import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring physics for that "jelly" feel
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const trailX = useSpring(cursorX, springConfig);
  const trailY = useSpring(cursorY, springConfig);

  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .interactive, .bento-item')) {
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
      {/* Main Dot */}
      <motion.div
        className="cursor-dot-main"
        style={{ x: cursorX, y: cursorY, x: '-50%', y: '-50%' }}
        animate={{
          scale: isClicking ? 0.8 : isHovered ? 1.5 : 1,
          backgroundColor: isHovered ? '#34C759' : '#111'
        }}
      />
      
      {/* The Jelly Trail */}
      <motion.div
        className={`cursor-trail ${isHovered ? 'hovered' : ''}`}
        style={{ 
          x: trailX, 
          y: trailY,
          translateX: '-50%',
          translateY: '-50%'
        }}
        animate={{
          width: isHovered ? 80 : 40,
          height: isHovered ? 80 : 40,
          opacity: isClicking ? 0.5 : 1,
        }}
      />
    </>
  );
};

export default CustomCursor;
