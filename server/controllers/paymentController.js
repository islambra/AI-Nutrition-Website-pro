import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import Formation from "../models/Formation.js";
import UserPlan from "../models/UserPlan.js";
import UserFormation from "../models/UserFormation.js";
import Client from "../models/Client.js";
import ChatRoom from "../models/ChatRoom.js";
import imagekit from "../configs/imageKit.js";

// Initiate offline payment with proof image
export const initiateOfflinePayment = async (req, res) => {
  let uploadedFileId = null;
  try {
    const { planId, formationId, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!paymentMethod || !["ccp", "baridimob"].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Invalid payment method. Use 'ccp' or 'baridimob'." });
    }

    if (!planId && !formationId) {
      return res.status(400).json({ success: false, message: "Either planId or formationId is required" });
    }

    if (planId && formationId) {
      return res.status(400).json({ success: false, message: "Provide only one of planId or formationId" });
    }

    let service = null;
    if (planId) {
      service = await Plan.findById(planId);
      if (!service) return res.status(404).json({ success: false, message: "Plan not found" });
    } else {
      service = await Formation.findById(formationId);
      if (!service) return res.status(404).json({ success: false, message: "Formation not found" });
    }

    const dieteticienId = service.createdBy;
    if (!dieteticienId) {
      return res.status(400).json({ success: false, message: "Service creator not found" });
    }

    let proofImage = null;
    let proofImageFileId = null;
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const upload = await imagekit.upload({
        file: base64,
        fileName: `payment-proof-${Date.now()}-${req.file.originalname}`,
        folder: "/payment-proofs",
      });
      proofImage = upload.url;
      proofImageFileId = upload.fileId;
      uploadedFileId = upload.fileId;
    }

    const payment = await Payment.create({
      user: userId,
      plan: planId || null,
      formation: formationId || null,
      amount: service.price,
      paymentMethod,
      status: "pending",
      proofImage,
      proofImageFileId,
      dieteticien: dieteticienId
    });

    res.status(201).json({
      success: true,
      message: "Payment proof submitted successfully. Waiting for dieteticien confirmation.",
      data: payment
    });
  } catch (error) {
    if (uploadedFileId) {
      try { await imagekit.deleteFile(uploadedFileId); } catch (_) {}
    }
    const devMsg = process.env.NODE_ENV === 'development' ? error.message : undefined;
    res.status(500).json({ success: false, message: "Error submitting payment proof", ...(devMsg && { error: devMsg }) });
  }
};

// Get pending payments for the logged-in dieteticien
export const getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      dieteticien: req.user.id,
      status: "pending"
    })
      .populate("user", "fullName email photo")
      .populate("plan", "planName price")
      .populate("formation", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};

