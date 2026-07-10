import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyProgress, createProgressEntry, deleteProgressEntry } from "../../api/progressApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Scale: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Lock: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  TrendingUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

const ProgressTracking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, progressRes] = await Promise.all([
          getMySubscriptions(),
          getMyProgress({ startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() })
        ]);
        if (subRes.success) {
          const active = subRes.data.find(s => s.isActive);
          setActiveSub(active || null);
        }
        if (progressRes.success) setEntries(progressRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!weight) { toast.error(t('dashboard.client.weight') + " is required"); return; }
    if (!activeSub) { toast.error(t('dashboard.client.needSubscription')); return; }
    setSubmitting(true);
    try {
      const res = await createProgressEntry({
        weight: parseFloat(weight),
        waist: waist ? parseFloat(waist) : null,
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        date
      });
      if (res.success) {
        toast.success("Progress logged");
        setWeight("");
        setWaist("");
        setBodyFat("");
        fetchEntries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await getMyProgress({ startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() });
      if (res.success) setEntries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProgressEntry(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      toast.success("Entry deleted");
    } catch (err) {
      toast.error("Error");
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

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <div className="aff-hero">
          <h1 className="aff-hero-title">{t('dashboard.client.progressTracking')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.progressDesc')}</p>
        </div>
      </ScrollReveal>

      {!activeSub ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center", padding: "3rem 2rem",
            background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            borderRadius: 20, border: "1.5px solid #fde68a",
            maxWidth: 480, margin: "0 auto"
          }}>
          <div style={{
            width: 72, height: 72, borderRadius: 24,
            background: "#fef3c7", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px", color: "#d97706"
          }}>
            <Icons.Lock />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#92400e", margin: "0 0 8px" }}>
            {t('dashboard.client.needSubscription')}
          </h3>
          <p style={{ fontSize: 14, color: "#b45309", margin: "0 0 20px", lineHeight: 1.5 }}>
            {t('dashboard.client.needSubscriptionDesc')}
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/client/my-subscriptions")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 40, border: "none",
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(217,119,6,0.3)"
            }}>
            {t('dashboard.client.goToSubscriptionsNow')} <Icons.ArrowRight />
          </motion.button>
        </motion.div>
      ) : (
        <>
          <ScrollReveal>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "#fff", borderRadius: 20, padding: "1.5rem",
                marginBottom: 24, border: "1.5px solid #e5e7eb",
                boxShadow: "0 8px 25px rgba(0,0,0,0.06)"
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.date')}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 12,
                    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                  }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                    {t('dashboard.client.weight')} (kg) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                    placeholder={t('dashboard.client.weight')}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                    {t('dashboard.client.waist')} (cm)
                  </label>
                  <input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)}
                    placeholder={t('dashboard.client.waist')}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                    {t('dashboard.client.bodyFat')} (%)
                  </label>
                  <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                    placeholder={t('dashboard.client.bodyFat')}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", fontWeight: 600, fontSize: 14,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 2px 8px rgba(16,185,129,0.25)"
                }}>
                {submitting ? t('common.loading') : t('dashboard.client.logProgress')}
              </motion.button>
            </motion.div>
          </ScrollReveal>

          {sorted.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                textAlign: "center", padding: "2rem 0",
                color: "#9ca3af", fontSize: 14
              }}>
              <Icons.TrendingUp />
              <p style={{ marginTop: 8 }}>{t('dashboard.client.noProgress')}</p>
            </motion.div>
          ) : (
            <ScrollReveal>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  border: "1.5px solid #e5e7eb", boxShadow: "0 4px 15px rgba(0,0,0,0.04)"
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9fafb" }}>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>{t('dashboard.client.date')}</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>{t('dashboard.client.weight')} (kg)</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>{t('dashboard.client.waist')} (cm)</th>
                        <th style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>{t('dashboard.client.bodyFat')} (%)</th>
                        <th style={{ padding: "12px 14px", textAlign: "center", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(e => (
                        <tr key={e._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px 14px", color: "#6b7280", fontWeight: 500 }}>{new Date(e.date).toLocaleDateString()}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#059669" }}>{e.weight}</td>
                          <td style={{ padding: "12px 14px", color: "#374151" }}>{e.waist || "-"}</td>
                          <td style={{ padding: "12px 14px", color: "#374151" }}>{e.bodyFat || "-"}</td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <button onClick={() => handleDelete(e._id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                              <Icons.Trash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </ScrollReveal>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ProgressTracking;
