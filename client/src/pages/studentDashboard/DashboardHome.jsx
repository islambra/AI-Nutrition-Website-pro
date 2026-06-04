import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Youtube,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./DashboardHome.css";

const activeFeatures = [
  {
    icon: BookOpen,
    title: "My Courses",
    description: "Access your nutrition courses organized by level and semester",
    path: "/student/my-courses",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
  },
];

const comingSoonFeatures = [
  {
    icon: Youtube,
    title: "Online Courses",
    description: "Video lectures and interactive learning sessions coming soon",
    date: "Coming Soon",
  },
  {
    icon: MessageCircle,
    title: "Live Q&A Sessions",
    description: "Real-time interaction with instructors and peers",
    date: "Coming Soon",
  },
  {
    icon: FileText,
    title: "Practice Tests",
    description: "Test your knowledge with quizzes and assignments",
    date: "Coming Soon",
  },
  {
    icon: GraduationCap,
    title: "Certification",
    description: "Earn certificates upon course completion",
    date: "Coming Soon",
  },
];

const DashboardHome = () => {
  const navigate = useNavigate();

  return (
    <div className="sdh-container">
      <div className="sdh-welcome">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sdh-welcome-content"
        >
          <div className="sdh-badge">
            <Sparkles size={16} />
            <span>Student Dashboard</span>
          </div>
          <h1 className="sdh-title">
            Welcome to Your <span className="sdh-gradient">Learning</span> Hub
          </h1>
          <p className="sdh-subtitle">
            Access your courses, track your progress, and enhance your nutrition education
          </p>
        </motion.div>
      </div>

      <section className="sdh-section">
        <h2 className="sdh-section-title">
          <BookOpen size={22} />
          Active Services
        </h2>
        <div className="sdh-grid">
          {activeFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="sdh-card active"
              onClick={() => navigate(feature.path)}
              style={{ "--card-accent": feature.color }}
            >
              <div
                className="sdh-card-icon"
                style={{ background: feature.gradient, color: feature.color }}
              >
                <feature.icon size={28} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="sdh-card-action">
                Get Started <ArrowRight size={16} />
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="sdh-section">
        <h2 className="sdh-section-title">
          <Clock size={22} />
          Coming Soon
        </h2>
        <div className="sdh-grid">
          {comingSoonFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="sdh-card coming-soon"
            >
              <div className="sdh-card-icon coming-soon-icon">
                <feature.icon size={28} />
              </div>
              <div className="sdh-coming-badge">{feature.date}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
