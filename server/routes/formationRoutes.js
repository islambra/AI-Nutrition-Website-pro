import express from "express";
import {
  createFormation, getFormations, getFormationById,
  updateFormation, deleteFormation, getMyFormations,
  createSession, getSessions, updateSession, deleteSession,
  getMyPurchasedFormations, checkFormationOwnership
} from "../controllers/formationController.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { validateFormation } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.post("/", authorize('dieteticien', 'admin'), upload.any(), validateFormation, createFormation);
router.get("/", getFormations);
router.get("/my-formations", getMyFormations);
router.get("/my-purchased", getMyPurchasedFormations);
router.get("/check/:id", checkFormationOwnership);
router.get("/:id", getFormationById);
router.put("/:id", authorize('dieteticien', 'admin'), upload.any(), updateFormation);
router.delete("/:id", deleteFormation);
router.post("/:formationId/sessions", authorize('dieteticien', 'admin'), createSession);
router.get("/:formationId/sessions", getSessions);
router.put("/sessions/:sessionId", authorize('dieteticien', 'admin'), updateSession);
router.delete("/sessions/:sessionId", authorize('dieteticien', 'admin'), deleteSession);

export default router;
