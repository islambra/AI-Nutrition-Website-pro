import 'dotenv/config';
import User from "../models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const generateToken = (userId) =>{
    const payload = { id: userId }
    return jwt.sign(payload, process.env.JWT_SECRET)
}


export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: "Fill all the fields, password must be at least 8 characters" 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



export const loginUser = async (req,res)=>{
    try {
        const {email,password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = generateToken(user._id.toString())
        res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email,role: user.role },
        });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


export const getUserdata = async (req,res) =>{
    try {
        const {user} = req
        res.json({success: true, user})
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
