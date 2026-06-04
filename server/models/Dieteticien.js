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
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Dieteticien = mongoose.model("Dieteticien", dieteticienSchema);
export default Dieteticien;