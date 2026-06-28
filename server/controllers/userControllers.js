import crypto from "crypto";
import User from "../models/User.js";
import Client from "../models/Client.js";
import Student from "../models/Student.js";
import Dieteticien from "../models/Dieteticien.js";
import PendingDieteticien from "../models/PendingDieteticien.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import imagekit from "../configs/imageKit.js";
import { securityLogger } from "../middleware/securityLogger.js";

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
};

const calculateHealthMetrics = (age, gender, heightCm, weightKg, activityLevel) => {
  if (!age || !heightCm || !weightKg || !gender || !activityLevel) {
    return null;
  }

  const numAge = Number(age);
  const numHeightCm = Number(heightCm);
  const numWeightKg = Number(weightKg);

  let bmr;
  if (gender === "Male") {
    bmr = 88.362 + (13.397 * numWeightKg) + (4.799 * numHeightCm) - (5.677 * numAge);
  } else {
    bmr = 447.593 + (9.247 * numWeightKg) + (3.098 * numHeightCm) - (4.33 * numAge);
  }

  const activityMultipliers = {
    "Sedentary": 1.2,
    "Lightly Active": 1.375,
    "Moderate": 1.55,
    "Active": 1.725,
    "Very Active": 1.9
  };
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  const heightMeters = numHeightCm / 100;
  const bmi = numWeightKg / (heightMeters * heightMeters);

  let bmiCategory;
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obesity";

  let idealWeightKg;
  if (gender === "Male") {
    idealWeightKg = numHeightCm - 100 - ((numHeightCm - 150) / 4);
  } else {
    idealWeightKg = numHeightCm - 100 - ((numHeightCm - 150) / 2.5);
  }

  const genderCoefficient = gender === "Male" ? 1 : 0;
  let bodyFatPercentage = -44.988 + (0.503 * numAge) + (10.689 * genderCoefficient) + (3.172 * bmi) - (0.026 * bmi * bmi);
  bodyFatPercentage = Math.max(5, Math.min(50, bodyFatPercentage));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    idealWeightKg: Math.round(idealWeightKg * 10) / 10,
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10
  };
};

