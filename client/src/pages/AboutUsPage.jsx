import React, { memo } from 'react';
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
  const features = [
    {
      icon: <Camera className="AboutUsPage-Icon" size={32} />,
      title: "AI Meal Recognition",
      description: "Snap a photo and our AI instantly identifies ingredients, portions, and nutritional breakdown with high precision."
    },
    {
      icon: <Apple className="AboutUsPage-Icon" size={32} />,
      title: "Personalized Diet Plans",
      description: "Tailored nutrition strategies built around your health profile, dietary preferences, and fitness goals."
    },
    {
      icon: <Activity className="AboutUsPage-Icon" size={32} />,
      title: "Macro & Micro Tracking",
      description: "Real-time dashboards tracking calories, macros, vitamins, and minerals to keep you on target."
    },
    {
      icon: <MessageCircle className="AboutUsPage-Icon" size={32} />,
      title: "Expert Chat Support",
      description: "Direct messaging with certified nutritionists for real-time advice, meal adjustments, and accountability."
    },
    {
      icon: <Calendar className="AboutUsPage-Icon" size={32} />,
      title: "Smart Meal Planning",
      description: "AI-generated weekly meal preps that adapt to your schedule, budget, and nutritional requirements."
    },
    {
      icon: <Users className="AboutUsPage-Icon" size={32} />,
      title: "Community Challenges",
      description: "Join group challenges, share progress, and stay motivated with a like-minded wellness community."
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
              <div className="AboutUsPage-Badge">SYSTEM INTEL</div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="AboutUsPage-Title">REVOLUTIONIZING NUTRITION WITH <span className="AboutUsPage-Highlight">AI PRECISION</span></h1>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="AboutUsPage-Subtitle">
                High-fidelity biological mapping and AI-assisted calorie tracking for the next generation of human performance.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <div className="AboutUsPage-Main">
          {/* Mission Section */}
          <section className="AboutUsPage-Section">
            <div className="AboutUsPage-Grid">
              <ScrollReveal direction="left" className="AboutUsPage-Text-Block">
                <h2 className="AboutUsPage-Heading">OUR MISSION</h2>
                <p className="AboutUsPage-Description">
                  To empower individuals to achieve their health and wellness goals by providing accessible, personalized nutrition solutions. We believe in a holistic approach that combines the precision of artificial intelligence with the empathy and expertise of professional nutritionists.
                </p>
                <div className="AboutUsPage-Stats">
                  <div className="AboutUsPage-Stat">
                    <span className="AboutUsPage-Stat-Num">NEURAL</span>
                    <span className="AboutUsPage-Stat-Label">Processing</span>
                  </div>
                  <div className="AboutUsPage-Stat">
                    <span className="AboutUsPage-Stat-Num">100%</span>
                    <span className="AboutUsPage-Stat-Label">Personalized</span>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" className="AboutUsPage-Visual-Block">
                <TiltCard className="AboutUsPage-Tilt">
                  <div className="AboutUsPage-Glass-Card">
                    <Heart className="AboutUsPage-Heart" size={48} />
                    <h3>COMPASSIONATE AI</h3>
                    <p>We combine deep technology with human intuition to ensure optimal health outcomes.</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>
          </section>

          {/* Features Grid */}
          <section className="AboutUsPage-Section">
            <ScrollReveal>
              <h2 className="AboutUsPage-Heading center">SYSTEM OFFERINGS</h2>
              <p className="AboutUsPage-Features-Subtitle">Next-generation tools engineered to transform how you interact with nutrition and wellness.</p>
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
                <h2 className="AboutUsPage-Heading white">THE APPROACH</h2>
                <p className="AboutUsPage-Description white opacity">
                  Leveraging advanced computer vision and deep learning to provide accurate calorie estimations, while emphasizing that technology complements expert human guidance. Our platform is designed to support individuals managing complex biological states.
                </p>
                <NavLink to="/signup" className="AboutUsPage-CTA-Btn">
                  JOIN NETWORK <ArrowUpRight size={18} style={{ marginLeft: '8px' }} />
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
