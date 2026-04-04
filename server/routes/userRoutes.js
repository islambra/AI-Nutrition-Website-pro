import express from "express";
import {
  registerUser,
  createBasicUser,
  loginUser,
  getAllUsers,
  getAllPatients,
  updateUser,
  deleteUser,
} from "../controllers/userControllers.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

// Auth routes
userRouter.post("/register", registerUser);
userRouter.post("/register-basic", createBasicUser); 
userRouter.post("/login", loginUser);  

// Get routes
userRouter.get("/all-user", getAllUsers);
userRouter.get("/patients", getAllPatients);

userRouter.put("/:id", upload.single('profilePicture'), updateUser);

// Delete route
userRouter.delete("/:id", deleteUser);

export default userRouter;