import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  initiateOfflinePayment,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  checkPlanOwnership,
  getUserPlans
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/buy", protect, upload.single("proofImage"), initiateOfflinePayment);
router.get("/check/:planId", protect, checkPlanOwnership);
router.get("/my-plans", protect, getUserPlans);
router.get("/offline/pending", protect, getPendingPayments);
router.post("/offline/approve/:id", protect, approvePayment);
router.post("/offline/reject/:id", protect, rejectPayment);

export default router;
