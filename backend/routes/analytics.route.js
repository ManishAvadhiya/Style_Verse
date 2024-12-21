import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { dashboardPage } from "../controllers/analytics.controller.js";
const router = express.Router();   
router.get("/",protectRoute,adminRoute,dashboardPage)
export default router;