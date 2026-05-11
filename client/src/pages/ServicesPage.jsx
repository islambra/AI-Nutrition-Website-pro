import React, { memo } from 'react';
import './ServicesPage.css';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Leaf,
  Brain,
  Activity,
  Zap,
  ShoppingCart,
  Target
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';       
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/planApi';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

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
  const [dynamicPlans, setDynamicPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planIndex, setPlanIndex] = useState(0);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getAllPlans();
        if (response.success) {
          const plans = response.data.map((plan, i) => {
            // Category-based icon fallback
            let CategoryIcon = <Activity size={32} />;
            if (plan.planCategory === "Weight Loss") CategoryIcon = <Target size={32} />;
            else if (plan.planCategory === "Muscle Gain") CategoryIcon = <Activity size={32} />;
            else if (plan.planCategory === "Diabetes") CategoryIcon = <Calendar size={32} />;
            else if (plan.planCategory === "PCOS & Hormonal Balance") CategoryIcon = <Users size={32} />;
            
            return {
              ...plan,
              title: plan.planName.toUpperCase(),
              icon: CategoryIcon,
              displayPrice: `${(plan.price * 140).toLocaleString()} DZD`,
              displayDescription: plan.description.substring(0, 120) + "...",
              features: [
                `${plan.duration} Weeks Program`,
                `${plan.consultationIncluded} Consultations`,
                plan.followUpFrequency + " Follow-ups"
              ],
              featured: i === 1,
              badge: i === 1 ? "MOST POPULAR" : null
            };
          });
          setDynamicPlans(plans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const nextPlan = () => setPlanIndex((prev) => (prev + 1) % dynamicPlans.length);
  const prevPlan = () => setPlanIndex((prev) => (prev - 1 + dynamicPlans.length) % dynamicPlans.length);

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase a plan");
      navigate('/login');
      return;
    }
    navigate(`/checkout/${plan._id}`, {
      state: { plan }
    });
  };

  const plansTrackRef = useRef(null);
  const [trackConstraints, setTrackConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    if (plansTrackRef.current) {
      const updateConstraints = () => {
        const track = plansTrackRef.current;
        const container = track.parentElement;
        const scrollWidth = track.scrollWidth;
        const containerWidth = container.offsetWidth;
        setTrackConstraints({
          left: -(scrollWidth - containerWidth),
          right: 0
        });
      };

      updateConstraints();
      window.addEventListener('resize', updateConstraints);
      return () => window.removeEventListener('resize', updateConstraints);
    }
  }, [dynamicPlans]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x < -threshold && planIndex < dynamicPlans.length - 1) {
      nextPlan();
    } else if (info.offset.x > threshold && planIndex > 0) {
      prevPlan();
    }
  };

  return (
    <div className="ServicesPage-Wrapper">
      <div className="ServicesPage-Mesh-Bg" />
      <ServicesOrganicFloaters />

      {/* 1. HERO */}
      <section className="ServicesPage-Hero">
        <ScrollReveal direction="down" className="ServicesPage-Hero-Inner">
          <h1 className="ServicesPage-Hero-Title">SYSTEM <br /> <span className="ServicesPage-Accent-Text">OPTIMIZATION</span></h1>
          <p className="ServicesPage-Hero-Subtitle">High-precision nutritional architecture designed to sync with your biological signature.</p>
        </ScrollReveal>
      </section>

      <ServicesMarquee />

      {/* 2. AI PRODUCT SHOWCASE */}
      <section className="ServicesPage-AI-Showcase">
        <div className="ServicesPage-AI-Grid">
          <ScrollReveal direction="left" className="ServicesPage-AI-Content">
            <h2>SNAP SYNC <br /> <span className="ServicesPage-Accent-Text">THRIVE</span></h2>      
            <p className="ServicesPage-AI-Description">Our neural networks eliminate the friction of data entry. Transform any meal into a high-fidelity metabolic readout instantly.</p>

            <NavLink to="/ai-tracker" className="ServicesPage-AI-Btn">
              ACCESS AI ENGINE <Zap size={20} />
            </NavLink>

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
            <div className="ServicesPage-Badge">PLANS</div>
            <h2 className="ServicesPage-Section-Title">VITALITY <span className="ServicesPage-Accent-Text">PLANS</span></h2>
            <p className="ServicesPage-Section-Subtitle">Select the tier that aligns with your objectives.</p>
          </ScrollReveal>
        </div>

        <div className="ServicesPage-Plans-Slider-Wrapper">
          {loading ? (
            <div className="ServicesPage-Loading-State">
              <Activity className="AP-Spin" size={48} />
              <p>Calibrating Systems...</p>
            </div>
          ) : dynamicPlans.length > 0 ? (
            <>
              <div className="ServicesPage-Plans-Slider-Container">
                <motion.div 
                  className="ServicesPage-Plans-Track"
                  ref={plansTrackRef}
                  drag="x"
                  dragConstraints={trackConstraints}
                  animate={{ 
                    x: window.innerWidth > 768 
                      ? `calc(-${planIndex * (100 / 3)}% - ${planIndex * (32 / 3)}px)`
                      : `calc(-${planIndex * 100}% - ${planIndex * 32}px)`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onDragEnd={handleDragEnd}
                >
                  {dynamicPlans.map((plan, i) => (
                    <div key={i} className="ServicesPage-Plan-Slide">
                      <div className={`ServicesPage-Plan-Card ${i === planIndex ? 'featured' : ''}`}>
                        {plan.badge && <div className="ServicesPage-Plan-Badge">{plan.badge}</div>}
                        <div className="ServicesPage-Plan-Image-Container">
                          {plan.planImage ? (
                            <img src={plan.planImage} alt={plan.planName} className="ServicesPage-Plan-Image" />
                          ) : (
                            <div className="ServicesPage-Plan-Icon-Fallback">{plan.icon}</div>
                          )}
                        </div>      
                        <h3>{plan.title}</h3>
                        <div className="ServicesPage-Plan-Price">{plan.displayPrice}<span>/mo</span></div>
                        <p className="ServicesPage-Plan-Desc">{plan.displayDescription}</p>

                        <ul className="ServicesPage-Plan-Features">
                          {plan.features.map((feat, fi) => (
                            <li key={fi}>
                              <Check size={16} /> {feat}
                            </li>
                          ))}
                        </ul>

                        <button 
                          onClick={() => handleSelectPlan(plan)}
                          className="ServicesPage-Plan-Btn"
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', font: 'inherit' }}
                        >  
                          <ShoppingCart size={18} style={{ marginRight: '8px' }} />
                          SELECT PLAN
                          <ChevronRight size={18} style={{ marginLeft: '8px' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              <div className="ServicesPage-Plans-Controls">
                <button onClick={prevPlan} className="ServicesPage-Plan-NavBtn prev">
                  <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div className="ServicesPage-Plans-Dots">
                  {dynamicPlans.map((_, i) => (
                    <div 
                      key={i} 
                      className={`ServicesPage-Plan-Dot ${i === planIndex ? 'active' : ''}`}
                      onClick={() => setPlanIndex(i)}
                    />
                  ))}
                </div>
                <button onClick={nextPlan} className="ServicesPage-Plan-NavBtn next">
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          ) : (
            <div className="ServicesPage-Empty-Plans">
              <p>No plans available at the moment. Explore our other services.</p>
            </div>
          )}
        </div>

        <div className="ServicesPage-AllPlans-Container">
          <ScrollReveal delay={0.4}>
            <NavLink to="/allPlans" className="ServicesPage-AllPlans-Btn">
              EXPLORE ALL DYNAMIC SYSTEMS <ArrowRight size={20} />
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
