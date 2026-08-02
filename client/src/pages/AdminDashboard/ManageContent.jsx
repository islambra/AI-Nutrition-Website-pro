import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  getAllBlogs,
  deleteBlog,
} from "../../api/blogApi";
import {
  getAllFormationsAdmin,
  deleteFormation,
} from "../../api/formationApi";
import {
  getAllPlans,
  deletePlan,
} from "../../api/planApi";
import {
  AlertTriangle,
  X,
  Trash2,
  Search,
  RefreshCw,
  FileText,
  Video,
  ClipboardList,
  Sparkles,
  Loader2,
  User,
  Calendar,
  Clock,
  Flame,
  Eye,
  Utensils,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./ManageContent.css";

const TABS = [
  { id: "blogs", icon: FileText, accent: "#8B5CF6", tint: "rgba(139, 92, 246, 0.12)", monogram: "B" },
  { id: "formations", icon: Video, accent: "#0EA5E9", tint: "rgba(14, 165, 233, 0.12)", monogram: "F" },
  { id: "plans", icon: ClipboardList, accent: "#10B981", tint: "rgba(16, 185, 129, 0.12)", monogram: "P" },
];

const DELETE_SUFFIX = { blogs: "Blog", formations: "Formation", plans: "Plan" };

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";

const formatPrice = (price) => `${Number(price || 0).toLocaleString()} DZD`;

const ManageContent = () => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState("blogs");
  const [data, setData] = useState({ blogs: [], formations: [], plans: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [blogsRes, formationsRes, plansRes] = await Promise.all([
        getAllBlogs(),
        getAllFormationsAdmin(),
        getAllPlans(),
      ]);
      setData({
        blogs: blogsRes?.data || [],
        formations: formationsRes?.data || [],
        plans: plansRes?.data || [],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.content.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const activeItems = data[activeTab] || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeItems;
    return activeItems.filter((item) => {
      const title = String(item.title || item.planName || "").toLowerCase();
      const creator = String(
        item.author?.fullName || item.creatorInfo?.fullName || ""
      ).toLowerCase();
      const category = String(item.planCategory || item.type || "").toLowerCase();
      return title.includes(q) || creator.includes(q) || category.includes(q);
    });
  }, [activeItems, search]);

  const activeConfig = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const totalCount = data.blogs.length + data.formations.length + data.plans.length;

  const openDelete = (kind, item) => setDeleteTarget({ kind, item });
  const openDetail = (kind, item) => setDetailItem({ kind, item });
  const closeDetail = () => setDetailItem(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { kind, item } = deleteTarget;
    setDeleting(true);
    try {
      let res;
      if (kind === "blogs") res = await deleteBlog(item._id);
      else if (kind === "formations") res = await deleteFormation(item._id);
      else if (kind === "plans") res = await deletePlan(item._id);

      if (res?.success) {
        setData((prev) => ({
          ...prev,
          [kind]: prev[kind].filter((i) => i._id !== item._id),
        }));
        toast.success(t(`admin.content.deleted${DELETE_SUFFIX[kind]}`));
        setDetailItem((prev) =>
          prev?.item._id === item._id ? null : prev
        );
      } else {
        toast.error(res?.message || t("admin.content.deleteFailed"));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t("admin.content.deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getStatusLabel = (status) => {
    const key =
      status === "completed"
        ? "statusCompleted"
        : status === "cancelled"
        ? "statusCancelled"
        : "statusActive";
    return t(`admin.content.${key}`);
  };

  const getStatusClass = (status) =>
    status === "completed"
      ? "is-status-completed"
      : status === "cancelled"
      ? "is-status-cancelled"
      : "is-status-active";

  const renderBlogMedia = (blog) => (
    <div className="mc-media">
      {blog.photo ? (
        <img src={blog.photo} alt={blog.title} loading="lazy" />
      ) : (
        <div className="mc-media-placeholder">
          <FileText size={28} />
        </div>
      )}
      <div className="mc-media-shade" />
      <span className="mc-monogram" style={{ color: TABS[0].accent, background: TABS[0].tint }}>
        B
      </span>
      {blog.type && (
        <span className="mc-type-chip" style={{ color: TABS[0].accent, background: TABS[0].tint }}>
          {blog.type}
        </span>
      )}
    </div>
  );

  const renderFormationMedia = (formation) => (
    <div className="mc-media">
      {formation.image ? (
        <img src={formation.image} alt={formation.title} loading="lazy" />
      ) : (
        <div className="mc-media-placeholder">
          <Video size={28} />
        </div>
      )}
      <div className="mc-media-shade" />
      <span className="mc-monogram" style={{ color: TABS[1].accent, background: TABS[1].tint }}>
        F
      </span>
      {formation.status && (
        <span className={`mc-type-chip ${getStatusClass(formation.status)}`}>
          {getStatusLabel(formation.status)}
        </span>
      )}
    </div>
  );

  const renderPlanMedia = (plan) => (
    <div className="mc-media">
      {plan.planImage ? (
        <img src={plan.planImage} alt={plan.planName} loading="lazy" />
      ) : (
        <div className="mc-media-placeholder">
          <ClipboardList size={28} />
        </div>
      )}
      <div className="mc-media-shade" />
      <span className="mc-monogram" style={{ color: TABS[2].accent, background: TABS[2].tint }}>
        P
      </span>
      {plan.planCategory && (
        <span className="mc-type-chip" style={{ color: TABS[2].accent, background: TABS[2].tint }}>
          {plan.planCategory}
        </span>
      )}
    </div>
  );

  const renderCard = (item, index) => {
    const kind = activeTab;
    const accent = activeConfig.accent;
    return (
      <motion.article
        key={item._id}
        className="mc-card"
        style={{ "--mc-accent": accent }}
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.05, 0.45),
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
      >
        <div className="mc-actions">
          <button
            type="button"
            className="mc-view"
            onClick={() => openDetail(kind, item)}
            aria-label={t("admin.content.viewDetails")}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="mc-delete"
            onClick={() => openDelete(kind, item)}
            aria-label={t(`admin.content.delete${DELETE_SUFFIX[kind]}`)}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mc-card-inner" onClick={() => openDetail(kind, item)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(kind, item); } }}>
        {kind === "blogs" ? (
          <>
            {renderBlogMedia(item)}
            <div className="mc-card-body">
              <h3 className="mc-card-title">{item.title}</h3>
              <div className="mc-meta">
                <span>
                  <User size={13} /> {item.author?.fullName || t("common.unknown")}
                </span>
                <span>
                  <Calendar size={13} /> {formatDate(item.createdAt)}
                </span>
              </div>
              {(item.tags || []).length > 0 && (
                <div className="mc-tags">
                  {(item.tags || []).slice(0, 3).map((tag, i) => (
                    <span key={i} className="mc-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : kind === "formations" ? (
          <>
            {renderFormationMedia(item)}
            <div className="mc-card-body">
              <h3 className="mc-card-title">{item.title}</h3>
              <p className="mc-desc">{item.description}</p>
              <div className="mc-meta">
                <span>
                  <Clock size={13} /> {item.durationWeeks} {t("admin.content.weeks")}
                </span>
                <span>
                  <Video size={13} /> {item.sessionsCount} {t("admin.content.sessions")}
                </span>
              </div>
              <div className="mc-price-row">
                <span className="mc-price">{formatPrice(item.price)}</span>
                <span className="mc-creator">
                  <User size={12} /> {item.creatorInfo?.fullName || t("common.unknown")}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {renderPlanMedia(item)}
            <div className="mc-card-body">
              <h3 className="mc-card-title">{item.planName}</h3>
              <p className="mc-desc">{item.targetUserProfile || item.description}</p>
              <div className="mc-meta">
                <span>
                  <Clock size={13} /> {item.duration} {t("admin.content.weeks")}
                </span>
                {item.dailyCalorieRange && (
                  <span>
                    <Flame size={13} /> {item.dailyCalorieRange.min}–{item.dailyCalorieRange.max}{" "}
                    {t("admin.content.calories")}
                  </span>
                )}
              </div>
              <div className="mc-price-row">
                <span className="mc-price">{formatPrice(item.price)}</span>
                <span className="mc-creator">
                  <User size={12} /> {item.creatorInfo?.fullName || t("common.unknown")}
                </span>
              </div>
            </div>
          </>
        )}
        </div>
      </motion.article>
    );
  };

  const deleteSuffix = deleteTarget ? DELETE_SUFFIX[deleteTarget.kind] : "";
  const deleteName = deleteTarget
    ? deleteTarget.item.title || deleteTarget.item.planName || ""
    : "";

  const macroKeys = [
    { key: "proteins" },
    { key: "carbohydrates" },
    { key: "fats" },
  ];

  const DetailSection = ({ title, children }) => (
    <section className="mc-detail-section">
      <h4>{title}</h4>
      {children}
    </section>
  );

  const ChipList = ({ items, empty }) =>
    items?.length ? (
      <div className="mc-detail-chips">
        {items.map((it, i) => (
          <span key={i} className="mc-detail-chip">
            {it}
          </span>
        ))}
      </div>
    ) : (
      <p className="mc-detail-muted">{empty}</p>
    );

  const MacroBars = ({ ratio }) => {
    if (!ratio) return <p className="mc-detail-muted">{t("admin.content.detailNotSpecified")}</p>;
    const total = ratio.proteins + ratio.carbohydrates + ratio.fats;
    const safe = total > 0 ? total : 1;
    return (
      <div className="mc-macro-bars">
        {macroKeys.map(({ key }) => {
          const val = Number(ratio[key]) || 0;
          const pct = Math.round((val / safe) * 100);
          return (
            <div key={key} className="mc-macro-row">
              <div className="mc-macro-head">
                <span>{t(`admin.content.macro${cap(key)}`)}</span>
                <strong>{val}%</strong>
              </div>
              <div className="mc-macro-track">
                <div className={`mc-macro-fill is-${key}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const MealList = ({ structure }) => {
    if (!structure) return <p className="mc-detail-muted">{t("admin.content.detailNotSpecified")}</p>;
    const meals = Array.isArray(structure) ? structure : [structure];
    return (
      <div className="mc-meal-list">
        {meals.map((meal, i) => (
          <div key={i} className="mc-meal-item">
            <div className="mc-meal-dot" />
            <div>
              <p className="mc-meal-name">
                {meal.mealName || meal.name || t("admin.content.detailMeal", { n: i + 1 })}
              </p>
              {meal.description && <p className="mc-meal-desc">{meal.description}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailContent = () => {
    if (!detailItem) return null;
    const { kind, item } = detailItem;

    if (kind === "blogs") {
      return (
        <>
          <div className="mc-detail-hero">
            <div className="mc-detail-media">
              {item.photo ? (
                <img src={item.photo} alt={item.title} />
              ) : (
                <div className="mc-media-placeholder">
                  <FileText size={40} />
                </div>
              )}
            </div>
            <div className="mc-detail-title-wrap">
              {item.type && <span className="mc-detail-chip">{item.type}</span>}
              <h3>{item.title}</h3>
              <div className="mc-detail-meta">
                <span><User size={13} /> {item.author?.fullName || t("common.unknown")}</span>
                <span><Calendar size={13} /> {formatDate(item.createdAt)}</span>
                {item.createdAt && <span><Clock size={13} /> {formatDate(item.updatedAt)}</span>}
              </div>
            </div>
          </div>
          <DetailSection title={t("admin.content.detailContent")}>
            <p className="mc-detail-text">{item.content || t("admin.content.detailNotSpecified")}</p>
          </DetailSection>
          <DetailSection title={t("admin.content.detailTags")}>
            <ChipList items={item.tags} empty={t("admin.content.detailNotSpecified")} />
          </DetailSection>
        </>
      );
    }

    if (kind === "formations") {
      return (
        <>
          <div className="mc-detail-hero">
            <div className="mc-detail-media">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <div className="mc-media-placeholder">
                  <Video size={40} />
                </div>
              )}
            </div>
            <div className="mc-detail-title-wrap">
              <span className={`mc-detail-chip ${getStatusClass(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
              <h3>{item.title}</h3>
              <div className="mc-detail-meta">
                <span><User size={13} /> {item.creatorInfo?.fullName || t("common.unknown")}</span>
                <span><Calendar size={13} /> {formatDate(item.startDate)} → {formatDate(item.endDate)}</span>
              </div>
            </div>
          </div>
          <div className="mc-detail-stats">
            <div className="mc-detail-stat">
              <Clock size={16} />
              <strong>{item.durationWeeks}</strong>
              <span>{t("admin.content.weeks")}</span>
            </div>
            <div className="mc-detail-stat">
              <Video size={16} />
              <strong>{item.sessionsCount}</strong>
              <span>{t("admin.content.sessions")}</span>
            </div>
            <div className="mc-detail-stat">
              <Flame size={16} />
              <strong>{formatPrice(item.price)}</strong>
              <span>{t("admin.content.price")}</span>
            </div>
          </div>
          <DetailSection title={t("admin.content.detailDescription")}>
            <p className="mc-detail-text">{item.description || t("admin.content.detailNotSpecified")}</p>
          </DetailSection>
          {item.files?.length > 0 && (
            <DetailSection title={t("admin.content.detailFiles")}>
              <div className="mc-detail-list">
                {item.files.map((f, i) => (
                  <div key={i} className="mc-detail-list-row">
                    <FileText size={14} />
                    <span>{f.fileName || f.originalName || f.name || `file-${i + 1}`}</span>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </>
      );
    }

    return (
      <>
        <div className="mc-detail-hero">
          <div className="mc-detail-media">
            {item.planImage ? (
              <img src={item.planImage} alt={item.planName} />
            ) : (
              <div className="mc-media-placeholder">
                <ClipboardList size={40} />
              </div>
            )}
          </div>
          <div className="mc-detail-title-wrap">
            {item.planCategory && <span className="mc-detail-chip">{item.planCategory}</span>}
            <h3>{item.planName}</h3>
            <div className="mc-detail-meta">
              <span><User size={13} /> {item.creatorInfo?.fullName || t("common.unknown")}</span>
              <span><Calendar size={13} /> {formatDate(item.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="mc-detail-stats">
          <div className="mc-detail-stat">
            <Clock size={16} />
            <strong>{item.duration}</strong>
            <span>{t("admin.content.weeks")}</span>
          </div>
          <div className="mc-detail-stat">
            <Flame size={16} />
            <strong>{item.dailyCalorieRange?.min}–{item.dailyCalorieRange?.max}</strong>
            <span>{t("admin.content.calories")}</span>
          </div>
          <div className="mc-detail-stat">
            <Utensils size={16} />
            <strong>{formatPrice(item.price)}</strong>
            <span>{t("admin.content.price")}</span>
          </div>
        </div>
        <DetailSection title={t("admin.content.detailProfile")}>
          <p className="mc-detail-text">{item.targetUserProfile || item.description || t("admin.content.detailNotSpecified")}</p>
        </DetailSection>
        <DetailSection title={t("admin.content.detailMacros")}>
          <MacroBars ratio={item.macronutrientRatio} />
        </DetailSection>
        <DetailSection title={t("admin.content.detailRecommended")}>
          <ChipList items={item.recommendedFoods} empty={t("admin.content.detailNotSpecified")} />
        </DetailSection>
        <DetailSection title={t("admin.content.detailAvoid")}>
          <ChipList items={item.foodsToAvoid} empty={t("admin.content.detailNotSpecified")} />
        </DetailSection>
        <DetailSection title={t("admin.content.detailMeals")}>
          <MealList structure={item.mealStructure} />
        </DetailSection>
        {item.weeklyGroceryList && (
          <DetailSection title={t("admin.content.detailGrocery")}>
            <div className="mc-detail-list">
              {(Array.isArray(item.weeklyGroceryList) ? item.weeklyGroceryList : []).map((g, i) => (
                <div key={i} className="mc-detail-list-row">
                  <ExternalLink size={14} />
                  <span>{typeof g === "string" ? g : (g.name || g.food || JSON.stringify(g))}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        )}
        {item.supplements?.length > 0 && (
          <DetailSection title={t("admin.content.detailSupplements")}>
            <ChipList items={item.supplements} empty={t("admin.content.detailNotSpecified")} />
          </DetailSection>
        )}
        {item.exercisePlan && (
          <DetailSection title={t("admin.content.detailExercise")}>
            <p className="mc-detail-text">{typeof item.exercisePlan === "string" ? item.exercisePlan : t("admin.content.detailNotSpecified")}</p>
          </DetailSection>
        )}
      </>
    );
  };

  const detailAccent = detailItem
    ? TABS.find((tab) => tab.id === detailItem.kind)?.accent || "#8B5CF6"
    : "#8B5CF6";

  return (
    <div className="mc-container">
      <header className="mc-header">
        <div>
          <div className="mc-eyebrow">
            <Sparkles size={13} /> {t("admin.content.manageContentBadge")}
          </div>
          <h1>{t("admin.content.manageContentTitle")}</h1>
          <p>{t("admin.content.manageContentDescription")}</p>
        </div>
        <div className="mc-header-right">
          <div className="mc-total">
            <strong>{totalCount}</strong>
            <span>{t("admin.content.totalItems", { count: totalCount })}</span>
          </div>
          <button
            type="button"
            className="mc-refresh"
            onClick={fetchAll}
            disabled={loading}
            title={t("admin.content.refresh")}
          >
            <RefreshCw size={16} className={loading ? "mc-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="mc-tabs" role="tablist" aria-label={t("admin.content.manageContentTitle")}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = data[tab.id].length;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`mc-tab ${isActive ? "active" : ""}`}
              style={{ "--mc-accent": tab.accent, "--mc-tint": tab.tint }}
              onClick={() => setActiveTab(tab.id)}
            >
              {isActive && (
                <motion.span
                  layoutId="mc-pill"
                  className="mc-tab-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon size={15} className="mc-tab-icon" />
              <span className="mc-tab-label">{t(`admin.content.${tab.id}Tab`)}</span>
              <span className="mc-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mc-toolbar">
        <div className="mc-search">
          <Search size={17} />
          <input
            type="text"
            placeholder={t(`admin.content.search${cap(activeTab)}`)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="mc-search-clear"
              onClick={() => setSearch("")}
              aria-label={t("common.cancel")}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mc-loading">
          <Loader2 className="mc-spin" size={40} />
          <p>{t("admin.content.loadingContent")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mc-empty">
          <div
            className="mc-empty-icon"
            style={{ color: activeConfig.accent, background: activeConfig.tint }}
          >
            <activeConfig.icon size={40} />
          </div>
          <h3>{t(`admin.content.no${cap(activeTab)}`)}</h3>
          <p>{t("admin.content.adjustSearch")}</p>
        </div>
      ) : (
        <div className="mc-grid">
          {filtered.map((item, index) => renderCard(item, index))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="mc-footer-count">
          {filtered.length} {filtered.length === 1 ? t("common.result") : t("common.results")}
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="mc-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              className="mc-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="mc-modal-close"
                onClick={() => !deleting && setDeleteTarget(null)}
                disabled={deleting}
                aria-label={t("common.cancel")}
              >
                <X size={18} />
              </button>
              <div className="mc-modal-icon">
                <AlertTriangle size={26} />
              </div>
              <h3>{t(`admin.content.delete${deleteSuffix}`)}</h3>
              <p>{t(`admin.content.deleteConfirm${deleteSuffix}`, { name: deleteName })}</p>
              <div className="mc-modal-actions">
                <button
                  type="button"
                  className="mc-modal-btn cancel"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  className="mc-modal-btn confirm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={16} className="mc-spin" /> : <Trash2 size={16} />}
                  {deleting ? t("common.loading") : t(`admin.content.delete${deleteSuffix}`)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailItem && (
          <motion.div
            className="mc-overlay mc-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          >
            <motion.div
              className="mc-detail-modal"
              style={{ "--mc-accent": detailAccent }}
              initial={{ opacity: 0, scale: 0.96, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 28 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t("admin.content.viewDetails")}
            >
              <div className="mc-detail-topbar">
                <div className="mc-detail-accent">
                  <span className="mc-detail-accent-dot" />
                  {t(`admin.content.${detailItem.kind}Tab`)}
                </div>
                <button
                  type="button"
                  className="mc-modal-close"
                  onClick={closeDetail}
                  aria-label={t("common.cancel")}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mc-detail-scroll">{renderDetailContent()}</div>
              <div className="mc-detail-footer">
                <button
                  type="button"
                  className="mc-modal-btn danger"
                  onClick={() => {
                    const { kind, item } = detailItem;
                    closeDetail();
                    openDelete(kind, item);
                  }}
                >
                  <Trash2 size={16} />
                  {t(`admin.content.delete${DELETE_SUFFIX[detailItem.kind]}`)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageContent;
