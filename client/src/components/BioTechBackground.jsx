import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import './BioTechBackground.css';

const BioTechBackground = () => {
  // Generate random positions for "Nodes" (AI/Neural) and "Bio-Cells" (Health/Organic)
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="biotech-bg-container">
      {/* 1. Base Mesh (Health - Soft Greens/Teals) */}
      <div className="biotech-mesh">
        <motion.div 
          className="bio-blob blob-1"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="bio-blob blob-2"
          animate={{ x: [0, -80, 0], y: [0, 120, 0], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 2. Neural Grid (AI - Subtle Tech Grid) */}
      <div className="tech-grid-overlay" />

      {/* 3. Floating Neural Nodes (AI/Tech Feel) */}
      <div className="neural-nodes">
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="neural-node"
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
              y: [0, -30, 0]
            }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* 4. Scanning Line (AI Tracking/Scanning Feel) */}
      <motion.div 
        className="scanning-line-horizontal"
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="bg-noise-overlay" />
    </div>
  );
};

export default BioTechBackground;
