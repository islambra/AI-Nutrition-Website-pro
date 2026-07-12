import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import './CustomCursor.css';

const LeafNode = ({ x, y }) => (
  <motion.div
    initial={{ scale: 0, rotate: 0, opacity: 0.6 }}
    animate={{ scale: [0, 1, 0], rotate: 45, opacity: 0, y: y + 20 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    className="star-trail-node"
    style={{ left: x, top: y, color: '#34C759' }}
  >
    <Leaf size={14} fill="currentColor" opacity={0.3} />
  </motion.div>
);

const CustomCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 40, stiffness: 400, mass: 0.3 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const [trail, setTrail] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timeouts = new Set();

    const handleMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      if (Math.random() > 0.85) {
        const id = Math.random();
        setTrail(prev => [...prev.slice(-10), { id, x: e.clientX, y: e.clientY }]);
        const tid = setTimeout(() => {
          setTrail(prev => prev.filter(t => t.id !== id));
          timeouts.delete(tid);
        }, 1200);
        timeouts.add(tid);
      }
    };

    const handleOver = (e) => {
      if (e.target.closest('a, button, .hyper-card, .btn-y2k')) setIsHovered(true);
      else setIsHovered(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    return () => {
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <div className="cursor-glass-blob" style={{ left: smoothX, top: smoothY }} />
      
      <AnimatePresence>
        {trail.map(t => <LeafNode key={t.id} x={t.x} y={t.y} />)}
      </AnimatePresence>

      <motion.div
        className="cursor-main-organic"
        style={{ left: smoothX, top: smoothY, x: '-50%', y: '-50%' }}
        animate={{ scale: isHovered ? 1.8 : 1 }}
      >
        <div className="cursor-inner-vitality" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
