import dotenv from "dotenv"
import { Coupon } from "../models/coupon.model.js";
import {stripe} from "../lib/stripe.js";
import Order from "../models/order.model.js";
dotenv.config();
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array is required" });
    }
    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe needs in cents -> 1 dollar = 100 cents
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });
    let coupon = null;
    if(couponCode) {
        coupon = await Coupon.findOne({ code: couponCode,userId:req.user, isActive: true });
        if (!coupon) {
          return res.status(404).json({ message: "Coupon not found" });
        }
        totalAmount -= Math.round(totalAmount * coupon.discount / 100);
    }
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items:lineItems,
        mode:"payment",
        success_url:`${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:`${process.env.CLIENT_URL}/purchase-cancelled`,
        discounts : coupon 
        ? [
            {coupon : await createStripeCoupon(coupon.discount)}
        ]
        : [],
        metadata:{
            userId: req.user._id.toString(),
            couponCode: couponCode || "",
            products: JSON.stringify(
                products.map((product) => ({
                    id: product._id,
                    price: product.price,
                    quantity: product.quantity,
                }))
            )
        }
        
    })
    if(totalAmount > 20000) {
        await createNewCoupon(req.user._id);
    }
    res.status(200).json({id:session.id , totalAmount:totalAmount/100});
  } catch (error) {
    res.status(500).json({ message: "Error creating checkout session", error: error.message });
  }
};
export const checkoutSuccess = async (req,res)=>{
    try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);
        const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      console.log("Order with this session ID already exists. Returning existing order.");
      return res.status(200).json({
        success: true,
        message: "Order already exists for this session.",
        orderId: existingOrder._id,
      });
    }
		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
            console.log("Products from session metadata:", products);

			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
}
async function createStripeCoupon(discount) {
    const coupon = await stripe.coupons.create({
        percent_off: discount,
        duration: "once",
    });
    return coupon.id;
}
async function createNewCoupon(userId) {
    await Coupon.findOneAndDelete({userId});
    const newCoupon = new Coupon({
        code:"GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discount:10,
        expirationDate:new Date(Date.now() + 30*24*60*60*1000),
        userId: userId
    })
    await newCoupon.save();
    return newCoupon;
}