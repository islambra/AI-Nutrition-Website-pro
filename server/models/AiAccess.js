import mongoose from "mongoose";

const aiAccessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true         
  },
  hasAccess: {
    type: Boolean,
    default: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  }
}, {
  timestamps: true
});

const AiAccess = mongoose.model("AiAccess", aiAccessSchema);
export default AiAccess;