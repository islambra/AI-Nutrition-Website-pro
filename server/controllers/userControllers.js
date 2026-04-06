// controllers/userControllers.js
import User from "../models/User.js";
import Patient from "../models/Patient.js";
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
export const registerPatient = async (req, res) => {
  try {
    console.log('=== PATIENT REGISTRATION START ===');
    
    const {
      fullName,
      email,
      password,
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      medicalConditions,
      allergies,
      goals
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: fullName, email, and password are required" 
      });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Patient already exists with this email" });
    }

    const healthMetrics = calculateHealthMetrics(age, gender, heightCm, weightKg, activityLevel);
    
    console.log('Calculated health metrics:', healthMetrics);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      age: age,
      gender: gender,
      heightCm: heightCm,
      weightKg: weightKg,
      activityLevel: activityLevel || "Sedentary",
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

    await newPatient.save();
    console.log('Patient saved successfully, ID:', newPatient._id);

    const patientObject = newPatient.toObject();
    delete patientObject.password;
    
    res.status(201).json({ 
      message: "Patient registered successfully", 
      user: patientObject,
      healthMetrics: {
        bmr: newPatient.bmr,
        tdee: newPatient.tdee,
        bmi: newPatient.bmi,
        bmiCategory: newPatient.bmiCategory,
        idealWeightKg: newPatient.idealWeightKg,
        bodyFatPercentage: newPatient.bodyFatPercentage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ 
      message: error.message || 'Internal server error'
    });
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

    if (!["Admin", "Nutritionist"].includes(role)) {
      return res.status(400).json({ 
        message: "Role must be either 'Admin' or 'Nutritionist'" 
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

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: `${role} created successfully`, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    let userType = "staff";
    let sourceModel = "User";
    
    if (!user) {
      user = await Patient.findOne({ email });
      userType = "patient";
      sourceModel = "Patient";
    }
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "Patient", userType, sourceModel },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: { ...userWithoutPassword, userType }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [staffUsers, patients] = await Promise.all([
      User.find().select("-password").lean(),
      Patient.find().select("-password").lean()
    ]);
    
    const staffWithType = staffUsers.map(user => ({
      ...user,
      userType: "staff"
    }));
    
    const patientsWithType = patients.map(patient => ({
      ...patient,
      userType: "patient"
    }));
    
    const allUsers = [...staffWithType, ...patientsWithType];
    
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Try to find in User model first
    let user = await User.findById(id);
    let userModel = "User";
    
    if (!user) {
      user = await Patient.findById(id);
      userModel = "Patient";
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Handle profile picture if uploaded
    if (req.file) {
      const folder = userModel === "Patient" ? "/patient-profiles" : "/staff-profiles";
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `${userModel.toLowerCase()}-${id}-${Date.now()}.jpg`,
        folder: folder,
      });
      updateData.photo = result.url;
    }

    // Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'createdAt' && key !== '_id') {
        user[key] = updateData[key];
      }
    });
    
    // Recalculate health metrics for patients if relevant fields changed
    if (userModel === "Patient" && (updateData.age !== undefined || updateData.gender !== undefined || 
        updateData.heightCm !== undefined || updateData.weightKg !== undefined || 
        updateData.activityLevel !== undefined)) {
      
      const healthMetrics = calculateHealthMetrics(
        user.age,
        user.gender,
        user.heightCm,
        user.weightKg,
        user.activityLevel
      );
      
      if (healthMetrics) {
        user.bmr = healthMetrics.bmr;
        user.tdee = healthMetrics.tdee;
        user.bmi = healthMetrics.bmi;
        user.bmiCategory = healthMetrics.bmiCategory;
        user.idealWeightKg = healthMetrics.idealWeightKg;
        user.bodyFatPercentage = healthMetrics.bodyFatPercentage;
      }
    }
    
    await user.save();
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    const userType = userModel === "Patient" ? "patient" : "staff";

    res.status(200).json({ 
      message: "User updated successfully", 
      user: { ...userWithoutPassword, userType },
      healthMetrics: userModel === "Patient" ? {
        bmr: user.bmr,
        tdee: user.tdee,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        idealWeightKg: user.idealWeightKg,
        bodyFatPercentage: user.bodyFatPercentage
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to delete from User model first
    let deletedUser = await User.findByIdAndDelete(id);
    let deletedFrom = "User";
    
    if (!deletedUser) {
      deletedUser = await Patient.findByIdAndDelete(id);
      deletedFrom = "Patient";
    }
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: `User deleted successfully from ${deletedFrom}` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllStaffUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-password").populate('assignedNutritionist', 'fullName email');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};