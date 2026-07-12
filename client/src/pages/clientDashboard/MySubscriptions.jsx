import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle, Video, X, RefreshCw, FileText, Clock, Calendar, Download, CheckCircle, ArrowRight, Lock, VideoOff, Trash2 } from "lucide-react";
import { getMySubscriptions, cancelSubscription, deleteSubscription, requestZoomSession, renewSubscription } from "../../api/dieteticienSubscriptionApi";
import { getSubscriberResources } from "../../api/resourceApi";
import { useChat } from "../../context/ChatContext";
import "./ClientDashboard.css";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  }),
};

const MySubscriptions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomModal, setZoomModal] = useState(null);
  const [zoomDate, setZoomDate] = useState("");
  const [zoomTime, setZoomTime] = useState("");
  const [zoomNote, setZoomNote] = useState("");
  const [submittingZoom, setSubmittingZoom] = useState(false);
  const [resources, setResources] = useState({});
  const [showResources, setShowResources] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { openChat } = useChat();

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await getMySubscriptions();
      if (res.success) setSubscriptions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    try {
      const res = await cancelSubscription(id);
      if (res.success) { toast.success(t("dashboard.client.subscriptionCancelled")); fetchSubscriptions(); }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      const res = await deleteSubscription(id);
      if (res.success) {
        toast.success("Subscription and all related data deleted");
        fetchSubscriptions();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setDeleting(false); setDeleteConfirmId(null); }
  };

  const handleZoomRequest = async () => {
    if (!zoomDate || !zoomTime) { toast.error(t("dashboard.client.selectDateTime")); return; }
    setSubmittingZoom(true);
    try {
      const requestedDateTime = new Date(`${zoomDate}T${zoomTime}`).toISOString();
      const res = await requestZoomSession(zoomModal, { requestedDateTime, note: zoomNote });
      if (res.success) {
        toast.success(t("dashboard.client.zoomRequested"));
        setZoomModal(null); setZoomDate(""); setZoomTime(""); setZoomNote("");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmittingZoom(false); }
  };

  const handleRenew = async (sub) => {
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "ccp");
      const res = await renewSubscription(sub._id, formData);
      if (res.success) { toast.success(t("dashboard.client.renewalSent")); fetchSubscriptions(); }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
  };

  const loadResources = async (dieteticienId, subId) => {
    try {
      const res = await getSubscriberResources(dieteticienId);
      if (res.success) setResources(prev => ({ ...prev, [subId]: res.data }));
      setShowResources(showResources === subId ? null : subId);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading"><div className="cd-spinner" /><p>{t("dashboard.client.loading")}</p></div>
      </div>
    );
  }

  const activeSubs = subscriptions.filter(s => s.isActive);
  const pastSubs = subscriptions.filter(s => !s.isActive);

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cd-header">
        <div className="cd-header-icon green"><User /></div>
        <div>
          <h1 className="cd-title">{t("dashboard.client.mySubscriptions")}</h1>
          <p className="cd-subtitle">{t("dashboard.client.mySubscriptionsDesc")}</p>
        </div>
      </div>

      {/* Empty */}
      {activeSubs.length === 0 && pastSubs.length === 0 && (
        <div className="cd-empty">
          <div className="cd-empty-icon green"><Lock /></div>
          <h3>{t("dashboard.client.noSubscriptions")}</h3>
          <p>{t("dashboard.client.findDieteticiensDesc")}</p>
        </div>
      )}

      {/* Active Subscriptions */}
      <AnimatePresence>
        {activeSubs.map((sub, i) => (
          <motion.div key={sub._id} className="cd-card" custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className="cd-sub-header">
              <div className="cd-sub-left">
                <div className="cd-sub-avatar">
                  {sub.dieteticien?.photo ? (
                    <img src={sub.dieteticien.photo} alt="" />
                  ) : (
                    <div className="cd-sub-avatar-fallback"><User /></div>
                  )}
                </div>
                <div>
                  <h3 className="cd-sub-name">{sub.dieteticien?.fullName || "Dieteticien"}</h3>
                  <p className="cd-sub-meta">
                    <Clock /> {sub.remainingDays} {t("dashboard.client.daysRemaining")}
                  </p>
                </div>
              </div>
              <span className="cd-badge active">{t("dashboard.client.active")}</span>
            </div>

            <div className="cd-progress">
              <div className="cd-progress-track">
                <div className="cd-progress-fill" style={{ width: `${Math.min(100, (sub.remainingDays / 30) * 100)}%` }} />
              </div>
              <span className="cd-progress-label">{sub.remainingDays}/30 days</span>
            </div>

            {sub.zoomLimit && (
              <div className="cd-zoom-usage" style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                background: sub.zoomRemaining === 0 ? "#fef2f2" : "#f0fdf4",
                borderRadius: 10,
                marginBottom: 14,
                fontSize: 13,
                fontWeight: 500,
                color: sub.zoomRemaining === 0 ? "#dc2626" : "#166534",
                border: `1px solid ${sub.zoomRemaining === 0 ? "#fecaca" : "#bbf7d0"}`
              }}>
                {sub.zoomRemaining === 0 ? <VideoOff size={16} /> : <Video size={16} />}
                <span>
                  Zoom sessions: {sub.zoomUsed}/{sub.zoomLimit} this month
                  {sub.zoomRemaining > 0 && ` (${sub.zoomRemaining} remaining)`}
                  {sub.zoomRemaining === 0 && " - Limit reached"}
                </span>
              </div>
            )}

            <div className="cd-actions">
              <button className="cd-action-btn chat" onClick={() => openChat(sub.dieteticien?._id)}>
                <MessageCircle /> {t("dashboard.client.chat")}
              </button>
              <button
                className={`cd-action-btn zoom ${sub.zoomRemaining === 0 ? 'disabled' : ''}`}
                onClick={() => setZoomModal(sub._id)}
                disabled={sub.zoomRemaining === 0}
                title={sub.zoomRemaining === 0 ? "Monthly zoom session limit reached" : "Request Zoom Session"}
                style={sub.zoomRemaining === 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                <Video /> {t("dashboard.client.requestZoom")}
              </button>
              <button className="cd-action-btn resources" onClick={() => loadResources(sub.dieteticien?._id, sub._id)}>
                <FileText /> {t("dashboard.client.resources")}
              </button>
              <button className="cd-action-btn cancel-sub" onClick={() => setCancelConfirmId(sub._id)}>
                <X /> {t("dashboard.client.cancelSub")}
              </button>
              <button className="cd-action-btn delete-sub" onClick={() => setDeleteConfirmId(sub._id)} style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff" }}>
                <Trash2 /> Delete
              </button>
            </div>

            {/* Resources Panel */}
            <AnimatePresence>
              {showResources === sub._id && (
                <motion.div className="cd-resources" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <h4>{t("dashboard.client.resources")}</h4>
                  {!resources[sub._id] || resources[sub._id].length === 0 ? (
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{t("dashboard.client.noResources")}</p>
                  ) : (
                    resources[sub._id].map(r => (
                      <div key={r._id} className="cd-resource-item">
                        <div>
                          <p className="cd-resource-title">{r.title}</p>
                          {r.description && <p className="cd-resource-desc">{r.description}</p>}
                        </div>
                        {r.fileUrl && (
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="cd-resource-download">
                            <Download size={14} style={{ marginRight: 4 }} /> {t("dashboard.client.download")}
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Past Subscriptions */}
      {pastSubs.length > 0 && (
        <>
          <h2 className="cd-section-title" style={{ marginTop: 32, marginBottom: 16 }}>{t("dashboard.client.pastSubscriptions")}</h2>
          {pastSubs.map(sub => (
            <div key={sub._id} className="cd-past-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <User size={18} style={{ color: "#94a3b8" }} />
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{sub.dieteticien?.fullName || "Dieteticien"}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>
              {!sub.cancelledAt && (
                <button className="cd-action-btn renew" onClick={() => handleRenew(sub)}>
                  <RefreshCw /> {t("dashboard.client.renew")}
                </button>
              )}
              <button className="cd-action-btn delete-sub" onClick={() => setDeleteConfirmId(sub._id)} style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", marginLeft: 8 }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </>
      )}

      {/* Zoom Modal */}
      {zoomModal && (
        <div className="cd-overlay" onClick={() => setZoomModal(null)}>
          <motion.div className="cd-modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={e => e.stopPropagation()}>
            <h3>{t("dashboard.client.requestZoom")}</h3>
            <div className="cd-form-grid" style={{ gap: 14 }}>
              <div className="cd-field">
                <label>{t("dashboard.client.date")}</label>
                <input type="date" value={zoomDate} onChange={e => setZoomDate(e.target.value)} />
              </div>
              <div className="cd-field">
                <label>{t("dashboard.client.time")}</label>
                <input type="time" value={zoomTime} onChange={e => setZoomTime(e.target.value)} />
              </div>
              <div className="cd-field">
                <label>{t("dashboard.client.note")}</label>
                <textarea value={zoomNote} onChange={e => setZoomNote(e.target.value)} rows={3} />
              </div>
            </div>
            <div className="cd-modal-actions">
              <button className="cd-modal-cancel" onClick={() => setZoomModal(null)}>{t("common.cancel")}</button>
              <button className="cd-modal-submit" onClick={handleZoomRequest} disabled={submittingZoom}>
                {submittingZoom ? t("common.loading") : t("dashboard.client.sendRequest")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirmId && (
        <div className="cd-overlay" onClick={() => setCancelConfirmId(null)}>
          <motion.div className="cd-modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={e => e.stopPropagation()}>
            <h3>{t("dashboard.client.cancelSub")}</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
              {t("dashboard.client.cancelConfirm") || "Are you sure you want to cancel this subscription? You will lose access to your dietitian."}
            </p>
            <div className="cd-modal-actions">
              <button className="cd-modal-cancel" onClick={() => setCancelConfirmId(null)}>{t("common.cancel")}</button>
              <button className="cd-modal-submit" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }} onClick={async () => {
                await handleCancel(cancelConfirmId);
                setCancelConfirmId(null);
              }}>
                {t("dashboard.client.confirmCancel") || "Yes, Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="cd-overlay" onClick={() => !deleting && setDeleteConfirmId(null)}>
          <motion.div className="cd-modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={e => e.stopPropagation()}>
            <h3>Delete Subscription</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
              This will permanently delete this subscription and ALL related data including chat messages, food diary entries, sessions, payments, and resources. This action cannot be undone.
            </p>
            <div className="cd-modal-actions">
              <button className="cd-modal-cancel" onClick={() => setDeleteConfirmId(null)} disabled={deleting}>{t("common.cancel")}</button>
              <button className="cd-modal-submit" style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }} onClick={() => handleDelete(deleteConfirmId)} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, Delete Everything"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default MySubscriptions;
