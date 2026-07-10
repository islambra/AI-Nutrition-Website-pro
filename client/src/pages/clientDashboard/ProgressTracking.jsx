import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Activity, Trash, Lock, ArrowRight, Calendar, Plus, Minus, TrendingUp, TrendingDown, Scale } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);

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
        setWeight(""); setWaist(""); setBodyFat(""); setShowForm(false);
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
  const latest = sorted[0];
  const previous = sorted[1];
  const weightDiff = latest && previous ? (latest.weight - previous.weight).toFixed(1) : null;

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
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
          {/* Summary Bar */}
          {sorted.length > 0 && (
            <motion.div className="cd-summary-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="cd-summary-item">
                <div className="cd-summary-icon purple"><Activity /></div>
                <div>
                  <p className="cd-summary-value">{sorted.length}</p>
                  <p className="cd-summary-label">{t("dashboard.client.entries") || "Entries"}</p>
                </div>
              </div>
              <div className="cd-summary-divider" />
              <div className="cd-summary-item">
                <div className="cd-summary-icon blue"><Scale /></div>
                <div>
                  <p className="cd-summary-value">{latest?.weight || "—"} <small>kg</small></p>
                  <p className="cd-summary-label">{t("dashboard.client.latestWeight") || "Latest"}</p>
                </div>
              </div>
              {weightDiff !== null && (
                <>
                  <div className="cd-summary-divider" />
                  <div className="cd-summary-item">
                    <div className={`cd-summary-icon ${parseFloat(weightDiff) <= 0 ? "green" : "red"}`}>
                      {parseFloat(weightDiff) <= 0 ? <TrendingDown /> : <TrendingUp />}
                    </div>
                    <div>
                      <p className={`cd-summary-value ${parseFloat(weightDiff) <= 0 ? "green-text" : "red-text"}`}>
                        {parseFloat(weightDiff) > 0 ? "+" : ""}{weightDiff} kg
                      </p>
                      <p className="cd-summary-label">{t("dashboard.client.change") || "Change"}</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Section Header + Toggle */}
          <div className="cd-section-header">
            <h2 className="cd-section-title">
              {sorted.length > 0 ? `${sorted.length} ${t("dashboard.client.entries") || "Entries"}` : ""}
            </h2>
            <button className={`cd-toggle-btn ${showForm ? "cancel" : "add"}`} onClick={() => setShowForm(!showForm)}>
              <Plus style={{ transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
              {showForm ? t("common.cancel") : t("dashboard.client.logProgress")}
            </button>
          </div>

          {/* Add Progress Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div className="cd-form-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="cd-field">
                  <label>{t("dashboard.client.date")}</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="cd-form-grid cols-3 cd-field-mt">
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
                <button className="cd-btn-primary cd-btn-mt" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? t("common.loading") : t("dashboard.client.logProgress")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {sorted.length === 0 && !showForm && (
            <div className="cd-empty">
              <div className="cd-empty-icon purple"><TrendingUp /></div>
              <h3>{t("dashboard.client.noProgress")}</h3>
              <button className="cd-lock-btn" onClick={() => setShowForm(true)}>
                <Plus /> {t("dashboard.client.logProgress")}
              </button>
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
                    <th className="cd-table-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e, i) => (
                    <tr key={e._id}>
                      <td>
                        <span className="cd-table-date">
                          <Calendar size={14} className="cd-table-date-icon" />
                          {new Date(e.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td><span className="cd-table-val">{e.weight}</span></td>
                      <td>{e.waist ? <span className="cd-table-val">{e.waist}</span> : <span className="cd-table-na">—</span>}</td>
                      <td>{e.bodyFat ? <span className="cd-table-val">{e.bodyFat}</span> : <span className="cd-table-na">—</span>}</td>
                      <td className="cd-table-actions">
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
