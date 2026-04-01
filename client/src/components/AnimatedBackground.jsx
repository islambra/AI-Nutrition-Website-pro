import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="mesh-bg-container">
      {/* The "Noise" overlay gives it a high-end textured look */}
      <div className="bg-noise-overlay" />
      
      {/* Animated Mesh Gradients */}
      <div className="mesh-gradient-wrapper">
        <motion.div 
          className="mesh-ball mesh-1"
          animate={{
            x: [0, 400, 0],
            y: [0, 200, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="mesh-ball mesh-2"
          animate={{
            x: [0, -300, 0],
            y: [0, 400, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="mesh-ball mesh-3"
          animate={{
            x: [0, 200, 0],
            y: [0, -300, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="mesh-ball mesh-4"
          animate={{
            x: [0, -400, 0],
            y: [0, -200, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default AnimatedBackground;
