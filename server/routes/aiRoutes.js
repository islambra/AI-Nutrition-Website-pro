import express from "express";
import { protect } from "../middleware/auth.js";
import { checkAiAccess, buyAiAccess, analyzeImage } from "../controllers/aiController.js";

const router = express.Router();

router.get("/check-access", protect, checkAiAccess);
router.post("/buy-access", protect, buyAiAccess);
router.post("/analyze", protect, analyzeImage); 

export default router;