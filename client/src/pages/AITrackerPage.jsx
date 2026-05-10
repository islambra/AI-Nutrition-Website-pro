// pages/AITrackerPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Upload, Zap, Activity, Target, Shield,
  Info, Search, ChevronRight, X,
  CheckCircle2, RefreshCcw, Utensils,
  Flame, Leaf, Sparkles, Loader2,
  Lock, CreditCard, LogIn, Hexagon, Cpu, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkAiAccess, buyAiAccess } from '../api/aiApi';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import toast from 'react-hot-toast';
import './AITrackerPage.css';

function AITrackerPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  // AI access states
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardInfo, setCardInfo] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        verifyAccess();
      } else {
        setCheckingAccess(false);
      }
    }
  }, [authLoading, isAuthenticated]);

  const verifyAccess = async () => {
    try {
      setCheckingAccess(true);
      const res = await checkAiAccess();
      setHasAccess(res.hasAccess);
    } catch (err) {
      toast.error('Could not verify AI access');
    } finally {
      setCheckingAccess(false);
    }
  };

  const openCheckout = () => {
    setCardInfo({ cardNumber: '', expiry: '', cvv: '', name: '' });
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!cardInfo.cardNumber || !cardInfo.expiry || !cardInfo.cvv || !cardInfo.name) {
      toast.error('Please fill in all card details');
      return;
    }
    setBuying(true);
    try {
      await buyAiAccess('credit_card');
      toast.success('AI Tracker unlocked!');
      setHasAccess(true);
      setShowCheckout(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setBuying(false);
    }
  };

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('INVALID FILE TYPE: Please select an image.');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const startScan = () => {
    if (!selectedImage) {
      toast.error('NO VISUAL DATA: Please upload an image first.');
      return;
    }
    setIsScanning(true);
    const loadingToast = toast.loading('Initializing neural analysis...', {
      style: { fontFamily: 'Outfit', fontSize: '12px' }
    });
    setTimeout(() => {
      const mockResults = {
        foodName: "Grilled Salmon with Asparagus",
        confidence: 98.4,
        calories: 420,
        macros: { protein: 45, carbs: 12, fat: 22 },
        ingredients: ["Salmon", "Asparagus", "Lemon", "Olive Oil", "Herbs"],
        insight: "High protein, omega‑3 rich meal. Excellent for metabolic recovery.",
        healthScore: 92
      };
      setResults(mockResults);
      setIsScanning(false);
      toast.dismiss(loadingToast);
      toast.success('ANALYSIS COMPLETE', { icon: '✨' });
    }, 3500);
  };

  const resetTracker = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults(null);
    setIsScanning(false);
  };

  // ---- RENDER LOGIC ----
  if (authLoading || checkingAccess) {
    return (
      <div className="AIT-LoadingScreen">
        <Loader2 size={48} className="AIT-Spin" />
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="AIT-Wrapper">
          <div className="AIT-Container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="AIT-LoginPrompt"
            >
              <div className="AIT-LoginPromptIcon">
                <Hexagon size={80} strokeWidth={1.5} />
                <Cpu size={40} className="AIT-LoginPromptCpu" />
              </div>
              <h2>Authentication Required</h2>
              <p>Unlock the power of AI‑driven nutrition analysis.</p>
              <button className="AIT-PaywallBtn" onClick={() => navigate('/login')}>
                <LogIn size={20} /> Sign In
              </button>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="AIT-Wrapper">
        {/* Futuristic background elements */}
        <div className="AIT-OrganicContainer">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="AIT-Floater"
              animate={{ opacity: [0, 0.15, 0], scale: [1, 1.2, 1], x: i * 20 }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: `${20 + i * 15}%`, left: `${10 + i * 15}%` }}
            >
              <Hexagon size={80 + i * 40} strokeWidth={0.8} />
            </motion.div>
          ))}
        </div>

        <div className="AIT-Container">
          <header className="AIT-Header">
            <ScrollReveal delay={0.1}>
              <h1 className="AIT-Title">
                <span className="AIT-TitleLine">AI</span>
                <span className="AIT-TitleGradient">TRACKER</span>
              </h1>
              <p className="AIT-Subtitle">Next‑generation nutritional intelligence at your fingertips.</p>
            </ScrollReveal>
          </header>

          {!hasAccess ? (
            /* ----- PAYWALL ----- */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="AIT-Paywall"
            >
              <div className="AIT-PaywallContent">
                <div className="AIT-PaywallGlow" />
                <div className="AIT-PaywallIconWrap">
                  <Lock size={48} strokeWidth={1.5} className="AIT-PaywallIcon" />
                </div>
                <h2>Unlock AI Tracker</h2>
                <p>One‑time purchase for unlimited access to advanced food recognition technology.</p>
                <div className="AIT-PriceTag">
                  <span className="AIT-Price">$9.99</span>
                  <span className="AIT-PriceLabel">Lifetime Access</span>
                </div>
                <button className="AIT-PaywallBtn" onClick={openCheckout}>
                  <CreditCard size={22} /> Purchase Now
                </button>
              </div>
            </motion.div>
          ) : (
            /* ----- FULL AI INTERFACE ----- */
            <div className="AIT-Grid">
              {/* Left Panel */}
              <div className="AIT-LabSection">
                <ScrollReveal direction="left" className="AIT-GlassCard">
                  <div className="AIT-CardHeader">
                    <div className="AIT-CardTitle">
                      <Camera size={20} />
                      <span>VISUAL INPUT</span>
                    </div>
                    {previewUrl && (
                      <button className="AIT-ResetBtn" onClick={resetTracker}>
                        <RefreshCcw size={16} /> RESET
                      </button>
                    )}
                  </div>

                  <div className={`AIT-UploadArea ${previewUrl ? 'has-preview' : ''}`}>
                    {!previewUrl ? (
                      <div className="AIT-UploadPrompt" onClick={() => fileInputRef.current.click()}>
                        <div className="AIT-IconCircle">
                          <Upload size={36} />
                        </div>
                        <h3>UPLOAD MEAL IMAGE</h3>
                        <p>Click or drag to select</p>
                        <span className="AIT-TechDetail">JPG, PNG, WEBP</span>
                      </div>
                    ) : (
                      <div className="AIT-PreviewContainer">
                        <img src={previewUrl} alt="Meal Preview" className="AIT-MainPreview" />
                        {isScanning && (
                          <motion.div
                            initial={{ top: '-10%' }}
                            animate={{ top: '110%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="AIT-ScanBar"
                          />
                        )}
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} style={{ display: 'none' }} accept="image/*" />
                  </div>

                  <div className="AIT-ActionWrapper">
                    {!results ? (
                      <button
                        className={`AIT-ProcessBtn ${isScanning ? 'is-loading' : ''}`}
                        onClick={startScan}
                        disabled={isScanning || !previewUrl}
                      >
                        {isScanning ? (
                          <><Loader2 size={20} className="AIT-Spin" /> ANALYZING</>
                        ) : (
                          <><Zap size={20} /> INITIALIZE SCAN</>
                        )}
                      </button>
                    ) : (
                      <div className="AIT-StatusDone">
                        <CheckCircle2 size={20} />
                        <span>ANALYSIS COMPLETE</span>
                      </div>
                    )}
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="left" delay={0.2} className="AIT-InfoBox">
                  <Info size={22} />
                  <div>
                    <h4>Deep Learning Engine</h4>
                    <p>40,000+ food items recognized with 95.3% accuracy.</p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Panel – Results */}
              <div className="AIT-ResultsSection">
                <AnimatePresence mode="wait">
                  {!results ? (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="AIT-WaitingState"
                    >
                      <div className="AIT-PulseIcon">
                        <Search size={48} strokeWidth={1.5} />
                      </div>
                      <h3>WAITING FOR INPUT</h3>
                      <p>Upload an image to begin analysis.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="AIT-ResultsCard"
                    >
                      {/* Header */}
                      <div className="AIT-ResultHeader">
                        <div>
                          <span className="AIT-Category">DETECTION RESULT</span>
                          <h2 className="AIT-FoodName">{results.foodName}</h2>
                        </div>
                        <div className="AIT-Confidence">
                          <span className="c-label">CONFIDENCE</span>
                          <span className="c-value">{results.confidence}%</span>
                        </div>
                      </div>

                      {/* Main Metrics */}
                      <div className="AIT-MainMetrics">
                        <div className="AIT-MetricLarge">
                          <Flame size={28} />
                          <div className="m-content">
                            <span className="m-label">CALORIES</span>
                            <span className="m-value">{results.calories} <span className="m-unit">kcal</span></span>
                          </div>
                        </div>
                        <div className="AIT-MetricLarge">
                          <Target size={28} />
                          <div className="m-content">
                            <span className="m-label">HEALTH SCORE</span>
                            <span className="m-value">{results.healthScore}<span className="m-unit">/100</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Macros */}
                      <div className="AIT-MacrosGrid">
                        {['protein', 'carbs', 'fat'].map((macro) => (
                          <div className="AIT-MacroItem" key={macro}>
                            <div className="macro-info">
                              <span>{macro.toUpperCase()}</span>
                              <span>{results.macros[macro]}g</span>
                            </div>
                            <div className="macro-bar">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(results.macros[macro], 100)}%` }}
                                className={`bar-fill ${macro}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ingredients */}
                      <div className="AIT-IngredientsSection">
                        <h4><Utensils size={16} /> IDENTIFIED COMPONENTS</h4>
                        <div className="AIT-TagCloud">
                          {results.ingredients.map((ing, i) => (
                            <span key={i} className="AIT-Tag">{ing}</span>
                          ))}
                        </div>
                      </div>

                      {/* Insight */}
                      <div className="AIT-InsightBox">
                        <Sparkles size={20} />
                        <p>{results.insight}</p>
                      </div>

                      <button className="AIT-SaveRecordBtn">
                        <Shield size={18} /> ADD TO DIARY
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* CHECKOUT MODAL */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              className="AIT-ModalOverlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
            >
              <motion.div
                className="AIT-CheckoutModal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="AIT-CheckoutClose" onClick={() => setShowCheckout(false)}>
                  <X size={20} />
                </button>
                <h2>Complete Purchase</h2>
                <p className="AIT-CheckoutPrice">$9.99</p>
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="AIT-FormGroup">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="John Doe" value={cardInfo.name}
                      onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })} required />
                  </div>
                  <div className="AIT-FormGroup">
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength="19" value={cardInfo.cardNumber}
                      onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })} required />
                  </div>
                  <div className="AIT-FormRow">
                    <div className="AIT-FormGroup">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" maxLength="5" value={cardInfo.expiry}
                        onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })} required />
                    </div>
                    <div className="AIT-FormGroup">
                      <label>CVV</label>
                      <input type="text" placeholder="123" maxLength="3" value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="AIT-CheckoutBtn" disabled={buying}>
                    {buying ? (
                      <><Loader2 size={18} className="AIT-Spin" /> Processing…</>
                    ) : (
                      <><CreditCard size={18} /> Pay $9.99</>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default AITrackerPage;