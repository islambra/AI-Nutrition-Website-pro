import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, AnimatePresence, useMotionValue } from 'framer-motion';
import { Sparkles, Star, Zap, Activity, Heart, Brain, Flame, Share2, MousePointer2, Terminal, Cpu, Target, Fingerprint, Dna, Clock, Eye, Radio, ChevronRight, Crosshair, Hexagon, Leaf, Sun, Wind, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import './HomePage.css';
import Footer from '../components/Footer.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import CustomCursor from '../components/CustomCursor.jsx';

// --- 1. REFRESH PRELOADER ---
const HealthPreloader = memo(() => {
  return (
    <motion.div 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#F9FBF9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: '#2D5A27' }}
      >
        <Leaf size={80} strokeWidth={1.5} />
      </motion.div>
      <div style={{ position: 'absolute', bottom: '10%', fontFamily: 'Outfit', fontSize: '14px', letterSpacing: '0.3em', color: '#2D5A27', fontWeight: 800 }}>
        CALIBRATING VITALITY
      </div>
    </motion.div>
  );
});

// --- 2. HERO SCROLL FRAMES ---
const HeroScrollFrames = memo(() => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -350]);

  const images = [
    { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop', y: y1, delay: 0, floatRange: [-15, 15] },
    { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop', y: y2, delay: 0.2, floatRange: [-20, 20] },
    { url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1968&auto=format&fit=crop', y: y3, delay: 0.4, floatRange: [-10, 10] },
  ];

  return (
    <div className="hero-frames-container">
      {images.map((img, i) => (
        <motion.div
          key={i}
          className={`hero-frame frame-${i + 1}`}
          style={{ y: img.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            translateY: img.floatRange
          }}
          transition={{ 
            opacity: { duration: 1, delay: img.delay },
            scale: { duration: 1, delay: img.delay },
            translateY: {
              duration: 3 + i,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
          whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
        >
          <motion.img 
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
            src={img.url} 
            alt={`Vitality ${i + 1}`} 
          />
        </motion.div>
      ))}
    </div>
  );
});

// --- 3. FLOATING LEAVES (Replaces Starbursts) ---
const OrganicFloaters = memo(() => (
  <>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="starburst"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.4, 0], 
          scale: [0.5, 1, 0.5],
          x: Math.random() * 100 + 'vw',
          y: Math.random() * 100 + 'vh'
        }}
        transition={{ duration: 6 + i, repeat: Infinity, delay: i * 1.5 }}
      >
        <Leaf size={15 + i * 8} />
      </motion.div>
    ))}
  </>
));

