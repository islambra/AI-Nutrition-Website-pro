import multer from 'multer';
import AiAccess from '../models/AiAccess.js';
import Payment from '../models/Payment.js';
import { detectFood } from '../services/aiService.js';
import { getNutritionForFood } from '../utils/foodNutritionMap.js';

const AI_TRACKER_PRICE = 1500; // Algerian Affordable Pricing (DZD)

// Helper ingredients & insights (can be expanded)
const ingredientsMap = {
  'salmon': ['Salmon', 'Lemon', 'Dill', 'Olive Oil'],
  'broccoli': ['Broccoli', 'Garlic', 'Lemon Juice'],
  'steak': ['Beef Steak', 'Salt', 'Pepper', 'Butter'],
  'chicken duck': ['Chicken', 'Duck', 'Herbs', 'Spices'],
  'bread': ['Wheat Flour', 'Yeast', 'Salt', 'Water'],
  'pizza': ['Dough', 'Tomato Sauce', 'Cheese', 'Pepperoni'],
  'pasta': ['Durum Wheat', 'Water', 'Salt'],
  'rice': ['White Rice', 'Water', 'Salt'],
  'salad': ['Lettuce', 'Tomatoes', 'Cucumber', 'Dressing']
};

function getInsight(nutrition, foodName) {
  if (nutrition.protein > 25) return 'High‑protein meal – great for muscle repair.';
  if (nutrition.fat < 5) return 'Very low fat – ideal for weight management.';
  if (nutrition.calories < 200) return 'Light meal – low in calories.';
  if (nutrition.carbs < 10) return 'Low‑carb choice – supports metabolic health.';
  return 'Balanced nutritional profile – part of a healthy diet.';
}

function computeHealthScore(nutrition) {
  let score = 70;
  if (nutrition.calories < 500) score += 10;
  if (nutrition.protein > 20) score += 10;
  if (nutrition.fat < 15) score += 5;
  if (nutrition.carbs < 30) score += 5;
  if (nutrition.healthScore) score = (score + nutrition.healthScore) / 2;
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Check if the user already has AI access
export const checkAiAccess = async (req, res) => {
  try {
    const access = await AiAccess.findOne({ user: req.user.id });
    res.status(200).json({
      success: true,
      hasAccess: access ? access.hasAccess : false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Buy AI access (one‑time payment)
export const buyAiAccess = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if already purchased
    const existing = await AiAccess.findOne({ user: userId });
    if (existing && existing.hasAccess) {
      return res.status(400).json({
        success: false,
        message: "You already have AI Tracker access"
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      amount: AI_TRACKER_PRICE,
      paymentMethod: req.body.paymentMethod || "credit_card"
    });

    // Grant access (or update existing record)
    if (existing) {
      existing.hasAccess = true;
      existing.payment = payment._id;
      await existing.save();
    } else {
      await AiAccess.create({
        user: userId,
        hasAccess: true,
        payment: payment._id
      });
    }

    res.status(201).json({
      success: true,
      message: "AI Tracker unlocked!",
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Multer setup for image upload
const upload = multer({ storage: multer.memoryStorage() });

// Image analysis endpoint
export const analyzeImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Verify user has access before analyzing
      const access = await AiAccess.findOne({ user: req.user.id });
      if (!access || !access.hasAccess) {
        return res.status(403).json({ error: 'AI Tracker not purchased' });
      }

      const { foodName, confidence } = await detectFood(req.file.buffer);
      const nutrition = getNutritionForFood(foodName);
      const ingredients = ingredientsMap[foodName] || [foodName];
      const insight = getInsight(nutrition, foodName);
      const healthScore = computeHealthScore(nutrition);

      res.json({
        foodName,
        confidence,
        calories: nutrition.calories,
        macros: {
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat
        },
        ingredients,
        insight,
        healthScore
      });
    } catch (err) {
      console.error('Analysis error:', err);
      res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  }
];