import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Order user is required"],
    },
    products:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Order product is required"],
            },
            quantity: {
                type: Number,
                required: [true, "Order quantity is required"],
            },
            price:{
                type: Number,
                required: [true, "Order price is required"],
                min:0,
            }
        }
    ],
    totalAmount:{
        type: Number,
        required: [true, "Order total amount is required"],
        min:0,
    },
    stripeSessionId:{
        type: String,
        required: [true, "Order stripe session ID is required"],
        unique:true,
    },
},{timestamps: true})

const Order = mongoose.model("Order",orderSchema);
export default Order;