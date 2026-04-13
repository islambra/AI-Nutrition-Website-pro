import User from "../models/User.js";
import Client from "../models/Client.js";
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

// Register a new client
export const registerClient = async (req, res) => {
  try {
    console.log('=== CLIENT REGISTRATION START ===');
    
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

    // Create User first
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "Client"
    });

    await newUser.save();
    console.log('User saved successfully, ID:', newUser._id);

    // Create Client profile
    const newClient = new Client({
      user: newUser._id,
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

    await newClient.save();
    console.log('Client profile saved successfully, ID:', newClient._id);

    // Prepare response
    const userObject = newUser.toObject();
    delete userObject.password;
    
    const clientObject = newClient.toObject();
    
    res.status(201).json({ 
      message: "Client registered successfully", 
      user: {
        ...userObject,
        clientProfile: clientObject
      },
      healthMetrics: {
        bmr: newClient.bmr,
        tdee: newClient.tdee,
        bmi: newClient.bmi,
        bmiCategory: newClient.bmiCategory,
        idealWeightKg: newClient.idealWeightKg,
        bodyFatPercentage: newClient.bodyFatPercentage
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

// Create staff user (Admin or Nutritionist)
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

// Login user (works for all roles)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in User model (all users are now in User model)
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If user is a Client, fetch client profile
    let clientProfile = null;
    if (user.role === "Client") {
      clientProfile = await Client.findOne({ user: user._id });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        clientId: clientProfile?._id 
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
        clientProfile: clientProfile || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with basic info only
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let clientProfile = null;
    if (user.role === "Client") {
      clientProfile = await Client.findOne({ user: user._id });
    }

    res.status(200).json({
      ...user.toObject(),
      clientProfile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Handle profile picture if uploaded
    if (req.file) {
      const folder = user.role === "Client" ? "/client-profiles" : "/staff-profiles";
      const result = await imagekit.upload({
        file: req.file.buffer.toString('base64'),
        fileName: `user-${id}-${Date.now()}.jpg`,
        folder: folder,
      });
      updateData.photo = result.url;
    }

    // Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Update user fields (only allowed fields)
    const allowedUserFields = ['fullName', 'email', 'password', 'photo'];
    allowedUserFields.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });
    
    await user.save();
    
    // If user is a Client, update client profile
    let clientProfile = null;
    let healthMetrics = null;
    
    if (user.role === "Client") {
      clientProfile = await Client.findOne({ user: user._id });
      
      if (clientProfile) {
        // Update client-specific fields
        const allowedClientFields = [
          'age', 'gender', 'heightCm', 'weightKg', 'activityLevel',
          'medicalConditions', 'allergies', 'goals'
        ];
        
        allowedClientFields.forEach(field => {
          if (updateData[field] !== undefined) {
            clientProfile[field] = updateData[field];
          }
        });
        
        // Recalculate health metrics if relevant fields changed
        const metricsFieldsChanged = ['age', 'gender', 'heightCm', 'weightKg', 'activityLevel']
          .some(field => updateData[field] !== undefined);
        
        if (metricsFieldsChanged) {
          healthMetrics = calculateHealthMetrics(
            clientProfile.age,
            clientProfile.gender,
            clientProfile.heightCm,
            clientProfile.weightKg,
            clientProfile.activityLevel
          );
          
          if (healthMetrics) {
            clientProfile.bmr = healthMetrics.bmr;
            clientProfile.tdee = healthMetrics.tdee;
            clientProfile.bmi = healthMetrics.bmi;
            clientProfile.bmiCategory = healthMetrics.bmiCategory;
            clientProfile.idealWeightKg = healthMetrics.idealWeightKg;
            clientProfile.bodyFatPercentage = healthMetrics.bodyFatPercentage;
          }
        }
        
        await clientProfile.save();
      }
    }
    
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({ 
      message: "User updated successfully", 
      user: { 
        ...userWithoutPassword, 
        clientProfile 
      },
      healthMetrics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user is a Client, delete client profile first
    if (user.role === "Client") {
      await Client.findOneAndDelete({ user: user._id });
    }
    
    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({ 
      message: "User deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff users (Admin and Nutritionist)
export const getAllStaffUsers = async (req, res) => {
  try {
    const users = await User.find({ 
      role: { $in: ["Admin", "Nutritionist"] } 
    }).select("-password");
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    // Find all users with role "Client"
    const clientUsers = await User.find({ role: "Client" }).select("-password").lean();
    
    // Fetch client profiles for each user
    const clients = await Promise.all(clientUsers.map(async (user) => {
      const clientProfile = await Client.findOne({ user: user._id }).lean();
      return {
        ...user,
        clientProfile
      };
    }));
    
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