const VelocityMarquee = memo(({ children, baseVelocity = -3 }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { stiffness: 400, damping: 50 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${((((v - (-20)) % (-25)) + (-25)) % (-25)) + (-20)}%`);
  
  useAnimationFrame((t, delta) => {
    let moveBy = baseVelocity * (delta / 1000);
    moveBy += moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="marquee-v5">
      <motion.div className="scroller" style={{ x, display: 'flex', whiteSpace: 'nowrap', gap: '50px' }}>
        {[...Array(10)].map((_, i) => <span key={i}>{children}</span>)}
      </motion.div>
    </div>
  );
});

const chartData = [
  { time: '08:00', v: 40 }, { time: '10:00', v: 85 }, { time: '12:00', v: 65 },
  { time: '14:00', v: 95 }, { time: '16:00', v: 75 }, { time: '18:00', v: 90 }, { time: '20:00', v: 50 },
];

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page-wrapper">
      <AnimatePresence>
        {isLoading && <HealthPreloader />}
      </AnimatePresence>

      <div className="y2k-gradient-bg" />
      <div className="chrome-grid" />
      <OrganicFloaters />


      {/* 1. HERO: ORGANIC PRECISION */}
      <section className="hero-section-v4">
        <HeroScrollFrames />
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}
        >
          
          <h1 className="hero-giant-text-v2">
            NATURAL <br /> INTELLIGENCE
          </h1>
          
          <div className="hero-buttons">
            <NavLink to="/signup" className="btn-y2k btn-y2k-primary">
              Start Assessment <ArrowUpRight size={20} />
            </NavLink>
            <NavLink to="/services" className="btn-y2k btn-y2k-glass">
              Our Science <Dna size={20} />
            </NavLink>
          </div>
        </motion.div>
      </section>

      {/* 2. VELOCITY MARQUEE */}
      <VelocityMarquee>
        ✦ CELLULAR HARMONY ✦ NUTRIENT DENSITY ✦ PEAK VITALITY ✦ AI PRECISION ✦ ORGANIC GROWTH ✦
      </VelocityMarquee>

      {/* 3. BENTO: CLEAN ANALYTICS */}
      <section className="bento-section" style={{ position: 'relative', zIndex: 5 }}>
        <div className="hyper-grid">
          <div className="hyper-card c-1">
            <Leaf size={40} color="#2D5A27" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: '#2D5A27' }}>Organic <br /> Analytics</h2>
            <p style={{ marginTop: '20px', fontSize: '18px', color: '#6B7280' }}>Precision nutrition mapped to your unique biological signature.</p>
          </div>
          
          <div className="hyper-card c-2">
            <Activity size={32} color="#34C759" />
            <div style={{ height: '150px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area type="monotone" dataKey="v" stroke="#34C759" strokeWidth={3} fill="#34C759" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="hyper-card c-3" style={{ background: 'linear-gradient(135deg, #2D5A27, #34C759)', color: '#fff' }}>
            <Sun size={40} />
            <h3 style={{ fontSize: '48px', fontWeight: 900, marginTop: '20px' }}>99.4%</h3>
            <p style={{ fontWeight: 600, opacity: 0.9 }}>BIOMETRIC ACCURACY</p>
          </div>

          <div className="hyper-card c-4">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '32px', fontWeight: 900, color: '#2D5A27' }}>VITAL READOUT</h3>
              <Brain size={30} color="#34C759" />
            </div>
            <div style={{ marginTop: '30px', fontFamily: 'Outfit', color: '#2D5A27', fontSize: '14px', background: '#E8F5E9', padding: '20px', borderRadius: '20px' }}>
              {`> TARGET: OPTIMAL HEALTH\n> STATUS: HARMONIZED\n> FUEL: PLANT BASED`}
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI FEATURE: NEURAL RECOGNITION */}
      <section className="HP-AI-Section">
        <div className="HP-AI-Grid">
          <ScrollReveal direction="left" className="HP-AI-TextSide">
            <h2 className="HP-AI-Title">
              AI ASSISTED <br /> CALORIE SYNC
            </h2>
            <p className="HP-AI-Description">
              Our proprietary computer vision model identifies food components and estimates nutritional density with clinical-grade precision. 
              No manual logging. Just pure visual intelligence.
            </p>
            <NavLink to="/ai-tracker" className="btn-y2k btn-y2k-primary">
              Access AI Engine <Zap size={20} />
            </NavLink>
          </ScrollReveal>
          
          <ScrollReveal direction="right">
            <div className="HP-AI-VisualBox">
              <div className="HP-AI-Corner HP-AI-TL" />
              <div className="HP-AI-Corner HP-AI-TR" />
              <div className="HP-AI-Corner HP-AI-BL" />
              <div className="HP-AI-Corner HP-AI-BR" />
              
              <div className="HP-AI-ImageWrapper">
                <img 
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop" 
                  alt="AI Analysis" 
                  className="HP-AI-Image" 
                />
                <div className="HP-AI-ScanContainer">
                  <div className="HP-AI-ScanLine" />
                </div>
              </div>
              
              <div className="HP-AI-Badge">
                <div className="HP-AI-BadgeStatus">ANALYSIS SUCCESS</div>
                <div className="HP-AI-BadgeValue">420 KCAL</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. THE CORE CTA */}
      <section className="cta-v5" style={{ position: 'relative', zIndex: 5 }}>
        <ScrollReveal scale={0.9}>
          <div className="hyper-card" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '100px 40px', borderRadius: '60px', background: '#fff' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(40px, 8vw, 100px)', fontWeight: 900, marginBottom: '40px', color: '#2D5A27' }}>
              RECLAIM <br /> VITALITY
            </h2>
            <NavLink to="/signup" className="btn-y2k btn-y2k-primary" style={{ margin: '0 auto', padding: '24px 64px' }}>
              Join the Movement
            </NavLink>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
