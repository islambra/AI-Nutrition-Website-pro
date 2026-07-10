import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getSubscriberStats } from "../../api/dieteticienSubscriptionApi";
import "./ClientsPage.css";

const Icons = {
  Users: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  DollarSign: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  TrendingUp: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  ArrowUp: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  AlertCircle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const SubscriptionStats = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSubscriberStats();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    {
      icon: <Icons.Users />,
      value: stats?.activeSubscribers || 0,
      label: t('dashboard.client.activeSubscribers'),
      gradient: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
      color: "#059669",
      barColor: "linear-gradient(90deg, #10b981, #34d399)",
      barWidth: "100%",
    },
    {
      icon: <Icons.Clock />,
      value: stats?.expiringThisWeek || 0,
      label: t('dashboard.client.expiringThisWeek'),
      gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
      color: "#d97706",
      barColor: "linear-gradient(90deg, #f59e0b, #fbbf24)",
      barWidth: stats?.activeSubscribers
        ? `${Math.min(100, ((stats.expiringThisWeek / stats.activeSubscribers) * 100))}%`
        : "0%",
    },
    {
      icon: <Icons.DollarSign />,
      value: `${(stats?.monthlyRevenue || 0).toLocaleString()} DZD`,
      label: t('dashboard.client.monthlyRevenue'),
      gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
      color: "#2563eb",
      barColor: "linear-gradient(90deg, #3b82f6, #60a5fa)",
      barWidth: "100%",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <div>
          <h1 className="cp-title">{t('dashboard.sidebar.subscriberStats')}</h1>
          <p className="cp-subtitle">{t('dashboard.client.mySubscriptionsDesc')}</p>
        </div>
      </div>

      <div className="cp-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="cp-card"
            whileHover={{ translateY: -4, boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }}
            style={{ padding: "1.5rem", overflow: "hidden", position: "relative" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: card.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: card.color, flexShrink: 0
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{
                  margin: 0, fontSize: 28, fontWeight: 700, color: card.color,
                  lineHeight: 1.1
                }}>
                  {card.value}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                  {card.label}
                </p>
              </div>
            </div>
            <div style={{
              width: "100%", height: 6, background: "#e5e7eb",
              borderRadius: 3, overflow: "hidden"
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: card.barWidth }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                style={{ height: "100%", background: card.barColor, borderRadius: 3 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 24, padding: "1.25rem 1.5rem",
          background: "#f0fdf4", borderRadius: 16,
          border: "1.5px solid #bbf7d0",
          display: "flex", alignItems: "center", gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "#d1fae5",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#059669", flexShrink: 0
        }}>
          <Icons.TrendingUp />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, color: "#047857", fontWeight: 500 }}>
            {t('dashboard.client.pricePerSubscription')}: <strong style={{ fontSize: 15 }}>{stats?.pricePerSubscription?.toLocaleString() || 4000} DZD</strong>
          </span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 12 }}>
            / {t('dashboard.client.month')}
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 12px", borderRadius: 20,
          background: "#ecfdf5", color: "#059669", fontSize: 12, fontWeight: 600
        }}>
          <Icons.ArrowUp /> {stats?.activeSubscribers || 0} {t('dashboard.client.active')}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionStats;
