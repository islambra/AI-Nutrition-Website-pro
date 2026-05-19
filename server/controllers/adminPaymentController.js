import Payment from '../models/Payment.js';
import UserPlan from '../models/UserPlan.js';
import AiAccess from '../models/AiAccess.js';

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
    // Delete associated UserPlan and AiAccess
    await UserPlan.findOneAndDelete({ payment: id });
    await AiAccess.findOneAndDelete({ payment: id });
    await Payment.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};