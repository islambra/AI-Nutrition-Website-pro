import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';

export const getDieteticienPlanPayments = async (req, res) => {
  try {
    const dieteticienId = req.user.id;
    const myPlans = await Plan.find({ createdBy: dieteticienId }).select('_id');
    const myPlanIds = myPlans.map(p => p._id);
    if (myPlanIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    const payments = await Payment.find({ plan: { "$in": myPlanIds } })
      .populate('user', 'fullName email')
      .populate('plan', 'planName price')
      .sort({ createdAt: -1 });
    const enriched = payments.map(payment => ({
      _id: payment._id,
      clientName: payment.user?.fullName || 'Unknown',
      clientEmail: payment.user?.email || '—',
      planName: payment.plan?.planName || 'Deleted Plan',
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      purchasedAt: payment.createdAt
    }));
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};