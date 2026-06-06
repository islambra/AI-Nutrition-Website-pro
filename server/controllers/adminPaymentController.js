import Payment from '../models/Payment.js';
import UserPlan from '../models/UserPlan.js';
import UserFormation from '../models/UserFormation.js';
import AiAccess from '../models/AiAccess.js';
import Consultation from '../models/Consultation.js';

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'fullName email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });

    // Enrich with payment type (Plan or AI Tracker)
    const enrichedPayments = await Promise.all(payments.map(async (payment) => {
      let type = 'Unknown';
      if (payment.plan) {
        type = 'Plan';
      } else {
        const aiAccess = await AiAccess.findOne({ payment: payment._id });
        type = aiAccess ? 'AI Tracker' : 'Unknown';
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
    // Find all UserPlan records linked to this payment (for Consultation cleanup)
    const userPlans = await UserPlan.find({ payment: id }, '_id');
    const userPlanIds = userPlans.map(up => up._id);

    // Delete Consultations referencing the deleted UserPlans
    if (userPlanIds.length > 0) {
      await Consultation.deleteMany({ userPlan: { $in: userPlanIds } });
    }

    // Delete associated purchase records
    await UserPlan.deleteMany({ payment: id });
    await UserFormation.deleteMany({ payment: id });
    await AiAccess.deleteMany({ payment: id });

    // Delete the payment itself
    await Payment.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Payment and all related records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};