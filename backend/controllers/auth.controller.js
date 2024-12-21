import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();
const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,  // prevents xss attack
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
export const signup = async (req, res, next) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ email, password, name });

    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error: " + error.message });
  }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if(user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            return res.json({ user });
        }else{
            return res.status(400).json({ message: "Invalid credentials" });
        }
    } catch (error) {
    res.status(500).json({message:"server error" , error:error.message});
        
    }
};
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if(refreshToken){
        const deocded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token:${deocded.userId}`)
    }
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({message:"server error" , error:error.message});
  }
};
export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if(!refreshToken){
            return res.status(401).json({ message: "Refresh token is required" });
        }

        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)
        if(storedToken !== refreshToken){
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const accessToken = jwt.sign({userId:decoded.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"})
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            samesite: "strict",
            maxAge: 15 * 60 * 1000,
          });
        res.json({msg:"Token refreshed successfully"}) 
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(500).json({message:"server error" , error:error.message});
        
    }
}
export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};