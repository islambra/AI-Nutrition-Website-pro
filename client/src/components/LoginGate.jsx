import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, ArrowRight, Shield } from 'lucide-react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '60px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    maxWidth: '520px',
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '60px 48px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  iconBox: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(46,204,113,0.2), rgba(46,204,113,0.05))',
    border: '1px solid rgba(46,204,113,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: 12,
    letterSpacing: '-0.5px',
  },
  accent: {
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '15px',
    lineHeight: 1.6,
    opacity: 0.6,
    marginBottom: 36,
    maxWidth: '360px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 36px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(46,204,113,0.3)',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 36px',
    borderRadius: '12px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '15px',
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '28px 0',
    opacity: 0.3,
    fontSize: '13px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 4,
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '13px',
    opacity: 0.45,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#2ecc71',
    flexShrink: 0,
  },
};

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
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(46,204,113,0.1)',
          borderTopColor: '#2ecc71',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.bgGlow} />
        <div style={styles.card}>
          <div style={styles.iconBox}>
            <Shield size={32} color="#2ecc71" />
          </div>

          <h2 style={styles.title}>
            <span style={styles.accent}>Authentication</span> Required
          </h2>
          <p style={styles.subtitle}>
            Sign in to your account to access this section. New here? Creating an account takes just a moment.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <NavLink
              to="/login"
              style={styles.btnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(46,204,113,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(46,204,113,0.3)';
              }}
            >
              Sign In <ArrowRight size={18} />
            </NavLink>
            <NavLink
              to="/signup"
              style={styles.btnSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Sparkles size={16} /> Create Account
            </NavLink>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span>why login?</span>
            <span style={styles.dividerLine} />
          </div>

          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureDot} />
              Access personalized nutrition plans and AI tracking
            </div>
            <div style={styles.feature}>
              <span style={styles.featureDot} />
              View your course materials and track progress
            </div>
            <div style={styles.feature}>
              <span style={styles.featureDot} />
              Manage consultations and stay connected
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default LoginGate;
