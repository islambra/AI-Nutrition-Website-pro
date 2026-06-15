import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 40, text = 'Analyzing...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fs-loading"
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 16, padding: 40
    }}
  >
    <div
      className="fs-spinner"
      style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid #eef2f6`,
        borderTopColor: '#22C55E',
        animation: 'fs-spin 0.8s linear infinite'
      }}
    />
    <span style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{text}</span>
  </motion.div>
);

export default LoadingSpinner;
