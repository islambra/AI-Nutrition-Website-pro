import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createGoal,
  getMyGoals,
  updateGoal,
  deleteGoal,
  getSubscriberGoals,
  updateGoalProgress
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/goals", protect, createGoal);
router.get("/goals", protect, getMyGoals);
router.put("/goals/:id", protect, updateGoal);
router.delete("/goals/:id", protect, deleteGoal);
router.get("/subscribers/:clientId/goals", protect, getSubscriberGoals);
router.patch("/goals/:id/progress", protect, updateGoalProgress);

export default router;
