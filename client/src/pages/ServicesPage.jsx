import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import './ServicesPage.css';
import { NavLink, useNavigate } from 'react-router-dom';
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

// --- VITALITY MARQUEE ---
const ServicesMarquee = () => (
  <div className="ServicesPage-Marquee">
    <motion.div
      animate={{ x: [0, -1000] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="ServicesPage-Marquee-Content"
    >
      {[...Array(10)].map((_, i) => (
        <span key={i}>{t('services.marquee')}</span>
      ))}
    </motion.div>
  </div>
);

function ServicesPage() {
  const { t } = useTranslation();
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
      toast.error(t('checkout.pleaseLogin'));
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
              t('services.weeksProgram', {weeks: plan.duration}),
              t('services.consultationsCount', {count: plan.consultationIncluded}),
              t('services.followUps', {frequency: plan.followUpFrequency})
            ],
            featured: i === 1,
            badge: i === 1 ? t('services.mostPopular') : null
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
      toast.error(t('checkout.pleaseLogin'));
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
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>{t('common.authRequired')}</h2>
        <p style={{ opacity: 0.6, maxWidth: 400 }}>
          {t('common.authRequiredDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="ServicesPage-Wrapper">
      <div className="ServicesPage-Mesh-Bg" />

      {/* 1. HERO */}
      <section className="ServicesPage-Hero">
        <ScrollReveal direction="down" className="ServicesPage-Hero-Inner">
          {userIsStudent ? (
            <>
              <h1 className="ServicesPage-Hero-Title"><Trans i18nKey="services.studentHeroTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h1>
              <p className="ServicesPage-Hero-Subtitle">{t('services.studentHeroSubtitle')}</p>
            </>
          ) : (
            <>
              <h1 className="ServicesPage-Hero-Title"><Trans i18nKey="services.heroTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h1>
              <p className="ServicesPage-Hero-Subtitle">{t('services.heroSubtitle')}</p>
            </>
          )}
        </ScrollReveal>
      </section>

      <ServicesMarquee />

      {userIsStudent ? (
        <>
          {/* STUDENT: COURSE SUBSCRIPTION */}
          <section className="ServicesPage-Student-Section">
            <div className="sp-section-header">
              <ScrollReveal>
                <div className="sp-badge">
                  <GraduationCap size={13} /> {t('services.courseBadge')}
                </div>
                <h2 className="sp-title">
                  <Trans i18nKey="services.courseTitle" components={{1: <span className="sp-title-highlight" />}} />
                </h2>
                <p className="sp-subtitle">{t('services.courseSubtitle')}</p>
              </ScrollReveal>
            </div>

            {subLoading ? (
              <div className="sub-loading">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="sub-loading-icon"
                >
                  <BookOpen size={48} />
                </motion.div>
              </div>
            ) : (
              <div className="sub-card-wrap">
                {subscription?.isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="sub-card sub-card-active"
                  >
                    <div className="sub-card-row">
                      <div className="sub-card-icon">
                        <CheckCircle size={22} />
                      </div>
                      <span className="sub-badge sub-badge-green">{t('services.subActive')}</span>
                    </div>
                    <h3 className="sub-title">{t('services.subAccessGranted')}</h3>
                    <p className="sub-desc">{t('services.subAccessDesc')}</p>
                    <div className="sub-meta">
                      <span className="sub-meta-item">
                        <Clock size={13} /> <Trans i18nKey="services.subExpires" values={{date: new Date(subscription.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}} />
                      </span>
                      <span className="sub-meta-item">
                        {subscription.daysRemaining >= 365 
                          ? <Trans i18nKey="services.subYearsRemaining" values={{years: Math.floor(subscription.daysRemaining / 365)}} />
                          : <Trans i18nKey="services.subDaysRemaining" values={{days: subscription.daysRemaining}} />
                        }
                      </span>
                    </div>
                    <NavLink to="/student/my-courses" className="sub-btn">
                      {t('services.browseCourses')} <ArrowRight size={17} />
                    </NavLink>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="sub-card sub-card-inactive"
                  >
                    <div className="sub-card-row">
                      <div className="sub-card-icon">
                        <GraduationCap size={22} />
                      </div>
                      <span className="sub-badge">{t('services.yearlyPlan')}</span>
                    </div>
                    <div className="sub-price">
                      <span className="sub-currency">DZD</span>
                      <span className="sub-amount">2,499<small>.99</small></span>
                      <span className="sub-period">{t('services.perYear')}</span>
                    </div>
                    <p className="sub-desc">{t('services.subDesc')}</p>
                    <div className="sub-benefits">
                      <div className="sub-benefit">
                        <CheckCircle size={14} />
                        <span>{t('services.benefitAllLevels')}</span>
                      </div>
                      <div className="sub-benefit">
                        <CheckCircle size={14} />
                        <span>{t('services.benefitSemesters')}</span>
                      </div>
                      <div className="sub-benefit">
                        <CheckCircle size={14} />
                        <span>{t('services.benefitMaterials')}</span>
                      </div>
                      <div className="sub-benefit">
                        <CheckCircle size={14} />
                        <span>{t('services.benefitFullYear')}</span>
                      </div>
                    </div>
                    {subscription && !subscription.isActive && (
                      <div className="sub-expired">
                        <Clock size={15} />
                        <span>{t('services.subExpiredMsg')}</span>
                      </div>
                    )}
                    <NavLink to="/checkout/course-subscription" className="sub-btn">
                      {t('services.subscribeNow')} <ArrowRight size={17} />
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
                <h2><Trans i18nKey="services.aiTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>      
                <p className="ServicesPage-AI-Description">{t('services.aiDesc')}</p>

                <NavLink to="/ai-tool" className="ServicesPage-AI-Btn">
                  {t('services.aiButton')} <Zap size={20} />
                </NavLink>

                <div className="ServicesPage-AI-Feature-List">
                  <div className="ServicesPage-AI-Feature-Item">
                    <div className="ServicesPage-AI-Feature-Icon"><Scan size={24} /></div>
                    <div>
                      <h4>{t('services.neuralRecognition')}</h4>
                      <p>{t('services.neuralRecognitionDesc')}</p>       
                    </div>
                  </div>
                  <div className="ServicesPage-AI-Feature-Item">
                    <div className="ServicesPage-AI-Feature-Icon"><PieChart size={24} /></div>
                    <div>
                      <h4>{t('services.macroDynamics')}</h4>
                      <p>{t('services.macroDynamicsDesc')}</p>      
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
                        <span className="ServicesPage-Overlay-Label">{t('services.mockupLabel')}</span>
                        <span className="ServicesPage-Overlay-Calories">{t('services.mockupCalories')}</span>
                      </div>
                      <div className="ServicesPage-Macros-Preview">
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupP')}</span> 24g</div>
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupC')}</span> 32g</div>
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupF')}</span> 18g</div>
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
                <div className="ServicesPage-Badge">{t('services.badgePlans')}</div>
                <h2 className="ServicesPage-Section-Title"><Trans i18nKey="services.plansTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>
                <p className="ServicesPage-Section-Subtitle">{t('services.plansSubtitle')}</p>
              </ScrollReveal>
            </div>

            <div className="ServicesPage-Plans-Slider-Wrapper">
              {loading ? (
                <div className="ServicesPage-Loading-State">
                  <Activity className="AP-Spin" size={48} />
                  <p>{t('common.loading')}</p>
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
                              {t('plans.buyNow')}
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
                  <p>{t('services.noPlans')}</p>
                </div>
              )}
            </div>

            <div className="ServicesPage-AllPlans-Container">
              <ScrollReveal delay={0.4}>
                <NavLink to="/allPlans" className="ServicesPage-AllPlans-Btn">
                  {t('plans.buyNow')} <ArrowRight size={20} />
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
                <h2><Trans i18nKey="services.aiTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>      
                <p className="ServicesPage-AI-Description">{t('services.aiDesc')}</p>

                <NavLink to="/ai-tool" className="ServicesPage-AI-Btn">
                  {t('services.aiButton')} <Zap size={20} />
                </NavLink>

                <div className="ServicesPage-AI-Feature-List">
                  <div className="ServicesPage-AI-Feature-Item">
                    <div className="ServicesPage-AI-Feature-Icon"><Scan size={24} /></div>
                    <div>
                      <h4>{t('services.neuralRecognition')}</h4>
                      <p>{t('services.neuralRecognitionDesc')}</p>       
                    </div>
                  </div>
                  <div className="ServicesPage-AI-Feature-Item">
                    <div className="ServicesPage-AI-Feature-Icon"><PieChart size={24} /></div>
                    <div>
                      <h4>{t('services.macroDynamics')}</h4>
                      <p>{t('services.macroDynamicsDesc')}</p>      
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
                        <span className="ServicesPage-Overlay-Label">{t('services.mockupLabel')}</span>
                        <span className="ServicesPage-Overlay-Calories">{t('services.mockupCalories')}</span>
                      </div>
                      <div className="ServicesPage-Macros-Preview">
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupP')}</span> 24g</div>
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupC')}</span> 32g</div>
                        <div className="ServicesPage-Macro-Pill"><span>{t('services.mockupF')}</span> 18g</div>
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
                <div className="ServicesPage-Badge">{t('services.badgePlans')}</div>
                <h2 className="ServicesPage-Section-Title"><Trans i18nKey="services.plansTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>
                <p className="ServicesPage-Section-Subtitle">{t('services.plansSubtitle')}</p>
              </ScrollReveal>
            </div>

            <div className="ServicesPage-Plans-Slider-Wrapper">
              {loading ? (
                <div className="ServicesPage-Loading-State">
                  <Activity className="AP-Spin" size={48} />
                  <p>{t('services.calibrating')}</p>
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
                              {t('services.selectPlan')}
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
                  <p>{t('services.noPlansAvailable')}</p>
                </div>
              )}
            </div>

            <div className="ServicesPage-AllPlans-Container">
              <ScrollReveal delay={0.4}>
                <NavLink to="/allPlans" className="ServicesPage-AllPlans-Btn">
                  {t('services.exploreAll')} <ArrowRight size={20} />
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
              <GraduationCap size={14} style={{ marginRight: 6 }} /> {t('services.formationBadge')}
            </div>
            <h2 className="ServicesPage-Section-Title"><Trans i18nKey="services.formationTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>
            <p className="ServicesPage-Section-Subtitle">{t('services.formationSubtitle')}</p>
          </ScrollReveal>
        </div>

        <div className="sp-formation-grid">
          {formationsLoading ? (
            <div className="ServicesPage-Loading-State">
              <Loader2 className="AP-Spin" size={48} />
              <p>{t('common.loading')}</p>
            </div>
          ) : formations.length === 0 ? (
            <div className="ServicesPage-Empty-Plans">
              <p>{t('services.noPlans')}</p>
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
                    <span><Calendar size={12} /> {f.sessionsCount} {t('services.sessions')}</span>
                    <span><Clock size={12} /> {f.durationWeeks} {t('services.weeks')}</span>
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
                    <Eye size={15} /> {t('services.viewDetails')}
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
                      <span className="fc-badge"><Clock size={12} /> {selectedFormation.durationWeeks} {t('services.weeks')}</span>
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
                          <span className="fc-creator-label">{t('services.createdBy')}</span>
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
                        <ShoppingCart size={16} /> {t('services.subscribe')}
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
          <h2 className="ServicesPage-Section-Title"><Trans i18nKey="services.ctaTitle" components={{1: <span className="ServicesPage-Accent-Text" />}} /></h2>
          <NavLink to="/signup" className="ServicesPage-Join-Btn">
            {t('services.ctaButton')}
          </NavLink>
        </ScrollReveal>
      </section>
    </div>
  );
}

export default ServicesPage;