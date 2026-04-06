// routes/userRoutes.js
import express from "express";
import {
  registerPatient,
  createStaffUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllStaffUsers,
  getAllPatients,
} from "../controllers/userControllers.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();


userRouter.post("/register-patient", registerPatient);
userRouter.post("/create-staff", createStaffUser);
userRouter.post("/login", loginUser);


userRouter.get("/all", getAllUsers);           
userRouter.get("/staff", getAllStaffUsers);   
userRouter.get("/patients", getAllPatients);   

// Update and Delete routes
userRouter.put("/:id", upload.single('profilePicture'), updateUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;