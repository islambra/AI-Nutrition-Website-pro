import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, AnimatePresence, useMotionValue } from 'framer-motion';
import { Sparkles, Utensils, Camera, Lightbulb, Users, Quote, ArrowRight, TrendingUp, ShieldCheck, Zap, Activity, Heart, Brain, Flame, Share2, MousePointer2, Terminal, Cpu, Target, Fingerprint, Dna, Clock, Eye, Radio } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import Tilt from 'react-parallax-tilt';
import './HomePage.css';
import Footer from '../components/Footer.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import BioTechBackground from '../components/BioTechBackground.jsx';
import CustomCursor from '../components/CustomCursor.jsx';

// --- 1. NEURAL PRELOADER ---
const NeuralPreloader = memo(({ finishLoading }) => {
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("SYNCING NEURAL PATHWAYS...");

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(finishLoading, 800);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 15) + 2;
        return next > 100 ? 100 : next;
      });
    }, 150);

    const statusMsgs = [
      "INITIALIZING BIO-LINK...",
      "MAPPING METABOLIC NODES...",
      "DECRYPTING DNA SEQUENCES...",
      "CALIBRATING AI VISION...",
      "SYSTEM READY."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      setStatus(statusMsgs[msgIdx]);
      msgIdx = (msgIdx + 1) % statusMsgs.length;
    }, 600);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [finishLoading]);

  return (
    <motion.div 
      className="neural-preloader"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 0.8 }}
    >
      <div className="loader-content">
        <Dna size={60} className="dna-loader-icon" />
        <div className="progress-track">
          <motion.div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <div className="loader-meta">
          <span className="percent-text">{percent}%</span>
          <span className="status-text">{status}</span>
        </div>
      </div>
    </motion.div>
  );
});

// --- 2. CIRCADIAN HUD ---
const CircadianHUD = memo(() => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="circadian-hud">
      <div className="hud-ring">
        <motion.div 
          className="hud-hand" 
          animate={{ rotate: (time.getHours() * 15) + (time.getMinutes() * 0.25) }} 
        />
      </div>
      <div className="hud-data">
        <p className="hud-time">{time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</p>
        <p className="hud-phase">PHASE: PEAK FOCUS</p>
      </div>
    </div>
  );
});

// --- 3. DATA DEBRIS ---
const DataDebris = memo(() => {
  return (
    <div className="data-debris-layer">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="debris-item"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%", 
            opacity: 0.1 
          }}
          animate={{ 
            y: [null, "-20%"],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 20 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {i % 2 === 0 ? "010110" : "VIT_C++"}
        </motion.div>
      ))}
    </div>
  );
});

// --- 4. NEURAL BIO-CORE ---
const BioCore = memo(() => {
  return (
    <div className="bio-core-container">
      <motion.div 
        className="core-outer-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="core-inner-ring"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <div className="core-center">
        <Dna size={80} className="dna-icon-v2" />
        <motion.div 
          className="core-pulse"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="core-orbiting-node"
          animate={{ rotate: 360, scale: [1, 1.5, 1] }}
          style={{ transformOrigin: '150px 150px', left: 'calc(50% - 150px)', top: 'calc(50% - 150px)' }}
          transition={{ rotate: { duration: 10 + i * 2, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, delay: i * 0.5 } }}
        />
      ))}
    </div>
  );
});

const SystemLog = memo(() => {
  const [logs, setLogs] = useState(["> INITIALIZING BIO-LINK...", "> NEURAL MAPPING COMPLETE", "> OPTIMIZING METABOLIC FLOW"]);
  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = ["> ANALYZING NUTRIENT DENSITY...", "> CALIBRATING AI VISION...", "> SYNCING BIOMETRIC DATA...", "> ENERGY LEVELS: OPTIMAL", "> PROTEIN SYNTHESIS: MAXIMIZED"];
      setLogs(prev => [...prev.slice(1), newLogs[Math.floor(Math.random() * newLogs.length)]]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="system-log-v2">
      {logs.map((log, i) => (
        <motion.p key={log + i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="log-line">{log}</motion.p>
      ))}
    </div>
  );
});

const Magnetic = memo(({ children }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  };
  const reset = () => setPosition({ x: 0, y: 0 });
  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={reset} animate={{ x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}>
      {children}
    </motion.div>
  );
});

