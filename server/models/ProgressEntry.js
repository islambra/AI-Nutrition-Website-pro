import mongoose from "mongoose";

const progressEntrySchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number,
    required: true
  },
  waist: {
    type: Number,
    default: null
  },
  bodyFat: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ""
  },
  dieteticienFeedback: {
    type: String,
    default: null
  },
  dieteticienFeedbackAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

progressEntrySchema.index({ client: 1, dieteticien: 1, date: -1 });

const ProgressEntry = mongoose.model("ProgressEntry", progressEntrySchema);
export default ProgressEntry;
