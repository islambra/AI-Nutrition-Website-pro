import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSubscribers } from "../../api/dieteticienSubscriptionApi";
import { useChat } from "../../context/ChatContext";
import "./ClientsPage.css";

const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  MessageCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Utensils: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  Target: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Activity: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

const SubscribersList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { openChat } = useChat();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSubscribers();
        if (res.success) setSubscribers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = subscribers.filter(s =>
    s.client?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="cp-title">{t('dashboard.sidebar.subscribers')}</h1>
          <p className="cp-subtitle">{subscribers.length} {t('dashboard.client.active')}</p>
        </div>
      </div>

      <div className="cp-search">
        <Icons.Search />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('dashboard.client.searchDieteticiens')} />
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
          {t('dashboard.client.noSubscriptions')}
        </p>
      ) : (
        <div className="cp-grid">
          {filtered.map(sub => (
            <motion.div key={sub._id} className="cp-card" whileHover={{ translateY: -4 }}>
              <div className="cp-card-header">
                <div className="cp-avatar">
                  {sub.client?.photo ? (
                    <img src={sub.client.photo} alt="" />
                  ) : (
                    <Icons.User />
                  )}
                </div>
                <div className="cp-client-info">
                  <h3>{sub.client?.fullName || "Client"}</h3>
                  <span><Icons.Mail /> {sub.client?.email}</span>
                </div>
              </div>
              <div className="cp-card-details">
                <div className="cp-detail-item">
                  <Icons.Calendar />
                  <span>{t('dashboard.client.expiresOn')} {new Date(sub.endDate).toLocaleDateString()}</span>
                </div>
                <div className="cp-detail-item">
                  <Icons.Clock />
                  <span>{sub.remainingDays} {t('dashboard.client.daysRemaining')}</span>
                </div>
              </div>
              <div className="cp-card-actions">
                <button onClick={() => openChat(sub.client?._id)} className="cp-action-btn">
                  <Icons.MessageCircle /> {t('dashboard.client.chat')}
                </button>
                <button onClick={() => navigate(`/dieteticien/subscribers/${sub.client?._id}/food-logs`)} className="cp-action-btn">
                  <Icons.Utensils /> {t('dashboard.client.foodDiary')}
                </button>
                <button onClick={() => navigate(`/dieteticien/subscribers/${sub.client?._id}/goals`)} className="cp-action-btn">
                  <Icons.Target /> {t('dashboard.client.goals')}
                </button>
                <button onClick={() => navigate(`/dieteticien/subscribers/${sub.client?._id}/progress`)} className="cp-action-btn">
                  <Icons.Activity /> {t('dashboard.client.progress')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SubscribersList;
