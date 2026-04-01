import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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

      <style jsx="true">{`
        .biotech-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background-color: #ffffff;
          overflow: hidden;
        }

        .biotech-mesh {
          position: absolute;
          inset: 0;
          filter: blur(100px);
          opacity: 0.4;
        }

        .bio-blob {
          position: absolute;
          border-radius: 50%;
        }

        .blob-1 {
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(52, 199, 89, 0.3) 0%, transparent 70%);
          top: -10%;
          left: -10%;
        }

        .blob-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(0, 122, 255, 0.2) 0%, transparent 70%);
          bottom: 10%;
          right: -5%;
        }

        .tech-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(52, 199, 89, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 199, 89, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        .neural-node {
          position: absolute;
          background: var(--primary-green, #34C759);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(52, 199, 89, 0.5);
          filter: blur(1px);
        }

        .scanning-line-horizontal {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(52, 199, 89, 0.1), transparent);
          box-shadow: 0 0 20px rgba(52, 199, 89, 0.05);
          z-index: 1;
        }

        .bg-noise-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default BioTechBackground;
