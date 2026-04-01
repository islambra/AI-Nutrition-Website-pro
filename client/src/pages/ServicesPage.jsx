import React from 'react';
import './ServicesPage.css';
import { NavLink } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import BioTechBackground from '../components/BioTechBackground';

function ServicesPage() {
  const coreServices = [
    {
      title: "Standard Subscription Plans",
      icon: "📅",
      description: "Accessible, structured plans for sustainable health. These plans provide a solid framework for your dietary journey with AI-assisted tools and professional resources.",
      features: [
        "Monthly Basic (seasonal options)",
        "Standard 3-month Transformation plans",
        "Weekly progress reports and insights",
        "Full recipe library and knowledge hub access"
      ]
    },
    {
      title: "Nutritionist-Led Special Plans",
      icon: "🧑‍⚕️",
      description: "For those with specific health needs like insulin resistance, PCOS, or thyroid disorders. These plans are developed through direct consultation with our certified nutritionists.",
      features: [
        "Personalized assessment of health history",
        "Custom plan created after 1-on-1 interaction",
        "Direct communication with nutritionists",
        "Dynamic adjustments based on progress"
      ]
    },
    {
      title: "Content & Community Resources",
      icon: "🤝",
      description: "Empower yourself with knowledge and community support. Access professional advice, success stories, and specialized health forums.",
      features: [
        "Expert blogs and nutritional news",
        "Success story sharing and user testimonials",
        "Specialized health and wellness forums",
        "Interactive workshops and Q&A sessions"
      ]
    }
  ];

  return (
    <div className="services-page-container">
      <BioTechBackground />
      {/* Hero Section */}
      <section className="services-hero">
        <ScrollReveal>
          <h1>Elevate Your Health with <span className="sv-text-gradient">Intelligent Solutions</span></h1>
          <p className="hero-subtitle">Combining cutting-edge AI technology with professional nutritional expertise to transform your wellness journey.</p>
        </ScrollReveal>
      </section>

      {/* Featured AI Service Section */}
      <section className="featured-ai-service">
        <div className="container">
          <ScrollReveal direction="left">
            <div className="ai-service-content">
              <div className="badge">Next-Gen Technology</div>
              <h2>AI Calorie & Nutrition <span className="text-highlight">Calculator</span></h2>
              <p className="main-description">
                Our core technology revolutionizes how you track your meals. No more manual entry—just snap a photo, and our advanced computer vision handles the rest.
              </p>
              
              <div className="ai-features-grid">
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">🔍</div>
                  <div>
                    <h4>Instant Recognition</h4>
                    <p>Identify thousands of food types and complex recipes instantly.</p>
                  </div>
                </div>
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">⚖️</div>
                  <div>
                    <h4>Portion Estimation</h4>
                    <p>Automated volume and portion size calculation using spatial depth.</p>
                  </div>
                </div>
                <div className="ai-feature-item">
                  <div className="ai-feature-icon">🧪</div>
                  <div>
                    <h4>Macro Breakdown</h4>
                    <p>Detailed analysis of carbs, proteins, fats, and micronutrients.</p>
                  </div>
                </div>
              </div>

              <NavLink to="/signup" className="btn sv-btn-primary try-ai-btn">Try the AI Tool Free</NavLink>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="ai-service-visual">
            <div className="mockup-container">
              <div className="phone-mockup">
                <div className="screen-content">
                  <div className="scan-animation"></div>
                  <div className="food-overlay">
                    <span className="label">🥗 Greek Salad</span>
                    <span className="calories">~340 kcal</span>
                  </div>
                  <div className="macros-preview">
                    <div className="macro"><span>P:</span> 12g</div>
                    <div className="macro"><span>C:</span> 15g</div>
                    <div className="macro"><span>F:</span> 24g</div>
                  </div>
                </div>
              </div>
              <div className="floating-stat stat-1">98% Accuracy</div>
              <div className="floating-stat stat-2">1,000+ Foods</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* AI Process Steps */}
      <section className="ai-process">
        <div className="container">
          <ScrollReveal>
            <h3 className="section-label">How it Works</h3>
            <h2>Three Steps to <span className="sv-text-gradient">Perfect Tracking</span></h2>
          </ScrollReveal>
          
          <div className="process-grid">
            <ScrollReveal delay={0.1} className="process-step">
              <div className="step-number">01</div>
              <h4>Capture</h4>
              <p>Snap a photo of your meal through the app from any angle.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="process-step">
              <div className="step-number">02</div>
              <h4>Analyze</h4>
              <p>Our neural networks identify ingredients and portion sizes.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.3} className="process-step">
              <div className="step-number">03</div>
              <h4>Log</h4>
              <p>Calories and macros are automatically added to your daily diary.</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="core-services-section">
        <div className="container">
          <ScrollReveal>
            <h2 className="center-text">Tailored Nutrition <span className="text-highlight">Plans</span></h2>
            <p className="center-text section-subtitle">Whether you're looking for structure or specialized medical support, we have a plan for you.</p>
          </ScrollReveal>
          
          <div className="services-grid">
            {coreServices.map((service, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <TiltCard className="service-tilt-wrapper">
                  <div className="service-detail-card">
                    <div className="service-icon-large">{service.icon}</div>
                    <h3>{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                    <ul className="service-features-list">
                      {service.features.map((feature, fIndex) => (
                        <li key={fIndex}>
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA Section */}
      <section className="consultation-section">
        <div className="container">
          <ScrollReveal>
            <div className="consultation-card-wrapper">
              <div className="consultation-info">
                <div className="badge secondary">Specialist Support</div>
                <h2>Professional 1-on-1 Consultations</h2>
                <p>Schedule a personalized session with our certified nutritionists for in-depth health assessment and custom goal setting.</p>
                <div className="consultation-features-grid">
                  <div className="c-feature">
                    <span className="c-icon">📅</span>
                    <span>Flexible Booking</span>
                  </div>
                  <div className="c-feature">
                    <span className="c-icon">💻</span>
                    <span>HD Video Calls (Zoom/Meet)</span>
                  </div>
                  <div className="c-feature">
                    <span className="c-icon">📝</span>
                    <span>Written Summary Report</span>
                  </div>
                </div>
                <NavLink to="/contact" className="btn sv-btn-secondary consultation-btn">Book Your Consultation</NavLink>
              </div>
              <div className="consultation-visual">
                <div className="expert-avatar-circle">
                  <span className="expert-icon">🧑‍⚕️</span>
                </div>
                <div className="active-meeting-pulse"></div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bottom Final CTA */}
      <section className="services-final-cta">
        <ScrollReveal>
          <div className="cta-content">
            <h2>Ready to Transform Your Health?</h2>
            <p>Join over 50,000+ users tracking their way to a better life.</p>
            <div className="cta-actions">
              <NavLink to="/signup" className="btn sv-btn-primary btn-lg">Get Started Free</NavLink>
              <NavLink to="/about" className="btn btn-outline btn-lg">How We're Different</NavLink>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

export default ServicesPage;
