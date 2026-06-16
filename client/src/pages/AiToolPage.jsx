import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Cpu, Lock, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkAiToolAccess } from '../api/aiToolApi';
import FoodScanner from '../components/FoodScanner';
import PageTransition from '../components/PageTransition';
import BioTechBackground from '../components/BioTechBackground';
import './AiToolPage.css';

function AiToolPage() {
  const { isAuthenticated, authLoading } = useAuth();
  const navigate = useNavigate();
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      checkAiToolAccess()
        .then(res => setHasAccess(res.hasAccess))
        .catch(() => setHasAccess(false))
        .finally(() => setAccessLoading(false));
    } else if (!authLoading) {
      setAccessLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || accessLoading) {
    return (
      <div className="AIT-LoadingScreen">
        <div className="AIT-LoadingSpinner" />
        <p>Loading AI Scanner...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="AIT-Wrapper">
          <BioTechBackground />
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
              <p>Sign in to access the AI Food Scanner and unlock nutritional insights.</p>
              <button className="AIT-PaywallBtn" onClick={() => navigate('/login')}>
                <LogIn size={20} /> Sign In
              </button>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!hasAccess) {
    return (
      <PageTransition>
        <div className="AIT-Wrapper">
          <BioTechBackground />
          <div className="AIT-Container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="AIT-LoginPrompt"
            >
              <div className="AIT-LoginPromptIcon">
                <Hexagon size={80} strokeWidth={1.5} />
                <Lock size={40} className="AIT-LoginPromptCpu" />
              </div>
              <h2>Subscription Required</h2>
              <p>
                You need an active yearly subscription to access the AI Food Scanner.
              </p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                Subscribe for just <strong>499.99 DZD/year</strong> and unlock instant
                nutritional analysis powered by advanced AI.
              </p>
              <button className="AIT-PaywallBtn" onClick={() => navigate('/checkout/ai-tool')}>
                <Zap size={20} /> Subscribe Now — 499.99 DZD/year
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
        <BioTechBackground />
        <div className="AIT-Container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="AIT-ScannerSection"
          >
            <div className="AIT-Header">
              <h1 className="AIT-Title">
                <span className="AIT-TitleLine">AI Food</span>
                <span className="AIT-TitleGradient">Scanner</span>
              </h1>
              <p className="AIT-Subtitle">
                Upload a photo of your meal and get instant nutritional analysis powered by advanced AI
              </p>
            </div>
            <FoodScanner />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default AiToolPage;
