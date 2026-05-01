// models/Plan.js

import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    // Basic Information
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    planCategory: {
      type: String,
      required: true,
    },
    targetUserProfile: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Plan Image
    planImage: {
      type: String,
      required: false,
      default: "",
    },

    // Duration & Price
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    // Consultation & Follow-up
    consultationIncluded: {
      type: Number,
      required: true,
      default: 0,
    },
    followUpFrequency: {
      type: String,
      required: true,
      enum: ["Daily", "Weekly", "Every 2 weeks", "Monthly", "None"],
    },

    // Nutrition Parameters
    dailyCalorieRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    macronutrientRatio: {
      carbs: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      protein: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      fat: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    recommendedFoods: {
      type: [String],
      required: true,
    },
    mealsPerDay: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    // Food Plan Details
    mealStructure: {
      type: Map,
      of: [String],
      required: true,
    },
    weeklyGroceryList: {
      protein: [String],
      vegetables: [String],
      carbs: [String],
      fats: [String],
      fruits: [String],
      other: [String],
    },
    foodsToAvoid: {
      type: [String],
      required: true,
    },

    // Supplements & Exercise
    supplementsSuggested: {
      type: [String],
      default: [],
    },
    exerciseRecommendation: {
      type: String,
      trim: true,
    },
    
    // Creator Information
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorInfo: {
      fullName: {
        type: String,
      },
      email: {
        type: String,
      },
      role: {
        type: String,
        enum: ["Admin", "Nutritionist", "Client"],
      },
      photo: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;