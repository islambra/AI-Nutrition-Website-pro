import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  // Basic info
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
  
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true
  },
  heightCm: {
    type: Number,
    required: true
  },
  weightKg: {
    type: Number,
    required: true
  },
  activityLevel: {
    type: String,
    enum: ["Sedentary", "Lightly Active", "Moderate", "Active", "Very Active"],
    required: true
  },
  
  bmr: {
    type: Number,
  },
  tdee: {
    type: Number,
  },
  bmi: {
    type: Number,

  },
  bmiCategory: {
    type: String,
  },
  idealWeightKg: {
    type: Number,
  },
  bodyFatPercentage: {
    type: Number,
  },
  
  medicalConditions: [{
    type: String
  }],
  allergies: [{
    type: String
  }],
  goals: {
    type: String,
    default: null
  },
  
  assignedNutritionist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }
}, {
  timestamps: true 
});


const Patient = mongoose.model("Patient", patientSchema);
export default Patient;