import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMySubscriptions, cancelSubscription, requestZoomSession, renewSubscription } from "../../api/dieteticienSubscriptionApi";
import { getSubscriberResources } from "../../api/resourceApi";
import ScrollReveal from "../../components/ScrollReveal";
import { useChat } from "../../context/ChatContext";
import "./ClientPlans.css";

const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Calendar: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  MessageCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Video: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  RefreshCw: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  FileText: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Upload: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

const MySubscriptions = () => {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomModal, setZoomModal] = useState(null);
  const [zoomDate, setZoomDate] = useState("");
  const [zoomTime, setZoomTime] = useState("");
  const [zoomNote, setZoomNote] = useState("");
  const [submittingZoom, setSubmittingZoom] = useState(false);
  const [resources, setResources] = useState({});
  const [showResources, setShowResources] = useState(null);
  const { openChat } = useChat();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await getMySubscriptions();
      if (res.success) setSubscriptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      const res = await cancelSubscription(id);
      if (res.success) {
        toast.success(t('dashboard.client.subscriptionCancelled'));
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleZoomRequest = async () => {
    if (!zoomDate || !zoomTime) {
      toast.error(t('dashboard.client.selectDateTime'));
      return;
    }
    setSubmittingZoom(true);
    try {
      const requestedDateTime = new Date(`${zoomDate}T${zoomTime}`).toISOString();
      const res = await requestZoomSession(zoomModal, { requestedDateTime, note: zoomNote });
      if (res.success) {
        toast.success(t('dashboard.client.zoomRequested'));
        setZoomModal(null);
        setZoomDate("");
        setZoomTime("");
        setZoomNote("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmittingZoom(false);
    }
  };

  const handleRenew = async (sub) => {
    try {
      const formData = new FormData();
      formData.append("paymentMethod", "ccp");
      const res = await renewSubscription(sub._id, formData);
      if (res.success) {
        toast.success(t('dashboard.client.renewalSent'));
        fetchSubscriptions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const loadResources = async (dieteticienId, subId) => {
    try {
      const res = await getSubscriberResources(dieteticienId);
      if (res.success) setResources(prev => ({ ...prev, [subId]: res.data }));
      setShowResources(showResources === subId ? null : subId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="aff-dashboard">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const activeSubs = subscriptions.filter(s => s.isActive);
  const pastSubs = subscriptions.filter(s => !s.isActive);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <div className="aff-hero">
          <h1 className="aff-hero-title">{t('dashboard.client.mySubscriptions')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.mySubscriptionsDesc')}</p>
        </div>
      </ScrollReveal>

      {activeSubs.length === 0 && pastSubs.length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noSubscriptions')}
        </p>
      )}

      {activeSubs.map(sub => (
        <ScrollReveal key={sub._id}>
          <div className="aff-card aff-card-primary" style={{ padding: "1.5rem", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  {sub.dieteticien?.photo ? (
                    <img src={sub.dieteticien.photo} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <Icons.User />
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{sub.dieteticien?.fullName || "Dieteticien"}</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                    <Icons.Clock /> {sub.remainingDays} {t('dashboard.client.daysRemaining')}
                  </p>
                </div>
              </div>
              <div style={{
                background: "#ecfdf5", color: "#059669", padding: "4px 12px",
                borderRadius: 20, fontSize: 12, fontWeight: 600
              }}>
                {t('dashboard.client.active')}
              </div>
            </div>

            <div style={{ width: "100%", height: 6, background: "#e5e7eb", borderRadius: 3, marginBottom: 16 }}>
              <div style={{
                width: `${Math.min(100, (sub.remainingDays / 30) * 100)}%`, height: "100%",
                background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 3
              }} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => openChat(sub.dieteticien?._id)}
                className="action-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  borderRadius: 10, border: "1.5px solid #10b981", background: "#ecfdf5",
                  color: "#059669", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}
              >
                <Icons.MessageCircle /> {t('dashboard.client.chat')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setZoomModal(sub._id)}
                className="action-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  borderRadius: 10, border: "1.5px solid #f59e0b", background: "#fffbeb",
                  color: "#d97706", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}
              >
                <Icons.Video /> {t('dashboard.client.requestZoom')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => loadResources(sub.dieteticien?._id, sub._id)}
                className="action-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  borderRadius: 10, border: "1.5px solid #8b5cf6", background: "#f5f3ff",
                  color: "#7c3aed", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}
              >
                <Icons.FileText /> {t('dashboard.client.resources')}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => handleCancel(sub._id)}
                className="action-btn"
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  borderRadius: 10, border: "1.5px solid #ef4444", background: "#fef2f2",
                  color: "#dc2626", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}
              >
                <Icons.X /> {t('dashboard.client.cancelSub')}
              </motion.button>
            </div>

            {showResources === sub._id && (
              <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>{t('dashboard.client.resources')}</h4>
                {(!resources[sub._id] || resources[sub._id].length === 0) ? (
                  <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{t('dashboard.client.noResources')}</p>
                ) : (
                  resources[sub._id].map(r => (
                    <div key={r._id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 12px", background: "#fff", borderRadius: 8, marginBottom: 6
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{r.title}</p>
                        {r.description && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{r.description}</p>}
                      </div>
                      {r.fileUrl && (
                        <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#059669", fontSize: 13, fontWeight: 500, textDecoration: "none" }}>
                          {t('dashboard.client.download')}
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </ScrollReveal>
      ))}

      {pastSubs.length > 0 && (
        <>
          <ScrollReveal>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "2rem 0 1rem" }}>{t('dashboard.client.pastSubscriptions')}</h2>
          </ScrollReveal>
          {pastSubs.map(sub => (
            <ScrollReveal key={sub._id}>
              <div className="aff-card aff-card-secondary" style={{ padding: "1.25rem", marginBottom: 12, opacity: 0.7 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icons.User />
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{sub.dieteticien?.fullName || "Dieteticien"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  {!sub.cancelledAt && (
                    <motion.button whileTap={{ scale: 0.95 }}
                      onClick={() => handleRenew(sub)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                        borderRadius: 8, border: "1.5px solid #10b981", background: "#ecfdf5",
                        color: "#059669", fontSize: 12, fontWeight: 500, cursor: "pointer"
                      }}
                    >
                      <Icons.RefreshCw /> {t('dashboard.client.renew')}
                    </motion.button>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </>
      )}

      {zoomModal && (
        <div className="modal-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "2rem", maxWidth: 420, width: "100%"
          }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>{t('dashboard.client.requestZoom')}</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.date')}</label>
              <input type="date" value={zoomDate} onChange={e => setZoomDate(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.time')}</label>
              <input type="time" value={zoomTime} onChange={e => setZoomTime(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.note')}</label>
              <textarea value={zoomNote} onChange={e => setZoomNote(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setZoomModal(null)}
                style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14 }}>
                {t('common.cancel')}
              </button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleZoomRequest} disabled={submittingZoom}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10, border: "none",
                  background: submittingZoom ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", fontWeight: 600, cursor: submittingZoom ? "not-allowed" : "pointer", fontSize: 14
                }}>
                {submittingZoom ? t('common.loading') : t('dashboard.client.sendRequest')}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MySubscriptions;
