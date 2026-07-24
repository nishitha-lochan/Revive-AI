'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-[#090d16]">
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Primary Aurora Glow Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-900/50 via-indigo-700/40 to-cyan-500/30 blur-[130px]"
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-cyan-600/30 via-violet-800/40 to-fuchsia-900/30 blur-[140px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-40 left-1/3 w-[650px] h-[650px] rounded-full bg-gradient-to-t from-emerald-900/25 via-indigo-950/40 to-purple-900/30 blur-[150px]"
      />
    </div>
  );
};
