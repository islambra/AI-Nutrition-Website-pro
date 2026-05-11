import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Plan from './models/Plan.js';
import connectDB from './configs/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const seedPlans = async () => {
  try {
    console.log('Connecting to database...');
    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL is not defined in .env');
    }
    await connectDB();

    // 1. Find or create a Nutritionist user
    let nutritionist = await User.findOne({ role: 'Nutritionist' });
    
    if (!nutritionist) {
      console.log('No nutritionist found, creating one...');
      const hashedPassword = await bcrypt.hash('nutritionist123', 10);
      nutritionist = await User.create({
        fullName: 'Dr. Sarah Smith',
        email: 'sarah.smith@example.com',
        password: hashedPassword,
        role: 'Nutritionist',
        photo: 'https://images.unsplash.com/photo-1559839734-2b71f153673f?q=80&w=200&h=200&auto=format&fit=crop'
      });
      console.log('Nutritionist created!');
    }

    // 2. Clear existing plans to update pricing
    await Plan.deleteMany({});
    console.log('Existing plans cleared.');

    const plansData = [
      {
        planName: "12-Week Weight Loss",
        planCategory: "Weight Loss",
        targetUserProfile: "Individuals looking for sustainable weight loss.",
        description: "Comprehensive 12-week program designed for body fat reduction while maintaining muscle mass.",
        planImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop",
        duration: 12,
        price: 10.00, // ~1400 DZD
        consultationIncluded: 4,
        followUpFrequency: "Weekly",
        dailyCalorieRange: { min: 1400, max: 1600 },
        macronutrientRatio: { carbs: 35, protein: 40, fat: 25 },
        recommendedFoods: ["Grilled Chicken", "Quinoa", "Spinach", "Greek Yogurt"],
        mealsPerDay: 4,
        mealStructure: {
          "Breakfast": ["Oatmeal with berries"],
          "Lunch": ["Chicken salad"],
          "Snack": ["Almonds"],
          "Dinner": ["Baked salmon"]
        },
        weeklyGroceryList: {
          protein: ["Chicken", "Salmon"],
          vegetables: ["Spinach", "Broccoli"],
          carbs: ["Oats", "Quinoa"],
          fats: ["Almonds", "Olive Oil"],
          fruits: ["Berries"],
          other: ["Green Tea"]
        },
        foodsToAvoid: ["Sugary drinks", "Deep-fried foods"],
        supplementsSuggested: ["Multivitamin"],
        exerciseRecommendation: "Moderate cardio 4x/week.",
        createdBy: nutritionist._id,
        creatorInfo: {
          fullName: nutritionist.fullName,
          email: nutritionist.email,
          role: nutritionist.role,
          photo: nutritionist.photo
        }
      },
      {
        planName: "Elite Muscle Building",
        planCategory: "Muscle Gain",
        targetUserProfile: "Athletes aiming for lean muscle mass.",
        description: "High-protein, calorie-surplus plan designed to fuel heavy lifting and recovery.",
        planImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
        duration: 8,
        price: 15.00, // ~2100 DZD
        consultationIncluded: 2,
        followUpFrequency: "Every 2 weeks",
        dailyCalorieRange: { min: 2800, max: 3200 },
        macronutrientRatio: { carbs: 50, protein: 30, fat: 20 },
        recommendedFoods: ["Beef", "Eggs", "Sweet Potato", "Whey Protein"],
        mealsPerDay: 5,
        mealStructure: {
          "Breakfast": ["4 Whole Eggs"],
          "Mid-Morning": ["Protein shake"],
          "Lunch": ["Ground beef with pasta"],
          "Pre-Workout": ["Chicken breast"],
          "Dinner": ["Steak or Fish"]
        },
        weeklyGroceryList: {
          protein: ["Beef", "Chicken", "Whey"],
          vegetables: ["Mixed Greens"],
          carbs: ["Pasta", "Rice", "Oats"],
          fats: ["Peanut Butter"],
          fruits: ["Bananas"],
          other: ["Creatine"]
        },
        foodsToAvoid: ["Empty calorie snacks"],
        supplementsSuggested: ["Creatine", "Whey"],
        exerciseRecommendation: "Heavy resistance training 4-5x/week.",
        createdBy: nutritionist._id,
        creatorInfo: {
          fullName: nutritionist.fullName,
          email: nutritionist.email,
          role: nutritionist.role,
          photo: nutritionist.photo
        }
      },
      {
        planName: "Diabetes Glucose Control",
        planCategory: "Diabetes",
        targetUserProfile: "Individuals focusing on blood sugar stabilization.",
        description: "Low-glycemic index plan to help stabilize glucose levels and improve insulin sensitivity.",
        planImage: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=800&auto=format&fit=crop",
        duration: 24,
        price: 20.00, // ~2800 DZD
        consultationIncluded: 8,
        followUpFrequency: "Monthly",
        dailyCalorieRange: { min: 1600, max: 1800 },
        macronutrientRatio: { carbs: 40, protein: 25, fat: 35 },
        recommendedFoods: ["Lentils", "Leafy Greens", "Nuts"],
        mealsPerDay: 3,
        mealStructure: {
          "Breakfast": ["Low-GI muesli"],
          "Lunch": ["Lentil soup"],
          "Dinner": ["Grilled fish"]
        },
        weeklyGroceryList: {
          protein: ["Lentils", "Fish"],
          vegetables: ["Kale", "Asparagus"],
          carbs: ["Quinoa", "Beans"],
          fats: ["Chia Seeds"],
          fruits: ["Berries"],
          other: ["Cinnamon"]
        },
        foodsToAvoid: ["High fructose syrups", "Fruit juices"],
        supplementsSuggested: ["Magnesium"],
        exerciseRecommendation: "Walking 15-20 mins after meals.",
        createdBy: nutritionist._id,
        creatorInfo: {
          fullName: nutritionist.fullName,
          email: nutritionist.email,
          role: nutritionist.role,
          photo: nutritionist.photo
        }
      },
      {
        planName: "PCOS Balance & Support",
        planCategory: "PCOS & Hormonal Balance",
        targetUserProfile: "Women managing PCOS symptoms.",
        description: "Focuses on anti-inflammatory foods and insulin-sensitizing nutrients for hormonal health.",
        planImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
        duration: 16,
        price: 18.00, // ~2520 DZD
        consultationIncluded: 6,
        followUpFrequency: "Weekly",
        dailyCalorieRange: { min: 1500, max: 1700 },
        macronutrientRatio: { carbs: 30, protein: 35, fat: 35 },
        recommendedFoods: ["Walnuts", "Spearmint Tea", "Pumpkin Seeds"],
        mealsPerDay: 3,
        mealStructure: {
          "Breakfast": ["Chia seed pudding"],
          "Lunch": ["Mediterranean bowl"],
          "Dinner": ["Tofu stir-fry"]
        },
        weeklyGroceryList: {
          protein: ["Salmon", "Tofu"],
          vegetables: ["Ginger", "Garlic"],
          carbs: ["Buckwheat"],
          fats: ["Walnuts"],
          fruits: ["Berries"],
          other: ["Spearmint Tea"]
        },
        foodsToAvoid: ["High-sugar snacks"],
        supplementsSuggested: ["Inositol", "Omega-3"],
        exerciseRecommendation: "Low-impact strength training and yoga.",
        createdBy: nutritionist._id,
        creatorInfo: {
          fullName: nutritionist.fullName,
          email: nutritionist.email,
          role: nutritionist.role,
          photo: nutritionist.photo
        }
      }
    ];

    for (const planData of plansData) {
      await Plan.create(planData);
      console.log(`Created plan: ${planData.planName}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();
