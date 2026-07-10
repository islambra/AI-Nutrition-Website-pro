import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  targetDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active"
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

goalSchema.index({ client: 1, dieteticien: 1 });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
