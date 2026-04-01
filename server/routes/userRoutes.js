import express from "express";
import {loginUser,registerUser, getUserdata,getAllUsers } from "../controllers/userControllers.js"
import {protect} from "../middleware/auth.js"
import { adminOnly } from "../middleware/adminOnly.js";

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/data", protect, getUserdata)
userRouter.get("/all", protect, adminOnly, getAllUsers);


export default userRouter