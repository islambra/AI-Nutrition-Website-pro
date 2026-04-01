import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const protect = async (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.json({ success: false, message: "Not authorized, Please log in to continue" });
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if (!decoded) {
            return res.json({ success: false, message: "Not authorized" });
        }
        req.user = await User.findById(decoded.id).select("-password")
        next()
    } catch (error) {
        return res.json({ success: false, message: "Not authorized" });
    }
}