export const registerUser = async (req, res) => {
  try {
    const {
      fullName, email, password, age, gender, role,
      heightCm, weightKg, activityLevel, medicalConditions, allergies, goals,
      studentCardNumber
    } = req.body;

    if (!["client", "student"].includes(role)) {
      return res.status(400).json({ message: 'Role must be "client" or "student"' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role
    });
    await newUser.save();

    let clientProfile = null;
    let studentProfile = null;
    let healthMetrics = null;

    if (role === "client") {
      healthMetrics = calculateHealthMetrics(
        Number(age), gender, Number(heightCm), Number(weightKg), activityLevel
      );
      clientProfile = new Client({
        user: newUser._id,
        age: Number(age), gender, heightCm: Number(heightCm), weightKg: Number(weightKg),
        activityLevel: activityLevel || "Sedentary",
        totalConsultations: 0,
        medicalConditions: medicalConditions || [],
        allergies: allergies || [],
        goals: goals || "",
        bmr: healthMetrics?.bmr,
        tdee: healthMetrics?.tdee,
        bmi: healthMetrics?.bmi,
        bmiCategory: healthMetrics?.bmiCategory,
        idealWeightKg: healthMetrics?.idealWeightKg,
        bodyFatPercentage: healthMetrics?.bodyFatPercentage
      });
      await clientProfile.save();
    } else if (role === "student") {
      if (!studentCardNumber) {
        await User.findByIdAndDelete(newUser._id);
        return res.status(400).json({ message: "Student card number is required" });
      }
      studentProfile = new Student({
        user: newUser._id,
        studentCardNumber: String(studentCardNumber),
        age: age ? Number(age) : null,
        gender: gender || null
      });
      await studentProfile.save();
    }

    const userObject = newUser.toObject();
    delete userObject.password;

    res.status(201).json({
      message: `${role === "client" ? "Client" : "Student"} registered successfully`,
      user: {
        ...userObject,
        clientProfile,
        studentProfile
      },
      healthMetrics
    });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

export const registerDieteticien = async (req, res) => {
  let uploadedFileId = null;
  try {
    const { fullName, email, password, age, gender, specialty, ccpNumber, ccpKey, baridiMob } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const pendingExists = await PendingDieteticien.findOne({ email: email.toLowerCase().trim() });
    if (pendingExists && pendingExists.status === "pending") {
      return res.status(400).json({ message: "A pending request already exists for this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let diplomaUrl = null;
    let diplomaFileId = null;
    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const safeFilename = `diploma-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: safeFilename,
        folder: "/diplomas",
      });
      diplomaUrl = upload.url;
      diplomaFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const pending = new PendingDieteticien({
      fullName: fullName.trim(),
      age, gender,
      email: email.toLowerCase().trim(),
      hashedPassword,
      specialty: specialty.trim(),
      diplomaUrl,
      diplomaFileId,
      ccpNumber: ccpNumber || null,
      ccpKey: ccpKey || null,
      baridiMob: baridiMob ? Number(baridiMob) : null,
      status: "pending"
    });
    await pending.save();

    res.status(201).json({
      message: "Your registration request has been submitted for review. You will receive an email once approved.",
      data: { id: pending._id, status: "pending" }
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

export const createStaffUser = async (req, res) => {
  try {
    const { fullName, email, password, role, specialty, ccpNumber, ccpKey, baridiMob } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    if (role === "dieteticien") {
      await Dieteticien.create({
        user: newUser._id,
        specialty: specialty || "General Nutrition",
        isApproved: true,
        ccpNumber: ccpNumber || null,
        ccpKey: ccpKey || null,
        baridiMob: baridiMob ? Number(baridiMob) : null
      });
    }

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: `${role === "admin" ? "Admin" : "Dieteticien"} created successfully`, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating staff user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      securityLogger.loginAttempt(email, ip, false);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      securityLogger.loginAttempt(email, ip, false);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    securityLogger.loginAttempt(email, ip, true, user._id.toString());

    let profile = null;
    if (user.role === "client") {
      profile = await Client.findOne({ user: user._id });
    } else if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === "dieteticien") {
      profile = await Dieteticien.findOne({ user: user._id });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        profileId: profile?._id
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        ...userWithoutPassword,
        clientProfile: user.role === "client" ? profile : null,
        studentProfile: user.role === "student" ? profile : null,
        dieteticienProfile: user.role === "dieteticien" ? profile : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = null;
    if (user.role === "client") {
      profile = await Client.findOne({ user: user._id });
    } else if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === "dieteticien") {
      profile = await Dieteticien.findOne({ user: user._id });
    }

    res.status(200).json({
      ...user.toObject(),
      clientProfile: user.role === "client" ? profile : null,
      studentProfile: user.role === "student" ? profile : null,
      dieteticienProfile: user.role === "dieteticien" ? profile : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};

export const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("fullName email photo role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let specialty = null;
    if (user.role === "dieteticien") {
      const dieteticien = await Dieteticien.findOne({ user: user._id });
      specialty = dieteticien?.specialty || null;
    }

    res.status(200).json({
      ...user.toObject(),
      specialty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const updateData = { ...req.body };

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized to update this user" });
    }

    if (req.file) {
      if (user.imageKitFileId) {
        try { await imagekit.deleteFile(user.imageKitFileId); } catch (_) {}
      }
      const folder = user.role === "client" ? "/client-profiles" : "/staff-profiles";
      const ext = req.file.originalname.split('.').pop();
      const safeFilename = `user-${crypto.randomBytes(8).toString('hex')}.${ext}`;
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: safeFilename,
        folder: folder,
      });
      updateData.photo = result.url;
      updateData.imageKitFileId = result.fileId;
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    const allowedUserFields = ['fullName', 'email', 'password', 'photo', 'imageKitFileId'];
    allowedUserFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();

    let profile = null;
    let healthMetrics = null;

    if (user.role === "client") {
      profile = await Client.findOne({ user: user._id });

      if (!profile) {
        profile = new Client({
          user: user._id, age: 25, gender: "Male",
          heightCm: 170, weightKg: 70, activityLevel: "Moderate",
          totalConsultations: 0, medicalConditions: [], allergies: [], goals: ""
        });
      }

      const allowedClientFields = [
        'age', 'gender', 'heightCm', 'weightKg', 'activityLevel',
        'medicalConditions', 'allergies', 'goals', 'totalConsultations'
      ];

      allowedClientFields.forEach(field => {
        if (updateData[field] !== undefined) {
          profile[field] = updateData[field];
        }
      });

      const metricsFieldsChanged = ['age', 'gender', 'heightCm', 'weightKg', 'activityLevel']
        .some(field => updateData[field] !== undefined);

      if (metricsFieldsChanged) {
        healthMetrics = calculateHealthMetrics(
          profile.age, profile.gender, profile.heightCm, profile.weightKg, profile.activityLevel
        );

        if (healthMetrics) {
          profile.bmr = healthMetrics.bmr;
          profile.tdee = healthMetrics.tdee;
          profile.bmi = healthMetrics.bmi;
          profile.bmiCategory = healthMetrics.bmiCategory;
          profile.idealWeightKg = healthMetrics.idealWeightKg;
          profile.bodyFatPercentage = healthMetrics.bodyFatPercentage;
        }
      }

      await profile.save();
    } else if (user.role === "student") {
      profile = await Student.findOne({ user: user._id });
      if (profile) {
        if (updateData.studentCardNumber !== undefined) profile.studentCardNumber = updateData.studentCardNumber;
        if (updateData.age !== undefined) profile.age = Number(updateData.age);
        if (updateData.gender !== undefined) profile.gender = updateData.gender;
        await profile.save();
      }
    } else if (user.role === "dieteticien") {
      profile = await Dieteticien.findOne({ user: user._id });
      if (profile) {
        const allowedDieteticienFields = ['specialty', 'ccpNumber', 'ccpKey', 'baridiMob'];
        allowedDieteticienFields.forEach(field => {
          if (updateData[field] !== undefined) {
            profile[field] = updateData[field];
          }
        });
        await profile.save();
      }
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        ...userWithoutPassword,
        clientProfile: user.role === "client" ? profile : null,
        studentProfile: user.role === "student" ? profile : null,
        dieteticienProfile: user.role === "dieteticien" ? profile : null
      },
      healthMetrics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating user profile" });
  }
};

export const incrementConsultations = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid client ID" });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    client.totalConsultations += 1;
    await client.save();

    res.status(200).json({
      success: true,
      message: "Consultation count updated",
      totalConsultations: client.totalConsultations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating consultation count" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    securityLogger.adminAction(req.user._id.toString(), 'DELETE_USER', id, `Role: ${user.role}`);

    if (user.imageKitFileId) {
      try { await imagekit.deleteFile(user.imageKitFileId); } catch (_) {}
    }

    if (user.role === "client") {
      await Client.findOneAndDelete({ user: user._id });
    } else if (user.role === "student") {
      await Student.findOneAndDelete({ user: user._id });
    } else if (user.role === "dieteticien") {
      const dieteticien = await Dieteticien.findOne({ user: user._id });
      if (dieteticien?.diplomaFileId) {
        try { await imagekit.deleteFile(dieteticien.diplomaFileId); } catch (_) {}
      }
      await Dieteticien.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

export const getAllStaffUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: { $in: ["admin", "dieteticien"] } })
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: { $in: ["admin", "dieteticien"] } })
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching staff users" });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: { $in: ["client", "student"] } })
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: { $in: ["client", "student"] } })
    ]);

    const clientUserIds = users.filter(u => u.role === "client").map(u => u._id);
    const studentUserIds = users.filter(u => u.role === "student").map(u => u._id);

    const [clients, students] = await Promise.all([
      clientUserIds.length ? Client.find({ user: { $in: clientUserIds } }).lean() : [],
      studentUserIds.length ? Student.find({ user: { $in: studentUserIds } }).lean() : []
    ]);

    const clientMap = {};
    for (const c of clients) clientMap[c.user.toString()] = c;
    const studentMap = {};
    for (const s of students) studentMap[s.user.toString()] = s;

    const enriched = users.map(user => ({
      ...user,
      clientProfile: user.role === "client" ? clientMap[user._id.toString()] || null : null,
      studentProfile: user.role === "student" ? studentMap[user._id.toString()] || null : null
    }));

    res.status(200).json({
      success: true,
      count: enriched.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching clients" });
  }
};

export const getDieteticienPaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const dieteticien = await Dieteticien.findOne({ user: id }).select("ccpNumber ccpKey baridiMob");

    if (!dieteticien) {
      return res.status(404).json({ success: false, message: "Dieteticien not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        ccpNumber: dieteticien.ccpNumber,
        ccpKey: dieteticien.ccpKey,
        baridiMob: dieteticien.baridiMob
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment info" });
  }
};

export const registerClient = registerUser;