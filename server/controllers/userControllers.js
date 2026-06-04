import User from "../models/User.js";
import Client from "../models/Client.js";
import Student from "../models/Student.js";
import Dieteticien from "../models/Dieteticien.js";
import PendingDieteticien from "../models/PendingDieteticien.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import imagekit from "../configs/imageKit.js";

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      healthMetrics = calculateHealthMetrics(age, gender, heightCm, weightKg, activityLevel);
      clientProfile = new Client({
        user: newUser._id,
        age, gender, heightCm, weightKg,
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
        studentCardNumber
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
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const registerDieteticien = async (req, res) => {
  try {
    const { fullName, email, password, age, gender, specialty } = req.body;

    if (!fullName || !email || !password || !age || !gender || !specialty) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const pendingExists = await PendingDieteticien.findOne({ email });
    if (pendingExists && pendingExists.status === "pending") {
      return res.status(400).json({ message: "A pending request already exists for this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let diplomaUrl = null;
    let diplomaFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `diploma-${Date.now()}-${req.file.originalname}`,
        folder: "/diplomas",
      });
      diplomaUrl = upload.url;
      diplomaFileId = upload.fileId;
    }

    const pending = new PendingDieteticien({
      fullName: fullName.trim(),
      age, gender,
      email: email.toLowerCase().trim(),
      hashedPassword,
      specialty: specialty.trim(),
      diplomaUrl,
      diplomaFileId,
      status: "pending"
    });
    await pending.save();

    res.status(201).json({
      message: "Your registration request has been submitted for review. You will receive an email once approved.",
      data: { id: pending._id, status: "pending" }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

export const createStaffUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        message: "Missing required fields: fullName, email, password, and role are required"
      });
    }

    if (!["admin", "dieteticien"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'admin' or 'dieteticien'"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
        specialty: req.body.specialty || "General Nutrition",
        isApproved: true
      });
    }

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: `${role === "admin" ? "Admin" : "Dieteticien"} created successfully`, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
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
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      if (user.imageKitFileId) {
        try { await imagekit.deleteFile(user.imageKitFileId); } catch (_) {}
      }
      const folder = user.role === "client" ? "/client-profiles" : "/staff-profiles";
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `user-${id}-${Date.now()}.jpg`,
        folder: folder,
      });
      updateData.photo = result.url;
      updateData.imageKitFileId = result.fileId;
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
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
      if (profile && updateData.studentCardNumber) {
        profile.studentCardNumber = updateData.studentCardNumber;
        await profile.save();
      }
    } else if (user.role === "dieteticien") {
      profile = await Dieteticien.findOne({ user: user._id });
      if (profile && updateData.specialty) {
        profile.specialty = updateData.specialty;
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
    res.status(500).json({ message: error.message });
  }
};

export const incrementConsultations = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.totalConsultations += 1;
    await client.save();

    res.status(200).json({
      message: "Consultation count updated",
      totalConsultations: client.totalConsultations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.imageKitFileId) {
      try { await imagekit.deleteFile(user.imageKitFileId); } catch (_) {}
    }

    if (user.role === "client") {
      await Client.findOneAndDelete({ user: user._id });
    } else if (user.role === "student") {
      await Student.findOneAndDelete({ user: user._id });
    } else if (user.role === "dieteticien") {
      await Dieteticien.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllStaffUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { "$in": ["admin", "dieteticien"] }
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const users = await User.find({ role: { "$in": ["client", "student"] } }).select("-password").lean();

    const enriched = await Promise.all(users.map(async (user) => {
      let profile = null;
      if (user.role === "client") {
        profile = await Client.findOne({ user: user._id }).lean();
      } else if (user.role === "student") {
        profile = await Student.findOne({ user: user._id }).lean();
      }
      return {
        ...user,
        clientProfile: user.role === "client" ? profile : null,
        studentProfile: user.role === "student" ? profile : null
      };
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerClient = registerUser;