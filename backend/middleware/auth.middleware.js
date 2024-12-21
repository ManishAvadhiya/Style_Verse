import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token; // Check for access token
    if (!accessToken) {
      return res.status(403).json({ message: "Unauthorized - Access token is required" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      return next(); // Make sure execution stops here
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(403).json({ message: "Invalid access token" }); // Handle other JWT errors
    }
  } catch (error) {
    return res.status(500).json({ message: "Error in protectRoute middleware", error: error.message });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Unauthorized - You are not admin" });
};
