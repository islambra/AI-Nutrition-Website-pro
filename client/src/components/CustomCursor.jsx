import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Outer ring follows with a slight spring delay for a "fluid" feel
  const springConfig = { damping: 20, stiffness: 250, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .interactive, .hyper-card, .btn-cyber-pill')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="cursor-ring"
        style={{ 
          left: ringX, 
          top: ringY, 
          x: '-50%', 
          y: '-50%' 
        }}
        animate={{
          scale: isClicking ? 0.5 : isHovered ? 1.8 : 1,
          borderColor: isHovered ? '#22C55E' : 'rgba(15, 23, 42, 0.2)',
          borderWidth: isHovered ? '1px' : '1.5px',
        }}
      />
      {/* Center Dot */}
      <motion.div
        className="cursor-dot-main"
        style={{ 
          left: cursorX, 
          top: cursorY, 
          x: '-50%', 
          y: '-50%'
        }}
        animate={{
          scale: isClicking ? 1.5 : isHovered ? 0.4 : 1,
          backgroundColor: isHovered ? '#22C55E' : '#0F172A'
        }}
      />
    </>
  );
};

export default CustomCursor;
