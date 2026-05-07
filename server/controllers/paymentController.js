// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import UserPlan from "../models/UserPlan.js";
import Client from "../models/Client.js";

// Buy a plan - instant payment
export const buyPlan = async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.id;

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // Check if user already has this plan
    const existingPlan = await UserPlan.findOne({
      user: userId,
      plan: planId
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "You already purchased this plan"
      });
    }

    // Create payment (instant)
    const payment = await Payment.create({
      user: userId,
      plan: planId,
      amount: plan.price,
      paymentMethod: paymentMethod || "credit_card"
    });

    // Create user plan with sessions
    const userPlan = await UserPlan.create({
      user: userId,
      plan: planId,
      payment: payment._id,
      sessionsRemaining: plan.consultationIncluded
    });

    // Update client's total consultations
    const client = await Client.findOne({ user: userId });
    if (client) {
      client.totalConsultations += plan.consultationIncluded;
      await client.save();
    }

    res.status(201).json({
      success: true,
      message: "Plan purchased successfully",
      data: {
        payment,
        userPlan
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Purchase failed",
      error: error.message
    });
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
      message: "Error checking plan",
      error: error.message
    });
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
      message: "Error fetching your plans",
      error: error.message
    });
  }
};