// Approve a pending payment and activate the service
export const approvePayment = async (req, res) => {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).session(mongoSession);

    if (!payment) {
      await mongoSession.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.dieteticien.toString() !== req.user.id) {
      await mongoSession.abortTransaction();
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (payment.status !== "pending") {
      await mongoSession.abortTransaction();
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "approved";
    await payment.save({ session: mongoSession });

    // Activate service (all within the same transaction)
    if (payment.plan) {
      const plan = await Plan.findById(payment.plan).session(mongoSession);
      if (plan) {
        await UserPlan.create([{
          user: payment.user,
          plan: payment.plan,
          payment: payment._id,
          sessionsRemaining: plan.consultationIncluded || 0
        }], { session: mongoSession });

        const client = await Client.findOne({ user: payment.user }).session(mongoSession);
        if (client) {
          client.totalConsultations += plan.consultationIncluded || 0;
          await client.save({ session: mongoSession });
        }

        const planCreatorId = plan.createdBy;
        if (planCreatorId && planCreatorId.toString() !== payment.user.toString()) {
          const existingRoom = await ChatRoom.findOne({
            "participants.user": { $all: [payment.user, planCreatorId] }
          }).session(mongoSession);
          if (!existingRoom) {
            await ChatRoom.create([{
              participants: [
                { user: payment.user, role: "client" },
                { user: planCreatorId, role: "dieteticien" }
              ],
              type: "plan",
              plan: payment.plan
            }], { session: mongoSession });
          }
        }
      }
    }

    if (payment.formation) {
      const formation = await Formation.findById(payment.formation).session(mongoSession);
      if (formation) {
        await UserFormation.create([{
          user: payment.user,
          formation: payment.formation,
          payment: payment._id
        }], { session: mongoSession });

        const formationCreatorId = formation.createdBy;
        if (formationCreatorId && formationCreatorId.toString() !== payment.user.toString()) {
          const existingRoom = await ChatRoom.findOne({
            "participants.user": { $all: [payment.user, formationCreatorId] }
          }).session(mongoSession);
          if (!existingRoom) {
            await ChatRoom.create([{
              participants: [
                { user: payment.user, role: req.user.role === "student" ? "student" : "client" },
                { user: formationCreatorId, role: "dieteticien" }
              ],
              type: "formation",
              formation: payment.formation
            }], { session: mongoSession });
          }
        }
      }
    }

    await mongoSession.commitTransaction();

    if (payment.proofImageFileId) {
      try { await imagekit.deleteFile(payment.proofImageFileId); } catch (_) {}
    }

    res.status(200).json({ success: true, message: "Payment approved and service activated" });
  } catch (error) {
    await mongoSession.abortTransaction();
    res.status(500).json({ success: false, message: "Error approving payment" });
  } finally {
    mongoSession.endSession();
  }
};

// Reject a pending payment
export const rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.dieteticien.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, message: `Payment already ${payment.status}` });
    }

    payment.status = "rejected";
    await payment.save();

    if (payment.proofImageFileId) {
      try { await imagekit.deleteFile(payment.proofImageFileId); } catch (_) {}
    }

    res.status(200).json({ success: true, message: "Payment rejected" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error rejecting payment" });
  }
};

// Check if user owns a plan
export const checkPlanOwnership = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const userPlan = await UserPlan.findOne({
      user: userId,
      plan: planId
    });

    res.status(200).json({
      success: true,
      ownsPlan: !!userPlan,
      userPlan: userPlan || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking plan"
    });
  }
};

// Get all payment requests for the logged-in user
export const getMyRequests = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate("plan", "planName planImage price")
      .populate("formation", "title image price")
      .sort({ createdAt: -1 });

    const enriched = payments.map(p => {
      let serviceType = "ai-tool";
      let serviceName = "AI Scanner";
      if (p.plan) {
        serviceType = "plan";
        serviceName = p.plan?.planName || "Plan";
      } else if (p.formation) {
        serviceType = "formation";
        serviceName = p.formation?.title || "Formation";
      } else if (p.courseSubscription) {
        serviceType = "course";
        serviceName = "Course Subscription";
      }
      return {
        _id: p._id,
        serviceType,
        serviceName,
        serviceImage: p.plan?.planImage || p.formation?.image || null,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        proofImage: p.proofImage,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching requests" });
  }
};

// Delete a user's own rejected payment request
export const deleteMyRequest = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user.id,
      status: "rejected"
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Request not found or already deleted" });
    }

    if (payment.proofImageFileId) {
      try { await imagekit.deleteFile(payment.proofImageFileId); } catch (_) {}
    }

    await Payment.findByIdAndDelete(payment._id);

    res.status(200).json({ success: true, message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting request" });
  }
};

// Get user's purchased plans
export const getUserPlans = async (req, res) => {
  try {
    const userId = req.user.id;

    const userPlans = await UserPlan.find({ user: userId })
      .populate("plan")
      .sort({ purchasedAt: -1 });

    res.status(200).json({
      success: true,
      count: userPlans.length,
      data: userPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your plans"
    });
  }
};
