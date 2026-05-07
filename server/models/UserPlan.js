// models/UserPlan.js
import mongoose from "mongoose";

const userPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true
  },
  sessionsRemaining: {
    type: Number,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const UserPlan = mongoose.model("UserPlan", userPlanSchema);
export default UserPlan;