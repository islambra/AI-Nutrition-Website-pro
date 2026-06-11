import mongoose from "mongoose";

const pendingDieteticienSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true,
    trim: true
  },
  diplomaUrl: {
    type: String,
    default: null
  },
  diplomaFileId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  ccpNumber: {
    type: String,
    default: null,
    trim: true
  },
  ccpKey: {
    type: String,
    default: null,
    trim: true
  },
  baridiMob: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PendingDieteticien = mongoose.model("PendingDieteticien", pendingDieteticienSchema);
export default PendingDieteticien;