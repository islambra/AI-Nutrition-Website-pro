import AiAccess from "../models/AiAccess.js";
import Payment from "../models/Payment.js";

const AI_TRACKER_PRICE = 1500; // Algerian Affordable Pricing (DZD)

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
      // No purchaseType needed since we can identify by the AiAccess record
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