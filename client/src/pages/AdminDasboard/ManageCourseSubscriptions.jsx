import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  DollarSign,
  Users,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  getPendingCourseSubscriptions,
  approveCourseSubscription,
  rejectCourseSubscription,
} from "../../api/courseApi";
import "./ManageCourseSubscriptions.css";

const ManageCourseSubscriptions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await getPendingCourseSubscriptions();
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
        const res = await approveCourseSubscription(selectedPayment._id);
        if (res.success) {
          setPayments((prev) => prev.filter((p) => p._id !== selectedPayment._id));
        }
      } else {
        const res = await rejectCourseSubscription(selectedPayment._id);
        if (res.success) {
          setPayments((prev) => prev.filter((p) => p._id !== selectedPayment._id));
        }
      }
      setModalOpen(false);
    } catch {
      // error handled by api
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
          <BookOpen size={48} />
        </motion.div>
        <p>Loading pending subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="mcs-container">
      <AnimatePresence>
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
              <h3>{modalType === "approve" ? "Approve Subscription" : "Reject Subscription"}</h3>
              <p>
                {modalType === "approve"
                  ? `Grant 1-year access to ${selectedPayment.user?.fullName || "this student"} for ${selectedPayment.amount?.toLocaleString()} DZD?`
                  : `Reject the payment of ${selectedPayment.amount?.toLocaleString()} DZD from ${selectedPayment.user?.fullName || "this student"}?`}
              </p>
              <p className="mcs-modal-note">
                {modalType === "approve"
                  ? "The student will be able to access all courses immediately."
                  : "The student will be notified that their payment was rejected."}
              </p>
              <div className="mcs-modal-actions">
                <button className="mcs-btn mcs-btn--ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className={`mcs-btn mcs-btn--${modalType}`}
                  onClick={confirmAction}
                  disabled={processing === selectedPayment._id}
                >
                  {processing === selectedPayment._id
                    ? "Processing..."
                    : modalType === "approve"
                    ? "Yes, Approve"
                    : "Yes, Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mcs-header">
        <div>
          <h1>Course Subscriptions</h1>
          <p className="mcs-subtitle">Manage pending course subscription payments</p>
        </div>
      </div>

      <div className="mcs-stats">
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon pending-stat">
            <Clock size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{totalPending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon amount-stat">
            <DollarSign size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{totalAmount.toLocaleString()} DZD</h3>
            <p>Total Amount</p>
          </div>
        </div>
        <div className="mcs-stat-card">
          <div className="mcs-stat-icon students-stat">
            <Users size={18} />
          </div>
          <div className="mcs-stat-info">
            <h3>{payments.length}</h3>
            <p>Students</p>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mcs-search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name or email..."
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
          <h3>{searchQuery ? "No results found" : "No pending subscriptions"}</h3>
          <p>
            {searchQuery
              ? "Try a different name or email"
              : "All course subscription payments have been processed"}
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
                      <span className="mcs-user-name">{payment.user?.fullName || "Unknown"}</span>
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
                      <a
                        href={payment.proofImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mcs-proof-btn"
                      >
                        <Eye size={14} /> Proof
                      </a>
                    ) : (
                      <span className="mcs-no-proof">No proof</span>
                    )}
                    <button
                      className="mcs-action-btn approve"
                      onClick={() => openModal("approve", payment)}
                      disabled={processing === payment._id}
                    >
                      <CheckCircle size={15} />
                      Approve
                    </button>
                    <button
                      className="mcs-action-btn reject"
                      onClick={() => openModal("reject", payment)}
                      disabled={processing === payment._id}
                    >
                      <XCircle size={15} />
                      Reject
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

export default ManageCourseSubscriptions;
