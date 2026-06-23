import { useState, useEffect, useMemo, memo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useVelocity, useAnimationFrame, AnimatePresence, useMotionValue } from 'framer-motion';
import { Activity, Leaf, ChevronRight, ArrowUpRight, Quote, Users, Target, Dna, BookOpen } from 'lucide-react';
import './HomePage.css';
import ScrollReveal from '../components/ScrollReveal.jsx';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
const HeroFrameItem = ({ img, i, scrollYProgress }) => {
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -200 * img.depth]);
  
  return (
    <motion.div
      className="hero-frame"
      style={{ 
        y: yParallax,
        left: img.xPos,
        top: img.yPos,
        width: img.width,
        height: img.height,
        zIndex: Math.floor(img.depth * 10),
        filter: img.blur,
        opacity: img.opacity
      }}
      initial={{ opacity: 0, scale: 0.9, rotate: img.rotation }}
      animate={{ 
        opacity: img.opacity, 
        scale: 1,
        translateY: [0, 15, 0],
        rotate: [img.rotation, img.rotation + 2, img.rotation]
      }}
      transition={{ 
        opacity: { duration: 1.2, delay: img.delay },
        scale: { duration: 1.2, delay: img.delay },
        translateY: {
          duration: img.duration,
          repeat: Infinity,
          ease: "easeInOut"
        },
        rotate: {
          duration: img.duration * 1.3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.05, zIndex: 100, filter: 'blur(0px)', opacity: 1 }}
    >
      <motion.img 
        src={img.url} 
        alt={`Vitality ${i + 1}`} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  );
};

