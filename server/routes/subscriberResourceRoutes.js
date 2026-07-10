import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  createResource,
  getMyResources,
  getSubscriberResources,
  deleteResource
} from "../controllers/subscriberResourceController.js";

const router = express.Router();

router.post("/resources", protect, upload.single("resourceFile"), createResource);
router.get("/resources", protect, getMyResources);
router.get("/resources/:dieteticienId", protect, getSubscriberResources);
router.delete("/resources/:id", protect, deleteResource);

export default router;
