import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import Formation from '../models/Formation.js';

export const getDieteticienPlanPayments = async (req, res) => {
  try {
    const dieteticienId = req.user.id;

    const [myPlans, myFormations] = await Promise.all([
      Plan.find({ createdBy: dieteticienId }).select('_id'),
      Formation.find({ createdBy: dieteticienId }).select('_id')
    ]);

    const myPlanIds = myPlans.map(p => p._id);
    const myFormationIds = myFormations.map(f => f._id);

    if (myPlanIds.length === 0 && myFormationIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const payments = await Payment.find({
      $or: [
        { plan: { $in: myPlanIds } },
        { formation: { $in: myFormationIds } }
      ]
    })
      .populate('user', 'fullName email')
      .populate('plan', 'planName price')
      .populate('formation', 'title price')
      .sort({ createdAt: -1 });

    const enriched = payments.map(payment => {
      const isPlan = !!payment.plan;
      return {
        _id: payment._id,
        clientName: payment.user?.fullName || 'Unknown',
        clientEmail: payment.user?.email || '—',
        serviceName: isPlan
          ? (payment.plan?.planName || 'Deleted Plan')
          : (payment.formation?.title || 'Deleted Formation'),
        serviceType: isPlan ? 'Plan' : 'Formation',
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        purchasedAt: payment.createdAt
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment info" });
  }
};