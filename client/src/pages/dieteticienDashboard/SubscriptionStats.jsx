import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BarChart3, Users, Clock, DollarSign, TrendingUp, ArrowUp } from "lucide-react";
import { getSubscriberStats } from "../../api/dieteticienSubscriptionApi";
import "./SubscriptionStats.css";

const SubscriptionStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getSubscriberStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="ss-page">
        <div className="ss-loading">
          <div className="ss-spinner" />
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const expiringPct = stats?.activeSubscribers
    ? Math.min(100, (stats.expiringThisWeek / stats.activeSubscribers) * 100)
    : 0;

  const kpis = [
    {
      icon: <Users />,
      value: stats?.activeSubscribers || 0,
      label: t("dashboard.client.activeSubscribers"),
      color: "green",
      barPct: "100%",
    },
    {
      icon: <Clock />,
      value: stats?.expiringThisWeek || 0,
      label: t("dashboard.client.expiringThisWeek"),
      color: "amber",
      barPct: `${expiringPct}%`,
    },
    {
      icon: <DollarSign />,
      value: `${(stats?.monthlyRevenue || 0).toLocaleString()} DZD`,
      label: t("dashboard.client.monthlyRevenue"),
      color: "blue",
      barPct: "100%",
    },
  ];

  return (
    <motion.div className="ss-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="ss-header">
        <div className="ss-header-icon">
          <BarChart3 />
        </div>
        <div>
          <h1 className="ss-title">{t("dashboard.sidebar.subscriberStats")}</h1>
          <p className="ss-subtitle">{t("dashboard.client.activeSubscribers")}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="ss-kpi-grid">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            className="ss-kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="ss-kpi-top">
              <div className={`ss-kpi-icon ${kpi.color}`}>
                {kpi.icon}
              </div>
              <div>
                <p className={`ss-kpi-value ${kpi.color}`}>{kpi.value}</p>
                <p className="ss-kpi-label">{kpi.label}</p>
              </div>
            </div>
            <div className="ss-bar-track">
              <motion.div
                className={`ss-bar-fill ${kpi.color}`}
                initial={{ width: 0 }}
                animate={{ width: kpi.barPct }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Insight */}
      <motion.div
        className="ss-revenue-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="ss-revenue-icon">
          <TrendingUp />
        </div>
        <div className="ss-revenue-info">
          <span className="ss-revenue-price">
            {t("dashboard.client.pricePerSubscription")}:{" "}
            <strong>{stats?.pricePerSubscription?.toLocaleString() || 4000} DZD</strong>
          </span>
          <span className="ss-revenue-period">/ {t("dashboard.client.month")}</span>
        </div>
        <div className="ss-revenue-badge">
          <ArrowUp />
          {stats?.activeSubscribers || 0} {t("dashboard.client.active")}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionStats;
