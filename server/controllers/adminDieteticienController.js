import User from "../models/User.js";
import Dieteticien from "../models/Dieteticien.js";
import PendingDieteticien from "../models/PendingDieteticien.js";
import imagekit from "../configs/imageKit.js";
import { sendApprovalEmail } from "../services/emailService.js";
import { securityLogger } from "../middleware/securityLogger.js";

export const getPendingDieteticiens = async (req, res) => {
  try {
    const pending = await PendingDieteticien.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pending dieteticiens" });
  }
};

export const approveDieteticien = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await PendingDieteticien.findById(id);

    if (!pending) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (pending.status !== "pending") {
      return res.status(400).json({ success: false, message: `Request already ${pending.status}` });
    }

    const existingUser = await User.findOne({ email: pending.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "A user with this email already exists" });
    }

    const newUser = await User.create({
      fullName: pending.fullName,
      email: pending.email,
      password: pending.hashedPassword,
      role: "dieteticien"
    });

    await Dieteticien.create({
      user: newUser._id,
      specialty: pending.specialty,
      diplomaUrl: pending.diplomaUrl,
      isApproved: true,
      ccpNumber: pending.ccpNumber || null,
      ccpKey: pending.ccpKey || null,
      baridiMob: pending.baridiMob || null
    });

    securityLogger.adminAction(req.user._id.toString(), 'APPROVE_DIETETICIEN', id, pending.email);
    await sendApprovalEmail(pending.email, pending.fullName);

    await PendingDieteticien.findByIdAndDelete(id);

    const { password: _, ...userSafe } = newUser.toObject();
    res.status(200).json({
      success: true,
      message: "Dieteticien approved successfully. An approval email has been sent.",
      user: userSafe
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving dieteticien" });
  }
};

export const rejectDieteticien = async (req, res) => {
  try {
    const { id } = req.params;
    const pending = await PendingDieteticien.findById(id);

    if (!pending) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (pending.diplomaFileId) {
      try { await imagekit.deleteFile(pending.diplomaFileId); } catch (_) {}
    }

    await PendingDieteticien.findByIdAndDelete(id);

    securityLogger.adminAction(req.user._id.toString(), 'REJECT_DIETETICIEN', id, pending.fullName);
    res.status(200).json({
      success: true,
      message: `Request from ${pending.fullName} has been rejected and removed.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting dieteticien" });
  }
};