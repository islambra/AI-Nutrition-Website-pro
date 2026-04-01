import { NavLink } from 'react-router-dom';
import { Sparkles, Utensils, Camera, Lightbulb, Users, Quote, ArrowRight } from 'lucide-react';
import './HomePage.css';
import Footer from '../components/Footer.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import TiltCard from '../components/TiltCard.jsx';
import AnimatedBackground from '../components/AnimatedBackground.jsx';

function HomePage() {
  return (
    <>
    <div className="home-page-wrapper">
      <AnimatedBackground />
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="section-content">
          <div className="hero-content">
            <ScrollReveal direction="down">
              <div className='AI-title-div'>
                <Sparkles size={16} />
                <span>AI-Powered Nutrition Platform</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1>Fuel Your Body. Empower <span className='text-gradient'>Your Life.</span></h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p>Personalized Dietary Assessment & AI-Assisted Calorie Tracking for a healthier, more vibrant you.</p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="hero-actions">
                <NavLink to="/signup" className="btn btn-primary">Start Your Journey <ArrowRight size={18} style={{ marginLeft: '8px' }} /></NavLink>
                <NavLink to="/services" className="btn btn-secondary">Explore Features</NavLink>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Empathy / Problem Section */}
      <section className="intro-problem-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="intro-content">
              <span className="section-tag">The Challenge</span>
              <h2>Stop Guessing, Start Progressing</h2>
              <p>Tracking calories is tedious, and most diet plans fail because they aren't built for *you*. We combine cutting-edge AI with professional nutritional guidance to make healthy living effortless and sustainable.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. The 3-Step Process */}
      <section className="process-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="section-header">
              <h2>Your Journey in 3 Simple Steps</h2>
            </div>
          </ScrollReveal>
          <div className="process-grid">
            <ScrollReveal delay={0.1} direction="left">
              <div className="process-step">
                <div className="step-number">01</div>
                <Camera size={40} className="step-icon" />
                <h3>Snap Your Meal</h3>
                <p>Just take a photo. Our AI identifies the food and portions instantly.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2} direction="left">
              <div className="process-step">
                <div className="step-number">02</div>
                <Utensils size={40} className="step-icon" />
                <h3>Get AI Insights</h3>
                <p>Receive immediate macro and calorie breakdowns with nutritional scores.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3} direction="left">
              <div className="process-step">
                <div className="step-number">03</div>
                <Sparkles size={40} className="step-icon" />
                <h3>Follow Your Plan</h3>
                <p>Adjust your day based on real-time feedback and expert-crafted goals.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section className="features-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-tag">Features</span>
              <h2>Everything You Need to Succeed</h2>
            </div>
          </ScrollReveal>
          <div className="features-grid">
            <ScrollReveal delay={0.1}>
              <div className="feature-card">
                <div className="feature-icon"><Utensils size={32} color="#34C759" /></div>
                <h3>Custom Diet Plans</h3>
                <p>Tailored to your body, goals, and preferences by expert nutritionists.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="feature-card">
                <div className="feature-icon"><Camera size={32} color="#34C759" /></div>
                <h3>AI Calorie Insights</h3>
                <p>Effortless tracking using advanced computer vision technology.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="feature-card">
                <div className="feature-icon"><Users size={32} color="#34C759" /></div>
                <h3>Expert Guidance</h3>
                <p>Direct access to certified professionals for ongoing support.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="testimonial-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="testimonial-content">
              <Quote size={48} color="#34C759" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h2>Real Results from Real People</h2>
              <p className="testimonial-quote">"The AI tracking changed my life. I finally understand what my body actually needs without the stress of manual logging."</p>
              <p className="testimonial-author">- Sarah P., Health Enthusiast</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6. Blog Preview Snippet */}
      <section className="blog-snippet-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="section-header">
              <h2>Nutrition Science & Tips</h2>
              <p>Stay informed with the latest research-backed dietary insights.</p>
              <NavLink to="/blogs" className="btn btn-secondary">Read All Articles</NavLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section className="plans-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="section-header">
              <span className="section-tag">Pricing</span>
              <h2>Invest in a Better You</h2>
            </div>
          </ScrollReveal>
          
          <div className="plans-grid">
            <ScrollReveal delay={0.1}>
              <TiltCard>
                <div className="plan-card">
                  <div className="plan-tag">Flexible</div>
                  <h3>Monthly Basic</h3>
                  <div className="plan-price">$29<span>/mo</span></div>
                  <ul className="plan-features">
                    <li>AI calorie tracking</li>
                    <li>Weekly reports</li>
                    <li>Community access</li>
                  </ul>
                  <NavLink to="/signup" className="btn btn-primary">Select Plan</NavLink>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <TiltCard>
                <div className="plan-card featured">
                  <div className="plan-tag">Best Value</div>
                  <h3>Standard Transformation</h3>
                  <div className="plan-price">$79<span>/3 mo</span></div>
                  <ul className="plan-features">
                    <li>Nutritionist check-in</li>
                    <li>Recipe library</li>
                    <li>Advanced AI breakdown</li>
                  </ul>
                  <NavLink to="/signup" className="btn btn-primary">Select Plan</NavLink>
                </div>
              </TiltCard>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <TiltCard>
                <div className="plan-card custom-plan">
                  <div className="plan-tag">Elite</div>
                  <h3>Professional Custom</h3>
                  <div className="plan-price">Custom</div>
                  <ul className="plan-features">
                    <li>1-on-1 consultations</li>
                    <li>Condition-specific plans</li>
                    <li>Priority support</li>
                  </ul>
                  <NavLink to="/contact" className="btn btn-secondary">Inquire Now</NavLink>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="cta-section">
        <div className="section-content">
          <ScrollReveal>
            <div className="cta-content">
              <h2>Start Your Transformation Today</h2>
              <p>Join thousands of users who have mastered their nutrition with AI.</p>
              <NavLink to="/signup" className="btn btn-primary btn-large">Join Now - It's Free to Start</NavLink>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
    </div>
    
    <Footer />
    </>
  );
}

export default HomePage;
