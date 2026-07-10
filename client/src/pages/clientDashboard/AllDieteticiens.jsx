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
  Mail: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>,
  Stethoscope: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
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

      <div className="aff-cards-grid">
        {filtered.length === 0 ? (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af", padding: "3rem 0" }}>
            {t('dashboard.client.noDieteticiens')}
          </p>
        ) : (
          filtered.map((d, i) => (
            <ScrollReveal key={d._id} direction={i % 2 === 0 ? "left" : "right"}>
              <motion.div
                className="aff-card aff-card-primary"
                whileHover={{ translateY: -6 }}
                onClick={() => navigate(`/client/dieteticiens/${d._id}`)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {d.photo ? (
                      <img src={d.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#059669" }}><Icons.User /></span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 4 }}>{d.fullName}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", fontSize: 13 }}>
                      <Icons.Stethoscope />
                      <span>{d.specialty}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669", fontSize: 13, fontWeight: 500 }}>
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
