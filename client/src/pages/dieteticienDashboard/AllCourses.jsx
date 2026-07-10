import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  GraduationCap,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Users,
  Clock,
  ChevronDown,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllCourses, deleteCourse } from "../../api/courseApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./AllCourses.css";

const LEVEL_NAMES = {
  1: "Foundation",
  2: "Intermediate",
  3: "Advanced",
};

const LEVEL_ICONS = {
  1: "★",
  2: "★★",
  3: "★★★",
};

const AllCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [collapsedLevels, setCollapsedLevels] = useState(() => new Set());

  const toggleLevel = (level) => {
    setCollapsedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const dashboardPrefix = user?.role === "admin" ? "/admin" : "/dieteticien";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      if (response.success) {
        setCourses(response.courses);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    try {
      const response = await deleteCourse(courseId);
      if (response.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        toast.success("Course deleted successfully");
      }
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    handleDelete(deleteTarget);
    setDeleteTarget(null);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.creatorInfo?.fullName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesSemester =
        semesterFilter === "all" ||
        course.semester === Number(semesterFilter);
      return matchesSearch && matchesSemester;
    });
  }, [courses, searchQuery, semesterFilter]);

  const groupedByLevel = useMemo(() => {
    const groups = { 1: [], 2: [], 3: [] };
    filteredCourses.forEach((course) => {
      if (groups[course.level]) {
        groups[course.level].push(course);
      }
    });
    return groups;
  }, [filteredCourses]);

  const totalCourses = courses.length;
  const hasCourses = totalCourses > 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const semesterOptions = [
    { value: "all", label: t("dashboard.dieteticien.allCourses.allSemesters") },
    { value: "1", label: t("dashboard.dieteticien.allCourses.semester1") },
    { value: "2", label: t("dashboard.dieteticien.allCourses.semester2") },
  ];

  if (loading) {
    return (
      <div className="ac-loader-wrapper">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="ac-loader-icon"
        >
          <BookOpen size={52} />
        </motion.div>
        <div className="ac-loader-skeleton-group">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ac-skeleton-row">
              <div className="ac-skeleton-block" style={{ width: `${60 + i * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ac-container">
      <div className="ac-header">
        <div className="ac-header-left">
          <div className="ac-header-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <h1>Courses Library</h1>
            <p>Manage all nutrition course materials</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="ac-add-btn"
          onClick={() => navigate(`${dashboardPrefix}/create-course`)}
        >
          <Plus size={18} />
          <span>New Course</span>
        </motion.button>
      </div>

      {hasCourses && (
        <>
          <div className="ac-stats-row">
            <div className="ac-stat-card">
              <div className="ac-stat-icon courses">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="ac-stat-value">{totalCourses}</span>
                <span className="ac-stat-label">Total Courses</span>
              </div>
            </div>
          </div>

          <div className="ac-toolbar">
            <div className="ac-search-wrapper">
              <Search size={16} className="ac-search-icon" />
              <input
                type="text"
                placeholder="Search by title or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ac-search-input"
              />
            </div>
            <div className="ac-filter-group">
              <Filter size={16} className="ac-filter-icon" />
              {semesterOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`ac-filter-chip ${semesterFilter === opt.value ? "active" : ""}`}
                  onClick={() => setSemesterFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!hasCourses ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ac-empty"
        >
          <div className="ac-empty-icon">
            <BookOpen size={48} />
          </div>
          <h3>No courses yet</h3>
          <p>Get started by creating your first nutrition course</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ac-add-btn"
            onClick={() => navigate(`${dashboardPrefix}/create-course`)}
          >
            <Plus size={18} /> Create Course
          </motion.button>
        </motion.div>
      ) : filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ac-empty"
        >
          <div className="ac-empty-icon">
            <Search size={48} />
          </div>
                          <h3>{t("common.noResults")}</h3>
                          <p>Try adjusting your search or filter</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="ac-levels"
        >
          {[1, 2, 3].map((level) => {
            const levelCourses = groupedByLevel[level];
            if (!levelCourses || levelCourses.length === 0) return null;

            const isCollapsed = collapsedLevels.has(level);

            return (
              <div key={level} className="ac-level-section">
                <button
                  className={`ac-level-header level-${level}`}
                  onClick={() => toggleLevel(level)}
                >
                  <div className="ac-level-header-left">
                    <div className={`ac-level-badge level-${level}`}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h2 className="ac-level-name">
                        Level {level} &mdash; {LEVEL_NAMES[level]}
                      </h2>
                      <span className="ac-level-subtitle">
                        {LEVEL_ICONS[level]} &middot; {levelCourses.length} course
                        {levelCourses.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="ac-level-header-right">
                    <span className="ac-level-count">{levelCourses.length}</span>
                    <motion.div
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ac-chevron"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </button>

                <motion.div
                  animate={{ height: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
                  initial={false}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="ac-grid-wrapper"
                  style={{ overflow: "hidden" }}
                >
                  <div className="ac-grid">
                    {levelCourses.map((course) => (
                      <motion.div
                        key={course._id}
                        variants={cardVariants}
                        layout
                        className="ac-course-card"
                      >
                  <div className="ac-card-top">
                    <span
                      className={`ac-semester-badge semester-${course.semester}`}
                    >
                      Sem {course.semester}
                    </span>
                    <div className="ac-card-type-icon">
                      {course.pdfs?.length > 0 ? (
                        <FileText size={14} />
                      ) : course.url ? (
                        <ExternalLink size={14} />
                      ) : null}
                    </div>
                  </div>

                  <div className="ac-card-body">
                    <div className={`ac-card-icon level-${level}`}>
                      <BookOpen size={22} />
                    </div>
                    <h3 title={course.title}>{course.title}</h3>
                    <div className="ac-card-meta">
                      <span className="ac-card-creator">
                        <Users size={12} />
                        {course.creatorInfo?.fullName || t("common.unknown")}
                      </span>
                      {course.createdAt && (
                        <span className="ac-card-date">
                          <Clock size={12} />
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ac-card-actions">
                    {course.url && (
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ac-action-btn drive"
                        title="Open Drive link"
                      >
                        <ExternalLink size={15} />
                        <span>Drive</span>
                      </a>
                    )}
                    {course.pdfs?.map((pdf, i) => (
                      <a
                        key={pdf.fileId || i}
                        href={pdf.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ac-action-btn pdf"
                        title={pdf.fileName || `PDF ${i + 1}`}
                      >
                        <FileText size={15} />
                        <span>PDF {course.pdfs.length > 1 ? i + 1 : ''}</span>
                      </a>
                    ))}
                    {user &&
                      (course.createdBy === user._id ||
                        user.role === "admin") && (
                        <button
                          className="ac-action-btn delete"
                          onClick={() => setDeleteTarget(course._id)}
                          title="Delete course"
                        >
                          <Trash2 size={15} />
                          <span>{t("common.delete")}</span>
                        </button>
                      )}
                  </div>
                </motion.div>
              ))}
            </div>
                </motion.div>
            </div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ac-modal-overlay"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="ac-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="ac-modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>

              <div className="ac-modal-icon-wrap">
                <div className="ac-modal-icon">
                  <AlertTriangle size={28} />
                </div>
              </div>

                  <h3 className="ac-modal-title">{t("common.delete")} Course</h3>
                  <p className="ac-modal-message">
                    Are you sure you want to delete this course? This action cannot be undone.
              </p>

              <div className="ac-modal-actions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="ac-modal-btn cancel"
                  onClick={() => setDeleteTarget(null)}
                >
                  {t("common.cancel")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="ac-modal-btn confirm"
                  onClick={confirmDelete}
                >
                  <Trash2 size={16} />
                  {t("common.delete")} Course
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllCourses;
