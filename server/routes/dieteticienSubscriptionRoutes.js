import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  getAllDieteticiens,
  getDieteticienById,
  subscribe,
  getMySubscriptions,
  getSubscribers,
  getSubscriberStats,
  renewSubscription,
  cancelSubscription,
  requestZoomSession,
  checkSubscriptionStatus
} from "../controllers/dieteticienSubscriptionController.js";

const router = express.Router();

router.get("/public/dieteticiens", getAllDieteticiens);
router.get("/public/dieteticiens/:id", getDieteticienById);

router.get("/dieteticiens", protect, getAllDieteticiens);
router.get("/dieteticiens/:id", protect, getDieteticienById);
router.post("/subscribe", protect, upload.single("proofImage"), subscribe);
router.get("/my", protect, getMySubscriptions);
router.get("/subscribers", protect, getSubscribers);
router.get("/stats", protect, getSubscriberStats);
router.post("/:id/renew", protect, upload.single("proofImage"), renewSubscription);
router.patch("/:id/cancel", protect, cancelSubscription);
router.post("/:id/zoom-request", protect, requestZoomSession);
router.get("/check/:dieteticienId", protect, checkSubscriptionStatus);

export default router;
