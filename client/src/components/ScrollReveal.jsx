import { motion } from 'framer-motion';

const ScrollReveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: directions[direction]?.y || 0, 
        x: directions[direction]?.x || 0 
      }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
