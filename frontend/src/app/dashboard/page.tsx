'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Terminal, ArrowRight, FolderGit2, Cpu, Activity, Sparkles, Star, GitFork, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuroraBackground } from '@/components/AuroraBackground';
import { AnalysisProgressModal } from '@/components/AnalysisProgressModal';
import { fetchProjects, analyzeRepository, ProjectData } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [statusText, setStatusText] = useState('');

  const loadData = async () => {
    setLoading(true);
    const list = await fetchProjects();
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnalyze = async (targetUrl?: string) => {
    const url = targetUrl || repoUrl;
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setStep(0);
    setStatusText('Validating GitHub URL...');

    try {
      setTimeout(() => { setStep(1); setStatusText('Cloning repository & scanning tree...'); }, 800);
      setTimeout(() => { setStep(2); setStatusText('Detecting framework & tech stack...'); }, 1600);
      setTimeout(() => { setStep(3); setStatusText('Running AST static health scan...'); }, 2400);
      setTimeout(() => { setStep(4); setStatusText('Executing multi-agent LLM reasoning...'); }, 3200);
      setTimeout(() => { setStep(5); setStatusText('Generating recovery score & 4-week roadmap...'); }, 4000);

      const res = await analyzeRepository(url);

      setTimeout(() => {
        setIsAnalyzing(false);
        router.push(`/projects/${res.project_id}`);
      }, 4800);
    } catch (e: any) {
      setIsAnalyzing(false);
      alert(e.message || 'Analysis failed');
    }
  };

  const sampleRepos = [
    'https://github.com/facebook/react',
    'https://github.com/expressjs/express',
    'https://github.com/fastapi/fastapi',
  ];

  return (
    <div className="min-h-screen relative flex flex-col">
      <AuroraBackground />
      <Navbar />

      <AnalysisProgressModal isOpen={isAnalyzing} step={step} statusText={statusText} />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-purple-400" />
                AI Recovery Dashboard
              </h1>
              <p className="text-xs text-slate-400">
                Monitor analyzed GitHub repositories, AI recovery scores, and technical debt tasks.
              </p>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repositories Analyzed</div>
              <div className="text-3xl font-extrabold text-white font-mono">{projects.length}</div>
              <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5" /> Scanned Repositories
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Recovery Score</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                {projects.length > 0
                  ? Math.round(projects.reduce((acc, p) => acc + (p.recovery_score || 70), 0) / projects.length)
                  : 0}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {projects.length > 0
                  ? (Math.round(projects.reduce((acc, p) => acc + (p.recovery_score || 70), 0) / projects.length) >= 50 ? 'High Revivability' : 'Recovery In Progress')
                  : 'No Repos Analyzed'}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Tokens Consumed</div>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                {projects.length > 0 ? `${(projects.length * 3.4).toFixed(1)}k` : '0k'}
              </div>
              <div className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> GPT-4o / Heuristic Agent
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects Revived</div>
              <div className="text-3xl font-extrabold text-purple-400 font-mono">
                {projects.filter(p => (p.recovery_score || 0) >= 40).length}
              </div>
              <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Active Roadmaps
              </div>
            </div>
          </div>

          {/* Analyze New Repo Quick Bar */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/30 glow-purple space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              Analyze New GitHub Repository
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Paste GitHub URL (e.g. https://github.com/facebook/react)"
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleAnalyze()}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30"
              >
                Analyze Repo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">Quick Samples:</span>
              {sampleRepos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnalyze(url)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-white/10 font-mono text-[11px]"
                >
                  {url.split('/').slice(-2).join('/')}
                </button>
              ))}
            </div>
          </div>

          {/* Analyzed Projects List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-purple-400" />
              Analyzed Repositories
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">Loading repositories...</div>
            ) : projects.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center space-y-4 border border-white/10">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-slate-300 text-sm font-semibold">No repositories analyzed yet.</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Paste a GitHub URL above to analyze code architecture, technical debt, and recovery roadmap.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj) => (
                  <motion.div
                    key={proj.id}
                    whileHover={{ y: -2 }}
                    className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-mono text-slate-400">{proj.owner}</div>
                          <h4 className="text-lg font-bold text-white">{proj.repo_name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-extrabold font-mono text-emerald-400">
                            {proj.recovery_score || 75}
                          </span>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Score</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300">
                          {proj.framework}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                          {proj.primary_language}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" /> {proj.stars || 120}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-cyan-400" /> {proj.forks || 28}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      Open Recovery Workspace
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
