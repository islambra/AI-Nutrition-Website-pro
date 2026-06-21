import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  initiateOfflinePayment,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  checkPlanOwnership,
  getUserPlans,
  getMyRequests,
  deleteMyRequest
} from "../controllers/paymentController.js";
import { validatePayment } from "../middleware/validate.js";
import { MulterError } from "multer";

const router = express.Router();

const handleMulterError = (err, req, res, next) => {
  if (err instanceof MulterError || err.message?.includes("Only JPEG")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

router.post("/buy", protect, upload.single("proofImage"), handleMulterError, validatePayment, initiateOfflinePayment);
router.get("/check/:planId", protect, checkPlanOwnership);
router.get("/my-plans", protect, getUserPlans);
router.get("/my-requests", protect, getMyRequests);
router.get("/offline/pending", protect, getPendingPayments);
router.post("/offline/approve/:id", protect, approvePayment);
router.post("/offline/reject/:id", protect, rejectPayment);
router.delete("/my-requests/:id", protect, deleteMyRequest);

export default router;
