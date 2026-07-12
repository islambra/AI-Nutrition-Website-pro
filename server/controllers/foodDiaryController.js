import FoodDiaryEntry from "../models/FoodDiaryEntry.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createEntry = async (req, res) => {
  try {
    const { dieteticienId, date, mealType, description, notes, calories, protein, carbs, fat } = req.body;
    const clientId = req.user.id;

    if (!mealType || !description) {
      return res.status(400).json({ success: false, message: "mealType and description are required" });
    }

    if (dieteticienId) {
      if (!mongoose.Types.ObjectId.isValid(dieteticienId)) {
        return res.status(400).json({ success: false, message: "Invalid dieteticien ID" });
      }
      const dietUser = await User.findById(dieteticienId);
      if (!dietUser || dietUser.role !== "dieteticien") {
        return res.status(400).json({ success: false, message: "Referenced user is not a valid dieteticien" });
      }
    }

    const entry = await FoodDiaryEntry.create({
      client: clientId,
      dieteticien: dieteticienId,
      date: date || new Date(),
      mealType,
      description,
      notes: notes || "",
      calories: calories || null,
      protein: protein || null,
      carbs: carbs || null,
      fat: fat || null
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating food diary entry" });
  }
};

export const getMyEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const query = { client: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [entries, total] = await Promise.all([
      FoodDiaryEntry.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      FoodDiaryEntry.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: entries, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching food diary entries" });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entry = await FoodDiaryEntry.findOneAndDelete({
      _id: req.params.id,
      client: req.user.id
    });
    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }
    res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting entry" });
  }
};

export const getSubscriberEntries = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const query = { client: clientId, dieteticien: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [entries, total] = await Promise.all([
      FoodDiaryEntry.find(query).populate("client", "fullName email photo").sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      FoodDiaryEntry.countDocuments(query)
    ]);

    res.status(200).json({ success: true, data: entries, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscriber entries" });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const dieteticienId = req.user.id;

    const entry = await FoodDiaryEntry.findById(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }
    if (entry.dieteticien.toString() !== dieteticienId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    entry.dieteticienFeedback = feedback;
    entry.dieteticienFeedbackAt = new Date();
    await entry.save();

    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding feedback" });
  }
};

export const getNutritionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const clientId = req.user.id;

    const matchStage = { client: new mongoose.Types.ObjectId(clientId) };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const result = await FoodDiaryEntry.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          calories: { $sum: { $ifNull: ["$calories", 0] } },
          protein: { $sum: { $ifNull: ["$protein", 0] } },
          carbs: { $sum: { $ifNull: ["$carbs", 0] } },
          fat: { $sum: { $ifNull: ["$fat", 0] } },
          entryCount: { $sum: 1 },
          mealTypes: { $push: "$mealType" }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const dailyMap = {};
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    const mealTypeCounts = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };

    result.forEach(day => {
      dailyMap[day._id] = {
        calories: day.calories,
        protein: day.protein,
        carbs: day.carbs,
        fat: day.fat,
        entryCount: day.entryCount
      };
      totalCalories += day.calories;
      totalProtein += day.protein;
      totalCarbs += day.carbs;
      totalFat += day.fat;
      day.mealTypes.forEach(mt => {
        if (mt && mealTypeCounts[mt] !== undefined) mealTypeCounts[mt]++;
      });
    });

    const daysWithNutrition = Object.values(dailyMap).filter(d => d.calories > 0).length;
    const totalEntries = result.reduce((sum, d) => sum + d.entryCount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalEntries,
        totalDays: result.length,
        dailyBreakdown: dailyMap,
        totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        averages: daysWithNutrition > 0 ? {
          calories: Math.round(totalCalories / daysWithNutrition),
          protein: Math.round(totalProtein / daysWithNutrition),
          carbs: Math.round(totalCarbs / daysWithNutrition),
          fat: Math.round(totalFat / daysWithNutrition)
        } : { calories: 0, protein: 0, carbs: 0, fat: 0 },
        mealTypeCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching nutrition summary" });
  }
};
