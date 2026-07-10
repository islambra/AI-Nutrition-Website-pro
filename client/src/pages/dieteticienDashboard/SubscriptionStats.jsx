import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { getSubscriberStats } from "../../api/dieteticienSubscriptionApi";
import "./ClientsPage.css";

const Icons = {
  Users: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Clock: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  DollarSign: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cp-page">
      <div className="cp-header">
        <div>
          <h1 className="cp-title">{t('dashboard.sidebar.subscriberStats')}</h1>
          <p className="cp-subtitle">{t('dashboard.client.mySubscriptionsDesc')}</p>
        </div>
      </div>

      <div className="cp-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <motion.div className="cp-card" whileHover={{ translateY: -4 }} style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#059669"
            }}>
              <Icons.Users />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#059669" }}>
                {stats?.activeSubscribers || 0}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{t('dashboard.client.activeSubscribers')}</p>
            </div>
          </div>
          <div style={{
            width: "100%", height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden"
          }}>
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 2
            }} />
          </div>
        </motion.div>

        <motion.div className="cp-card" whileHover={{ translateY: -4 }} style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706"
            }}>
              <Icons.Clock />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#d97706" }}>
                {stats?.expiringThisWeek || 0}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{t('dashboard.client.expiringThisWeek')}</p>
            </div>
          </div>
          <div style={{
            width: "100%", height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden"
          }}>
            <div style={{
              width: `${stats?.activeSubscribers ? ((stats.expiringThisWeek / stats.activeSubscribers) * 100) : 0}%`,
              height: "100%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)", borderRadius: 2
            }} />
          </div>
        </motion.div>

        <motion.div className="cp-card" whileHover={{ translateY: -4 }} style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb"
            }}>
              <Icons.DollarSign />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#2563eb" }}>
                {stats?.monthlyRevenue?.toLocaleString() || 0} DZD
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{t('dashboard.client.monthlyRevenue')}</p>
            </div>
          </div>
          <div style={{
            width: "100%", height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden"
          }}>
            <div style={{
              width: "100%", height: "100%",
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: 2
            }} />
          </div>
        </motion.div>
      </div>

      <div style={{ marginTop: 24, padding: "1rem", background: "#f9fafb", borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13 }}>
          <Icons.TrendingUp />
          <span>{t('dashboard.client.pricePerSubscription')}: <strong>{stats?.pricePerSubscription?.toLocaleString() || 4000} DZD</strong></span>
        </div>
      </div>
    </motion.div>
  );
};

export default SubscriptionStats;
