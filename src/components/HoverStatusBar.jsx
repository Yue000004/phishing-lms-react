import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HoverStatusBar = ({ url }) => {
  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-0 left-0 z-[9999] bg-[#f8f9fa] border-t border-r border-gray-300 px-2 py-0.5 text-[11px] text-gray-600 font-sans pointer-events-none max-w-[600px] truncate shadow-sm"
        >
          {url}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HoverStatusBar;
