import mongoose from "mongoose";

const dieteticienSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
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
  paymentProofUrl: {
    type: String,
    default: null
  },
  paymentProofFileId: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  ccpNumber: {
    type: String,
    default: null,
    trim: true
  },
  ccpKey: {
    type: String,
    default: null,
    trim: true,
    match: [/^\d{2}$/, "CCP key must be exactly 2 digits"]
  },
  baridiMob: {
    type: Number,
    default: null
  }
}, { timestamps: true });

const Dieteticien = mongoose.model("Dieteticien", dieteticienSchema);
export default Dieteticien;