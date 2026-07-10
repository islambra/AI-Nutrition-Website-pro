import ProgressEntry from "../models/ProgressEntry.js";

export const createProgressEntry = async (req, res) => {
  try {
    const { dieteticienId, date, weight, waist, bodyFat, notes } = req.body;
    const clientId = req.user.id;

    if (weight === undefined || weight === null) {
      return res.status(400).json({ success: false, message: "Weight is required" });
    }

    const entry = await ProgressEntry.create({
      client: clientId,
      dieteticien: dieteticienId,
      date: date || new Date(),
      weight,
      waist: waist || null,
      bodyFat: bodyFat || null,
      notes: notes || ""
    });

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating progress entry" });
  }
};

export const getMyProgress = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { client: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await ProgressEntry.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching progress entries" });
  }
};

export const deleteProgressEntry = async (req, res) => {
  try {
    const entry = await ProgressEntry.findOneAndDelete({
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

export const getSubscriberProgress = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;
    const query = { client: clientId, dieteticien: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await ProgressEntry.find(query)
      .populate("client", "fullName email photo")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscriber progress" });
  }
};
