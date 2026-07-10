import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Target, Calendar, CheckCircle } from "lucide-react";
import { getSubscriberGoals, updateGoalProgress } from "../../api/goalsApi";
import "./SubscribersList.css";

const SubscriberGoals = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
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
      <div className="sub-detail-page">
        <div className="sub-detail-loading">
          <div className="sub-detail-spinner" />
          <p>{t("dashboard.client.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="sub-detail-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sub-detail-header">
        <button className="sub-detail-back" onClick={() => navigate("/dieteticien/subscribers")}>
          <ArrowLeft />
        </button>
        <div className="sub-detail-icon-wrap goals">
          <Target />
        </div>
        <div>
          <h1 className="sub-detail-title">{t("dashboard.client.goals")}</h1>
          <p className="sub-detail-subtitle">{goals[0]?.client?.fullName || "Client"}</p>
        </div>
      </div>

      {/* Empty */}
      {goals.length === 0 && (
        <motion.div className="sub-detail-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sub-detail-empty-icon goals">
            <Target />
          </div>
          <h3>{t("dashboard.client.noGoals")}</h3>
          <p>{t("dashboard.client.findDieteticiensDesc")}</p>
        </motion.div>
      )}

      {/* Goal Cards */}
      <AnimatePresence>
        {goals.map((goal, i) => (
          <motion.div
            key={goal._id}
            className="goal-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="goal-card-top">
              <div className={`goal-icon-wrap ${goal.status === "completed" ? "completed" : "active"}`}>
                {goal.status === "completed" ? <CheckCircle /> : <Target />}
              </div>
              <div className="goal-info">
                <h3 className="goal-title">{goal.title}</h3>
                {goal.description && <p className="goal-desc">{goal.description}</p>}
                {goal.targetDate && (
                  <p className="goal-target-date">
                    <Calendar />
                    {t("dashboard.client.targetDate")}: {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="goal-progress-bar">
              <div className="goal-progress-track">
                <div
                  className={`goal-progress-fill ${goal.status === "completed" ? "completed" : "active"}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="goal-progress-pct">{goal.progress}%</span>
            </div>

            {/* Active: Percentage Buttons */}
            {goal.status === "active" && (
              <div className="goal-percent-btns">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    onClick={() => handleProgress(goal._id, pct)}
                    className={`goal-percent-btn ${goal.progress >= pct ? "reached" : ""}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}

            {/* Completed Badge */}
            {goal.status === "completed" && (
              <div className="goal-completed-badge">
                <CheckCircle />
                {t("dashboard.client.completed")}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubscriberGoals;
