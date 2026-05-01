import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  // Reference to User model for basic info
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true // One client profile per user
  },
  
  // Client-specific fields
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
  
  // Calculated fields
  bmr: {
    type: Number
  },
  tdee: {
    type: Number
  },
  bmi: {
    type: Number
  },
  bmiCategory: {
    type: String
  },
  idealWeightKg: {
    type: Number
  },
  bodyFatPercentage: {
    type: Number
  },
  
  // Consultation tracking
  totalConsultations: {
    type: Number,
    default: 0
  },
  // Additional info
  medicalConditions: [{
    type: String
  }],
  allergies: [{
    type: String
  }],
  goals: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Client = mongoose.model("Client", clientSchema);
export default Client;