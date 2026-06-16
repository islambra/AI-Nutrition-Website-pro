import { motion } from 'framer-motion';
import { Hexagon, Cpu, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FoodScanner from '../components/FoodScanner';
import PageTransition from '../components/PageTransition';
import BioTechBackground from '../components/BioTechBackground';
import './AITrackerPage.css';

function AITrackerPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="AIT-LoadingScreen">
        <div className="AIT-LoadingSpinner" />
        <p>Loading AI Tools...</p>
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

export default AITrackerPage;