const HeroScrollFrames = memo(() => {
  const { scrollYProgress } = useScroll();
  
  // High-performance nutritional imagery - reduced to 6 to prevent clutter
  const rawImages = [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1968&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop'
  ];

  const frames = useMemo(() => {
    // Define 6 specific non-overlapping slots
    const slots = [
      { x: 5, y: 10 },  // Top Left
      { x: 12, y: 45 }, // Mid Left
      { x: 6, y: 75 },  // Bottom Left
      { x: 80, y: 15 }, // Top Right
      { x: 72, y: 50 }, // Mid Right
      { x: 82, y: 78 }  // Bottom Right
    ];

    return rawImages.map((url, i) => {
      const slot = slots[i];
      return {
        url,
        xPos: `${slot.x + (Math.random() * 5 - 2.5)}%`,
        yPos: `${slot.y + (Math.random() * 5 - 2.5)}%`,
        width: `${Math.random() * 50 + 200}px`,
        height: `${Math.random() * 50 + 280}px`,
        rotation: Math.random() * 16 - 8,
        duration: 5 + Math.random() * 3,
        delay: i * 0.2,
        depth: 1 + Math.random() * 1.5,
        opacity: 0.9,
        scale: 1
      };
    });
  }, []);

  return (
    <div className="hero-frames-container">
      {frames.map((img, i) => (
        <HeroFrameItem 
          key={i} 
          img={img} 
          i={i} 
          scrollYProgress={scrollYProgress} 
        />
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

function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const reviews = [
    {
      name: "Dr. Elena Vance",
      role: "Neural Surgeon",
      text: "The precision tracking has completely recalibrated my daily performance. Biological optimization at its peak.",
      image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=2070&auto=format&fit=crop"
    },
    {
      name: "Marcus Thorne",
      role: "Bio-Hacker",
      text: "Eliminating the friction of manual logging with AI vision changed everything. It's like having a clinical lab in my pocket.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      name: "Sophia Chen",
      role: "Athlete",
      text: "Finally, a system that understands nutrient density versus just calories. My recovery time has decreased by 40%.",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop"
    },
    {
      name: "James Wilson",
      role: "Executive",
      text: "Managing a high-stress career requires cognitive clarity. This platform ensures my brain is fueled for maximum output.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  const [reviewIndex, setReviewIndex] = useState(0);

  const nextReview = () => setReviewIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <div className="home-page-wrapper">
      <AnimatePresence>
        {isLoading && <HealthPreloader />}
      </AnimatePresence>

      <div className="y2k-gradient-bg" />
      <div className="chrome-grid" />
      <OrganicFloaters />


      {/* 1. HERO: UX REFINEMENT */}
      <section className="hero-section-v4">
        <HeroScrollFrames />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 10, maxWidth: '1000px' }}
        >
          
          <h1 className="hero-giant-text-v2">
            FUEL YOUR <br /> VITALITY
          </h1>
          <p className="hero-subtitle-v2">
            Precision nutrition tailored to your biology,<br />Unlock peak health through science & tracking.
          </p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <NavLink to="/signup" className="btn-y2k btn-y2k-primary">
              Start Assessment <ArrowUpRight size={20} />
            </NavLink>
            <NavLink to="/services" className="btn-y2k btn-y2k-glass">
              Our Science <Dna size={20} />
            </NavLink>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. VELOCITY MARQUEE */}
      <VelocityMarquee>
        ✦ EXPERT GUIDANCE ✦ BIOLOGICAL PRECISION ✦ CLINICAL TRACKING ✦ PEAK VITALITY ✦ ORGANIC GROWTH ✦
      </VelocityMarquee>

      {/* 3. FEATURES */}
      <section className="HP-Features-Section">
        <div className="HP-Section-Header">
          <ScrollReveal>
            <h2 className="HP-Section-Title">EVERYTHING YOU <span className="HP-Accent-Text">NEED</span></h2>
            <p className="HP-Section-Subtitle">A complete platform for nutrition education, meal planning, and health tracking.</p>
          </ScrollReveal>
        </div>

        <div className="HP-Features-Grid">
          <ScrollReveal className="HP-Feature-Card">
            <div className="HP-Feature-Icon"><BookOpen size={28} /></div>
            <h3>Course Library</h3>
            <p>Access structured nutrition courses organized by level and semester. Learn at your own pace with downloadable materials.</p>
          </ScrollReveal>

          <ScrollReveal className="HP-Feature-Card">
            <div className="HP-Feature-Icon"><Target size={28} /></div>
            <h3>Personalized Plans</h3>
            <p>Get custom meal plans tailored to your goals — weight loss, muscle gain, diabetes management, and more.</p>
          </ScrollReveal>

          <ScrollReveal className="HP-Feature-Card">
            <div className="HP-Feature-Icon"><Activity size={28} /></div>
            <h3>AI Tracking</h3>
            <p>Snap a photo of your meal and let our AI analyze macros, calories, and nutrients in real time.</p>
          </ScrollReveal>

          <ScrollReveal className="HP-Feature-Card">
            <div className="HP-Feature-Icon"><Users size={28} /></div>
            <h3>Expert Consultations</h3>
            <p>Connect with certified dietitians for one-on-one guidance and follow-up support.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. REVIEWS: BIOLOGICAL TESTIMONIALS */}
      <section className="HP-Reviews-Section">
        <div className="HP-Section-Header">
          <ScrollReveal>
            <h2 className="HP-Section-Title">BIOLOGICAL <span className="HP-Accent-Text">REPORTS</span></h2>
            <p className="HP-Section-Subtitle">Real-world results from our global community of health optimizers.</p>
          </ScrollReveal>
        </div>

        <div className="HP-Reviews-Slider-Container">
          <div className="HP-Reviews-Track">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="HP-Review-Slide"
              >
                <div className="HP-Review-Card slider-mode">
                  <Quote className="HP-Review-Quote" size={60} />
                  <p className="HP-Review-Text">"{reviews[reviewIndex].text}"</p>
                  <div className="HP-Review-User">
                    <img src={reviews[reviewIndex].image} alt={reviews[reviewIndex].name} className="HP-Review-Avatar" />
                    <div>
                      <h4>{reviews[reviewIndex].name}</h4>
                      <p>{reviews[reviewIndex].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="HP-Reviews-Dots">
            {reviews.map((_, i) => (
              <div 
                key={i} 
                className={`HP-Review-Dot ${i === reviewIndex ? 'active' : ''}`}
                onClick={() => setReviewIndex(i)}
              />
            ))}
          </div>

          <div className="HP-Reviews-Controls" style={{ marginTop: '40px', justifyContent: 'center' }}>
            <button onClick={prevReview} className="HP-Review-NavBtn"><ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /></button>
            <button onClick={nextReview} className="HP-Review-NavBtn"><ChevronRight size={24} /></button>
          </div>
        </div>
      </section>

      {/* 5. THE CORE CTA */}
      <section className="cta-v5">
        <ScrollReveal scale={0.95}>
          <div className="hyper-card" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', padding: '120px 40px', borderRadius: '80px', background: '#fff' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 900, marginBottom: '40px', color: '#1E3F1B', letterSpacing: '-0.04em' }}>
              RECLAIM YOUR <br /> VITALITY
            </h2>
            <NavLink to="/signup" className="btn-y2k btn-y2k-primary" style={{ margin: '0 auto', padding: '24px 64px' }}>
              Join the Movement
            </NavLink>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}

export default HomePage;