const ChromaticFilter = memo(({ distortionAmount }) => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <filter id="chromaticAberration">
        <feOffset in="SourceGraphic" dx={distortionAmount} dy="0" result="red" />
        <feComponentTransfer in="red" result="redOnly">
          <feFuncR type="identity" />
          <feFuncG type="table" tableValues="0 0" />
          <feFuncB type="table" tableValues="0 0" />
        </feComponentTransfer>
        
        <feOffset in="SourceGraphic" dx={useTransform(distortionAmount, (v) => -v)} dy="0" result="blue" />
        <feComponentTransfer in="blue" result="blueOnly">
          <feFuncR type="table" tableValues="0 0" />
          <feFuncG type="table" tableValues="0 0" />
          <feFuncB type="identity" />
        </feComponentTransfer>

        <feBlend in="redOnly" in2="blueOnly" mode="screen" result="colorShift" />
        <feBlend in="colorShift" in2="SourceGraphic" mode="screen" />
      </filter>
    </svg>
  );
});

const VelocityMarquee = memo(({ children, baseVelocity = 100 }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 400, damping: 50 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${((((v - (-20)) % (-25)) + (-25)) % (-25)) + (-20)}%`);
  const directionFactor = useRef(1);
  
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    const vFactor = velocityFactor.get();
    if (vFactor < 0) directionFactor.current = -1;
    else if (vFactor > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * vFactor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax-marquee">
      <motion.div className="scroller" style={{ x }}>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
});

const chartData = [
  { time: '08:00', metabolic: 65, energy: 40 },
  { time: '10:00', metabolic: 85, energy: 70 },
  { time: '12:00', metabolic: 70, energy: 90 },
  { time: '14:00', metabolic: 95, energy: 65 },
  { time: '16:00', metabolic: 75, energy: 50 },
  { time: '18:00', metabolic: 90, energy: 85 },
];

function HomePage() {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('neural-preloader-shown');
  });

  const finishLoading = useMemo(() => () => {
    setIsLoading(false);
    sessionStorage.setItem('neural-preloader-shown', 'true');
  }, []);

  const { scrollYProgress } = useScroll();
  
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const floatAnim = useMemo(() => ({ y: [0, -15, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } }), []);

  // AI-Vision Mouse Tracker
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <AnimatePresence>
        {isLoading && <NeuralPreloader finishLoading={() => setIsLoading(false)} />}
      </AnimatePresence>

      <CustomCursor />
      <CircadianHUD />
      
      <motion.div 
        className="home-page-wrapper"
      >
        <div className="grain-overlay" />
        <BioTechBackground />
        <DataDebris />

        {/* 1. Hero Section - HYPER-DATA-DRIVEN */}
        <section className="hero-section-v4">
          <div className="hero-grid-overlay" />
          <motion.div 
            className="hero-content-container"
            style={{ y: heroY, opacity: heroOpacity }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1, 
                transition: { 
                  staggerChildren: 0.15, 
                  delayChildren: 0.4,
                  ease: [0.23, 1, 0.32, 1] 
                } 
              }
            }}
          >
            <div className="hud-snippet top-left">COORD_X: 42.10</div>
            <div className="hud-snippet bottom-right">RE-SYNC: ACTIVE</div>

            <motion.div 
              className="floating-stat heart-stat interactive" 
              animate={floatAnim}
              variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
            >
              <Heart size={20} fill="#ef4444" color="#ef4444" />
              <span>72 BPM</span>
            </motion.div>
            <motion.div 
              className="floating-stat brain-stat interactive" 
              animate={{ ...floatAnim, transition: { ...floatAnim.transition, delay: 1 } }}
              variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
            >
              <Brain size={20} color="#8b5cf6" />
              <span>FOCUS: MAX</span>
            </motion.div>

            <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
              <div className='aura-badge interactive neon-border'>
                <Activity size={14} className="pulse-icon" />
                <span>NEURAL-NUTRITION PROTOCOL v5.0</span>
              </div>
            </motion.div>

            <motion.h1 
              className="hero-giant-text-v2" 
              variants={{ 
                hidden: { y: 60, opacity: 0, skewY: 5 }, 
                visible: { y: 0, opacity: 1, skewY: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } } 
              }}
            >
              UPGRADE <br />
              <span className='glitch-text-v2' data-text="BIOLOGY.">YOUR <span className='text-outline-v2 biology-hover-glow'>BIOLOGY.</span></span>
            </motion.h1>

            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <SystemLog />
            </motion.div>

            <motion.div 
              className="hero-buttons" 
              variants={{ hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { delay: 0.2 } } }}
            >
              <Magnetic>
                <NavLink to="/signup" className="btn-cyber-pill btn-primary-glow interactive">
                  <span className="btn-text">Initialize Access</span>
                  <div className="btn-icon-wrapper"><ArrowRight size={18} /></div>
                  <div className="btn-glare" />
                </NavLink>
              </Magnetic>
              <Magnetic>
                <NavLink to="/services" className="btn-cyber-pill btn-secondary-ghost interactive">
                  <span className="btn-text">View Science</span>
                  <div className="btn-icon-wrapper"><Cpu size={18} /></div>
                </NavLink>
              </Magnetic>
            </motion.div>

            <BioCore />
          </motion.div>
          
          <div className="hero-bottom-glow-v2" />
        </section>

        {/* 2. Seamless Marquee Section */}
        <div className="marquee-wrapper-v3">
          <VelocityMarquee baseVelocity={-1.5}>
            <span className="marquee-item-v3"><Zap size={20} /> FUTURE OF FUEL • </span>
            <span className="marquee-item-v3"><Cpu size={20} /> AI OPTIMIZED • </span>
            <span className="marquee-item-v3"><Terminal size={20} /> NEURAL SYNC • </span>
            <span className="marquee-item-v3"><Sparkles size={20} /> BIO-HACKING • </span>
          </VelocityMarquee>
        </div>

        {/* 3. Bio-Data Command Center */}
        <section className="command-center-section">
          <div className="container">
            <ScrollReveal>
              <div className="dashboard-header">
                <div className="live-tag">LIVE SIMULATION</div>
                <h2 className="tech-heading-v2">BIO-DATA COMMAND</h2>
              </div>
            </ScrollReveal>

            <div className="dashboard-layout">
              <div className="chart-container-v2">
                <div className="chart-header">
                  <h3>Metabolic Velocity (mv/s)</h3>
                  <div className="chart-legend">
                    <span className="legend-item"><div className="dot green" /> Efficiency</span>
                    <span className="legend-item"><div className="dot blue" /> Output</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '15px', backdropFilter: 'blur(10px)' }} />
                    <Area type="monotone" dataKey="metabolic" stroke="#22C55E" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={3} />
                    <Area type="monotone" dataKey="energy" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorBlue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="stats-sidebar">
                {[
                  { label: "Active Cycles", val: "1.2ms", icon: <Cpu size={18}/>, color: "#8b5cf6" },
                  { label: "Sync Status", val: "OPTIONAL", icon: <Zap size={18}/>, color: "#22C55E" },
                  { label: "Neural Load", val: "42%", icon: <Activity size={18}/>, color: "#0ea5e9" }
                ].map((stat, i) => (
                  <ScrollReveal key={i} delay={i * 0.1}>
                    <div className="sidebar-stat-card">
                      <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
                      <div>
                        <p className="stat-label">{stat.label}</p>
                        <p className="stat-val">{stat.val}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Hyper-Grid - WITH AI VISION OVERLAY */}
        <section className="bento-section">
          <div className="container">
            <ScrollReveal>
              <div className="section-head">
                <h2 className="tech-heading">HYPER-GRID MODULES</h2>
              </div>
            </ScrollReveal>

            <div className="hyper-grid">
              {[
                { id: 1, icon: <Fingerprint size={48} />, title: "Unique Bio-ID", desc: "Encrypted profiling based on DNA.", card: "card-1" },
                { id: 2, icon: <Target size={48} />, title: "Precision Targeting", desc: "AI-driven meal timing.", card: "card-2" },
                { id: 3, icon: <Activity size={64} />, title: "Bio-Feedback", desc: "", card: "card-3" },
                { id: 4, icon: null, title: "99.4%", desc: "ACCURACY RATING", card: "card-4" }
              ].map((m, i) => (
                <motion.div 
                  key={m.id} 
                  className={`hyper-card ${m.card}`}
                  whileHover={{ y: -5 }}
                >
                  <div className="hyper-content">
                    {m.icon && <div className="hyper-icon">{m.icon}</div>}
                    <h3>{m.title}</h3>
                    {m.desc && <p>{m.desc}</p>}
                  </div>
                  {/* AI VISION CIRCLE */}
                  <motion.div 
                    className="ai-vision-scanner" 
                    style={{ 
                      left: mouseX, 
                      top: mouseY,
                      translateX: '-50%',
                      translateY: '-50%',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Sticky Section */}
        <section className="sticky-reveal-section-v2">
          <div className="container">
            <div className="sticky-content-v2">
              <ScrollReveal direction="left">
                <div className="sticky-text-block-v2">
                  <span className="step-count-v2">01 / NEURAL TRACKING</span>
                  <h2>Beyond <br /> Numbers.</h2>
                  <p>We visualize the soul of your nutrition. Macro-density, vitamin-flow, and metabolic-velocity.</p>
                  <div className="feature-pulse-list">
                    <div className="pulse-item"><div className="dot" /> AI Ingredient DNA</div>
                    <div className="pulse-item"><div className="dot" /> Bio-Bio Availability</div>
                    <div className="pulse-item"><div className="dot" /> Longevity Insights</div>
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="right" delay={0.2}>
                <div className="glass-panel-v2">
                  <div className="data-rings">
                    <div className="ring ring-1" />
                    <div className="ring ring-2" />
                    <div className="ring ring-3" />
                  </div>
                  <div className="visual-graph-v2">
                    {[80, 60, 95, 40, 75].map((h, i) => (
                      <motion.div 
                        key={i} 
                        className="graph-bar-v2" 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1, type: "spring" }}
                      />
                    ))}
                  </div>
                  <div className="panel-scan-effect" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* 6. Vibe Testimonial */}
        <section className="testimonial-v4">
          <div className="container">
            <ScrollReveal scale={0.95}>
              <div className="vibe-card">
                <div className="vibe-avatar-ring">
                  <div className="vibe-avatar" />
                </div>
                <Quote size={40} className="q-icon-v2" />
                <h3>"This is the first platform that actually gets it. It's not a diet tracker; it's a lifestyle OS."</h3>
                <div className="user-info-v2">
                  <p className="p-name">Maya R.</p>
                  <p className="p-title">Bio-Hacker & Designer</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="cta-v4">
          <div className="container">
            <ScrollReveal direction="up">
              <div className="explosive-card interactive">
                <div className="mesh-gradient-overlay" />
                <h2 className="glow-text">READY TO <br /> OPTIMIZE?</h2>
                <div className="cta-actions">
                  <Magnetic>
                    <NavLink to="/signup" className="btn-modern btn-black interactive">
                      JOIN THE NETWORK
                    </NavLink>
                  </Magnetic>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </motion.div>
      <Footer />
    </div>
  );
}

export default HomePage;



