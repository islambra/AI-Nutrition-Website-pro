import { motion } from 'framer-motion';
import { Hexagon, Cpu, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FoodScanner from '../components/FoodScanner';
import PageTransition from '../components/PageTransition';
import './AITrackerPage.css';

function AITrackerPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="AIT-LoadingScreen">
        <div className="AIT-Spin" style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #eef2f6', borderTopColor: '#22C55E', animation: 'aitSpin 0.8s linear infinite' }} />
        <p>Loading...</p>
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
              <p>Sign in to use the AI Food Scanner.</p>
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
        <div className="AIT-OrganicContainer" />
        <div className="AIT-Container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="AIT-ScannerSection"
          >
            <div className="AIT-Header">
              <h1 className="AIT-Title">
                <span className="AIT-TitleLine">AI Food</span>
                <span className="AIT-TitleGradient">Scanner</span>
              </h1>
              <p className="AIT-Subtitle">
                Upload a photo of your meal and get instant nutritional analysis
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
