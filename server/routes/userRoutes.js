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
  getDieteticienPaymentInfo,
  updateLanguage
} from "../controllers/userControllers.js";
import upload from "../middleware/multer.js";
import { protect, authorize } from "../middleware/auth.js";
import { getPlatformPaymentInfo } from "../controllers/sharedPlatformPaymentController.js";
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
userRouter.post("/register-dieteticien", upload.fields([{ name: "diploma", maxCount: 1 }, { name: "paymentProof", maxCount: 1 }]), validateDieteticienRegister, registerDieteticien);
userRouter.post("/login", validateLogin, loginUser);
userRouter.get("/platform-payment-info", getPlatformPaymentInfo);

// Protected routes (authentication required)
userRouter.get("/me", protect, getCurrentUser);
userRouter.get("/public-profile/:id", getUserPublicProfile);
userRouter.post("/create-staff", protect, authorize('admin'), validateStaffCreate, createStaffUser);
userRouter.get("/all", protect, authorize('admin'), getAllUsers);
userRouter.get("/staff", protect, authorize('admin'), getAllStaffUsers);
userRouter.get("/clients", protect, authorize('dieteticien', 'admin'), getAllClients);
userRouter.put("/:id", protect, upload.single('profilePicture'), updateUser);
userRouter.delete("/:id", protect, deleteUser);

// Dieteticien payment info (clients/students need it to pay)
userRouter.get("/:id/payment-info", protect, authorize('admin', 'dieteticien', 'client', 'student'), getDieteticienPaymentInfo);

// Consultation routes
userRouter.patch("/client/:id/increment-consultations", protect, incrementConsultations);

// Language preference
userRouter.patch("/language", protect, updateLanguage);

export default userRouter;