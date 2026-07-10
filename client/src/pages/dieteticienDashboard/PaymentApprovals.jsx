import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, Calendar, CreditCard, DollarSign, Loader2,
  Check, X, Eye, Clock, Smartphone, FileText, AlertCircle
} from 'lucide-react';
import { getPendingPayments, approvePayment, rejectPayment } from '../../api/paymentApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './PaymentApprovals.css';

const PaymentApprovals = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingPayments();
      setPayments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approvePayment(id);
      setPayments(prev => prev.filter(p => p._id !== id));
      toast.success(t("dashboard.dieteticien.paymentApprovals.approved"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("dashboard.dieteticien.paymentApprovals.approveFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectPayment(id);
      setPayments(prev => prev.filter(p => p._id !== id));
      setConfirmReject(null);
      toast.success(t("dashboard.dieteticien.paymentApprovals.rejected"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("dashboard.dieteticien.paymentApprovals.rejectFailed"));
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getServiceName = (p) => {
    if (p.plan) return p.plan.planName || 'Plan';
    if (p.formation) return p.formation.title || 'Formation';
    if (p.dieteticienSubscription) return `Subscription - ${p.user?.fullName || 'Client'}`;
    return 'Unknown';
  };

  const getServiceType = (p) => {
    if (p.plan) return 'Plan';
    if (p.formation) return 'Formation';
    if (p.dieteticienSubscription) return 'Subscription';
    return 'Unknown';
  };

  if (loading) return (
    <div className="pa-loading">
      <div className="loading-spinner"></div>
      <p>{t("dashboard.dieteticien.paymentApprovals.loading")}</p>
    </div>
  );

  if (error) return (
    <div className="pa-error">
      <div className="error-icon">⚠️</div>
      <h3>{t("dashboard.dieteticien.paymentApprovals.loadError")}</h3>
      <p>{error}</p>
      <button onClick={fetchPending} className="pa-retry-btn">{t("dashboard.dieteticien.paymentApprovals.tryAgain")}</button>
    </div>
  );

  return (
    <div className="pa-container">
      <div className="pa-header">
        <div className="pa-header-left">
          <h1>{t("dashboard.dieteticien.paymentApprovals.title")}</h1>
          <p className="pa-subtitle">{t("dashboard.dieteticien.paymentApprovals.subtitle")}</p>
        </div>
        <div className="pa-stats-card">
          <div className="pa-stat-item">
            <Clock size={20} />
            <div>
              <span className="pa-stat-label">{t("dashboard.dieteticien.paymentApprovals.pending")}</span>
              <span className="pa-stat-value">{payments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="pa-empty">
          <div className="pa-empty-icon"><Check size={48} /></div>
          <h3>{t("dashboard.dieteticien.paymentApprovals.allCaughtUp")}</h3>
          <p>{t("dashboard.dieteticien.paymentApprovals.noPending")}</p>
        </div>
      ) : (
        <div className="pa-grid">
          <AnimatePresence>
            {payments.map(payment => (
              <motion.div
                key={payment._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="pa-card"
              >
                <div className="pa-card-gradient"></div>
                <div className="pa-card-content">
                  <div className="pa-client-section">
                    <div className="pa-client-avatar">
                      {payment.user?.photo ? (
                        <img src={payment.user.photo} alt="" className="pa-avatar-img" />
                      ) : (
                        <User size={22} />
                      )}
                    </div>
                    <div className="pa-client-details">
                      <h3>{payment.user?.fullName || 'Unknown'}</h3>
                      <span className="pa-client-email">{payment.user?.email || '—'}</span>
                    </div>
                    <span className={`pa-method-badge ${payment.paymentMethod}`}>
                      {payment.paymentMethod === 'ccp' ? <CreditCard size={12} /> : <Smartphone size={12} />}
                      {payment.paymentMethod.toUpperCase()}
                    </span>
                  </div>

                  <div className="pa-service-row">
                    <div className="pa-service-chip">
                      <Package size={14} />
                      <span>{getServiceName(payment)}</span>
                    </div>
                    <div className="pa-service-chip pa-type-chip">
                      <FileText size={14} />
                      <span>{getServiceType(payment)}</span>
                    </div>
                    <div className="pa-service-chip pa-amount-chip">
                      <DollarSign size={14} />
                      <span>{payment.amount?.toLocaleString()} DZD</span>
                    </div>
                  </div>

                  <div className="pa-proof-section">
                    <div className="pa-proof-left">
                      {payment.proofImage ? (
                        <button className="pa-proof-btn" onClick={() => setPreviewImage(payment.proofImage)}>
                          <Eye size={18} /> {t("dashboard.dieteticien.paymentApprovals.viewProof")}
                        </button>
                      ) : (
                        <span className="pa-no-proof">{t("dashboard.dieteticien.paymentApprovals.noProof")}</span>
                      )}
                    </div>
                    <div className="pa-proof-date">
                      <Calendar size={14} />
                      <span>{t("dashboard.dieteticien.paymentApprovals.submitted", { date: formatDate(payment.createdAt) })}</span>
                    </div>
                  </div>

                  <div className="pa-actions">
                    <button
                      className="pa-btn pa-btn-approve"
                      onClick={() => handleApprove(payment._id)}
                      disabled={actionLoading === payment._id}
                    >
                      {actionLoading === payment._id ? (
                        <Loader2 size={16} className="pa-spin" />
                      ) : <Check size={16} />}
                      {t("dashboard.dieteticien.paymentApprovals.approve")}
                    </button>
                    <button
                      className="pa-btn pa-btn-reject"
                      onClick={() => setConfirmReject(payment._id)}
                      disabled={actionLoading === payment._id}
                    >
                      {actionLoading === payment._id ? (
                        <Loader2 size={16} className="pa-spin" />
                      ) : <X size={16} />}
                      {t("dashboard.dieteticien.paymentApprovals.reject")}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="pa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              className="pa-image-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="pa-image-close" onClick={() => setPreviewImage(null)}>×</button>
              <img src={previewImage} alt="Proof full size" className="pa-proof-image" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmReject && (
          <motion.div
            className="pa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmReject(null)}
          >
            <motion.div
              className="pa-confirm-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pa-confirm-icon">
                <AlertCircle size={28} />
              </div>
              <h3>{t("dashboard.dieteticien.paymentApprovals.rejectTitle")}</h3>
              <p>{t("dashboard.dieteticien.paymentApprovals.rejectDesc")}</p>
              <div className="pa-confirm-actions">
                <button
                  className="pa-confirm-cancel"
                  onClick={() => setConfirmReject(null)}
                >
                  {t("dashboard.dieteticien.paymentApprovals.cancel")}
                </button>
                <button
                  className="pa-confirm-reject"
                  onClick={() => handleReject(confirmReject)}
                >
                  {t("dashboard.dieteticien.paymentApprovals.confirmReject")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentApprovals;
