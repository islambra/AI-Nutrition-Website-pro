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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  BookMarked,
  X,
  Clock,
  Eye,
  User,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import "../components/FormationCard.css";
import { useAuth } from '../context/AuthContext';
import { getAllPlans } from '../api/planApi';
import { getAllCourses } from '../api/courseApi';
import { getAllFormations, purchaseFormation } from '../api/formationApi';
import { useState, useEffect, useRef } from 'react';
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

const LEVELS = [
  { id: 1, title: "Level 1", subtitle: "Foundation Courses" },
  { id: 2, title: "Level 2", subtitle: "Intermediate Courses" },
  { id: 3, title: "Level 3", subtitle: "Advanced Courses" },
];

const SEMESTERS = [1, 2];

function ServicesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const userIsStudent = user && isStudent(user);
  const userIsClient = user && isClient(user);
  const [dynamicPlans, setDynamicPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planIndex, setPlanIndex] = useState(0);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState(null);
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
      fetchCourses();
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

  const handlePurchaseFormation = async (formation) => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase");
      navigate('/login');
      return;
    }
    try {
      const res = await purchaseFormation(formation._id);
      if (res.success) {
        toast.success("Formation purchased successfully! Check My Formations.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await getAllCourses();
      if (response.success) {
        setCourses(response.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCoursesLoading(false);
      setLoading(false);
    }
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

  const getCoursesForLevelSemester = (level, semester) => {
    return courses.filter((c) => c.level === level && c.semester === semester);
  };

  const toggleLevel = (levelId) => {
    setExpandedLevel(expandedLevel === levelId ? null : levelId);
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
          {/* STUDENT: COURSES SECTION */}
          <section className="ServicesPage-Plans-Section">
            <div className="ServicesPage-Section-Header">
              <ScrollReveal>
                <div className="ServicesPage-Badge">
                  <GraduationCap size={14} style={{ marginRight: 6 }} /> COURSES
                </div>
                <h2 className="ServicesPage-Section-Title">MY <span className="ServicesPage-Accent-Text">COURSES</span></h2>
                <p className="ServicesPage-Section-Subtitle">Browse your course materials organized by level and semester.</p>
              </ScrollReveal>
            </div>

            <div className="sc-levels">
              {coursesLoading ? (
                <div className="ServicesPage-Loading-State">
                  <Loader2 className="AP-Spin" size={48} />
                  <p>Loading courses...</p>
                </div>
              ) : (
                LEVELS.map((level) => {
                  const isExpanded = expandedLevel === level.id;
                  const sem1Courses = getCoursesForLevelSemester(level.id, 1);
                  const sem2Courses = getCoursesForLevelSemester(level.id, 2);

                  return (
                    <motion.div
                      key={level.id}
                      layout
                      className={`sc-level-card ${isExpanded ? "expanded" : ""}`}
                    >
                      <button
                        className="sc-level-header"
                        onClick={() => toggleLevel(level.id)}
                      >
                        <div className="sc-level-info">
                          <div className="sc-level-icon">
                            <BookMarked size={22} />
                          </div>
                          <div>
                            <h3>{level.title}</h3>
                            <span className="sc-level-subtitle">{level.subtitle}</span>
                          </div>
                        </div>
                        <div className="sc-level-stats">
                          <span className="sc-course-count">
                            {sem1Courses.length + sem2Courses.length} courses
                          </span>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="sc-level-body"
                          >
                            <div className="sc-semesters">
                              {SEMESTERS.map((sem) => {
                                const semCourses = sem === 1 ? sem1Courses : sem2Courses;
                                return (
                                  <div key={sem} className="sc-semester">
                                    <div className="sc-semester-header">
                                      <GraduationCap size={16} />
                                      <h4>Semester {sem}</h4>
                                      <span className="sc-semester-count">{semCourses.length} courses</span>
                                    </div>
                                    {semCourses.length === 0 ? (
                                      <div className="sc-empty">
                                        <BookOpen size={20} />
                                        <p>No courses available yet</p>
                                      </div>
                                    ) : (
                                      <div className="sc-course-list">
                                        {semCourses.map((course) => (
                                          <motion.div
                                            key={course._id}
                                            className="sc-course-item"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                          >
                                            <BookOpen size={18} className="sc-course-item-icon" />
                                            <div className="sc-course-content">
                                              <h5>{course.title}</h5>
                                              {course.createdAt && (
                                                <span className="sc-course-date">
                                                  Added {new Date(course.createdAt).toLocaleDateString()}
                                                </span>
                                              )}
                                            </div>
                                            {course.url && (
                                              <a href={course.url} target="_blank" rel="noopener noreferrer" className="sc-pdf-btn">
                                                <ExternalLink size={14} />
                                                <span>Open</span>
                                                <ExternalLink size={12} />
                                              </a>
                                            )}
                                            {course.pdfUrl && (
                                              <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer" className="sc-pdf-btn">
                                                <FileText size={14} />
                                                <span>PDF</span>
                                                <ExternalLink size={12} />
                                              </a>
                                            )}
                                          </motion.div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
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