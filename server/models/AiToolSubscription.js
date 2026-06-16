import mongoose from "mongoose";

const aiToolSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  hasAccess: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  }
}, { timestamps: true });

const AiToolSubscription = mongoose.model("AiToolSubscription", aiToolSubscriptionSchema);
export default AiToolSubscription;
