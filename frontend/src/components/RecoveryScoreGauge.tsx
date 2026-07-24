'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeProps {
  score: number;
  size?: number;
}

export const RecoveryScoreGauge: React.FC<GaugeProps> = ({ score, size = 180 }) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'stroke-emerald-500 text-emerald-400';
  let glowClass = 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  let scoreLabel = 'High Revivability';

  if (score < 50) {
    colorClass = 'stroke-rose-500 text-rose-400';
    glowClass = 'drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]';
    scoreLabel = 'Critical Tech Debt';
  } else if (score < 75) {
    colorClass = 'stroke-amber-400 text-amber-300';
    glowClass = 'drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]';
    scoreLabel = 'Moderate Effort Required';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Score Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
          className={`${colorClass} ${glowClass}`}
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
          {score}
        </span>
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-1">
          / 100 Score
        </span>
      </div>
      <div className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full border border-white/10 ${colorClass} bg-white/5`}>
        {scoreLabel}
      </div>
    </div>
  );
};
