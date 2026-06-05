import express from "express";
import {
  createFormation, getFormations, getFormationById,
  updateFormation, deleteFormation, getMyFormations,
  createSession, getSessions, updateSession, deleteSession,
  purchaseFormation, getMyPurchasedFormations, checkFormationOwnership
} from "../controllers/formationController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.any(), createFormation);
router.get("/", getFormations);
router.get("/my-formations", getMyFormations);
router.get("/my-purchased", getMyPurchasedFormations);
router.get("/check/:id", checkFormationOwnership);
router.get("/:id", getFormationById);
router.put("/:id", upload.any(), updateFormation);
router.delete("/:id", deleteFormation);
router.post("/:id/purchase", purchaseFormation);

router.post("/:formationId/sessions", createSession);
router.get("/:formationId/sessions", getSessions);
router.put("/sessions/:sessionId", updateSession);
router.delete("/sessions/:sessionId", deleteSession);

export default router;
