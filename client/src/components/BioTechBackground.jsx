import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import './BioTechBackground.css';

const BioTechBackground = memo(() => {
  // Generate random positions for "Nodes" (AI/Neural)
  const nodes = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
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
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="bio-blob blob-2"
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 2. Neural Grid (AI - Subtle Tech Grid) */}
      <div className="tech-grid-overlay" />

      {/* 3. Floating Neural Nodes (Using CSS animations for better performance) */}
      <div className="neural-nodes">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="neural-node-css"
            style={{
              width: node.size,
              height: node.size,
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDuration: `${node.duration}s`,
              animationDelay: `${node.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 4. Scanning Line (AI Tracking/Scanning Feel) */}
      <div className="scanning-line-horizontal-css" />
      
      <div className="bg-noise-overlay" />
    </div>
  );
});

export default BioTechBackground;
