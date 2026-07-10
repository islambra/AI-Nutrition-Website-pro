import mongoose from "mongoose";

const foodDiaryEntrySchema = new mongoose.Schema({
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
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true
  },
  description: {
    type: String,
    required: true
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

foodDiaryEntrySchema.index({ client: 1, dieteticien: 1, date: -1 });

const FoodDiaryEntry = mongoose.model("FoodDiaryEntry", foodDiaryEntrySchema);
export default FoodDiaryEntry;
