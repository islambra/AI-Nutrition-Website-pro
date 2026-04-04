import User from "../models/User.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import imagekit from "../configs/imageKit.js";

// Helper function to calculate health metrics
const calculateHealthMetrics = (age, gender, heightCm, weightKg, activityLevel) => {
  // Only calculate if all required fields exist
  if (!age || !heightCm || !weightKg || !gender || !activityLevel) {
    return null;
  }
  
  const numAge = Number(age);
  const numHeightCm = Number(heightCm);
  const numWeightKg = Number(weightKg);
  
  // 1. Calculate BMR (Mifflin-St Jeor Equation)
  let bmr;
  if (gender === "Male") {
    bmr = 88.362 + (13.397 * numWeightKg) + (4.799 * numHeightCm) - (5.677 * numAge);
  } else {
    bmr = 447.593 + (9.247 * numWeightKg) + (3.098 * numHeightCm) - (4.33 * numAge);
  }
  
  // 2. Calculate TDEE based on activity level
  const activityMultipliers = {
    "Sedentary": 1.2,
    "Light": 1.375,
    "Moderate": 1.55,
    "Active": 1.725,
    "Very Active": 1.9
  };
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
  // 3. Calculate BMI
  const heightMeters = numHeightCm / 100;
  const bmi = numWeightKg / (heightMeters * heightMeters);
  
  // 4. Determine BMI Category
  let bmiCategory;
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obesity";
  
  // 5. Calculate Ideal Weight (Devine formula)
  let idealWeightKg;
  if (gender === "Male") {
    idealWeightKg = numHeightCm - 100 - ((numHeightCm - 150) / 4);
  } else {
    idealWeightKg = numHeightCm - 100 - ((numHeightCm - 150) / 2.5);
  }
  
  // 6. Calculate Body Fat Percentage
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

// Register user with ALL information
export const registerUser = async (req, res) => {
  try {
    console.log('=== REGISTRATION START ===');
    
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

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields: fullName, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Calculate health metrics
    const healthMetrics = calculateHealthMetrics(age, gender, heightCm, weightKg, activityLevel);
    
    console.log('Calculated health metrics:', healthMetrics);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with all data
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      age: age || null,
      gender: gender || null,
      heightCm: heightCm || null,
      weightKg: weightKg || null,
      activityLevel: activityLevel || "Sedentary",
      medicalConditions: medicalConditions || [],
      allergies: allergies || [],
      goals: goals || "",
      // Add calculated health metrics
      bmr: healthMetrics?.bmr || null,
      tdee: healthMetrics?.tdee || null,
      bmi: healthMetrics?.bmi || null,
      bmiCategory: healthMetrics?.bmiCategory || null,
      idealWeightKg: healthMetrics?.idealWeightKg || null,
      bodyFatPercentage: healthMetrics?.bodyFatPercentage || null
    });

    // Save user
    await newUser.save();
    console.log('User saved successfully, ID:', newUser._id);

    // Return user without password
    const userObject = newUser.toObject();
    delete userObject.password;
    
    res.status(201).json({ 
      message: "User registered successfully", 
      user: userObject,
      healthMetrics: {
        bmr: newUser.bmr,
        tdee: newUser.tdee,
        bmi: newUser.bmi,
        bmiCategory: newUser.bmiCategory,
        idealWeightKg: newUser.idealWeightKg,
        bodyFatPercentage: newUser.bodyFatPercentage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ 
      message: error.message || 'Internal server error'
    });
  }
};

// Create user with ONLY basic info
export const createBasicUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "Patient"
    });

    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "Patient" }).select("-password");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle profile picture if uploaded
    if (req.file) {
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `profile-${id}-${Date.now()}.jpg`,
        folder: "/user-profiles",
      });
      updateData.photo = result.url;
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'updatedAt') {
        user[key] = updateData[key];
      }
    });
    
    // Recalculate health metrics if relevant fields changed
    if (updateData.age !== undefined || updateData.gender !== undefined || 
        updateData.heightCm !== undefined || updateData.weightKg !== undefined || 
        updateData.activityLevel !== undefined) {
      
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
    
    user.updatedAt = Date.now();
    await user.save();
    
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ 
      message: "User updated successfully", 
      user: userWithoutPassword,
      healthMetrics: {
        bmr: user.bmr,
        tdee: user.tdee,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
        idealWeightKg: user.idealWeightKg,
        bodyFatPercentage: user.bodyFatPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
