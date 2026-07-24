'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Loader2, GitBranch, Cpu, FileSearch, ShieldCheck, Layers } from 'lucide-react';

interface ProgressModalProps {
  isOpen: boolean;
  step: number;
  statusText: string;
}

export const AnalysisProgressModal: React.FC<ProgressModalProps> = ({ isOpen, step, statusText }) => {
  if (!isOpen) return null;

  const steps = [
    { title: 'Validate Repository URL', icon: GitBranch },
    { title: 'Clone Repository & Parse File Tree', icon: FileSearch },
    { title: 'Detect Framework & Dependencies', icon: Cpu },
    { title: 'AST Code Health & Vulnerability Scan', icon: ShieldCheck },
    { title: 'Multi-Agent AI Reasoning', icon: Layers },
    { title: 'Finalize Recovery Score & Roadmap', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-card rounded-3xl p-8 border border-purple-500/30 glow-purple space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto border border-purple-500/30 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white">Analyzing Repository</h3>
          <p className="text-xs text-slate-400 font-mono">{statusText}</p>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-3.5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isDone = step > idx;
            const isCurrent = step === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-purple-950/50 border-purple-500/50 text-purple-200 shadow-md shadow-purple-500/10'
                    : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 text-xs font-medium">{s.title}</div>
                {isCurrent && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    In Progress
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
