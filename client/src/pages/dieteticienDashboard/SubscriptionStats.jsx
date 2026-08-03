import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BarChart3, Users, DollarSign, TrendingUp, ArrowUp } from "lucide-react";
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

  const activeCount = stats?.activeSubscribers || 0;

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
        {/* Active Subscribers */}
        <motion.div
          className="ss-kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="ss-kpi-top">
            <div className="ss-kpi-icon green">
              <Users />
            </div>
            <div>
              <p className="ss-kpi-value green">{activeCount}</p>
              <p className="ss-kpi-label">{t("dashboard.client.activeSubscribers")}</p>
            </div>
          </div>
          <div className="ss-bar-track">
            <motion.div
              className="ss-bar-fill green"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          className="ss-kpi-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <div className="ss-kpi-top">
            <div className="ss-kpi-icon blue">
              <DollarSign />
            </div>
            <div>
              <p className="ss-kpi-value blue">{(stats?.monthlyRevenue || 0).toLocaleString()} DZD</p>
              <p className="ss-kpi-label">{t("dashboard.client.monthlyRevenue")}</p>
            </div>
          </div>
          <div className="ss-bar-track">
            <motion.div
              className="ss-bar-fill blue"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.46, duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>
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
            <strong>{stats?.pricePerSubscription?.toLocaleString() || 2999} DZD</strong>
          </span>
          <span className="ss-revenue-period">/ {t("dashboard.client.month")}</span>
        </div>
        <div className="ss-revenue-badge">
          <ArrowUp />
          {activeCount} {t("dashboard.client.active")}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionStats;
