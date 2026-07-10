import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getMyGoals, createGoal, updateGoal, deleteGoal } from "../../api/goalsApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

const Goals = () => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await getMyGoals();
      if (res.success) setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title) { toast.error("Title is required"); return; }
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

      <ScrollReveal>
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px",
              borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14
            }}>
            <Icons.Plus /> {t('dashboard.client.addGoal')}
          </motion.button>
        </div>
      </ScrollReveal>

      {showForm && (
        <ScrollReveal>
          <div style={{ background: "#f9fafb", borderRadius: 16, padding: "1.5rem", marginBottom: 24, border: "1.5px solid #e5e7eb" }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.title')}</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#374151" }}>{t('dashboard.client.targetDate')}</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "10px 24px", borderRadius: 10, border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14 }}>
                {t('common.cancel')}
              </button>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={submitting}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: submitting ? "#9ca3af" : "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14
                }}>
                {submitting ? t('common.loading') : t('common.save')}
              </motion.button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {goals.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noGoals')}
        </p>
      ) : (
        goals.map(goal => (
          <ScrollReveal key={goal._id}>
            <div className="aff-card aff-card-primary" style={{ padding: "1.25rem", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: goal.status === "completed" ? "#d1fae5" : goal.status === "cancelled" ? "#fef2f2" : "#fef3c7",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: goal.status === "completed" ? "#059669" : goal.status === "cancelled" ? "#dc2626" : "#d97706"
                }}>
                  <Icons.Target />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{goal.title}</h3>
                      {goal.description && <p style={{ margin: "4px 0", fontSize: 13, color: "#6b7280" }}>{goal.description}</p>}
                    </div>
                    <button onClick={() => handleDelete(goal._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                      <Icons.Trash />
                    </button>
                  </div>
                  {goal.targetDate && (
                    <p style={{ margin: "4px 0 8px", fontSize: 12, color: "#9ca3af" }}>
                      {t('dashboard.client.targetDate')}: {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{
                        width: `${goal.progress}%`, height: "100%",
                        background: goal.status === "completed" ? "#10b981" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                        borderRadius: 3, transition: "width 0.3s"
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", minWidth: 32, textAlign: "right" }}>
                      {goal.progress}%
                    </span>
                  </div>
                  {goal.status === "active" && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {[25, 50, 75, 100].map(pct => (
                        <button key={pct} onClick={() => handleProgress(goal, pct)}
                          style={{
                            flex: 1, padding: "4px 0", borderRadius: 6, border: "1.5px solid #d1d5db",
                            background: goal.progress >= pct ? "#10b981" : "#fff",
                            color: goal.progress >= pct ? "#fff" : "#374151",
                            fontSize: 11, fontWeight: 500, cursor: "pointer"
                          }}>
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                  {goal.status === "completed" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: "#059669", fontSize: 13 }}>
                      <Icons.CheckCircle /> {t('dashboard.client.completed')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))
      )}
    </motion.div>
  );
};

export default Goals;
