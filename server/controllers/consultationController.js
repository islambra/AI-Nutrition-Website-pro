import Consultation from "../models/Consultation.js";
import UserPlan from "../models/UserPlan.js";
import Plan from "../models/Plan.js";
import { createZoomMeeting } from "../utils/zoom.js";

// Book a consultation (user side)
export const bookConsultation = async (req, res) => {
  try {
    const { userPlanId, requestedDateTime, note } = req.body;
    const userId = req.user.id;

    const userPlan = await UserPlan.findById(userPlanId).populate("plan");
    if (!userPlan) return res.status(404).json({ success: false, message: "User plan not found" });
    if (userPlan.user.toString() !== userId) return res.status(403).json({ success: false, message: "Not authorized" });
    if (userPlan.sessionsRemaining <= 0) return res.status(400).json({ success: false, message: "No sessions remaining" });

    const plan = await Plan.findById(userPlan.plan);
    if (!plan || !plan.createdBy) return res.status(400).json({ success: false, message: "Plan has no assigned nutritionist" });

    if (new Date(requestedDateTime) <= new Date()) {
      return res.status(400).json({ success: false, message: "Date must be in the future" });
    }

    userPlan.sessionsRemaining -= 1;
    await userPlan.save();

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's consultations (unchanged)
export const getUserConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate("userPlan")
      .populate("nutritionist", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    const topic = `${consultation.user.fullName} - ${consultation.plan.planName} Consultation`;
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
    res.status(500).json({ success: false, message: error.message || "Failed to accept consultation" });
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

    const userPlan = await UserPlan.findById(consultation.userPlan);
    if (userPlan) {
      userPlan.sessionsRemaining += 1;
      await userPlan.save();
    }

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel consultation (by user) – only pending, restores session
export const cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id);
    if (!consultation) return res.status(404).json({ success: false, message: "Consultation not found" });
    if (consultation.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Not authorized" });
    if (consultation.status !== "pending") return res.status(400).json({ success: false, message: "Only pending bookings can be cancelled" });

    consultation.status = "cancelled";
    await consultation.save();

    const userPlan = await UserPlan.findById(consultation.userPlan);
    if (userPlan) {
      userPlan.sessionsRemaining += 1;
      await userPlan.save();
    }

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};