import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getRooms, getMessages, createRoom, deleteRoom } from "../controllers/chatController.js";

const router = Router();

router.get("/rooms", protect, getRooms);
router.get("/rooms/:id/messages", protect, getMessages);
router.post("/rooms", protect, createRoom);
router.delete("/rooms/:id", protect, deleteRoom);

export default router;
