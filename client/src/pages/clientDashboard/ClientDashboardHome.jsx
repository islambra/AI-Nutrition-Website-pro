import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ClipboardList, Activity, Sparkles, Users, Heart, Utensils, Target } from "lucide-react";
import ScrollReveal from "../../components/ScrollReveal";
import { useTranslation } from 'react-i18next';
import "./ClientPlans.css";

const ClientDashboardHome = () => {
  const { t } = useTranslation();
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
            <span>{t('dashboard.client.badge')}</span>
          </div>
          <h1 className="aff-hero-title">
            {t('dashboard.client.title')}
          </h1>
          <p className="aff-hero-sub">
            {t('dashboard.client.subtitle')}
          </p>
        </div>
      </ScrollReveal>

      <div className="aff-cards-grid">
        <ScrollReveal direction="left">
          <motion.div
            className="aff-card aff-card-primary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/dieteticiens")}
          >
            <div className="aff-card-icon">
              <Users size={32} />
            </div>
            <h3>{t('dashboard.client.findDieteticiens')}</h3>
            <p>{t('dashboard.client.findDieteticiensDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.browseAll')}
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <motion.div
            className="aff-card aff-card-secondary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/my-subscriptions")}
          >
            <div className="aff-card-icon">
              <Heart size={32} />
            </div>
            <h3>{t('dashboard.client.mySubscriptions')}</h3>
            <p>{t('dashboard.client.mySubscriptionsDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.goToSubscriptions')}
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="left">
          <motion.div
            className="aff-card aff-card-primary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/my-plans")}
          >
            <div className="aff-card-icon">
              <ShoppingBag size={32} />
            </div>
            <h3>{t('dashboard.client.myPlans')}</h3>
            <p>{t('dashboard.client.myPlansDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.goToPlans')}
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
            <h3>{t('dashboard.client.browsePlans')}</h3>
            <p>{t('dashboard.client.browsePlansDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.browseAll')}
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="left">
          <motion.div
            className="aff-card aff-card-secondary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/food-diary")}
          >
            <div className="aff-card-icon">
              <Utensils size={32} />
            </div>
            <h3>{t('dashboard.client.foodDiary')}</h3>
            <p>{t('dashboard.client.foodDiaryDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.goToSubscriptions')}
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <motion.div
            className="aff-card aff-card-primary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/goals")}
          >
            <div className="aff-card-icon">
              <Target size={32} />
            </div>
            <h3>{t('dashboard.client.goals')}</h3>
            <p>{t('dashboard.client.goalsDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.goToSubscriptions')}
            </span>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal direction="left">
          <motion.div
            className="aff-card aff-card-secondary"
            whileHover={{ translateY: -6 }}
            onClick={() => navigate("/client/progress")}
          >
            <div className="aff-card-icon">
              <Activity size={32} />
            </div>
            <h3>{t('dashboard.client.progressTracking')}</h3>
            <p>{t('dashboard.client.progressDesc')}</p>
            <span className="aff-card-link">
              {t('dashboard.client.goToSubscriptions')}
            </span>
          </motion.div>
        </ScrollReveal>

      </div>

      <ScrollReveal>
        <div className="aff-insight">
          <Activity size={20} />
          <p>{t('dashboard.client.insight')}</p>
        </div>
      </ScrollReveal>
    </motion.div>
  );
};

export default ClientDashboardHome;
