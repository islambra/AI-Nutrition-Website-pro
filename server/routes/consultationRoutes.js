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
  cancelConsultation          // ← Added
} from "../controllers/consultationController.js";

const router = express.Router();

// User routes
router.post("/book", protect, bookConsultation);
router.get("/my-bookings", protect, getUserConsultations);
router.get("/user-plan/:userPlanId", protect, getConsultationsByUserPlan);

// Nutritionist routes
router.get("/nutritionist-requests", protect, getNutritionistRequests);
router.patch("/:id/accept", protect, acceptConsultation);
router.patch("/:id/reject", protect, rejectConsultation);
router.patch("/:id/complete", protect, completeConsultation);

// User cancel route (restores session)
router.patch("/:id/cancel", protect, cancelConsultation);

// Delete consultation (hard delete, careful)
router.delete("/:id", protect, deleteConsultation);

export default router;