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
  Target,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Loader2,
  ChevronDown,
  X,
  Clock,
  Eye,
  User,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Lock,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import "../components/FormationCard.css";
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/planApi';
import { getAllFormations } from '../api/formationApi';
import { getMySubscription } from '../api/courseApi';
import { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { isStudent, isClient } from '../api/userApi';

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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userIsStudent = user && isStudent(user);
  const userIsClient = user && isClient(user);
  const [dynamicPlans, setDynamicPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planIndex, setPlanIndex] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);
  const [formations, setFormations] = useState([]);
  const [formationsLoading, setFormationsLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState(null);

  useEffect(() => {
    if (selectedFormation) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [selectedFormation]);

  useEffect(() => {
    fetchFormations();
    if (userIsStudent) {
      fetchSubscription();
    } else if (userIsClient) {
      fetchPlans();
    } else {
      fetchPlans();
    }
  }, [userIsStudent, userIsClient]);

  const fetchFormations = async () => {
    try {
      setFormationsLoading(true);
      const response = await getAllFormations();
      if (response.success) setFormations(response.data);
    } catch (error) {
      console.error("Error fetching formations:", error);
    } finally {
      setFormationsLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      setSubLoading(true);
      const res = await getMySubscription();
      if (res.success) setSubscription(res.data);
    } catch {
      console.error("Failed to load subscription");
    } finally {
      setSubLoading(false);
    }
  };

  const handlePurchaseFormation = (formation) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase");
      navigate('/login');
      return;
    }
    navigate(`/checkout/formation/${formation._id}`, {
      state: { formation }
    });
  };

  const fetchPlans = async () => {
    try {
      const response = await getAllPlans();
      if (response.success) {
        const plans = response.data.map((plan, i) => {
          let CategoryIcon = <Activity size={32} />;
          if (plan.planCategory === "Weight Loss") CategoryIcon = <Target size={32} />;
          else if (plan.planCategory === "Muscle Gain") CategoryIcon = <Activity size={32} />;
          else if (plan.planCategory === "Diabetes") CategoryIcon = <Calendar size={32} />;
          else if (plan.planCategory === "PCOS & Hormonal Balance") CategoryIcon = <Users size={32} />;
          
          return {
            ...plan,
            title: plan.planName.toUpperCase(),
            icon: CategoryIcon,
            displayPrice: `${plan.price.toLocaleString()} DZD`,
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

  const nextPlan = () => setPlanIndex((prev) => (prev + 1) % dynamicPlans.length);
  const prevPlan = () => setPlanIndex((prev) => (prev - 1 + dynamicPlans.length) % dynamicPlans.length);

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase a plan");
      navigate('/login');
      return;
    }
    navigate(`/checkout/plan/${plan._id}`, {
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

  if (user && !userIsStudent && !userIsClient) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Access Restricted</h2>
        <p style={{ opacity: 0.6, maxWidth: 400 }}>
          This page is only available for students and clients.
        </p>
      </div>
    );
  }

  return (
    <div className="ServicesPage-Wrapper">
      <div className="ServicesPage-Mesh-Bg" />
      <ServicesOrganicFloaters />

      {/* 1. HERO */}
      <section className="ServicesPage-Hero">
        <ScrollReveal direction="down" className="ServicesPage-Hero-Inner">
          {userIsStudent ? (
            <>
              <h1 className="ServicesPage-Hero-Title">NUTRITION <br /> <span className="ServicesPage-Accent-Text">EDUCATION</span></h1>
              <p className="ServicesPage-Hero-Subtitle">Access your course materials, track your progress, and advance your nutrition knowledge.</p>
            </>
          ) : (
            <>
              <h1 className="ServicesPage-Hero-Title">SYSTEM <br /> <span className="ServicesPage-Accent-Text">OPTIMIZATION</span></h1>
              <p className="ServicesPage-Hero-Subtitle">High-precision nutritional architecture designed to sync with your biological signature.</p>
            </>
          )}
        </ScrollReveal>
      </section>

      <ServicesMarquee />

      {userIsStudent ? (
        <>
          {/* STUDENT: COURSE SUBSCRIPTION */}
          <section className="ServicesPage-Student-Section">
            <div className="sp-section-bg-orbs" />
            <div className="sp-section-header">
              <ScrollReveal>
                <div className="sp-badge">
                  <GraduationCap size={13} /> COURSE ACCESS
                </div>
                <h2 className="sp-title">
                  Course <span className="sp-title-highlight">Subscription</span>
                </h2>
                <p className="sp-subtitle">Get yearly access to all nutrition course materials.</p>
              </ScrollReveal>
            </div>

            {subLoading ? (
              <div className="sp-loading">
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="sp-loading-icon"
                >
                  <BookOpen size={48} />
                </motion.div>
              </div>
            ) : (
              <div className="sp-card-container">
                {subscription?.isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className="sp-card sp-card-active"
                  >
                    <div className="sp-active-illust">
                      <div className="sp-active-illust-icon">
                        <CheckCircle size={36} />
                      </div>
                    </div>
                    <div className="sp-active-body">
                      <div className="sp-active-header-row">
                        <h3 className="sp-active-title">Access Granted</h3>
                        <span className="sp-active-pill">Active</span>
                      </div>
                      <p className="sp-active-desc">You have full access to all course materials across every level and semester.</p>
                      <div className="sp-active-meta">
                        <div className="sp-meta-item">
                          <Clock size={14} />
                          Expires {new Date(subscription.endDate).toLocaleDateString()}
                        </div>
                        <div className="sp-meta-dot" />
                        <div className="sp-meta-item">
                          <CheckCircle size={14} />
                          {subscription.daysRemaining} days remaining
                        </div>
                      </div>
                      <NavLink to="/student/my-courses" className="sp-btn sp-btn-active">
                        Browse Courses <ArrowRight size={17} />
                      </NavLink>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    className="sp-card sp-card-inactive"
                  >
                    <div className="sp-inactive-top">
                      <div className="sp-inactive-icon-wrap">
                        <GraduationCap size={22} />
                      </div>
                      <span className="sp-inactive-badge">Yearly Plan</span>
                    </div>
                    <div className="sp-price-block">
                      <span className="sp-currency">DZD</span>
                      <span className="sp-amount">2,499<small>.99</small></span>
                      <span className="sp-period">/year</span>
                    </div>
                    <p className="sp-inactive-desc">Unlock every course across all levels and semesters.</p>
                    <div className="sp-benefits">
                      <div className="sp-benefit">
                        <div className="sp-benefit-icon"><BookOpen size={14} /></div>
                        <span>All levels (1, 2 &amp; 3)</span>
                      </div>
                      <div className="sp-benefit">
                        <div className="sp-benefit-icon"><FileText size={14} /></div>
                        <span>Both semesters</span>
                      </div>
                      <div className="sp-benefit">
                        <div className="sp-benefit-icon"><ExternalLink size={14} /></div>
                        <span>PDF materials &amp; Drive links</span>
                      </div>
                      <div className="sp-benefit">
                        <div className="sp-benefit-icon"><Clock size={14} /></div>
                        <span>Full year of access</span>
                      </div>
                    </div>
                    {subscription && !subscription.isActive && (
                      <div className="sp-expired">
                        <XCircle size={15} />
                        <span>Your previous subscription has expired. Renew to regain access.</span>
                      </div>
                    )}
                    <NavLink to="/checkout/course-subscription" className="sp-btn sp-btn-subscribe">
                      Subscribe Now <ArrowRight size={17} />
                    </NavLink>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        </>
      ) : userIsClient ? (
        <>
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
                            <div className="ServicesPage-Plan-Price">{plan.displayPrice}</div>
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
        </>
      ) : (
        <>
          {/* FULL PAGE for unauthenticated users, admins, dieteticiens */}
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
                            <div className="ServicesPage-Plan-Price">{plan.displayPrice}</div>
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
        </>
      )}

      {/* FORMATIONS SECTION - hidden for client accounts */}
      {!userIsClient && (
      <section className="ServicesPage-Plans-Section">
        <div className="ServicesPage-Section-Header">
          <ScrollReveal>
            <div className="ServicesPage-Badge">
              <GraduationCap size={14} style={{ marginRight: 6 }} /> FORMATIONS
            </div>
            <h2 className="ServicesPage-Section-Title">ONLINE <span className="ServicesPage-Accent-Text">FORMATIONS</span></h2>
            <p className="ServicesPage-Section-Subtitle">Enroll in guided training programs with live sessions and resources.</p>
          </ScrollReveal>
        </div>

        <div className="sp-formation-grid">
          {formationsLoading ? (
            <div className="ServicesPage-Loading-State">
              <Loader2 className="AP-Spin" size={48} />
              <p>Loading formations...</p>
            </div>
          ) : formations.length === 0 ? (
            <div className="ServicesPage-Empty-Plans">
              <p>No formations available yet.</p>
            </div>
          ) : (
            formations.map((f) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sp-formation-card"
              >
                <div className="sp-formation-img-wrap">
                  {f.image ? (
                    <img src={f.image} alt={f.title} className="sp-formation-img" />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--health-mint)" }}>
                      <Video size={36} style={{ color: "var(--health-green)", opacity: 0.3 }} />
                    </div>
                  )}
                  <span className="sp-formation-price">{f.price.toLocaleString()} DZD</span>
                </div>

                <div className="sp-formation-body">
                  <div className="sp-formation-meta">
                    <span><Calendar size={12} /> {f.sessionsCount} sessions</span>
                    <span><Clock size={12} /> {f.durationWeeks} weeks</span>
                  </div>

                  <h3 className="sp-formation-title">{f.title}</h3>
                  <p className="sp-formation-desc">{f.description}</p>

                  {f.creatorInfo && (
                    <div className="sp-formation-creator">
                      {f.creatorInfo.photo ? (
                        <img src={f.creatorInfo.photo} alt={f.creatorInfo.fullName} className="sp-formation-avatar" />
                      ) : (
                        <div className="sp-formation-avatar sp-formation-avatar-fallback">
                          <User size={14} />
                        </div>
                      )}
                      <span>{f.creatorInfo.fullName}</span>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFormation(f)}
                    className="sp-formation-btn"
                  >
                    <Eye size={15} /> View Details
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Formation Detail Modal */}
        <AnimatePresence>
          {selectedFormation && (
            <motion.div
              className="ServicesPage-Modal-Overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFormation(null)}
            >
              <motion.div
                className="ServicesPage-Modal-Content"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 800 }}
              >
                <button className="ServicesPage-Modal-Close" onClick={() => setSelectedFormation(null)}>
                  <X size={20} />
                </button>
                <div style={{ display: "flex", minHeight: 350 }}>
                  {selectedFormation.image && (
                    <div style={{ width: "45%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                      <img
                        src={selectedFormation.image}
                        alt={selectedFormation.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px 0 0 20px" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(255,255,255,0.95))", pointerEvents: "none" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column" }}>
                    <div className="fc-badge-row">
                      <span className="fc-badge"><Clock size={12} /> {selectedFormation.durationWeeks} weeks</span>
                      <span className="fc-price-badge" style={{ fontSize: 16 }}>{selectedFormation.price.toLocaleString()} DZD</span>
                    </div>

                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--health-green)", margin: "12px 0 8px", lineHeight: 1.2 }}>{selectedFormation.title}</h2>
                    <p className="ServicesPage-Formation-Desc" style={{ fontSize: 14, lineHeight: 1.7, color: "var(--health-gray)", marginBottom: 16, WebkitLineClamp: 5 }}>{selectedFormation.description}</p>

                    <div className="fc-meta-row" style={{ marginBottom: 12 }}>
                      <span className="fc-meta-item"><Calendar size={14} /> {selectedFormation.sessionsCount} sessions</span>
                      <span className="fc-meta-item"><Users size={14} /> {selectedFormation.durationWeeks} weeks</span>
                      {selectedFormation.startDate && (
                        <span className="fc-meta-item"><Calendar size={14} /> Starts {new Date(selectedFormation.startDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    {selectedFormation.creatorInfo && (
                      <div className="fc-creator-row" style={{ marginTop: 0, paddingTop: 12 }}>
                        {selectedFormation.creatorInfo.photo ? (
                          <img src={selectedFormation.creatorInfo.photo} alt={selectedFormation.creatorInfo.fullName} className="fc-creator-avatar" />
                        ) : (
                          <div className="fc-creator-avatar-fallback">
                            <User size={16} />
                          </div>
                        )}
                        <div className="fc-creator-info">
                          <span className="fc-creator-label">Created by</span>
                          <span className="fc-creator-name">{selectedFormation.creatorInfo.fullName}</span>
                        </div>
                      </div>
                    )}

                    {selectedFormation.files?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {selectedFormation.files.map((file, i) => (
                          <div key={i} className="ServicesPage-Formation-File-Item">
                            <FileText size={14} /> {file.name}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: "auto", display: "flex", gap: 12 }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { handlePurchaseFormation(selectedFormation); setSelectedFormation(null); }}
                        className="fc-btn fc-btn-primary"
                        style={{ flex: 1, justifyContent: "center", padding: "14px 28px", fontSize: 14 }}
                      >
                        <ShoppingCart size={16} /> ENROLL NOW
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      )}

      {/* FINAL CTA */}
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