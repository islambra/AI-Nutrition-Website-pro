import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  
  photo: {
    type: String,
    default: null
  },
  
  role: {
    type: String,
    enum: ["Admin", "Nutritionist", "Patient"],
    default: "Patient"
  },
  
  // Physical info
  age: Number,
  gender: String,
  heightCm: Number,
  weightKg: Number,
  activityLevel: String,
  
  // Health metrics (calculated and stored)
  bmr: Number,
  tdee: Number,
  bmi: Number,
  bmiCategory: String,
  idealWeightKg: Number,
  bodyFatPercentage: Number,
  
  // Health details
  medicalConditions: [String],
  allergies: [String],
  goals: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

export default User;