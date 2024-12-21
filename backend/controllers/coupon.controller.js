import { Coupon } from "../models/coupon.model.js"

export const getCoupon = async (req,res) =>{
    try {
        const coupon  = await Coupon.findOne({userId: req.user._id,isActive:true})
        res.json(coupon || null)
    } catch (error) {
        res.status(500).json({message:"Error in getting coupon",error: error.message})
    }
}
export const validateCoupon = async (req, res) =>{
    try {
        const {code} = req.body;
        const coupon  = await Coupon.findOne({code:code,isActive:true,userId:req.user._id})
        if(!coupon){
            return res.status(400).json({message:"Invalid coupon code"})
        }
        if(new Date(coupon.expirationDate) < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(400).json({message:"Coupon has expired"})
        }
        res.json(coupon)
    } catch (error) {
        res.status(500).json({message:"Error in validating coupon",error: error.message})
    }
}