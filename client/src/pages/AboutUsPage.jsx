import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Users, ShieldCheck, Heart, Sparkles, Brain, Apple } from 'lucide-react';
import TiltCard from '../components/TiltCard';
import ScrollReveal from '../components/ScrollReveal';
import PageTransition from '../components/PageTransition';
import './AboutUsPage.css';

function AboutUsPage() {
  const features = [
    {
      icon: <Apple className="about-v2-icon" size={32} />,
      title: "Dietary Consultations",
      description: "Receive customized diet plans tailored to your unique health history and specific goals."
    },
    {
      icon: <Brain className="about-v2-icon" size={32} />,
      title: "AI Calorie Tracking",
      description: "Utilize cutting-edge AI-based food recognition system to estimate calorie content."
    },
    {
      icon: <Sparkles className="about-v2-icon" size={32} />,
      title: "Engaging Content",
      description: "Access insightful blogs, latest news, healthy recipes, and lifestyle tips."
    },
    {
      icon: <Target className="about-v2-icon" size={32} />,
      title: "Structured Plans",
      description: "Explore various dietary plans designed to fit your unique needs."
    }
  ];

  return (
    <PageTransition>
      <div className="about-v2-wrapper">
        {/* Modern Hero Section */}
        <section className="about-v2-hero">
          <div className="about-v2-hero-inner">
            <ScrollReveal direction="down">
              <div className="about-v2-badge">About Us</div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="about-v2-title">Revolutionizing Nutrition with <span className="about-v2-highlight">AI Technology</span></h1>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <p className="about-v2-subtitle">
                Your dedicated platform for Personalized Dietary Assessment and AI-Assisted Calorie Tracking.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <div className="about-v2-main">
          {/* Mission Section */}
          <section className="about-v2-section">
            <div className="about-v2-grid">
              <ScrollReveal direction="left" className="about-v2-text-block">
                <h2 className="about-v2-heading">Our Mission</h2>
                <p className="about-v2-description">
                  Our mission is to empower individuals to achieve their health and wellness goals by providing accessible, personalized nutrition solutions. We believe in a holistic approach that combines the precision of artificial intelligence with the empathy and expertise of professional nutritionists.
                </p>
                <div className="about-v2-stats">
                  <div className="about-v2-stat">
                    <span className="about-v2-stat-num">AI</span>
                    <span className="about-v2-stat-label">Powered</span>
                  </div>
                  <div className="about-v2-stat">
                    <span className="about-v2-stat-num">100%</span>
                    <span className="about-v2-stat-label">Personalized</span>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" className="about-v2-visual-block">
                <TiltCard className="about-v2-tilt">
                  <div className="about-v2-glass-card">
                    <Heart className="about-v2-heart" size={48} />
                    <h3>Compassionate Care</h3>
                    <p>We combine technology with human touch to ensure the best health outcomes.</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            </div>
          </section>

          {/* Features Grid */}
          <section className="about-v2-section">
            <ScrollReveal>
              <h2 className="about-v2-heading center">What We Offer</h2>
            </ScrollReveal>
            <div className="about-v2-features-grid">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="about-v2-feature-card">
                    <div className="about-v2-feature-icon-wrapper">
                      {feature.icon}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Approach Section */}
          <section className="about-v2-section about-v2-approach">
            <ScrollReveal>
              <div className="about-v2-dark-card">
                <h2 className="about-v2-heading white">Our Approach</h2>
                <p className="about-v2-description white opacity">
                  We leverage advanced computer vision and deep learning to provide accurate calorie estimations, while always emphasizing that technology complements, rather than replaces, expert human guidance. Our platform is designed to support individuals managing weight, insulin resistance, PCOS, thyroid disorders, and more.
                </p>
                <NavLink to="/signup" className="about-v2-cta-btn">
                  Join Us Today!
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
