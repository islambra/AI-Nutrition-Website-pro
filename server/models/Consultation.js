import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPlan",
    default: null
  },
  dieteticienSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DieteticienSubscription",
    default: null
  },
  nutritionist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan"
  },
  requestedDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  zoomLink: {
    type: String,
    default: null
  },
  zoomStartUrl: {
    type: String,
    default: null
  },
  meetingId: {
    type: String,
    default: null
  },
  meetingPassword: {
    type: String,
    default: null
  },
  note: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

consultationSchema.index({ user: 1, createdAt: -1 });
consultationSchema.index({ nutritionist: 1, status: 1 });

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;