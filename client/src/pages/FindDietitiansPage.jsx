import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ChevronRight, User, Stethoscope, ArrowUpDown, Sparkles, Star, Shield } from "lucide-react";
import { getPublicDieteticiens } from "../api/dieteticienSubscriptionApi";
import ScrollReveal from "../components/ScrollReveal";
import "./FindDietitiansPage.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

const FindDietitiansPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dieteticiens, setDieteticiens] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPublicDieteticiens();
        if (res.success) setDieteticiens(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let result = dieteticiens.filter((d) => {
      const matchesSearch = d.fullName?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    if (sortBy === "name") {
      result.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    }

    return result;
  }, [dieteticiens, search, sortBy]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #059669, #10b981)",
      "linear-gradient(135deg, #0891b2, #06b6d4)",
      "linear-gradient(135deg, #7c3aed, #8b5cf6)",
      "linear-gradient(135deg, #d97706, #f59e0b)",
      "linear-gradient(135deg, #dc2626, #ef4444)",
      "linear-gradient(135deg, #2563eb, #3b82f6)",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="fdp-page">
      {/* Hero */}
      <section className="fdp-hero">
        <div className="fdp-hero-bg">
          <div className="fdp-hero-orb fdp-hero-orb-1" />
          <div className="fdp-hero-orb fdp-hero-orb-2" />
          <div className="fdp-hero-orb fdp-hero-orb-3" />
        </div>
        <div className="fdp-hero-content">
          <motion.div
            className="fdp-hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles size={14} />
            <span>{t("findDietitians.badge")}</span>
          </motion.div>
          <motion.h1
            className="fdp-hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("findDietitians.title")}
          </motion.h1>
          <motion.p
            className="fdp-hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {t("findDietitians.subtitle")}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            className="fdp-search-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="fdp-search-bar">
              <Search size={20} className="fdp-search-icon" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("findDietitians.searchPlaceholder")}
                className="fdp-search-input"
              />
              {search && (
                <button className="fdp-search-clear" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="fdp-hero-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <div className="fdp-stat">
              <span className="fdp-stat-number">{dieteticiens.length}</span>
              <span className="fdp-stat-label">{t("findDietitians.expertsAvailable")}</span>
            </div>
            <div className="fdp-stat-divider" />
            <div className="fdp-stat">
              <span className="fdp-stat-number">4,000</span>
              <span className="fdp-stat-label">{t("findDietitians.dzdMonth")}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="fdp-content">
        <div className="fdp-content-inner">
          {/* Sort + Results Count */}
          <div className="fdp-results-header">
            <span className="fdp-results-count">
              {filtered.length} {t("findDietitians.dietitiansFound")}
            </span>
            <div className="fdp-sort">
              <ArrowUpDown size={14} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="fdp-sort-select"
              >
                <option value="newest">{t("findDietitians.newest")}</option>
                <option value="name">{t("findDietitians.nameAZ")}</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="fdp-loading">
              <div className="fdp-spinner" />
              <p>{t("findDietitians.loading")}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <motion.div
              className="fdp-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <User size={48} />
              <h3>{t("findDietitians.noResults")}</h3>
              <p>{t("findDietitians.noResultsDesc")}</p>
              <button
                className="fdp-empty-reset"
                onClick={() => setSearch("")}
              >
                {t("findDietitians.clearFilters")}
              </button>
            </motion.div>
          )}

          {/* Cards Grid */}
          {!loading && filtered.length > 0 && (
            <motion.div
              className="fdp-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((d, i) => (
                  <motion.div
                    key={d._id}
                    className="fdp-card"
                    variants={cardVariants}
                    layout
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    onClick={() => navigate(`/find-dietitians/${d._id}`)}
                  >
                    <div className="fdp-card-glow" />
                    <div className="fdp-card-inner">
                      <div className="fdp-card-header">
                        <div
                          className="fdp-card-avatar"
                          style={{ background: getGradient(i) }}
                        >
                          {d.photo ? (
                            <img src={d.photo} alt={d.fullName} loading="lazy" />
                          ) : (
                            <span className="fdp-card-initials">
                              {getInitials(d.fullName)}
                            </span>
                          )}
                        </div>
                        <div className="fdp-card-verified">
                          <Shield size={12} />
                        </div>
                      </div>

                      <div className="fdp-card-body">
                        <h3 className="fdp-card-name">{d.fullName}</h3>
                        <div className="fdp-card-specialty">
                          <Stethoscope size={13} />
                          <span>{d.specialty || t("findDietitians.generalNutrition")}</span>
                        </div>
                        <div className="fdp-card-rating">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} className="fdp-star" />
                          ))}
                          <span>{t("findDietitians.verifiedProfessional")}</span>
                        </div>
                      </div>

                      <div className="fdp-card-footer">
                        <div className="fdp-card-price">
                          <span className="fdp-price-amount">3,000</span>
                          <span className="fdp-price-currency">DZD / {t("findDietitians.month")}</span>
                        </div>
                        <button className="fdp-card-btn">
                          <span>{t("findDietitians.viewProfile")}</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FindDietitiansPage;
