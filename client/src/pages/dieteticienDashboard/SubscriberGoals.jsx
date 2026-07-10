import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getSubscriberGoals, updateGoalProgress } from "../../api/goalsApi";
import "./ClientsPage.css";

const Icons = {
  Target: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
};

const SubscriberGoals = () => {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSubscriberGoals(clientId);
        if (res.success) setGoals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [clientId]);

  const handleProgress = async (goalId, progress) => {
    try {
      const status = progress >= 100 ? "completed" : "active";
      const res = await updateGoalProgress(goalId, { progress, status });
      if (res.success) {
        setGoals(prev => prev.map(g => g._id === goalId ? { ...g, progress, status } : g));
        toast.success("Progress updated");
      }
    } catch (err) {
      toast.error("Error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <h1 className="cp-title">{t('dashboard.client.goals')}</h1>
        <p className="cp-subtitle">{goals[0]?.client?.fullName || "Client"}</p>
      </div>

      {goals.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noGoals')}
        </p>
      ) : (
        goals.map(goal => (
          <div key={goal._id} className="cp-card" style={{ padding: "1.25rem", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: goal.status === "completed" ? "#d1fae5" : "#fef3c7",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: goal.status === "completed" ? "#059669" : "#d97706"
              }}>
                <Icons.Target />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{goal.title}</h3>
                {goal.description && <p style={{ margin: "4px 0", fontSize: 13, color: "#6b7280" }}>{goal.description}</p>}
                {goal.targetDate && (
                  <p style={{ margin: "4px 0 8px", fontSize: 12, color: "#9ca3af" }}>
                    {t('dashboard.client.targetDate')}: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
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
                  <div style={{ display: "flex", gap: 4 }}>
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => handleProgress(goal._id, pct)}
                        style={{
                          flex: 1, padding: "6px 0", borderRadius: 6, border: "1.5px solid #d1d5db",
                          background: goal.progress >= pct ? "#10b981" : "#fff",
                          color: goal.progress >= pct ? "#fff" : "#374151",
                          fontSize: 12, fontWeight: 500, cursor: "pointer"
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
        ))
      )}
    </motion.div>
  );
};

export default SubscriberGoals;
