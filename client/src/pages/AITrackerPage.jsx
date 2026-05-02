import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Zap, Activity, Target, Shield, 
  Info, AlertTriangle, Search, ChevronRight, X, 
  CheckCircle2, RefreshCcw, PieChart, Utensils, 
  Flame, Leaf, Sparkles, Fingerprint, Loader2
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import toast from 'react-hot-toast';
import './AITrackerPage.css';

function AITrackerPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

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

    // Simulate AI Processing
    setTimeout(() => {
      const mockResults = {
        foodName: "Grilled Salmon with Asparagus",
        confidence: 98.4,
        calories: 420,
        macros: {
          protein: 45,
          carbs: 12,
          fat: 22
        },
        ingredients: ["Salmon", "Asparagus", "Lemon", "Olive Oil", "Herbs"],
        insight: "High protein, omega-3 rich meal. Excellent for metabolic recovery and cognitive function.",
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

  return (
    <PageTransition>
      <div className="AIT-Wrapper">
        <div className="AIT-OrganicContainer">
          <motion.div 
            animate={{ opacity: [0, 0.1, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="AIT-Floater"
            style={{ top: '15%', left: '5%' }}
          >
            <Zap size={140} strokeWidth={0.5} />
          </motion.div>
        </div>

        <div className="AIT-Container">
          <header className="AIT-Header">
            <ScrollReveal direction="down">
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="AIT-Title">AI <span className="AIT-Highlight">TRACKER</span></h1>
              <p className="AIT-Subtitle">Instant biological breakdown of your nutrition intake via deep learning.</p>
            </ScrollReveal>
          </header>

          <div className="AIT-Grid">
            {/* Analysis Laboratory */}
            <div className="AIT-LabSection">
              <ScrollReveal direction="left" className="AIT-GlassCard">
                <div className="AIT-CardHeader">
                  <div className="AIT-CardTitle">
                    <Camera size={18} />
                    <span>VISUAL INPUT SYSTEM</span>
                  </div>
                  {previewUrl && (
                    <button className="AIT-ResetBtn" onClick={resetTracker}>
                      <RefreshCcw size={14} /> RESET
                    </button>
                  )}
                </div>

                <div className={`AIT-UploadArea ${previewUrl ? 'has-preview' : ''}`}>
                  {!previewUrl ? (
                    <div className="AIT-UploadPrompt" onClick={() => fileInputRef.current.click()}>
                      <div className="AIT-IconCircle">
                        <Upload size={32} />
                      </div>
                      <h3>UPLOAD MEAL VISUAL</h3>
                      <p>Drop your image here or click to browse</p>
                      <span className="AIT-TechDetail">SUPPORTED: JPG, PNG, RAW DATA</span>
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
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                  />
                </div>

                <div className="AIT-ActionWrapper">
                  {!results ? (
                    <button 
                      className={`AIT-ProcessBtn ${isScanning ? 'is-loading' : ''}`}
                      onClick={startScan}
                      disabled={isScanning || !previewUrl}
                    >
                      {isScanning ? (
                        <> <Loader2 size={18} className="AIT-Spin" /> ANALYZING BIOMETRICS </>
                      ) : (
                        <> <Zap size={18} /> INITIALIZE SCAN </>
                      )}
                    </button>
                  ) : (
                    <div className="AIT-StatusDone">
                      <CheckCircle2 size={18} />
                      <span>BIO MAP SYNCHRONIZED</span>
                    </div>
                  )}
                </div>
              </ScrollReveal>

              <ScrollReveal direction="left" delay={0.2} className="AIT-InfoBox">
                <Info size={20} />
                <div>
                  <h4>ENGINE SPECIFICATION</h4>
                  <p>Our neural networks process over 40,000 food data points to deliver 95%+ accuracy in caloric estimation.</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Results Output */}
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
                      <Search size={40} strokeWidth={1} />
                    </div>
                    <h3>WAITING FOR DATA</h3>
                    <p>Provide a visual input to begin biological synthesis.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="AIT-ResultsCard"
                  >
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

                    <div className="AIT-MainMetrics">
                      <div className="AIT-MetricLarge">
                        <Flame size={24} />
                        <div className="m-content">
                          <span className="m-label">ESTIMATED CALORIES</span>
                          <span className="m-value">{results.calories} <span className="m-unit">KCAL</span></span>
                        </div>
                      </div>
                      <div className="AIT-MetricLarge">
                        <Target size={24} />
                        <div className="m-content">
                          <span className="m-label">VITAL SCORE</span>
                          <span className="m-value">{results.healthScore}<span className="m-unit">/100</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="AIT-MacrosGrid">
                      <div className="AIT-MacroItem">
                        <div className="macro-info">
                          <span>PROTEIN</span>
                          <span>{results.macros.protein}g</span>
                        </div>
                        <div className="macro-bar"><motion.div initial={{width: 0}} animate={{width: '75%'}} className="bar-fill protein" /></div>
                      </div>
                      <div className="AIT-MacroItem">
                        <div className="macro-info">
                          <span>CARBS</span>
                          <span>{results.macros.carbs}g</span>
                        </div>
                        <div className="macro-bar"><motion.div initial={{width: 0}} animate={{width: '30%'}} className="bar-fill carbs" /></div>
                      </div>
                      <div className="AIT-MacroItem">
                        <div className="macro-info">
                          <span>FATS</span>
                          <span>{results.macros.fat}g</span>
                        </div>
                        <div className="macro-bar"><motion.div initial={{width: 0}} animate={{width: '50%'}} className="bar-fill fats" /></div>
                      </div>
                    </div>

                    <div className="AIT-IngredientsSection">
                      <h4><Utensils size={14} /> IDENTIFIED COMPONENTS</h4>
                      <div className="AIT-TagCloud">
                        {results.ingredients.map((ing, i) => (
                          <span key={i} className="AIT-Tag">{ing}</span>
                        ))}
                      </div>
                    </div>

                    <div className="AIT-InsightBox">
                      <Sparkles size={18} />
                      <p>{results.insight}</p>
                    </div>

                    <button className="AIT-SaveRecordBtn">
                      <Shield size={16} /> LOG TO VITAL RECORDS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AITrackerPage;
