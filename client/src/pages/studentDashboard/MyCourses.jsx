import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
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
  Lock,
} from "lucide-react";
import { getAllCourses, checkCourseAccess } from "../../api/courseApi";
import "./MyCourses.css";

const LEVEL_NAMES = {
  1: "Foundation",
  2: "Intermediate",
  3: "Advanced",
};

const LEVEL_ICONS = {
  1: "\u2605",
  2: "\u2605\u2605",
  3: "\u2605\u2605\u2605",
};

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accessRes, coursesRes] = await Promise.all([
        checkCourseAccess(),
        getAllCourses(),
      ]);
      if (accessRes.success) setHasAccess(accessRes.hasAccess);
      if (coursesRes.success) setCourses(coursesRes.courses);
    } catch {
      console.error("Failed to load data");
    } finally {
      setAccessChecked(true);
      setLoading(false);
    }
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
    { value: "all", label: "All Semesters" },
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
  ];

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="mc-loader-wrapper">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mc-loader-icon"
        >
          <BookOpen size={52} />
        </motion.div>
        <div className="mc-loader-skeleton-group">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mc-skeleton-row">
              <div className="mc-skeleton-block" style={{ width: `${60 + i * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (accessChecked && !hasAccess) {
    return (
      <div className="mc-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mc-access-blocked"
        >
          <div className="mc-blocked-icon">
            <Lock size={48} />
          </div>
          <h2>Subscription Required</h2>
          <p>
            You need an active yearly subscription to access course materials.
          </p>
          <p className="mc-blocked-price">
            Subscribe for just <strong>2,499.99 DZD/year</strong> and unlock all
            courses across all levels and semesters.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mc-subscribe-btn"
            onClick={() => navigate("/student/course-subscription")}
          >
            Subscribe Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div className="mc-header-left">
          <div className="mc-header-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <h1>My Courses</h1>
            <p>Browse your course materials by level and semester</p>
          </div>
        </div>
      </div>

      {hasCourses && (
        <>
          <div className="mc-stats-row">
            <div className="mc-stat-card">
              <div className="mc-stat-icon courses">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="mc-stat-value">{totalCourses}</span>
                <span className="mc-stat-label">Total Courses</span>
              </div>
            </div>
          </div>

          <div className="mc-toolbar">
            <div className="mc-search-wrapper">
              <Search size={16} className="mc-search-icon" />
              <input
                type="text"
                placeholder="Search by title or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mc-search-input"
              />
            </div>
            <div className="mc-filter-group">
              <Filter size={16} className="mc-filter-icon" />
              {semesterOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`mc-filter-chip ${semesterFilter === opt.value ? "active" : ""}`}
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
          className="mc-empty"
        >
          <div className="mc-empty-icon">
            <BookOpen size={48} />
          </div>
          <h3>No courses available</h3>
          <p>Courses will appear here once they are added</p>
        </motion.div>
      ) : filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mc-empty"
        >
          <div className="mc-empty-icon">
            <Search size={48} />
          </div>
          <h3>No matches found</h3>
          <p>Try adjusting your search or filter</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mc-levels"
        >
          {[1, 2, 3].map((level) => {
            const levelCourses = groupedByLevel[level];
            if (!levelCourses || levelCourses.length === 0) return null;

            const isCollapsed = collapsedLevels.has(level);

            return (
              <div key={level} className="mc-level-section">
                <button
                  className={`mc-level-header level-${level}`}
                  onClick={() => toggleLevel(level)}
                >
                  <div className="mc-level-header-left">
                    <div className={`mc-level-badge level-${level}`}>
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h2 className="mc-level-name">
                        Level {level} &mdash; {LEVEL_NAMES[level]}
                      </h2>
                      <span className="mc-level-subtitle">
                        {LEVEL_ICONS[level]} &middot; {levelCourses.length} course
                        {levelCourses.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="mc-level-header-right">
                    <span className="mc-level-count">{levelCourses.length}</span>
                    <motion.div
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mc-chevron"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      key="grid"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="mc-grid-wrapper"
                    >
                      <div className="mc-grid">
                        {levelCourses.map((course, idx) => (
                          <motion.div
                            key={course._id}
                            variants={cardVariants}
                            layout
                            className="mc-course-card"
                          >
                      <div className="mc-card-top">
                        <span
                          className={`mc-semester-badge semester-${course.semester}`}
                        >
                          Sem {course.semester}
                        </span>
                        <div className="mc-card-type-icon">
                          {course.pdfUrl ? (
                            <FileText size={14} />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                        </div>
                      </div>

                      <div className="mc-card-body">
                        <div className={`mc-card-icon level-${level}`}>
                          <BookOpen size={22} />
                        </div>
                        <h3 title={course.title}>{course.title}</h3>
                        <div className="mc-card-meta">
                          <span className="mc-card-creator">
                            <Users size={12} />
                            {course.creatorInfo?.fullName || "Unknown"}
                          </span>
                          {course.createdAt && (
                            <span className="mc-card-date">
                              <Clock size={12} />
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mc-card-actions">
                        {course.url && (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mc-action-btn drive"
                            title="Open Drive link"
                          >
                            <ExternalLink size={15} />
                            <span>Drive</span>
                          </a>
                        )}
                        {course.pdfUrl && (
                          <a
                            href={course.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mc-action-btn pdf"
                            title="View PDF"
                          >
                            <FileText size={15} />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default MyCourses;
