import mongoose from "mongoose";

const dieteticienSubscriptionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  dieteticien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
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
  },
  renewedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DieteticienSubscription",
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  zoomSessionsUsedThisMonth: {
    type: Number,
    default: 0
  },
  zoomMonthResetDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

dieteticienSubscriptionSchema.index({ client: 1, dieteticien: 1 });
dieteticienSubscriptionSchema.index({ dieteticien: 1, hasAccess: 1 });

const DieteticienSubscription = mongoose.model("DieteticienSubscription", dieteticienSubscriptionSchema);
export default DieteticienSubscription;
