import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Flame, Beef, Wheat, Droplets, Lock, ArrowRight, Calendar, Utensils } from "lucide-react";
import { getNutritionSummary } from "../../api/foodDiaryApi";
import { getMySubscriptions } from "../../api/dieteticienSubscriptionApi";
import "./ClientDashboard.css";

const NutritionProgress = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState(null);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, summaryRes] = await Promise.all([getMySubscriptions(), getNutritionSummary()]);
        if (subRes.success) {
          const active = subRes.data.find(s => s.isActive);
          setActiveSub(active || null);
        }
        if (summaryRes.success) setSummary(summaryRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    if (period === "week") {
      start.setDate(now.getDate() - 7);
    } else if (period === "month") {
      start.setMonth(now.getMonth() - 1);
    } else {
      start.setFullYear(now.getFullYear() - 1);
    }
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  };

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod);
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await getNutritionSummary({ startDate, endDate });
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cd-page">
        <div className="cd-loading"><div className="cd-spinner" /><p>{t("dashboard.client.loading")}</p></div>
      </div>
    );
  }

  if (!activeSub) {
    return (
      <div className="cd-page">
        <div className="cd-header">
          <div className="cd-header-icon purple"><BarChart3 /></div>
          <div>
            <h1 className="cd-title">Nutrition Progress</h1>
            <p className="cd-subtitle">Track your nutrition journey</p>
          </div>
        </div>
        <motion.div className="cd-lock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="cd-lock-icon"><Lock /></div>
          <h3>{t("dashboard.client.needSubscription")}</h3>
          <p>Subscribe to a dietitian to start tracking your nutrition progress.</p>
          <button className="cd-lock-btn" onClick={() => navigate("/client/my-subscriptions")}>
            {t("dashboard.client.goToSubscriptionsNow")} <ArrowRight />
          </button>
        </motion.div>
      </div>
    );
  }

  const stats = summary || { totalEntries: 0, totalDays: 0, totals: {}, averages: {}, mealTypeCounts: {} };

  const statCards = [
    {
      icon: <Utensils />,
      value: stats.totalEntries,
      label: "Total Entries",
      color: "blue"
    },
    {
      icon: <Calendar />,
      value: stats.totalDays,
      label: "Days Tracked",
      color: "green"
    },
    {
      icon: <Flame />,
      value: stats.averages?.calories || 0,
      label: "Avg Calories/Day",
      color: "amber"
    },
    {
      icon: <Beef />,
      value: `${stats.averages?.protein || 0}g`,
      label: "Avg Protein/Day",
      color: "red"
    }
  ];

  const macroCards = [
    { label: "Total Calories", value: stats.totals?.calories || 0, unit: "kcal", color: "#f59e0b", bg: "#fef3c7" },
    { label: "Total Protein", value: stats.totals?.protein || 0, unit: "g", color: "#dc2626", bg: "#fee2e2" },
    { label: "Total Carbs", value: stats.totals?.carbs || 0, unit: "g", color: "#2563eb", bg: "#dbeafe" },
    { label: "Total Fat", value: stats.totals?.fat || 0, unit: "g", color: "#7c3aed", bg: "#ede9fe" }
  ];

  const mealTypes = [
    { key: "breakfast", label: t("dashboard.client.breakfast"), color: "#d97706", bg: "#fef3c7" },
    { key: "lunch", label: t("dashboard.client.lunch"), color: "#2563eb", bg: "#dbeafe" },
    { key: "dinner", label: t("dashboard.client.dinner"), color: "#db2777", bg: "#fce7f3" },
    { key: "snack", label: t("dashboard.client.snack"), color: "#7c3aed", bg: "#ede9fe" }
  ];

  const maxMealCount = Math.max(1, ...Object.values(stats.mealTypeCounts || {}));

  return (
    <motion.div className="cd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="cd-header">
        <div className="cd-header-icon purple"><BarChart3 /></div>
        <div>
          <h1 className="cd-title">Nutrition Progress</h1>
          <p className="cd-subtitle">Track your nutrition journey with {activeSub?.dieteticien?.fullName || "your dietitian"}</p>
        </div>
      </div>

      {/* Period Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["week", "month", "year"].map(p => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            style={{
              padding: "8px 18px",
              borderRadius: 50,
              border: "1.5px solid",
              borderColor: period === p ? "#8b5cf6" : "#e2e8f0",
              background: period === p ? "#f5f3ff" : "#fff",
              color: period === p ? "#7c3aed" : "#64748b",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s"
            }}
          >
            {p === "week" ? "Last 7 Days" : p === "month" ? "Last 30 Days" : "Last Year"}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "18px 16px",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
            }}
          >
            <div className={`cd-summary-icon ${card.color}`} style={{ marginBottom: 12 }}>
              {card.icon}
            </div>
            <p className="cd-summary-value">{card.value}</p>
            <p className="cd-summary-label">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Macro Totals */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          border: "1px solid rgba(0,0,0,0.05)",
          marginBottom: 24
        }}
      >
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16, margin: "0 0 16px" }}>
          Nutrition Totals ({period === "week" ? "Last 7 Days" : period === "month" ? "Last 30 Days" : "Last Year"})
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {macroCards.map((card, i) => (
            <div key={i} style={{
              padding: 16,
              borderRadius: 14,
              background: card.bg,
              textAlign: "center"
            }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: card.color, margin: 0 }}>
                {card.value.toLocaleString()}
              </p>
              <p style={{ fontSize: 13, color: card.color, margin: "4px 0 0", fontWeight: 500 }}>{card.unit}</p>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>{card.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Average Daily */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          border: "1px solid rgba(0,0,0,0.05)",
          marginBottom: 24
        }}
      >
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: "#1e293b", margin: "0 0 16px" }}>
          Daily Averages
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{stats.averages?.calories || 0}</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Avg kcal/day</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#dc2626", margin: 0 }}>{stats.averages?.protein || 0}g</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Avg protein/day</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#2563eb", margin: 0 }}>{stats.averages?.carbs || 0}g</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Avg carbs/day</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#7c3aed", margin: 0 }}>{stats.averages?.fat || 0}g</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Avg fat/day</p>
          </div>
        </div>
      </motion.div>

      {/* Meal Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 600, color: "#1e293b", margin: "0 0 16px" }}>
          Meal Type Distribution
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mealTypes.map((meal, i) => {
            const count = stats.mealTypeCounts?.[meal.key] || 0;
            const pct = maxMealCount > 0 ? (count / maxMealCount) * 100 : 0;
            return (
              <div key={meal.key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: meal.color, minWidth: 80 }}>{meal.label}</span>
                <div style={{ flex: 1, height: 24, background: "#f1f5f9", borderRadius: 12, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                    style={{ height: "100%", background: meal.color, borderRadius: 12 }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", minWidth: 40, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NutritionProgress;
