import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AnimatedBackground = () => {
  const { scrollYProgress } = useScroll();
  
  // Natural, healthy green palette
  const color1 = useTransform(scrollYProgress, [0, 0.5, 1], ['#DCFCE7', '#BBF7D0', '#86EFAC']); // Soft Sprout Greens
  const color2 = useTransform(scrollYProgress, [0, 0.5, 1], ['#F0FDF4', '#DCFCE7', '#F0FDF4']); 
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);

  return (
    <div className="mesh-bg-container" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="bg-noise-overlay" style={{ opacity: 0.03 }} />
      
      <div className="mesh-gradient-wrapper">
        <motion.div 
          className="mesh-ball"
          style={{ 
            background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`, 
            y: y1,
            width: '1200px',
            height: '1200px',
            left: '-10%',
            top: '-10%',
            position: 'absolute',
            opacity: 0.6,
            filter: 'blur(80px)'
          }}
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="mesh-ball"
          style={{ 
            background: `radial-gradient(circle, #BBF7D0 0%, transparent 70%)`, 
            y: y2,
            width: '1000px',
            height: '1000px',
            right: '-10%',
            bottom: '-10%',
            position: 'absolute',
            opacity: 0.4,
            filter: 'blur(100px)'
          }}
          animate={{ x: [0, -150, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;
