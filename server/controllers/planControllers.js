// controllers/planControllers.js

import mongoose from "mongoose";
import Plan from "../models/Plan.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";

export const createPlan = async (req, res) => {
  try {
    const {
      planName,
      planCategory,
      targetUserProfile,
      description,
      duration,
      price,
      consultationIncluded,
      followUpFrequency,
      dailyCalorieRange,
      macronutrientRatio,
      recommendedFoods,
      mealsPerDay,
      mealStructure,
      weeklyGroceryList,
      foodsToAvoid,
      supplementsSuggested,
      exerciseRecommendation,
    } = req.body;

    // Get authenticated user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate macronutrients sum to 100
    const { carbs, protein, fat } = JSON.parse(macronutrientRatio);
    if (carbs + protein + fat !== 100) {
      return res.status(400).json({
        success: false,
        message: "Macronutrient ratio must sum to 100%",
      });
    }

    let planImageUrl = null;

    // Upload image to ImageKit if file exists
    if (req.file) {
      try {
        const base64Image = req.file.buffer.toString("base64");
        const uploadResponse = await imagekit.upload({
          file: base64Image,
          fileName: `${Date.now()}-${req.file.originalname}`,
          folder: "/plans",
        });
        planImageUrl = uploadResponse.url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Error uploading plan image",
          error: uploadError.message,
        });
      }
    }

    // Create plan with creator info
    const plan = await Plan.create({
      planName,
      planCategory,
      targetUserProfile,
      description,
      planImage: planImageUrl,
      duration,
      price,
      consultationIncluded: consultationIncluded || 0,
      followUpFrequency,
      dailyCalorieRange: JSON.parse(dailyCalorieRange),
      macronutrientRatio: JSON.parse(macronutrientRatio),
      recommendedFoods: JSON.parse(recommendedFoods),
      mealsPerDay,
      mealStructure: JSON.parse(mealStructure),
      weeklyGroceryList: weeklyGroceryList ? JSON.parse(weeklyGroceryList) : {
        protein: [],
        vegetables: [],
        carbs: [],
        fats: [],
        fruits: [],
        other: [],
      },
      foodsToAvoid: JSON.parse(foodsToAvoid),
      supplementsSuggested: supplementsSuggested ? JSON.parse(supplementsSuggested) : [],
      exerciseRecommendation: exerciseRecommendation || "",
      createdBy: req.user.id,
      creatorInfo: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photo: user.photo || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating plan",
      error: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Find plan
    let plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if user is the creator
    if (plan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this plan",
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Remove creatorInfo from update data to prevent tampering
    delete updateData.creatorInfo;
    delete updateData.createdBy;

    // Parse JSON fields if they exist
    if (req.body.macronutrientRatio) {
      const { carbs, protein, fat } = JSON.parse(req.body.macronutrientRatio);
      if (carbs + protein + fat !== 100) {
        return res.status(400).json({
          success: false,
          message: "Macronutrient ratio must sum to 100%",
        });
      }
      updateData.macronutrientRatio = JSON.parse(req.body.macronutrientRatio);
    }

    if (req.body.dailyCalorieRange) {
      updateData.dailyCalorieRange = JSON.parse(req.body.dailyCalorieRange);
    }

    if (req.body.recommendedFoods) {
      updateData.recommendedFoods = JSON.parse(req.body.recommendedFoods);
    }

    if (req.body.mealStructure) {
      updateData.mealStructure = JSON.parse(req.body.mealStructure);
    }

    if (req.body.weeklyGroceryList) {
      updateData.weeklyGroceryList = JSON.parse(req.body.weeklyGroceryList);
    }

    if (req.body.foodsToAvoid) {
      updateData.foodsToAvoid = JSON.parse(req.body.foodsToAvoid);
    }

    if (req.body.supplementsSuggested) {
      updateData.supplementsSuggested = JSON.parse(req.body.supplementsSuggested);
    }

    // Upload new image if provided
    if (req.file) {
      try {
        const base64Image = req.file.buffer.toString("base64");
        const uploadResponse = await imagekit.upload({
          file: base64Image,
          fileName: `${Date.now()}-${req.file.originalname}`,
          folder: "/plans",
        });
        updateData.planImage = uploadResponse.url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Error uploading new image",
          error: uploadError.message,
        });
      }
    }

    // Update plan
    plan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating plan",
      error: error.message,
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if user is the creator
    if (plan.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this plan",
      });
    }

    await plan.deleteOne();

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting plan",
      error: error.message,
    });
  }
};

export const getMyPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your plans",
      error: error.message,
    });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, minDuration, maxDuration } = req.query;

    // Build filter object
    let filter = {};

    if (category) {
      filter.planCategory = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minDuration || maxDuration) {
      filter.duration = {};
      if (minDuration) filter.duration.$gte = Number(minDuration);
      if (maxDuration) filter.duration.$lte = Number(maxDuration);
    }

    const plans = await Plan.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching plans",
      error: error.message,
    });
  }
};

// Get single plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching plan",
      error: error.message,
    });
  }
};