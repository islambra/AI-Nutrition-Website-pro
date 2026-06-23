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
import { protect, authorize } from "../middleware/auth.js";
import { validatePlan, validateQueryParams } from "../middleware/validate.js";

const planRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
planRouter.get("/", validateQueryParams, getAllPlans);

// Protected routes (dieteticien/admin only)
planRouter.get("/my-plans/list", protect, getMyPlans);
planRouter.post("/", protect, authorize('dieteticien', 'admin'), upload.single("planImage"), validatePlan, createPlan);
planRouter.put("/:id", protect, authorize('dieteticien', 'admin'), upload.single("planImage"), updatePlan);
planRouter.delete("/:id", protect, authorize('dieteticien', 'admin'), deletePlan);

planRouter.get("/:id", getPlanById);

export default planRouter;