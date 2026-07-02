import React, { memo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Heart, Sparkles, Brain, Apple, ArrowUpRight, Leaf, ShieldCheck, Users, Camera, TrendingUp, MessageCircle, Calendar, Activity, Zap } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import PageTransition from '../components/PageTransition';
import './AboutUsPage.css';

// --- ORGANIC FLOATERS ---
const AboutUsOrganicFloaters = memo(() => (
  <div className="AboutUsPage-Organic-Container">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="AboutUsPage-Floater"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.12, 0], 
          x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
          y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
        }}
        transition={{ duration: 22 + i * 4, repeat: Infinity, ease: "linear" }}
      >
        <Leaf size={30 + i * 15} strokeWidth={1} />
      </motion.div>
    ))}
  </div>
));

function AboutUsPage() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Camera className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.0.title'),
      description: t('about.features.0.desc')
    },
    {
      icon: <Apple className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.1.title'),
      description: t('about.features.1.desc')
    },
    {
      icon: <Activity className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.2.title'),
      description: t('about.features.2.desc')
    },
    {
      icon: <MessageCircle className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.3.title'),
      description: t('about.features.3.desc')
    },
    {
      icon: <Calendar className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.4.title'),
      description: t('about.features.4.desc')
    },
    {
      icon: <Users className="AboutUsPage-Icon" size={32} />,
      title: t('about.features.5.title'),
      description: t('about.features.5.desc')
    }
  ];

  return (
    <PageTransition>
      <div className="AboutUsPage-Wrapper">
        <AboutUsOrganicFloaters />
        <div className="AboutUsPage-Grid-Overlay" />

        {/* Hero Section */}
        <section className="AboutUsPage-Hero">
          <div className="AboutUsPage-Hero-Inner">
            <ScrollReveal direction="down">
              <div className="AboutUsPage-Badge">{t('about.badge')}</div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="AboutUsPage-Title"><Trans i18nKey="about.heroTitle" components={{1: <span className="AboutUsPage-Highlight" />}} /></h1>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="AboutUsPage-Subtitle">{t('about.heroSubtitle')}</p>
            </ScrollReveal>
          </div>
        </section>

        <div className="AboutUsPage-Main">
          {/* Mission Section */}
          <section className="AboutUsPage-Section">
            <div className="AboutUsPage-Grid">
              <ScrollReveal direction="left" className="AboutUsPage-Text-Block">
                <h2 className="AboutUsPage-Heading">{t('about.missionTitle')}</h2>
                <p className="AboutUsPage-Description">
                  {t('about.missionText')}
                </p>
                <div className="AboutUsPage-Stats">
                  <div className="AboutUsPage-Stat">
                    <span className="AboutUsPage-Stat-Num">{t('about.statNeural')}</span>
                    <span className="AboutUsPage-Stat-Label">{t('about.statProcessing')}</span>
                  </div>
                  <div className="AboutUsPage-Stat">
                    <span className="AboutUsPage-Stat-Num">{t('about.statPersonalized')}</span>
                    <span className="AboutUsPage-Stat-Label">{t('about.statPersonalizedLabel')}</span>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" className="AboutUsPage-Visual-Block">
                <TiltCard className="AboutUsPage-Tilt">
                  <div className="AboutUsPage-Glass-Card">
                    <Heart className="AboutUsPage-Heart" size={48} />
                    <h3>{t('about.compassionateTitle')}</h3>
                    <p>{t('about.compassionateDesc')}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>
          </section>

          {/* Features Grid */}
          <section className="AboutUsPage-Section">
            <ScrollReveal>
              <h2 className="AboutUsPage-Heading center">{t('about.featuresTitle')}</h2>
              <p className="AboutUsPage-Features-Subtitle">{t('about.featuresSubtitle')}</p>
              <div className="AboutUsPage-Heading-Accent" />
            </ScrollReveal>
            <div className="AboutUsPage-Features-Grid">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="AboutUsPage-Feature-Card">
                    <div className="AboutUsPage-Feature-Icon-Wrapper">
                      {feature.icon}
                      <div className="AboutUsPage-Icon-Glow" />
                    </div>
                    <h3>{feature.title.toUpperCase()}</h3>
                    <p>{feature.description}</p>
                    <div className="AboutUsPage-Card-Accent" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Approach Section */}
          <section className="AboutUsPage-Section AboutUsPage-Approach">
            <ScrollReveal>
              <div className="AboutUsPage-Dark-Card">
                <h2 className="AboutUsPage-Heading white">{t('about.approachTitle')}</h2>
                <p className="AboutUsPage-Description white opacity">
                  {t('about.approachDesc')}
                </p>
                <NavLink to="/signup" className="AboutUsPage-CTA-Btn">
                  {t('about.cta')} <ArrowUpRight size={18} style={{ marginLeft: '8px' }} />
                </NavLink>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

export default AboutUsPage;
