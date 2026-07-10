import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createProgressEntry,
  getMyProgress,
  deleteProgressEntry,
  getSubscriberProgress
} from "../controllers/progressController.js";

const router = express.Router();

router.post("/entries", protect, createProgressEntry);
router.get("/entries", protect, getMyProgress);
router.delete("/entries/:id", protect, deleteProgressEntry);
router.get("/subscribers/:clientId/entries", protect, getSubscriberProgress);

export default router;
