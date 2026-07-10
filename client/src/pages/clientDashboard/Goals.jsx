import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getMyGoals, createGoal, updateGoal, deleteGoal } from "../../api/goalsApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Lock: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

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
        const [subRes, goalsRes] = await Promise.all([
          getMySubscriptions(),
          getMyGoals()
        ]);
        if (subRes.success) {
          const active = subRes.data.find(s => s.isActive);
          setActiveSub(active || null);
        }
        if (goalsRes.success) setGoals(goalsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCreate = async () => {
    if (!title) { toast.error("Title is required"); return; }
    if (!activeSub) { toast.error(t('dashboard.client.needSubscription')); return; }
    setSubmitting(true);
    try {
      const res = await createGoal({ title, description, targetDate: targetDate || null });
      if (res.success) {
        toast.success("Goal created");
        setTitle("");
        setDescription("");
        setTargetDate("");
        setShowForm(false);
        fetchGoals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await getMyGoals();
      if (res.success) setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProgress = async (goal, newProgress) => {
    try {
      const status = newProgress >= 100 ? "completed" : goal.status;
      const res = await updateGoal(goal._id, { progress: newProgress, status });
      if (res.success) {
        setGoals(prev => prev.map(g => g._id === goal._id ? { ...g, progress: newProgress, status } : g));
      }
    } catch (err) {
      toast.error("Error updating progress");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g._id !== id));
      toast.success("Goal deleted");
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aff-dashboard">
      <ScrollReveal>
        <div className="aff-hero">
          <h1 className="aff-hero-title">{t('dashboard.client.goals')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.goalsDesc')}</p>
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
          {goals.length > 0 && (
            <ScrollReveal>
              <div style={{ textAlign: "right", marginBottom: 16 }}>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(!showForm)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 24px", borderRadius: 40, border: "none",
                    background: showForm
                      ? "#fef2f2"
                      : "linear-gradient(135deg, #059669, #10b981)",
                    color: showForm ? "#dc2626" : "#fff",
                    fontWeight: 600, fontSize: 14, cursor: "pointer",
                    boxShadow: showForm ? "none" : "0 2px 8px rgba(16,185,129,0.25)"
                  }}>
                  <span style={{ display: "flex", transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
                    <Icons.Plus />
                  </span>
                  {showForm ? t('common.cancel') : t('dashboard.client.addGoal')}
                </motion.button>
              </div>
            </ScrollReveal>
          )}

          {showForm && (
            <ScrollReveal>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "#fff", borderRadius: 20, padding: "1.5rem",
                  marginBottom: 24, border: "1.5px solid #e5e7eb",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                    {t('dashboard.client.title')} <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={t('dashboard.client.title')}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.description')}</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder={t('dashboard.client.description')}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, resize: "vertical", outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#374151" }}>{t('dashboard.client.targetDate')}</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 12,
                      border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none"
                    }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={submitting}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, border: "none",
                    background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                    color: "#fff", fontWeight: 600, fontSize: 14,
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: submitting ? "none" : "0 2px 8px rgba(16,185,129,0.25)"
                  }}>
                  {submitting ? t('common.loading') : t('dashboard.client.addGoal')}
                </motion.button>
              </motion.div>
            </ScrollReveal>
          )}

          {goals.length === 0 && !showForm ? (
            <ScrollReveal>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{
                  textAlign: "center", padding: "3rem 2rem",
                  background: "#f9fafb", borderRadius: 20,
                  border: "1.5px dashed #e5e7eb"
                }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 24,
                  background: "#f0fdf4", display: "flex", alignItems: "center",
                  justifyContent: "center", margin: "0 auto 16px", color: "#10b981"
                }}>
                  <Icons.Target />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", margin: "0 0 6px" }}>{t('dashboard.client.goals')}</h3>
                <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 20px" }}>
                  {t('dashboard.client.noGoals')}
                </p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowForm(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "12px 28px", borderRadius: 40, border: "none",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                  }}>
                  <Icons.Plus /> {t('dashboard.client.addGoal')}
                </motion.button>
              </motion.div>
            </ScrollReveal>
          ) : (
            goals.map(goal => (
              <ScrollReveal key={goal._id}>
                <motion.div
                  className="aff-card aff-card-primary"
                  whileHover={{ translateY: -2 }}
                  style={{ padding: "1.25rem", marginBottom: 12 }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: goal.status === "completed" ? "#d1fae5" : "#fef3c7",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: goal.status === "completed" ? "#059669" : "#d97706",
                      flexShrink: 0
                    }}>
                      <Icons.Target />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{goal.title}</h3>
                          {goal.description && <p style={{ margin: "4px 0", fontSize: 13, color: "#6b7280" }}>{goal.description}</p>}
                        </div>
                        <button onClick={() => handleDelete(goal._id)}
                          style={{
                            background: "none", border: "none",
                            cursor: "pointer", color: "#9ca3af", padding: 4
                          }}>
                          <Icons.Trash />
                        </button>
                      </div>
                      {goal.targetDate && (
                        <p style={{ margin: "4px 0 8px", fontSize: 12, color: "#9ca3af" }}>
                          {t('dashboard.client.targetDate')}: {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{ duration: 0.5 }}
                            style={{
                              height: "100%",
                              background: goal.status === "completed" ? "#10b981" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                              borderRadius: 4
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", minWidth: 36, textAlign: "right" }}>
                          {goal.progress}%
                        </span>
                      </div>
                      {goal.status === "active" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          {[25, 50, 75, 100].map(pct => (
                            <motion.button key={pct} whileTap={{ scale: 0.9 }}
                              onClick={() => handleProgress(goal, pct)}
                              style={{
                                flex: 1, padding: "6px 0", borderRadius: 8,
                                border: "1.5px solid #d1d5db",
                                background: goal.progress >= pct ? "#10b981" : "#fff",
                                color: goal.progress >= pct ? "#fff" : "#374151",
                                fontSize: 12, fontWeight: 500, cursor: "pointer",
                                transition: "all 0.2s"
                              }}>
                              {pct}%
                            </motion.button>
                          ))}
                        </div>
                      )}
                      {goal.status === "completed" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "#059669", fontSize: 13, fontWeight: 500 }}>
                          <Icons.CheckCircle /> {t('dashboard.client.completed')}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))
          )}
        </>
      )}
    </motion.div>
  );
};

export default Goals;
