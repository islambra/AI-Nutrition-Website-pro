import Consultation from "../models/Consultation.js";
import UserPlan from "../models/UserPlan.js";
import Plan from "../models/Plan.js";
import { createZoomMeeting } from "../utils/zoom.js";

// Book a consultation (user side)
export const bookConsultation = async (req, res) => {
  try {
    const { userPlanId, requestedDateTime, note } = req.body;
    const userId = req.user.id;

    if (new Date(requestedDateTime) <= new Date()) {
      return res.status(400).json({ success: false, message: "Date must be in the future" });
    }

    // Atomic decrement — prevents race condition where 2 users book the last session
    const userPlan = await UserPlan.findOneAndUpdate(
      { _id: userPlanId, user: userId, sessionsRemaining: { $gt: 0 } },
      { $inc: { sessionsRemaining: -1 } },
      { new: true }
    ).populate("plan");

    if (!userPlan) {
      const exists = await UserPlan.findById(userPlanId);
      if (!exists) return res.status(404).json({ success: false, message: "User plan not found" });
      if (exists.user.toString() !== userId) return res.status(403).json({ success: false, message: "Not authorized" });
      return res.status(400).json({ success: false, message: "No sessions remaining" });
    }

    const plan = userPlan.plan;
    if (!plan || !plan.createdBy) return res.status(400).json({ success: false, message: "Plan has no assigned nutritionist" });

    const consultation = await Consultation.create({
      user: userId,
      userPlan: userPlan._id,
      nutritionist: plan.createdBy,
      plan: plan._id,
      requestedDateTime,
      note: note || ""
    });

    res.status(201).json({ success: true, message: "Consultation booked", data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error booking consultation" });
  }
};

// Get user's consultations (unchanged)
export const getUserConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate("userPlan")
      .populate("nutritionist", "fullName email")
      .populate("plan", "planName planCategory")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching consultations" });
  }
};

// Get consultations for a specific user plan (unchanged)
export const getConsultationsByUserPlan = async (req, res) => {
  try {
    const { userPlanId } = req.params;
    const consultations = await Consultation.find({
      user: req.user.id,
      userPlan: userPlanId
    }).populate("nutritionist", "fullName email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching consultations" });
  }
};

// Nutritionist: Get pending requests (unchanged)
export const getNutritionistRequests = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      nutritionist: req.user.id,
      status: { $in: ["pending", "accepted"] }
    })
      .populate("user", "fullName email")
      .populate("plan", "planName")
      .populate("userPlan")
      .sort({ requestedDateTime: 1 });
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
};

// Accept consultation (creates Zoom meeting automatically)
export const acceptConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id)
      .populate("user", "fullName email")
      .populate("plan", "planName");

    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found" });
    if (consultation.nutritionist.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Unauthorized" });
    if (consultation.status !== "pending") return res.status(400).json({ success: false, message: `Already ${consultation.status}` });

    const startTime = new Date(consultation.requestedDateTime).toISOString();
    const planName = consultation.plan?.planName || "Suivi Nutritionnel";
    const topic = `${consultation.user.fullName} - ${planName} Consultation`;
    const meeting = await createZoomMeeting(topic, startTime, 60);

    consultation.status = "accepted";
    consultation.zoomLink = meeting.joinUrl;
    consultation.zoomStartUrl = meeting.startUrl;
    consultation.meetingId = meeting.zoomMeetingId;
    consultation.meetingPassword = meeting.password;
    await consultation.save();

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    console.error("Accept consultation error:", error);
    res.status(500).json({ success: false, message: "Failed to accept consultation" });
  }
};

// Reject consultation (restores session)
export const rejectConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, nutritionist: req.user.id, status: "pending" },
      { status: "rejected" },
      { new: true }
    );
    if (!consultation) return res.status(404).json({ success: false, message: "Request not found or already processed" });

    if (consultation.userPlan) {
      await UserPlan.findOneAndUpdate(
        { _id: consultation.userPlan },
        { $inc: { sessionsRemaining: 1 } }
      );
    }

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting consultation" });
  }
};

// Mark consultation as completed
export const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, nutritionist: req.user.id, status: "accepted" },
      { status: "completed" },
      { new: true }
    );
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found" });
    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error completing consultation" });
  }
};

// Cancel consultation (by user) – only pending, restores session
export const cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, user: req.user.id, status: "pending" },
      { status: "cancelled" },
      { new: true }
    );
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found or already processed" });

    await UserPlan.findOneAndUpdate(
      { _id: consultation.userPlan },
      { $inc: { sessionsRemaining: 1 } }
    );

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling consultation" });
  }
};

// Delete consultation (hard delete)
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ success: false, message: "Not found" });
    if (consultation.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
    await consultation.deleteOne();
    res.status(200).json({ success: true, message: "Consultation deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting consultation" });
  }
};