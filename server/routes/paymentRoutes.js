// routes/paymentRoutes.js
import express from "express";
import { buyPlan, checkPlanOwnership, getUserPlans } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const paymentRouter = express.Router();

// All routes are protected
paymentRouter.post("/buy", protect, buyPlan);
paymentRouter.get("/check/:planId", protect, checkPlanOwnership);
paymentRouter.get("/my-plans", protect, getUserPlans);

export default paymentRouter;