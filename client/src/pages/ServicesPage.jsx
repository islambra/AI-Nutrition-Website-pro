import React, { memo } from 'react';
import './ServicesPage.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Scan, 
  PieChart, 
  Check, 
  Video, 
  FileText, 
  ArrowRight,
  Leaf,
  Brain,
  Activity,
  Zap
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';       
import { useAuth } from '../context/AuthContext';

// --- ORGANIC FLOATERS ---
const ServicesOrganicFloaters = memo(() => (
  <div className="ServicesPage-Organic-Container">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="ServicesPage-Floater"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.15, 0], 
          x: [Math.random() * 100 + 'vw', Math.random() * 100 + 'vw'],
          y: [Math.random() * 100 + 'vh', Math.random() * 100 + 'vh']
        }}
        transition={{ duration: 25 + i, repeat: Infinity, ease: "linear" }}
      >
        <Leaf size={30 + i * 15} strokeWidth={1} />
      </motion.div>
    ))}
  </div>
));

// --- VITALITY MARQUEE ---
const ServicesMarquee = () => (
  <div className="ServicesPage-Marquee">
    <motion.div
      animate={{ x: [0, -1000] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="ServicesPage-Marquee-Content"
    >
      {[...Array(10)].map((_, i) => (
        <span key={i}>✦ Biological Excellence ✦ Neural Precision ✦ Vitality Optimized ✦</span>
      ))}
    </motion.div>
  </div>
);

function ServicesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const coreServices = [
    {
      title: "VITAL ESSENTIALS",
      icon: <Calendar size={32} />,
      price: "$19",
      description: "Foundational nutrition for sustainable longevity. Our standard plans provide the biological framework needed for daily excellence.",
      features: ["Monthly Vitality Tracking", "AI Nutrition Hub Access", "Weekly Insights", "Seasonal Blueprints"],        
      featured: false
    },
    {
      title: "PRECISION CARE",
      icon: <Activity size={32} />,
      price: "$49",
      description: "Direct-action plans for complex biological needs. Specialized support for insulin resistance and metabolic health.",
      features: ["1-on-1 Clinical Consult", "Health History Analysis", "Real-time Synchronization", "Priority Messaging"], 
      featured: true,
      badge: "MOST POPULAR"
    },
    {
      title: "BIO COMMUNITY",
      icon: <MessageSquare size={32} />,
      price: "$29",
      description: "Collaborative wellness through shared intelligence. Connect with experts and peers in a high-performance network.",
      features: ["Verified Network Access", "Expert Research Feed", "Bio-Wellness Forums", "Weekly Live Q&As"],
      featured: false
    }
  ];

  return (
    <div className="ServicesPage-Wrapper">
      <div className="ServicesPage-Mesh-Bg" />
      <ServicesOrganicFloaters />

      {/* 1. HERO */}
      <section className="ServicesPage-Hero">
        <ScrollReveal direction="down" className="ServicesPage-Hero-Inner">
          <h1 className="ServicesPage-Hero-Title">SYSTEM <br /> <span className="ServicesPage-Accent-Text">OPTIMIZATION</span></h1>
          <p className="ServicesPage-Hero-Subtitle">High-precision nutritional architecture designed to sync with your unique biological signature.</p>
        </ScrollReveal>
      </section>

      <ServicesMarquee />

      {/* 2. AI PRODUCT SHOWCASE */}
      <section className="ServicesPage-AI-Showcase">
        <div className="ServicesPage-AI-Grid">
          <ScrollReveal direction="left" className="ServicesPage-AI-Content">
            <h2>SNAP SYNC <br /> <span className="ServicesPage-Accent-Text">THRIVE</span></h2>      
            <p className="ServicesPage-AI-Description">Our neural networks eliminate the friction of data entry. Transform any meal into a high-fidelity metabolic readout instantly.</p>

            <div className="ServicesPage-AI-Feature-List">
              <div className="ServicesPage-AI-Feature-Item">
                <div className="ServicesPage-AI-Feature-Icon"><Scan size={24} /></div>
                <div>
                  <h4>NEURAL RECOGNITION</h4>
                  <p>98.4% Accuracy in complex ingredient analysis.</p>       
                </div>
              </div>
              <div className="ServicesPage-AI-Feature-Item">
                <div className="ServicesPage-AI-Feature-Icon"><PieChart size={24} /></div>
                <div>
                  <h4>MACRO DYNAMICS</h4>
                  <p>Real-time protein, fat, and nutrient breakdown.</p>      
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="ServicesPage-AI-Visual">
            <div className="ServicesPage-Mockup-Container">
              <div className="ServicesPage-Phone-Mockup">
                <div className="ServicesPage-Screen-Content">
                  <div className="ServicesPage-Scan-Animation" />
                  <div className="ServicesPage-Food-Overlay">
                    <span className="ServicesPage-Overlay-Label">VITAL BOWL</span>
                    <span className="ServicesPage-Overlay-Calories">~420 KCAL</span>
                  </div>
                  <div className="ServicesPage-Macros-Preview">
                    <div className="ServicesPage-Macro-Pill"><span>P:</span> 24g</div>
                    <div className="ServicesPage-Macro-Pill"><span>C:</span> 32g</div>
                    <div className="ServicesPage-Macro-Pill"><span>F:</span> 18g</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. PLANS SECTION */}
      <section className="ServicesPage-Plans-Section">
        <div className="ServicesPage-Section-Header">
          <ScrollReveal>
            <div className="ServicesPage-Badge">SUBSCRIPTIONS</div>
            <h2 className="ServicesPage-Section-Title">VITALITY <span className="ServicesPage-Accent-Text">PLANS</span></h2>
            <p className="ServicesPage-Section-Subtitle">Select the tier that aligns with your current metabolic objectives.</p>
          </ScrollReveal>
        </div>

        <div className="ServicesPage-Plans-Grid">
          {coreServices.map((plan, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className={`ServicesPage-Plan-Card ${plan.featured ? 'featured' : ''}`}>
                {plan.badge && <div className="ServicesPage-Plan-Badge">{plan.badge}</div>}
                <div className="ServicesPage-Plan-Icon">{plan.icon}</div>      
                <h3>{plan.title}</h3>
                <div className="ServicesPage-Plan-Price">{plan.price}<span>/mo</span></div>
                <p className="ServicesPage-Plan-Desc">{plan.description}</p>

                <ul className="ServicesPage-Plan-Features">
                  {plan.features.map((feat, fi) => (
                    <li key={fi}>
                      <Check size={16} /> {feat}
                    </li>
                  ))}
                </ul>

                <NavLink 
                  to={isAuthenticated ? "/allPlans" : "/login"} 
                  className="ServicesPage-Plan-Btn"
                >  
                  SELECT PLAN
                </NavLink>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="ServicesPage-AllPlans-Container">
          <ScrollReveal delay={0.4}>
            <NavLink to="/allPlans" className="ServicesPage-AllPlans-Btn">
              EXPLORE ALL DYNAMIC PLANS <ArrowRight size={20} />
            </NavLink>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. CONSULTATION BANNER */}
      <section className="ServicesPage-Consult-Section">
        <ScrollReveal>
          <div className="ServicesPage-Consult-Banner">
            <div className="ServicesPage-Consult-Info">
              <h2>CLINICAL <br /> OVERRIDE</h2>
              <p>Direct access to certified clinical nutritionists for advanced health assessment and objective calibration.</p>

              <div className="ServicesPage-Consult-Stats">
                <div>
                  <h4>HD VIDEO</h4>
                  <p>Bio-Consults</p>
                </div>
                <div>
                  <h4>WRITTEN</h4>
                  <p>Vital Reports</p>
                </div>
              </div>

              <NavLink to="/contact" className="ServicesPage-Consult-Btn">
                BOOK SESSION
              </NavLink>
            </div>
            <div className="ServicesPage-Consult-Visual">
              <Brain size={240} strokeWidth={0.5} opacity={0.3} color="#fff" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 5. FINAL CTA */}
      <section className="ServicesPage-CTA-Section">
        <ScrollReveal>
          <h2 className="ServicesPage-Section-Title">READY TO <br /> <span className="ServicesPage-Accent-Text">OPTIMIZE?</span></h2>
          <NavLink to="/signup" className="ServicesPage-Join-Btn">
            JOIN THE NETWORK
          </NavLink>
        </ScrollReveal>
      </section>
    </div>
  );
}

export default ServicesPage;
