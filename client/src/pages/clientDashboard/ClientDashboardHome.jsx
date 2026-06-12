import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ClipboardList, ArrowRight, Activity, Sparkles } from "lucide-react";
import ScrollReveal from "../../components/ScrollReveal";
import "./ClientPlans.css";

const ClientDashboardHome = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="aff-dashboard"
    >
      <ScrollReveal>
        <div className="aff-hero">
          <div className="aff-hero-badge">
            <Sparkles size={16} />
            <span>CLIENT DASHBOARD</span>
          </div>
          <h1 className="aff-hero-title">
            Your <span className="aff-accent">Nutrition Hub</span>
          </h1>
          <p className="aff-hero-sub">
            Manage your plans, book consultations, and track your progress.
          </p>
        </div>
      </ScrollReveal>

      <div className="aff-cards-grid">
        <ScrollReveal direction="left">
          <motion.div
            className="aff-card aff-card-primary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/my-plans")}
          >
            <div className="aff-card-icon">
              <ShoppingBag size={32} />
            </div>
            <h3>My Plans</h3>
            <p>View purchased nutrition plans and book consultation sessions.</p>
            <span className="aff-card-link">
              Go to Plans <ArrowRight size={16} />
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <motion.div
            className="aff-card aff-card-secondary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/allPlans")}
          >
            <div className="aff-card-icon">
              <ClipboardList size={32} />
            </div>
            <h3>Browse Plans</h3>
            <p>Explore all available nutrition plans from our experts.</p>
            <span className="aff-card-link">
              Browse All <ArrowRight size={16} />
            </span>
          </motion.div>
        </ScrollReveal>

      </div>

      <ScrollReveal>
        <div className="aff-insight">
          <Activity size={20} />
          <p>You can manage all your nutrition plans and consultation bookings from the <strong>My Plans</strong> section.</p>
        </div>
      </ScrollReveal>
    </motion.div>
  );
};

export default ClientDashboardHome;
