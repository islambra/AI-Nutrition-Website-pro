import mongoose from "mongoose";
import DieteticienSubscription from "../models/DieteticienSubscription.js";
import Dieteticien from "../models/Dieteticien.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Consultation from "../models/Consultation.js";
import ChatRoom from "../models/ChatRoom.js";
import imagekit from "../configs/imageKit.js";

const SUBSCRIPTION_PRICE = 4000;
const SUBSCRIPTION_DURATION_DAYS = 30;

export const getAllDieteticiens = async (req, res) => {
  try {
    const dieteticiens = await Dieteticien.find({ isApproved: true })
      .populate("user", "fullName email photo")
      .sort({ createdAt: -1 })
      .lean();

    const data = dieteticiens.map(d => ({
      _id: d.user._id,
      fullName: d.user.fullName,
      email: d.user.email,
      photo: d.user.photo,
      specialty: d.specialty,
      dieteticienProfileId: d._id
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dieteticiens" });
  }
};

export const getDieteticienById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user || user.role !== "dieteticien") {
      return res.status(404).json({ success: false, message: "Dieteticien not found" });
    }

    const dieteticien = await Dieteticien.findOne({ user: user._id }).lean();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        photo: user.photo,
        specialty: dieteticien?.specialty || "",
        dieteticienProfileId: dieteticien?._id || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dieteticien" });
  }
};

export const subscribe = async (req, res) => {
  let uploadedFileId = null;
  try {
    const { dieteticienId, paymentMethod } = req.body;
    const clientId = req.user.id;

    if (!paymentMethod || !["ccp", "baridimob"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method. Use 'ccp' or 'baridimob'." });
    }

    const dieteticien = await User.findById(dieteticienId);
    if (!dieteticien || dieteticien.role !== "dieteticien") {
      return res.status(404).json({ success: false, message: "Dieteticien not found" });
    }

    // Check if client already has ANY active subscription with ANY dietitian
    const anyActiveSub = await DieteticienSubscription.findOne({
      client: clientId,
      hasAccess: true,
      endDate: { $gte: new Date() },
      cancelledAt: null
    });
    if (anyActiveSub) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription. You can only subscribe to one dietitian at a time."
      });
    }

    // Check if client already has ANY pending subscription payment with ANY dietitian
    const anyPendingPayment = await Payment.findOne({
      user: clientId,
      dieteticienSubscription: true,
      status: "pending"
    });
    if (anyPendingPayment) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending subscription request. You can only subscribe to one dietitian at a time."
      });
    }

    const activeSub = await DieteticienSubscription.findOne({
      client: clientId,
      dieteticien: dieteticienId,
      hasAccess: true,
      endDate: { $gte: new Date() },
      cancelledAt: null
    });
    if (activeSub) {
      return res.status(400).json({ success: false, message: "You already have an active subscription with this dieteticien" });
    }

    const pendingPayment = await Payment.findOne({
      user: clientId,
      dieteticien: dieteticienId,
      dieteticienSubscription: true,
      status: "pending"
    });
    if (pendingPayment) {
      return res.status(400).json({ success: false, message: "You already have a pending subscription payment for this dieteticien" });
    }

    let proofImage = null;
    let proofImageFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `sub-payment-${Date.now()}-${req.file.originalname}`,
        folder: "/payment-proofs",
      });
      proofImage = upload.url;
      proofImageFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const payment = await Payment.create({
      user: clientId,
      dieteticien: dieteticienId,
      dieteticienSubscription: true,
      amount: SUBSCRIPTION_PRICE,
      paymentMethod,
      status: "pending",
      proofImage,
      proofImageFileId
    });

    res.status(201).json({
      success: true,
      message: "Subscription payment submitted. Waiting for dieteticien confirmation.",
      data: payment
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Error submitting subscription payment" });
  }
};

