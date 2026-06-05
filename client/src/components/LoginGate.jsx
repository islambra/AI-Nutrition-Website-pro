import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';
import './LoginGate.css';

const LoginGate = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <div className="logingate-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="logingate-wrapper">
        <div className="logingate-bg-glow" />
        <div className="logingate-card">
          <div className="logingate-icon-box">
            <Shield size={28} color="#2ecc71" />
          </div>

          <h2 className="logingate-title">
            <span className="logingate-title-accent">Authentication</span> Required
          </h2>
          <p className="logingate-subtitle">
            Sign in to access this section. New here? Creating an account takes just a moment.
          </p>

          <div className="logingate-buttons">
            <NavLink to="/login" className="logingate-btn-primary">
              Sign In <ArrowRight size={16} />
            </NavLink>
            <NavLink to="/signup" className="logingate-btn-secondary">
              <Sparkles size={14} /> Create Account
            </NavLink>
          </div>

          <div className="logingate-divider">
            <span className="logingate-divider-line" />
            <span>Why login?</span>
            <span className="logingate-divider-line" />
          </div>

          <div className="logingate-features">
            <div className="logingate-feature">
              <span className="logingate-feature-dot" />
              Personalized nutrition plans &amp; AI tracking
            </div>
            <div className="logingate-feature">
              <span className="logingate-feature-dot" />
              Course materials &amp; progress tracking
            </div>
            <div className="logingate-feature">
              <span className="logingate-feature-dot" />
              Consultations &amp; stay connected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default LoginGate;
