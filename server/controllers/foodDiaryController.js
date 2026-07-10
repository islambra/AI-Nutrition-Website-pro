import FoodDiaryEntry from "../models/FoodDiaryEntry.js";

export const createEntry = async (req, res) => {
  try {
    const { dieteticienId, date, mealType, description, notes } = req.body;
    const clientId = req.user.id;

    if (!mealType || !description) {
      return res.status(400).json({ success: false, message: "mealType and description are required" });
    }

    const entry = await FoodDiaryEntry.create({
      client: clientId,
      dieteticien: dieteticienId,
      date: date || new Date(),
      mealType,
      description,
      notes: notes || ""
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating food diary entry" });
  }
};

export const getMyEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { client: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await FoodDiaryEntry.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: entries });
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
    const query = { client: clientId, dieteticien: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await FoodDiaryEntry.find(query)
      .populate("client", "fullName email photo")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: entries });
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
