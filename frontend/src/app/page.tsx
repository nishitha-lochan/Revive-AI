'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ArrowRight, Layers, FileCode, Bot, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { AuroraBackground } from '@/components/AuroraBackground';
import { Navbar } from '@/components/Navbar';
import { AnalysisProgressModal } from '@/components/AnalysisProgressModal';
import { analyzeRepository } from '@/lib/api';

export default function LandingPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [statusText, setStatusText] = useState('');

  const sampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/expressjs/express',
    'https://github.com/fastapi/fastapi',
    'https://github.com/vercel/next.js',
  ];

  const handleAnalyze = async (urlToUse?: string) => {
    const targetUrl = urlToUse || repoUrl;
    if (!targetUrl.trim()) return;

    setIsAnalyzing(true);
    setStep(0);
    setStatusText('Validating GitHub URL...');

    try {
      setTimeout(() => { setStep(1); setStatusText('Cloning repository & scanning tree...'); }, 800);
      setTimeout(() => { setStep(2); setStatusText('Detecting framework & tech stack...'); }, 1600);
      setTimeout(() => { setStep(3); setStatusText('Running AST static health scan...'); }, 2400);
      setTimeout(() => { setStep(4); setStatusText('Executing multi-agent LLM reasoning...'); }, 3200);
      setTimeout(() => { setStep(5); setStatusText('Generating recovery score & 4-week roadmap...'); }, 4000);

      const res = await analyzeRepository(targetUrl);

      setTimeout(() => {
        setIsAnalyzing(false);
        router.push(`/projects/${res.project_id}`);
      }, 4800);
    } catch (e: any) {
      setIsAnalyzing(false);
      alert(e.message || 'Analysis failed');
    }
  };

  const features = [
    {
      title: 'Repository Analysis',
      desc: 'Understand any GitHub repository instantly with automated tree scanning & stack detection.',
      icon: Terminal,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Architecture Mapping',
      desc: 'Interactive DAG dependency graphs connecting folders, modules, services, databases, and APIs.',
      icon: Layers,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'AI Recovery Plan',
      desc: 'Generate a 4-week milestone recovery roadmap with difficulty scores, priority levels, and hours.',
      icon: Zap,
      color: 'from-amber-500 to-rose-500',
    },
    {
      title: 'Project Documentation',
      desc: 'Auto-generate missing READMEs, installation guides, architecture specs, and API documentation.',
      icon: FileCode,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Repository RAG Chat',
      desc: 'Ask questions like "Where is login handled?" and receive context-aware answers with file lines.',
      icon: Bot,
      color: 'from-fuchsia-500 to-purple-500',
    },
    {
      title: 'Task & Issue Generator',
      desc: 'Export actionable technical debt items directly to GitHub Issues or Markdown roadmaps.',
      icon: ShieldCheck,
      color: 'from-violet-500 to-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden">
      <AuroraBackground />
      <Navbar />

      <AnalysisProgressModal isOpen={isAnalyzing} step={step} statusText={statusText} />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 space-y-12 sm:space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider glow-purple"
          >
            <Sparkles className="w-3.5 h-3.5" /> Multi-Agent AI Recovery SaaS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            Bring Dead Projects <br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Back To Life
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Found an abandoned GitHub repository? Revive AI understands the codebase, identifies what&apos;s broken, generates a recovery roadmap, and helps developers continue building.
          </motion.p>

          {/* Interactive URL Input Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto space-y-3"
          >
            <div className="glass-card rounded-2xl p-2 border border-purple-500/30 glow-purple flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="pl-3 text-slate-400">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="Paste GitHub Repo URL (e.g. facebook/react)"
                  className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder-slate-500 focus:outline-none min-w-0"
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95"
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Repos */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-slate-400">Try Sample Repos:</span>
              {sampleRepos.map((url, idx) => {
                const repoName = url.split('/').slice(-2).join('/');
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setRepoUrl(url);
                      handleAnalyze(url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-white/10 transition-all font-mono"
                  >
                    {repoName}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Full-Stack AI Recovery Suite</h2>
            <p className="text-xs text-slate-400">Everything needed to resurrect legacy and abandoned open-source projects.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => {
                    const inputEl = document.querySelector('input');
                    if (inputEl) {
                      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      inputEl.focus();
                    }
                  }}
                  className="glass-card rounded-2xl p-6 border border-white/10 glass-card-hover space-y-4 flex flex-col justify-between cursor-pointer transition-all hover:border-purple-500/40"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-0.5 shadow-md`}>
                      <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-purple-400 font-semibold">
                    <span>Try Feature</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Revive AI. Bringing Dead Repositories Back To Life.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/dashboard" className="hover:text-purple-400">Dashboard</Link>
            <Link href="/history" className="hover:text-purple-400">History</Link>
            <Link href="/settings" className="hover:text-purple-400">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
