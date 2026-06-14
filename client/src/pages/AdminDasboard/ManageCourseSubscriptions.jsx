import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ExternalLink
} from "lucide-react";
import {
  getPendingCourseSubscriptions,
  approveCourseSubscription,
  rejectCourseSubscription,
} from "../../api/courseApi";
import toast from "react-hot-toast";
import "./ManageCourseSubscriptions.css";

const ManageCourseSubscriptions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.error("Failed to load pending subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      setProcessing(paymentId);
      const res = await approveCourseSubscription(paymentId);
      if (res.success) {
        toast.success(res.message);
        setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (paymentId) => {
    try {
      setProcessing(paymentId);
      const res = await rejectCourseSubscription(paymentId);
      if (res.success) {
        toast.success("Payment rejected");
        setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="mcs-loader-wrapper">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <BookOpen size={52} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mcs-container">
      <div className="mcs-header">
        <div className="mcs-header-left">
          <div className="mcs-header-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <h1>Course Subscriptions</h1>
            <p>Manage pending course subscription payments</p>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mcs-empty"
        >
          <div className="mcs-empty-icon">
            <CheckCircle size={48} />
          </div>
          <h3>No pending subscriptions</h3>
          <p>All course subscription payments have been processed</p>
        </motion.div>
      ) : (
        <div className="mcs-table-wrapper">
          <table className="mcs-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Proof</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td data-label="Student">
                    <div className="mcs-user-info">
                      {payment.user?.photo && (
                        <img
                          src={payment.user.photo}
                          alt=""
                          className="mcs-user-avatar"
                        />
                      )}
                      <span>{payment.user?.fullName || "—"}</span>
                    </div>
                  </td>
                  <td data-label="Email">{payment.user?.email || "—"}</td>
                  <td data-label="Amount">
                    <strong>{payment.amount?.toLocaleString()} DZD</strong>
                  </td>
                  <td data-label="Method" className="mcs-capitalize">
                    {payment.paymentMethod}
                  </td>
                  <td data-label="Proof">
                    {payment.proofImage ? (
                      <a
                        href={payment.proofImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mcs-proof-link"
                      >
                        <ExternalLink size={16} /> View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="Date">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Actions">
                    <div className="mcs-actions">
                      <button
                        className="mcs-btn approve"
                        onClick={() => handleApprove(payment._id)}
                        disabled={processing === payment._id}
                      >
                        <CheckCircle size={16} />
                        {processing === payment._id ? "..." : "Approve"}
                      </button>
                      <button
                        className="mcs-btn reject"
                        onClick={() => handleReject(payment._id)}
                        disabled={processing === payment._id}
                      >
                        <XCircle size={16} />
                        {processing === payment._id ? "..." : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCourseSubscriptions;
