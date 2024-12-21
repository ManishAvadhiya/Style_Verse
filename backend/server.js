import express from 'express';
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import productsRoutes from "./routes/products.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticRoutes from "./routes/analytics.route.js"
import { connectDB } from './lib/db.js';
import path from "path";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

const __dirname = path.resolve();

app.use(express.json({limit:"10mb"}));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/products",productsRoutes);
app.use("/api/cart",cartRoutes)
app.use("/api/coupons",couponRoutes)
app.use("/api/payments",paymentRoutes)
app.use("/api/analytics",analyticRoutes)

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}


app.listen(PORT,()=>{
    console.log(`server running at ${PORT} port`)
    connectDB();
})