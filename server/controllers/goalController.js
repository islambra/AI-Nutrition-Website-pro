import Goal from "../models/Goal.js";

export const createGoal = async (req, res) => {
  try {
    const { dieteticienId, title, description, targetDate } = req.body;
    const clientId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const goal = await Goal.create({
      client: clientId,
      dieteticien: dieteticienId,
      title,
      description: description || "",
      targetDate: targetDate || null
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating goal" });
  }
};

export const getMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ client: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching goals" });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status, progress } = req.body;
    const clientId = req.user.id;

    const goal = await Goal.findOne({ _id: id, client: clientId });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (status !== undefined) goal.status = status;
    if (progress !== undefined) goal.progress = progress;

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating goal" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      client: req.user.id
    });
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }
    res.status(200).json({ success: true, message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting goal" });
  }
};

export const getSubscriberGoals = async (req, res) => {
  try {
    const { clientId } = req.params;
    const goals = await Goal.find({ client: clientId, dieteticien: req.user.id })
      .populate("client", "fullName email photo")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscriber goals" });
  }
};

export const updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;
    const dieteticienId = req.user.id;

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }
    if (goal.dieteticien.toString() !== dieteticienId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (progress !== undefined) goal.progress = Math.min(100, Math.max(0, progress));
    if (status !== undefined) goal.status = status;

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating goal progress" });
  }
};
