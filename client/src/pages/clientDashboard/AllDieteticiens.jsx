import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllDieteticiens } from "../../api/dieteticienSubscriptionApi";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  User: () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Stethoscope: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  BadgeCheck: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  MessageCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  ClipboardList: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  TrendingUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
};

const benefits = [
  { key: "zoom",     icon: "Video",       },
  { key: "chat",     icon: "MessageCircle", },
  { key: "diary",    icon: "ClipboardList", },
  { key: "resources", icon: "FileText",   },
  { key: "tracking", icon: "TrendingUp", },
];

const IconMap = {
  Video, MessageCircle, ClipboardList, FileText, TrendingUp,
};

const AllDieteticiens = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dieteticiens, setDieteticiens] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAllDieteticiens();
        if (res.success) setDieteticiens(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = dieteticiens.filter(d =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="aff-hero-title">{t('dashboard.client.findDieteticiens')}</h1>
          <p className="aff-hero-sub">{t('dashboard.client.findDieteticiensDesc')}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="search-bar" style={{ maxWidth: 480, margin: "0 auto 2rem", position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: 12, color: "#9ca3af" }}><Icons.Search /></span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('dashboard.client.searchDieteticiens')}
            style={{
              width: "100%", padding: "10px 14px 10px 42px", borderRadius: 12,
              border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
              background: "#fff", transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#10b981"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>
      </ScrollReveal>

      <div className="aff-cards-grid aff-diet-grid">
        {filtered.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
            {t('dashboard.client.noDieteticiens')}
          </p>
        ) : (
          filtered.map((d, i) => (
            <ScrollReveal key={d._id} direction={i % 2 === 0 ? "left" : "right"}>
              <motion.div
                className="aff-card aff-card-dieteticien"
                whileHover={{ translateY: -6 }}
                onClick={() => navigate(`/client/dieteticiens/${d._id}`)}
              >
                {/* Header */}
                <div className="aff-diet-header">
                  <div className="aff-diet-avatar">
                    {d.photo ? (
                      <img src={d.photo} alt="" loading="lazy" />
                    ) : (
                      <span className="aff-diet-avatar-fallback"><Icons.User /></span>
                    )}
                  </div>
                  <div className="aff-diet-info">
                    <h3 className="aff-diet-name">{d.fullName}</h3>
                    <div className="aff-diet-specialty">
                      <Icons.Stethoscope />
                      <span>{d.specialty || t('dashboard.client.generalNutrition')}</span>
                      <span className="aff-verified-badge" title={t('dashboard.client.verifiedProfessional')}>
                        <Icons.BadgeCheck />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="aff-diet-price">
                  <span className="aff-price-amount">{t('dashboard.client.subPrice')}</span>
                  <span className="aff-price-period">/ {t('dashboard.client.subDuration')}</span>
                </div>

                {/* What's Included */}
                <div className="aff-diet-included">
                  <h4 className="aff-diet-included-title">{t('dashboard.client.whatIncluded')}</h4>
                  <div className="aff-diet-benefits">
                    {benefits.map(b => {
                      const IconComp = IconMap[b.icon];
                      return (
                        <div key={b.key} className="aff-diet-benefit">
                          <div className="aff-diet-benefit-icon">
                            <IconComp />
                          </div>
                          <div className="aff-diet-benefit-text">
                            <strong>{t(`dashboard.client.included${b.key.charAt(0).toUpperCase() + b.key.slice(1)}`)}</strong>
                            <span>{t(`dashboard.client.included${b.key.charAt(0).toUpperCase() + b.key.slice(1)}Desc`)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action */}
                <div className="aff-diet-action">
                  <span>{t('dashboard.client.viewProfile')}</span>
                  <Icons.ChevronRight />
                </div>
              </motion.div>
            </ScrollReveal>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default AllDieteticiens;
