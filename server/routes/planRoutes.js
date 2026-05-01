// routes/planRoutes.js

import express from "express";
import multer from "multer";
import {
  createPlan,
  updatePlan,
  deletePlan,
  getMyPlans,
  getAllPlans,
  getPlanById,
} from "../controllers/planControllers.js";
import { protect } from "../middleware/auth.js";

const planRouter = express.Router();

// Configure multer for memory storage (since we send to ImageKit)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
planRouter.get("/", getAllPlans);
planRouter.get("/:id", getPlanById);

// Protected routes (nutritionist only)
planRouter.get("/my-plans/list", protect, getMyPlans);
planRouter.post("/", protect, upload.single("planImage"), createPlan);
planRouter.put("/:id", protect, upload.single("planImage"), updatePlan);
planRouter.delete("/:id", protect, deletePlan);

export default planRouter;