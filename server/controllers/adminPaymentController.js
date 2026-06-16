import Payment from '../models/Payment.js';
import UserPlan from '../models/UserPlan.js';
import UserFormation from '../models/UserFormation.js';
import CourseSubscription from '../models/CourseSubscription.js';
import AiToolSubscription from '../models/AiToolSubscription.js';
import Consultation from '../models/Consultation.js';
import imagekit from '../configs/imageKit.js';

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "approved" })
      .populate('user', 'fullName email')
      .populate('plan', 'name price')
      .populate('formation', 'title price')
      .sort({ createdAt: -1 });

    const enrichedPayments = await Promise.all(payments.map(async (payment) => {
      let type = 'Unknown';
      if (payment.plan) {
        type = 'Plan';
      } else if (payment.formation) {
        type = 'Formation';
      } else if (payment.courseSubscription) {
        type = 'Course Subscription';
      } else if (payment.aiToolSubscription) {
        type = 'AI Tracker';
      }
      return {
        ...payment.toJSON(),
        type
      };
    }));

    res.status(200).json({ success: true, data: enrichedPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    const userPlans = await UserPlan.find({ payment: id }, '_id');
    const userPlanIds = userPlans.map(up => up._id);

    if (userPlanIds.length > 0) {
      await Consultation.deleteMany({ userPlan: { $in: userPlanIds } });
    }

    await UserPlan.deleteMany({ payment: id });
    await UserFormation.deleteMany({ payment: id });
    await CourseSubscription.deleteMany({ payment: id });
    await AiToolSubscription.deleteMany({ payment: id });

    await Payment.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Payment and all related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending course subscription payments
export const getPendingCourseSubscriptions = async (req, res) => {
  try {
    const payments = await Payment.find({
      courseSubscription: true,
      status: "pending"
    })
      .populate("user", "fullName email photo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve course subscription
export const approveCourseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.courseSubscription) {
      return res.status(400).json({ success: false, message: "Not a course subscription payment" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "approved";
    await payment.save();

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const existing = await CourseSubscription.findOne({ user: payment.user });
    if (existing) {
      existing.hasAccess = true;
      existing.startDate = now;
      existing.endDate = endDate;
      existing.payment = payment._id;
      await existing.save();
    } else {
      await CourseSubscription.create({
        user: payment.user,
        hasAccess: true,
        startDate: now,
        endDate: endDate,
        payment: payment._id
      });
    }

    res.status(200).json({ success: true, message: "Course subscription approved. Student has access for 1 year." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject course subscription
export const rejectCourseSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.courseSubscription) {
      return res.status(400).json({ success: false, message: "Not a course subscription payment" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "rejected";
    await payment.save();

    if (payment.proofImageFileId) {
      try { await imagekit.deleteFile(payment.proofImageFileId); } catch (_) {}
    }

    res.status(200).json({ success: true, message: "Course subscription payment rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending AI tool subscription payments
export const getPendingAiToolSubscriptions = async (req, res) => {
  try {
    const payments = await Payment.find({
      aiToolSubscription: true,
      status: "pending"
    })
      .populate("user", "fullName email photo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve AI tool subscription
export const approveAiToolSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.aiToolSubscription) {
      return res.status(400).json({ success: false, message: "Not an AI tool subscription payment" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "approved";
    await payment.save();

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const existing = await AiToolSubscription.findOne({ user: payment.user });
    if (existing) {
      existing.hasAccess = true;
      existing.startDate = now;
      existing.endDate = endDate;
      existing.payment = payment._id;
      await existing.save();
    } else {
      await AiToolSubscription.create({
        user: payment.user,
        hasAccess: true,
        startDate: now,
        endDate: endDate,
        payment: payment._id
      });
    }

    res.status(200).json({ success: true, message: "AI Tool subscription approved. User has access for 1 year." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject AI tool subscription
export const rejectAiToolSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (!payment.aiToolSubscription) {
      return res.status(400).json({ success: false, message: "Not an AI tool subscription payment" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "rejected";
    await payment.save();

    if (payment.proofImageFileId) {
      try { await imagekit.deleteFile(payment.proofImageFileId); } catch (_) {}
    }

    res.status(200).json({ success: true, message: "AI Tool subscription payment rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};