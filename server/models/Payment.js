// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal"],
    required: true
  }
}, {
  timestamps: true
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;