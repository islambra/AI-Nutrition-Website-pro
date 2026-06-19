import express from "express";
import { forgotPassword, resetPassword } from "../controllers/passwordResetController.js";
import { validatePasswordReset, validateNewPassword } from "../middleware/validate.js";

const router = express.Router();

router.post("/forgot", validatePasswordReset, forgotPassword);
router.post("/reset/:token", validateNewPassword, resetPassword);

export default router;
