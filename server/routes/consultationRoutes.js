import express from "express";
import { protect } from "../middleware/auth.js";
import {
  bookConsultation,
  getUserConsultations,
  getConsultationsByUserPlan,
  getNutritionistRequests,
  acceptConsultation,
  rejectConsultation,
  completeConsultation,
  deleteConsultation,
  cancelConsultation
} from "../controllers/consultationController.js";
import { validateConsultation } from "../middleware/validate.js";

const router = express.Router();

router.post("/book", protect, validateConsultation, bookConsultation);
router.get("/my-bookings", protect, getUserConsultations);
router.get("/user-plan/:userPlanId", protect, getConsultationsByUserPlan);

router.get("/nutritionist-requests", protect, getNutritionistRequests);
router.patch("/:id/accept", protect, acceptConsultation);
router.patch("/:id/reject", protect, rejectConsultation);
router.patch("/:id/complete", protect, completeConsultation);

router.patch("/:id/cancel", protect, cancelConsultation);

router.delete("/:id", protect, deleteConsultation);

export default router;