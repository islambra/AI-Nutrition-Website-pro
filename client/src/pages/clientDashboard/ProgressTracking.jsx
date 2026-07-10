import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TrendingUp, Trash, Lock, ArrowRight, Calendar, Activity } from "lucide-react";
import { getMyProgress, createProgressEntry, deleteProgressEntry } from "../../api/progressApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import "./ClientDashboard.css";

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
        if (subRes.success) { const active = subRes.data.find(s => s.isActive); setActiveSub(active || null); }
        if (progressRes.success) setEntries(progressRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!weight) { toast.error(t("dashboard.client.weight") + " is required"); return; }
    if (!activeSub) { toast.error(t("dashboard.client.needSubscription")); return; }
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
        setWeight(""); setWaist(""); setBodyFat("");
        const updated = await getMyProgress({ startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() });
        if (updated.success) setEntries(updated.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteProgressEntry(id); setEntries(prev => prev.filter(e => e._id !== id)); toast.success("Entry deleted"); }
    catch (err) { toast.error("Error"); }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading"><div className="cd-spinner" /><p>{t("dashboard.client.loading")}</p></div>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cd-header">
        <div className="cd-header-icon purple"><Activity /></div>
        <div>
          <h1 className="cd-title">{t("dashboard.client.progressTracking")}</h1>
          <p className="cd-subtitle">{t("dashboard.client.progressDesc")}</p>
        </div>
      </div>

      {/* Lock Screen */}
      {!activeSub ? (
        <motion.div className="cd-lock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cd-lock-icon"><Lock /></div>
          <h3>{t("dashboard.client.needSubscription")}</h3>
          <p>{t("dashboard.client.needSubscriptionDesc")}</p>
          <button className="cd-lock-btn" onClick={() => navigate("/client/my-subscriptions")}>
            {t("dashboard.client.goToSubscriptionsNow")} <ArrowRight />
          </button>
        </motion.div>
      ) : (
        <>
          {/* Add Progress Form */}
          <motion.div className="cd-form-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cd-field">
              <label>{t("dashboard.client.date")}</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="cd-form-grid cols-3" style={{ marginTop: 14 }}>
              <div className="cd-field">
                <label>{t("dashboard.client.weight")} (kg) <span className="required">*</span></label>
                <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder={t("dashboard.client.weight")} />
              </div>
              <div className="cd-field">
                <label>{t("dashboard.client.waist")} (cm)</label>
                <input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} placeholder={t("dashboard.client.waist")} />
              </div>
              <div className="cd-field">
                <label>{t("dashboard.client.bodyFat")} (%)</label>
                <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder={t("dashboard.client.bodyFat")} />
              </div>
            </div>
            <button className="cd-btn-primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? t("common.loading") : t("dashboard.client.logProgress")}
            </button>
          </motion.div>

          {/* Empty */}
          {sorted.length === 0 && (
            <div className="cd-empty">
              <div className="cd-empty-icon purple"><TrendingUp /></div>
              <h3>{t("dashboard.client.noProgress")}</h3>
            </div>
          )}

          {/* Table */}
          {sorted.length > 0 && (
            <motion.div className="cd-table-wrap" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <table className="cd-table">
                <thead>
                  <tr>
                    <th>{t("dashboard.client.date")}</th>
                    <th>{t("dashboard.client.weight")} (kg)</th>
                    <th>{t("dashboard.client.waist")} (cm)</th>
                    <th>{t("dashboard.client.bodyFat")} (%)</th>
                    <th style={{ textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(e => (
                    <tr key={e._id}>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "#1e293b" }}>
                          <Calendar size={14} style={{ color: "#8b5cf6" }} />
                          {new Date(e.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td><span className="cd-table-val">{e.weight}</span></td>
                      <td>{e.waist ? <span className="cd-table-val">{e.waist}</span> : <span className="cd-table-na">—</span>}</td>
                      <td>{e.bodyFat ? <span className="cd-table-val">{e.bodyFat}</span> : <span className="cd-table-na">—</span>}</td>
                      <td style={{ textAlign: "center" }}>
                        <button className="cd-delete-btn" onClick={() => handleDelete(e._id)}><Trash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ProgressTracking;
