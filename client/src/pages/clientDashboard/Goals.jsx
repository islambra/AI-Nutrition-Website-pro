import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Target, Plus, Trash, Calendar, Lock, ArrowRight, CheckCircle, Minus, ListChecks } from "lucide-react";
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
    const clamped = Math.max(0, Math.min(100, newProgress));
    try {
      const status = clamped >= 100 ? "completed" : goal.status;
      const res = await updateGoal(goal._id, { progress: clamped, status });
      if (res.success) setGoals(prev => prev.map(g => g._id === goal._id ? { ...g, progress: clamped, status } : g));
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

  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed");

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
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
          {/* Summary Bar */}
          {goals.length > 0 && (
            <motion.div className="cd-summary-bar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="cd-summary-item">
                <div className="cd-summary-icon amber"><ListChecks /></div>
                <div>
                  <p className="cd-summary-value">{goals.length}</p>
                  <p className="cd-summary-label">{t("dashboard.client.goals")}</p>
                </div>
              </div>
              <div className="cd-summary-divider" />
              <div className="cd-summary-item">
                <div className="cd-summary-icon blue"><Target /></div>
                <div>
                  <p className="cd-summary-value">{activeGoals.length}</p>
                  <p className="cd-summary-label">{t("dashboard.client.active")}</p>
                </div>
              </div>
              <div className="cd-summary-divider" />
              <div className="cd-summary-item">
                <div className="cd-summary-icon green"><CheckCircle /></div>
                <div>
                  <p className="cd-summary-value">{completedGoals.length}</p>
                  <p className="cd-summary-label">{t("dashboard.client.completed")}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section Header + Toggle */}
          <div className="cd-section-header">
            <h2 className="cd-section-title">
              {activeGoals.length > 0 ? `${activeGoals.length} ${t("dashboard.client.active")}` : ""}
            </h2>
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
                <div className="cd-field cd-field-mt">
                  <label>{t("dashboard.client.description")}</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder={t("dashboard.client.description")} />
                </div>
                <div className="cd-field cd-field-mt">
                  <label>{t("dashboard.client.targetDate")}</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
                <button className="cd-btn-primary cd-btn-mt" onClick={handleCreate} disabled={submitting}>
                  {submitting ? t("common.loading") : t("dashboard.client.addGoal")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {goals.length === 0 && !showForm && (
            <div className="cd-empty">
              <div className="cd-empty-icon amber"><Target /></div>
              <h3>{t("dashboard.client.noGoals")}</h3>
              <button className="cd-lock-btn" onClick={() => setShowForm(true)}>
                <Plus /> {t("dashboard.client.addGoal")}
              </button>
            </div>
          )}

          {/* Active Goals */}
          <AnimatePresence>
            {activeGoals.map((goal, i) => (
              <motion.div key={goal._id} className="cd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}>
                <div className="cd-goal-top">
                  <div className="cd-goal-icon active"><Target /></div>
                  <div className="cd-goal-info">
                    <div className="cd-goal-header">
                      <h3 className="cd-goal-title">{goal.title}</h3>
                      <button className="cd-delete-btn" onClick={() => handleDelete(goal._id)}><Trash /></button>
                    </div>
                    {goal.description && <p className="cd-goal-desc">{goal.description}</p>}
                    {goal.targetDate && (
                      <p className="cd-goal-date">
                        <Calendar size={14} /> {t("dashboard.client.targetDate")}: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="cd-goal-progress">
                      <div className="cd-goal-track">
                        <div className="cd-goal-fill active" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="cd-goal-pct">{goal.progress}%</span>
                    </div>
                    {/* Stepper */}
                    <div className="cd-stepper">
                      <button className="cd-stepper-btn" onClick={() => handleProgress(goal, goal.progress - 25)} disabled={goal.progress <= 0}>
                        <Minus size={14} />
                      </button>
                      <span className="cd-stepper-value">{goal.progress}%</span>
                      <button className="cd-stepper-btn" onClick={() => handleProgress(goal, goal.progress + 25)} disabled={goal.progress >= 100}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <>
              <h2 className="cd-section-title cd-section-mt">{t("dashboard.client.completed")}</h2>
              {completedGoals.map((goal, i) => (
                <motion.div key={goal._id} className="cd-card cd-card-completed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}>
                  <div className="cd-goal-top">
                    <div className="cd-goal-icon completed"><CheckCircle /></div>
                    <div className="cd-goal-info">
                      <div className="cd-goal-header">
                        <h3 className="cd-goal-title">{goal.title}</h3>
                        <button className="cd-delete-btn" onClick={() => handleDelete(goal._id)}><Trash /></button>
                      </div>
                      <div className="cd-goal-progress">
                        <div className="cd-goal-track">
                          <div className="cd-goal-fill completed" style={{ width: "100%" }} />
                        </div>
                        <span className="cd-goal-pct completed-text">100%</span>
                      </div>
                      <div className="cd-completed-badge">
                        <CheckCircle size={14} /> {t("dashboard.client.completed")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Goals;
