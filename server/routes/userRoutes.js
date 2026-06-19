import express from "express";
import {
  registerClient,
  registerUser,
  registerDieteticien,
  createStaffUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllStaffUsers,
  getAllClients,
  incrementConsultations,
  getUserPublicProfile,
  getDieteticienPaymentInfo
} from "../controllers/userControllers.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/auth.js";
import {
  validateRegister,
  validateLogin,
  validateDieteticienRegister,
  validateStaffCreate,
  validateMongoId
} from "../middleware/validate.js";

const userRouter = express.Router();

// Public routes (no authentication required)
userRouter.post("/register-client", validateRegister, registerClient);
userRouter.post("/register", validateRegister, registerUser);
userRouter.post("/register-dieteticien", upload.single("diploma"), validateDieteticienRegister, registerDieteticien);
userRouter.post("/login", validateLogin, loginUser);

// Protected routes (authentication required)
userRouter.get("/me", protect, getCurrentUser);
userRouter.get("/public-profile/:id", getUserPublicProfile);
userRouter.post("/create-staff", protect, validateStaffCreate, createStaffUser);
userRouter.get("/all", protect, getAllUsers);
userRouter.get("/staff", protect, getAllStaffUsers);
userRouter.get("/clients", protect, getAllClients);
userRouter.put("/:id", protect, upload.single('profilePicture'), updateUser);
userRouter.delete("/:id", protect, deleteUser);

// Dieteticien payment info
userRouter.get("/:id/payment-info", getDieteticienPaymentInfo);

// Consultation routes
userRouter.patch("/client/:id/increment-consultations", protect, incrementConsultations);

export default userRouter;