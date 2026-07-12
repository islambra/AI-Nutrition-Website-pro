import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Calendar, Clock, MessageCircle, Utensils, Users, X, DollarSign, TrendingUp, ArrowUp } from "lucide-react";
import { getSubscribers, getSubscriberStats } from "../../api/dieteticienSubscriptionApi";
import { useChat } from "../../context/ChatContext";
import "./SubscribersList.css";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  }),
};

const SubscribersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { openChat } = useChat();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subRes, statsRes] = await Promise.all([getSubscribers(), getSubscriberStats()]);
        if (subRes.success) setSubscribers(subRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = subscribers.filter((s) =>
    s.client?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getDaysClass = (days) => {
    if (days > 14) return "ok";
    if (days > 5) return "warn";
    return "danger";
  };

  if (loading) {
    return (
      <div className="sub-list-page">
        <div className="sub-list-loading">
          <div className="sub-list-spinner" />
          <p>{t("dashboard.client.loading")}</p>
        </div>
      </div>
    );
  }

  const expiringPct = stats?.activeSubscribers
    ? Math.min(100, (stats.expiringThisWeek / stats.activeSubscribers) * 100)
    : 0;

  const kpis = [
    { icon: <Users />, value: stats?.activeSubscribers || 0, label: t("dashboard.client.activeSubscribers"), color: "green", barPct: "100%" },
    { icon: <Clock />, value: stats?.expiringThisWeek || 0, label: t("dashboard.client.expiringThisWeek"), color: "amber", barPct: `${expiringPct}%` },
    { icon: <DollarSign />, value: `${(stats?.monthlyRevenue || 0).toLocaleString()} DZD`, label: t("dashboard.client.monthlyRevenue"), color: "blue", barPct: "100%" },
  ];

  return (
    <motion.div className="sub-list-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="sub-list-header">
        <div className="sub-list-header-left">
          <div className="sub-list-icon-wrap"><Users /></div>
          <div>
            <h1 className="sub-list-title">{t("dashboard.sidebar.subscribers")}</h1>
            <p className="sub-list-subtitle">
              {subscribers.length} {t("dashboard.client.active")}{" "}
              {subscribers.length === 1 ? t("dashboard.sidebar.subscriber") : t("dashboard.sidebar.subscribers")}
            </p>
          </div>
        </div>
        {subscribers.length > 0 && (
          <div className="sub-list-count-badge">
            <Users size={16} />
            {subscribers.length}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="sub-list-kpi-grid">
        {kpis.map((kpi, i) => (
          <motion.div key={i} className="sub-list-kpi-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="sub-list-kpi-top">
              <div className={`sub-list-kpi-icon ${kpi.color}`}>{kpi.icon}</div>
              <div>
                <p className={`sub-list-kpi-value ${kpi.color}`}>{kpi.value}</p>
                <p className="sub-list-kpi-label">{kpi.label}</p>
              </div>
            </div>
            <div className="sub-list-bar-track">
              <motion.div className={`sub-list-bar-fill ${kpi.color}`} initial={{ width: 0 }} animate={{ width: kpi.barPct }} transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: "easeOut" }} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Insight */}
      <motion.div className="sub-list-revenue-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="sub-list-revenue-icon"><TrendingUp /></div>
        <div className="sub-list-revenue-info">
          <span className="sub-list-revenue-price">
            {t("dashboard.client.pricePerSubscription")}: <strong>{stats?.pricePerSubscription?.toLocaleString() || 4000} DZD</strong>
          </span>
          <span className="sub-list-revenue-period">/ {t("dashboard.client.month")}</span>
        </div>
        <div className="sub-list-revenue-badge">
          <ArrowUp />
          {stats?.activeSubscribers || 0} {t("dashboard.client.active")}
        </div>
      </motion.div>

      {/* Search */}
      {subscribers.length > 0 && (
        <div className="sub-list-search">
          <Search />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("dashboard.client.searchDieteticiens")} />
          {search && (
            <button className="sub-list-search-clear" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Empty */}
      {filtered.length === 0 && (
        <motion.div className="sub-list-empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sub-list-empty-icon"><Users /></div>
          <h3>{search ? t("common.noResults") : t("dashboard.client.noSubscriptions")}</h3>
          <p>{search ? t("dashboard.client.searchDieteticiens") : t("dashboard.client.findDieteticiensDesc")}</p>
        </motion.div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="sub-list-grid">
          <AnimatePresence>
            {filtered.map((sub, i) => (
              <motion.div key={sub._id} className="sub-list-card" custom={i} variants={cardVariants} initial="hidden" animate="visible" layout>
                <div className="sub-list-card-bar" />
                <div className="sub-list-card-body">
                  <div className="sub-list-card-top">
                    <div className="sub-list-avatar">
                      {sub.client?.photo ? (
                        <img src={sub.client.photo} alt="" loading="lazy" />
                      ) : (
                        <div className="sub-list-avatar-fallback">{getInitials(sub.client?.fullName)}</div>
                      )}
                    </div>
                    <div className="sub-list-card-info">
                      <h3 className="sub-list-card-name">{sub.client?.fullName || "Client"}</h3>
                      <p className="sub-list-card-email">{sub.client?.email}</p>
                    </div>
                    <div className="sub-list-status-dot" title={t("dashboard.client.active")} />
                  </div>

                  <div className="sub-list-card-details">
                    <div className="sub-list-detail">
                      <Calendar />
                      <span><strong>{t("dashboard.client.expiresOn")}</strong> {new Date(sub.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className={`sub-list-days-badge ${getDaysClass(sub.remainingDays)}`}>
                      <Clock size={12} />
                      {sub.remainingDays} {t("dashboard.client.daysRemaining")}
                    </div>
                  </div>

                  <div className="sub-list-card-actions">
                    <button className="sub-list-action-btn primary" onClick={() => openChat(sub.client?._id)}>
                      <MessageCircle /> {t("dashboard.client.chat")}
                    </button>
                    <button className="sub-list-action-btn" onClick={() => navigate(`/dieteticien/subscribers/${sub.client?._id}/food-logs`)}>
                      <Utensils /> {t("dashboard.client.foodDiary")}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SubscribersList;
