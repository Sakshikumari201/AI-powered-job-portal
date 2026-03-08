import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PageWrapper = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full h-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
