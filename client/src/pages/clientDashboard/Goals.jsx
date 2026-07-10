import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Target, Plus, Trash, Calendar, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { getMyGoals, createGoal, updateGoal, deleteGoal } from "../../api/goalsApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import "./ClientDashboard.css";

const Goals = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, goalsRes] = await Promise.all([getMySubscriptions(), getMyGoals()]);
        if (subRes.success) { const active = subRes.data.find(s => s.isActive); setActiveSub(active || null); }
        if (goalsRes.success) setGoals(goalsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCreate = async () => {
    if (!title) { toast.error("Title is required"); return; }
    if (!activeSub) { toast.error(t("dashboard.client.needSubscription")); return; }
    setSubmitting(true);
    try {
      const res = await createGoal({ title, description, targetDate: targetDate || null });
      if (res.success) {
        toast.success("Goal created");
        setTitle(""); setDescription(""); setTargetDate(""); setShowForm(false);
        const updated = await getMyGoals();
        if (updated.success) setGoals(updated.data);
      }
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const handleProgress = async (goal, newProgress) => {
    try {
      const status = newProgress >= 100 ? "completed" : goal.status;
      const res = await updateGoal(goal._id, { progress: newProgress, status });
      if (res.success) setGoals(prev => prev.map(g => g._id === goal._id ? { ...g, progress: newProgress, status } : g));
    } catch (err) { toast.error("Error updating progress"); }
  };

  const handleDelete = async (id) => {
    try { await deleteGoal(id); setGoals(prev => prev.filter(g => g._id !== id)); toast.success("Goal deleted"); }
    catch (err) { toast.error("Error"); }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading"><div className="cd-spinner" /><p>{t("dashboard.client.loading")}</p></div>
      </div>
    );
  }

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cd-header">
        <div className="cd-header-icon amber"><Target /></div>
        <div>
          <h1 className="cd-title">{t("dashboard.client.goals")}</h1>
          <p className="cd-subtitle">{t("dashboard.client.goalsDesc")}</p>
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
          {/* Toggle Form Button */}
          <div className="cd-section-header">
            <h2 className="cd-section-title">{goals.length > 0 ? `${goals.length} ${t("dashboard.client.goals")}` : ""}</h2>
            <button className={`cd-toggle-btn ${showForm ? "cancel" : "add"}`} onClick={() => setShowForm(!showForm)}>
              <Plus style={{ transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
              {showForm ? t("common.cancel") : t("dashboard.client.addGoal")}
            </button>
          </div>

          {/* Add Goal Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div className="cd-form-card" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="cd-field">
                  <label>{t("dashboard.client.title")} <span className="required">*</span></label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t("dashboard.client.title")} />
                </div>
                <div className="cd-field" style={{ marginTop: 14 }}>
                  <label>{t("dashboard.client.description")}</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t("dashboard.client.description")} />
                </div>
                <div className="cd-field" style={{ marginTop: 14 }}>
                  <label>{t("dashboard.client.targetDate")}</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
                <button className="cd-btn-primary" style={{ marginTop: 16 }} onClick={handleCreate} disabled={submitting}>
                  {submitting ? t("common.loading") : t("dashboard.client.addGoal")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {goals.length === 0 && !showForm && (
            <div className="cd-empty">
              <div className="cd-empty-icon amber"><Target /></div>
              <h3>{t("dashboard.client.noGoals")}</h3>
              <button className="cd-lock-btn" onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <Plus /> {t("dashboard.client.addGoal")}
              </button>
            </div>
          )}

          {/* Goal Cards */}
          <AnimatePresence>
            {goals.map((goal, i) => (
              <motion.div key={goal._id} className="cd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}>
                <div className="cd-goal-top">
                  <div className={`cd-goal-icon ${goal.status === "completed" ? "completed" : "active"}`}>
                    {goal.status === "completed" ? <CheckCircle /> : <Target />}
                  </div>
                  <div className="cd-goal-info">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <h3 className="cd-goal-title">{goal.title}</h3>
                      <button className="cd-delete-btn" onClick={() => handleDelete(goal._id)}><Trash /></button>
                    </div>
                    {goal.description && <p className="cd-goal-desc">{goal.description}</p>}
                    {goal.targetDate && (
                      <p className="cd-goal-date">
                        <Calendar /> {t("dashboard.client.targetDate")}: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="cd-goal-progress">
                      <div className="cd-goal-track">
                        <div className={`cd-goal-fill ${goal.status === "completed" ? "completed" : "active"}`} style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="cd-goal-pct">{goal.progress}%</span>
                    </div>
                    {goal.status === "active" && (
                      <div className="cd-goal-btns">
                        {[25, 50, 75, 100].map(pct => (
                          <button key={pct} className={`cd-goal-btn ${goal.progress >= pct ? "reached" : ""}`} onClick={() => handleProgress(goal, pct)}>
                            {pct}%
                          </button>
                        ))}
                      </div>
                    )}
                    {goal.status === "completed" && (
                      <div className="cd-completed-badge">
                        <CheckCircle /> {t("dashboard.client.completed")}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

export default Goals;