export const getMySubscriptions = async (req, res) => {
  try {
    const subs = await DieteticienSubscription.find({ client: req.user.id })
      .populate("dieteticien", "fullName email photo")
      .populate("payment")
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const data = subs.map(sub => {
      const isActive = sub.hasAccess && sub.endDate && new Date(sub.endDate) >= now && !sub.cancelledAt;
      const remainingDays = isActive ? Math.ceil((new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)) : 0;
      return { ...sub, isActive, remainingDays };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscriptions" });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subs = await DieteticienSubscription.find({
      dieteticien: req.user.id,
      hasAccess: true,
      endDate: { $gte: new Date() },
      cancelledAt: null
    })
      .populate("client", "fullName email photo")
      .populate("payment")
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const data = subs.map(sub => {
      const remainingDays = Math.ceil((new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24));
      return { ...sub, remainingDays };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscribers" });
  }
};

export const getSubscriberStats = async (req, res) => {
  try {
    const now = new Date();
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);

    const [activeCount, expiringCount, totalRevenue] = await Promise.all([
      DieteticienSubscription.countDocuments({
        dieteticien: req.user.id,
        hasAccess: true,
        endDate: { $gte: now },
        cancelledAt: null
      }),
      DieteticienSubscription.countDocuments({
        dieteticien: req.user.id,
        hasAccess: true,
        endDate: { $gte: now, $lte: weekLater },
        cancelledAt: null
      }),
      DieteticienSubscription.aggregate([
        { $match: { dieteticien: new mongoose.Types.ObjectId(req.user.id), hasAccess: true } },
        { $lookup: { from: "payments", localField: "payment", foreignField: "_id", as: "payment" } },
        { $unwind: "$payment" },
        { $group: { _id: null, total: { $sum: "$payment.amount" } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeSubscribers: activeCount,
        expiringThisWeek: expiringCount,
        monthlyRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        pricePerSubscription: SUBSCRIPTION_PRICE
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching subscription stats" });
  }
};

export const renewSubscription = async (req, res) => {
  let uploadedFileId = null;
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const clientId = req.user.id;

    const oldSub = await DieteticienSubscription.findById(id);
    if (!oldSub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    if (oldSub.client.toString() !== clientId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (oldSub.hasAccess && new Date(oldSub.endDate) > new Date()) {
      return res.status(400).json({ success: false, message: "Subscription is still active" });
    }

    if (!paymentMethod || !["ccp", "baridimob"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method" });
    }

    const pendingPayment = await Payment.findOne({
      user: clientId,
      dieteticien: oldSub.dieteticien,
      dieteticienSubscription: true,
      status: "pending"
    });
    if (pendingPayment) {
      return res.status(400).json({ success: false, message: "You already have a pending renewal payment" });
    }

    let proofImage = null;
    let proofImageFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `sub-renew-${Date.now()}-${req.file.originalname}`,
        folder: "/payment-proofs",
      });
      proofImage = upload.url;
      proofImageFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const payment = await Payment.create({
      user: clientId,
      dieteticien: oldSub.dieteticien,
      dieteticienSubscription: true,
      amount: SUBSCRIPTION_PRICE,
      paymentMethod,
      status: "pending",
      proofImage,
      proofImageFileId
    });

    res.status(201).json({
      success: true,
      message: "Renewal payment submitted. Waiting for dieteticien confirmation.",
      data: { payment, renewedFrom: id }
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Error submitting renewal payment" });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await DieteticienSubscription.findById(id);
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    if (sub.client.toString() !== req.user.id && sub.dieteticien.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (sub.cancelledAt) {
      return res.status(400).json({ success: false, message: "Subscription already cancelled" });
    }

    sub.cancelledAt = new Date();
    await sub.save();

    res.status(200).json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling subscription" });
  }
};

export const requestZoomSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { requestedDateTime, note } = req.body;
    const clientId = req.user.id;

    const sub = await DieteticienSubscription.findById(id);
    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    if (sub.client.toString() !== clientId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (!sub.hasAccess || sub.cancelledAt || new Date(sub.endDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Subscription is not active" });
    }
    if (new Date(requestedDateTime) <= new Date()) {
      return res.status(400).json({ success: false, message: "Date must be in the future" });
    }

    const consultation = await Consultation.create({
      user: clientId,
      nutritionist: sub.dieteticien,
      dieteticienSubscription: sub._id,
      requestedDateTime,
      note: note || ""
    });

    res.status(201).json({ success: true, message: "Zoom session requested", data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error requesting zoom session" });
  }
};

export const checkSubscriptionStatus = async (req, res) => {
  try {
    const { dieteticienId } = req.params;

    const activeSub = await DieteticienSubscription.findOne({
      client: req.user.id,
      dieteticien: dieteticienId,
      hasAccess: true,
      endDate: { $gte: new Date() },
      cancelledAt: null
    });

    res.status(200).json({
      success: true,
      hasActiveSubscription: !!activeSub,
      subscription: activeSub || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error checking subscription status" });
  }
};
