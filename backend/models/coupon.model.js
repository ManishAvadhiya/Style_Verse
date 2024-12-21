import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        required: [true, "Coupon discount is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expirationDate:{
        type: Date,
        required: [true, "Coupon expiration date is required"],
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Coupon user is required"],
        unique: true,
    }
},{timestamps: true})

export const Coupon = mongoose.model("coupon",couponSchema);