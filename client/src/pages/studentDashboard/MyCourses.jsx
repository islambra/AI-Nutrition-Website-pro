import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Loader2,
  GraduationCap,
  BookMarked,
} from "lucide-react";
import { getAllCourses } from "../../api/courseApi";
import "./MyCourses.css";

const LEVELS = [
  { id: 1, title: "Level 1", subtitle: "Foundation Courses" },
  { id: 2, title: "Level 2", subtitle: "Intermediate Courses" },
  { id: 3, title: "Level 3", subtitle: "Advanced Courses" },
];

const SEMESTERS = [1, 2];

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);

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
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesForLevelSemester = (level, semester) => {
    return courses.filter((c) => c.level === level && c.semester === semester);
  };

  const toggleLevel = (levelId) => {
    setExpandedLevel(expandedLevel === levelId ? null : levelId);
  };

  if (loading) {
    return (
      <div className="mc-loader-wrapper">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <BookOpen size={60} color="#2D5A27" />
        </motion.div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="mc-container">
      <div className="mc-header">
        <div className="mc-badge">
          <GraduationCap size={20} />
          <span>My Courses</span>
        </div>
        <h1 className="mc-title">
          Nutrition <span className="mc-gradient">Education</span>
        </h1>
        <p className="mc-subtitle">
          Browse your course materials organized by level and semester
        </p>
      </div>

      <div className="mc-levels">
        {LEVELS.map((level) => {
          const isExpanded = expandedLevel === level.id;
          const sem1Courses = getCoursesForLevelSemester(level.id, 1);
          const sem2Courses = getCoursesForLevelSemester(level.id, 2);

          return (
            <motion.div
              key={level.id}
              layout
              className={`mc-level-card ${isExpanded ? "expanded" : ""}`}
            >
              <button
                className="mc-level-header"
                onClick={() => toggleLevel(level.id)}
              >
                <div className="mc-level-info">
                  <div className="mc-level-icon">
                    <BookMarked size={24} />
                  </div>
                  <div>
                    <h2>{level.title}</h2>
                    <span className="mc-level-subtitle">
                      {level.subtitle}
                    </span>
                  </div>
                </div>
                <div className="mc-level-stats">
                  <span className="mc-course-count">
                    {sem1Courses.length + sem2Courses.length} courses
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mc-level-body"
                  >
                    <div className="mc-semesters">
                      {SEMESTERS.map((sem) => {
                        const semCourses =
                          sem === 1 ? sem1Courses : sem2Courses;
                        return (
                          <div key={sem} className="mc-semester">
                            <div className="mc-semester-header">
                              <GraduationCap size={18} />
                              <h3>Semester {sem}</h3>
                              <span className="mc-semester-count">
                                {semCourses.length} courses
                              </span>
                            </div>

                            {semCourses.length === 0 ? (
                              <div className="mc-empty">
                                <BookOpen size={24} />
                                <p>No courses available yet for this semester</p>
                              </div>
                            ) : (
                              <div className="mc-course-list">
                                {semCourses.map((course) => (
                                  <motion.div
                                    key={course._id}
                                    className="mc-course-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                  >
                                    <div className="mc-course-icon">
                                      <FileText size={20} />
                                    </div>
                                    <div className="mc-course-content">
                                      <h4>{course.title}</h4>
                                      {course.createdAt && (
                                        <span className="mc-course-date">
                                          Added{" "}
                                          {new Date(
                                            course.createdAt
                                          ).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                    {course.pdfUrl && (
                                      <a
                                        href={course.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mc-pdf-btn"
                                      >
                                        <FileText size={16} />
                                        <span>View PDF</span>
                                        <ExternalLink size={14} />
                                      </a>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
