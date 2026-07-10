import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createEntry,
  getMyEntries,
  deleteEntry,
  getSubscriberEntries,
  addFeedback
} from "../controllers/foodDiaryController.js";

const router = express.Router();

router.post("/entries", protect, createEntry);
router.get("/entries", protect, getMyEntries);
router.delete("/entries/:id", protect, deleteEntry);
router.get("/subscribers/:clientId/entries", protect, getSubscriberEntries);
router.patch("/entries/:id/feedback", protect, addFeedback);

export default router;
