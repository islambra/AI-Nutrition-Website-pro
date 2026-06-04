import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllCourses, deleteCourse } from "../../api/courseApi";
import toast from "react-hot-toast";
import "./AllCourses.css";

const LEVEL_NAMES = {
  1: "Level 1 - Foundation",
  2: "Level 2 - Intermediate",
  3: "Level 3 - Advanced",
};

const AllCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await deleteCourse(courseId);
      if (response.success) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId));
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const groupedByLevel = { 1: [], 2: [], 3: [] };
  courses.forEach((course) => {
    if (groupedByLevel[course.level]) {
      groupedByLevel[course.level].push(course);
    }
  });

  if (loading) {
    return (
      <div className="ac-loader-wrapper">
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
    <div className="ac-container">
      <div className="ac-header">
        <div>
          <h1>
            <BookOpen size={24} /> All Courses
          </h1>
          <p>Manage your nutrition course materials</p>
        </div>
        <button
          className="ac-add-btn"
          onClick={() => navigate("/dieteticien/create-course")}
        >
          <Plus size={18} /> New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="ac-empty">
          <AlertCircle size={48} />
          <h3>No courses yet</h3>
          <p>Create your first course to get started</p>
          <button
            className="ac-add-btn"
            onClick={() => navigate("/dieteticien/create-course")}
          >
            <Plus size={18} /> Create Course
          </button>
        </div>
      ) : (
        <div className="ac-levels">
          {[1, 2, 3].map((level) => {
            const levelCourses = groupedByLevel[level] || [];
            if (levelCourses.length === 0) return null;

            return (
              <div key={level} className="ac-level-section">
                <h2 className="ac-level-title">
                  <GraduationCap size={20} />
                  {LEVEL_NAMES[level]}
                  <span className="ac-count">{levelCourses.length} courses</span>
                </h2>
                <div className="ac-grid">
                  {levelCourses.map((course) => (
                    <motion.div
                      key={course._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="ac-course-card"
                    >
                      <div className="ac-course-top">
                        <span className="ac-semester-badge">
                          Semester {course.semester}
                        </span>
                      </div>
                      <div className="ac-course-body">
                        <div className="ac-course-icon">
                          <BookOpen size={24} />
                        </div>
                        <h3>{course.title}</h3>
                        <p className="ac-course-creator">
                          by {course.creatorInfo?.fullName || "Unknown"}
                        </p>
                        {course.createdAt && (
                          <span className="ac-course-date">
                            Added {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="ac-course-actions">
                        {course.url && (
                          <a
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ac-action-btn pdf"
                            title="Open Drive link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {course.pdfUrl && (
                          <a
                            href={course.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ac-action-btn pdf"
                            title="View PDF"
                          >
                            <FileText size={16} />
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {user &&
                          (course.createdBy === user._id ||
                            user.role === "admin") && (
                            <button
                              className="ac-action-btn delete"
                              onClick={() => handleDelete(course._id)}
                              title="Delete course"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllCourses;
