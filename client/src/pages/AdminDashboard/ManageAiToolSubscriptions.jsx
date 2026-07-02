import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  DollarSign,
  Users,
  Eye,
} from "lucide-react";
import {
  getPendingAiToolSubscriptions,
  approveAiToolSubscription,
  rejectAiToolSubscription,
} from "../../api/aiToolApi";
import "./ManageCourseSubscriptions.css";

const ManageAiToolSubscriptions = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingAiToolSubscriptions();
      if (res.success) setPayments(res.data);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, payment) => {
    setModalType(type);
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedPayment || !modalType) return;
    try {
      setProcessing(selectedPayment._id);
      if (modalType === "approve") {
        const res = await approveAiToolSubscription(selectedPayment._id);
        if (res.success) {
          setPayments((prev) => prev.filter((p) => p._id !== selectedPayment._id));
        }
      } else {
        const res = await rejectAiToolSubscription(selectedPayment._id);
        if (res.success) {
          setPayments((prev) => prev.filter((p) => p._id !== selectedPayment._id));
        }
      }
      setModalOpen(false);
    } catch {
    } finally {
      setProcessing(null);
      setSelectedPayment(null);
      setModalType(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filtered = searchQuery.trim()
    ? payments.filter((p) =>
        p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  const totalPending = payments.length;
  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="mcs-loading">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mcs-loading-icon"
        >
          <Zap size={48} />
        </motion.div>
        <p>{t('admin.loadingPendingAiSubscriptions')}</p>
      </div>
    );
  }

  return (
    <div className="mcs-container">
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mcs-modal-overlay"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mcs-image-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="mcs-image-close" onClick={() => setPreviewImage(null)}>×</button>
              <img src={previewImage} alt={t('admin.paymentProof')} className="mcs-proof-image" />
            </motion.div>
          </motion.div>
        )}

        {modalOpen && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mcs-modal-overlay"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="mcs-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`mcs-modal-icon ${modalType}`}>
                {modalType === "approve" ? <CheckCircle size={28} /> : <XCircle size={28} />}
              </div>
              <h3>{modalType === "approve" ? t('admin.approveAiToolSubscription') : t('admin.rejectAiToolSubscription')}</h3>
              <p>
                {modalType === "approve"
                  ? t('admin.grantAiAccessConfirm', { name: selectedPayment.user?.fullName || t('admin.thisUser'), amount: selectedPayment.amount?.toLocaleString() })
                  : t('admin.rejectAiPaymentConfirm', { name: selectedPayment.user?.fullName || t('admin.thisUser'), amount: selectedPayment.amount?.toLocaleString() })}
              </p>
              <p className="mcs-modal-note">
                {modalType === "approve"
                  ? t('admin.approveAiSubscriptionNote')
                  : t('admin.rejectAiSubscriptionNote')}
              </p>
              <div className="mcs-modal-actions">
                <button className="mcs-btn mcs-btn--ghost" onClick={() => setModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button
                  className={`mcs-btn mcs-btn--${modalType}`}
                  onClick={confirmAction}
                  disabled={processing === selectedPayment._id}
                >
                  {processing === selectedPayment._id
                    ? t('admin.processing')
                    : modalType === "approve"
                    ? t('admin.yesApprove')
                    : t('admin.yesReject')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mcs-header">
        <div>
          <h1>{t('admin.aiToolSubscriptions')}</h1>
          <p className="mcs-subtitle">{t('admin.manageAiSubscriptions')}</p>
        </div>
      </div>

      <div className="mcs-stats">
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon pending-stat">
            <Clock size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{totalPending}</h3>
            <p>{t('common.pending')}</p>
          </div>
        </div>
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon amount-stat">
            <DollarSign size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{totalAmount.toLocaleString()} DZD</h3>
            <p>{t('admin.totalAmount')}</p>
          </div>
        </div>
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon students-stat">
            <Users size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{payments.length}</h3>
            <p>{t('admin.users')}</p>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mcs-search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder={t('admin.searchByNameOrEmail')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mcs-empty">
          <div className="mcs-empty-icon">
            {searchQuery ? <Search size={40} /> : <CheckCircle size={48} />}
          </div>
          <h3>{searchQuery ? t('common.noResults') : t('admin.noPendingSubscriptions')}</h3>
          <p>
            {searchQuery
              ? t('admin.tryDifferentNameOrEmail')
              : t('admin.allAiSubscriptionsProcessed')}
          </p>
        </div>
      ) : (
        <div className="mcs-list">
          {filtered.map((payment) => {
            const initials = getInitials(payment.user?.fullName);
            return (
              <div key={payment._id} className="mcs-card">
                <div className="mcs-card-top">
                  <div className="mcs-card-user">
                    <div className="mcs-avatar">
                      {payment.user?.photo ? (
                        <img src={payment.user.photo} alt="" className="mcs-avatar-img" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="mcs-user-info">
                      <span className="mcs-user-name">{payment.user?.fullName || t('common.unknown')}</span>
                      <span className="mcs-user-email">{payment.user?.email || "—"}</span>
                    </div>
                  </div>
                  <div className="mcs-card-meta">
                    <span className="mcs-amount">{payment.amount?.toLocaleString()} DZD</span>
                    <span className="mcs-method">{payment.paymentMethod}</span>
                  </div>
                </div>

                <div className="mcs-card-bottom">
                  <span className="mcs-date">{new Date(payment.createdAt).toLocaleDateString()}</span>
                  <div className="mcs-card-actions">
                    {payment.proofImage ? (
                      <button
                        className="mcs-proof-btn"
                        onClick={() => setPreviewImage(payment.proofImage)}
                      >
                        <Eye size={14} /> {t('admin.proof')}
                      </button>
                    ) : (
                      <span className="mcs-no-proof">{t('admin.noProof')}</span>
                    )}
                    <button
                      className="mcs-action-btn approve"
                      onClick={() => openModal("approve", payment)}
                      disabled={processing === payment._id}
                    >
                      <CheckCircle size={15} />
                      {t('admin.approve')}
                    </button>
                    <button
                      className="mcs-action-btn reject"
                      onClick={() => openModal("reject", payment)}
                      disabled={processing === payment._id}
                    >
                      <XCircle size={15} />
                      {t('admin.reject')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageAiToolSubscriptions;
