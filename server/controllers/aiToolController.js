import Payment from "../models/Payment.js";
import AiToolSubscription from "../models/AiToolSubscription.js";
import imagekit from "../configs/imageKit.js";

const AI_TOOL_SUBSCRIPTION_PRICE = 499.99;

export const getPlatformPaymentInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        ccpNumber: process.env.PLATFORM_CCP_NUMBER || null,
        ccpKey: process.env.PLATFORM_CCP_KEY || null,
        baridiMob: process.env.PLATFORM_BARIDI_MOB || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment info" });
  }
};

export const initiateAiToolSubscription = async (req, res) => {
  let uploadedFileId = null;
  try {
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    if (!paymentMethod || !["ccp", "baridimob"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method. Use 'ccp' or 'baridimob'." });
    }

    const existing = await AiToolSubscription.findOne({ user: userId });
    if (existing && existing.hasAccess && existing.endDate && new Date(existing.endDate) > new Date()) {
      return res.status(400).json({ success: false, message: "You already have an active AI tool subscription" });
    }

    let proofImage = null;
    let proofImageFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `ai-tool-sub-proof-${Date.now()}-${req.file.originalname}`,
        folder: "/payment-proofs",
      });
      proofImage = upload.url;
      proofImageFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const payment = await Payment.create({
      user: userId,
      amount: AI_TOOL_SUBSCRIPTION_PRICE,
      paymentMethod,
      status: "pending",
      proofImage,
      proofImageFileId,
      aiToolSubscription: true
    });

    res.status(201).json({
      success: true,
      message: "AI Tool subscription payment proof submitted. Waiting for admin approval.",
      data: payment
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Error initiating subscription" });
  }
};

export const checkAiToolAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await AiToolSubscription.findOne({ user: userId });

    let hasAccess = false;
    if (sub && sub.hasAccess && sub.endDate && new Date(sub.endDate) > new Date()) {
      hasAccess = true;
    }

    res.status(200).json({ success: true, hasAccess });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking access" });
  }
};

export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const sub = await AiToolSubscription.findOne({ user: userId })
      .populate("payment", "amount status paymentMethod createdAt");

    if (!sub) {
      return res.status(200).json({ success: true, data: null });
    }

    const isActive = sub.hasAccess && sub.endDate && new Date(sub.endDate) > new Date();
    const daysRemaining = isActive ? Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
      success: true,
      data: {
        hasAccess: sub.hasAccess,
        isActive,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysRemaining,
        payment: sub.payment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscription" });
  }
};
