import mongoose from "mongoose";

const subscriberResourceSchema = new mongoose.Schema({
  dieteticien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileId: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

subscriberResourceSchema.index({ dieteticien: 1, createdAt: -1 });

const SubscriberResource = mongoose.model("SubscriberResource", subscriberResourceSchema);
export default SubscriberResource;
