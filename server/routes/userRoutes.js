import express from "express";
import {
  registerClient,
  createStaffUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllStaffUsers,
  getAllClients,
} from "../controllers/userControllers.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

// Public routes (no authentication required)
userRouter.post("/register-client", registerClient);
userRouter.post("/login", loginUser);

// Protected routes (authentication required)
userRouter.post("/create-staff", protect, createStaffUser);
userRouter.get("/all", protect, getAllUsers);           
userRouter.get("/staff", protect, getAllStaffUsers);   
userRouter.get("/clients", protect, getAllClients);     
userRouter.put("/:id", protect, upload.single('profilePicture'), updateUser);
userRouter.delete("/:id", protect, deleteUser);

export default userRouter;