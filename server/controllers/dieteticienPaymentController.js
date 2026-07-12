import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import Formation from '../models/Formation.js';
import DieteticienSubscription from '../models/DieteticienSubscription.js';

export const getDieteticienPlanPayments = async (req, res) => {
  try {
    const dieteticienId = req.user.id;

    const [myPlans, myFormations, mySubscriptions] = await Promise.all([
      Plan.find({ createdBy: dieteticienId }).select('_id'),
      Formation.find({ createdBy: dieteticienId }).select('_id'),
      DieteticienSubscription.find({ dieteticien: dieteticienId, hasAccess: true })
        .populate('client', 'fullName email')
        .populate('payment', 'amount paymentMethod createdAt')
        .lean()
    ]);

    const myPlanIds = myPlans.map(p => p._id);
    const myFormationIds = myFormations.map(f => f._id);

    const planPayments = await Payment.find({
      status: "approved",
      $or: [
        { plan: { $in: myPlanIds } },
        { formation: { $in: myFormationIds } }
      ]
    })
      .populate('user', 'fullName email')
      .populate('plan', 'planName price')
      .populate('formation', 'title price')
      .sort({ createdAt: -1 });

    const enriched = planPayments.map(payment => {
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

    const subscriptionSales = mySubscriptions
      .filter(sub => sub.payment)
      .map(sub => ({
        _id: sub.payment._id || sub._id,
        clientName: sub.client?.fullName || 'Unknown',
        clientEmail: sub.client?.email || '—',
        serviceName: `${sub.client?.fullName || 'Client'} - Subscription`,
        serviceType: 'Subscription',
        amount: sub.payment?.amount || 0,
        paymentMethod: sub.payment?.paymentMethod || 'ccp',
        purchasedAt: sub.payment?.createdAt || sub.startDate
      }));

    const allSales = [...enriched, ...subscriptionSales].sort((a, b) =>
      new Date(b.purchasedAt) - new Date(a.purchasedAt)
    );

    res.status(200).json({ success: true, data: allSales });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment info" });
  }
};