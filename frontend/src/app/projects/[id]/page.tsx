'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  Calendar,
  Layers,
  Bot,
  FileText,
  Activity,
  Download,
  ArrowLeft,
  Sparkles,
  Star,
  GitFork,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Square,
  CheckSquare,
  Clock,
  Code2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuroraBackground } from '@/components/AuroraBackground';
import { RecoveryScoreGauge } from '@/components/RecoveryScoreGauge';
import { ArchitectureVisualizer } from '@/components/ArchitectureVisualizer';
import { RoadmapTab } from '@/components/RoadmapTab';
import { RepoChatTab } from '@/components/RepoChatTab';
import { DocumentationTab } from '@/components/DocumentationTab';
import { CodeHealthTab } from '@/components/CodeHealthTab';
import { ReportsTab } from '@/components/ReportsTab';
import { fetchProjectDetails, ProjectData } from '@/lib/api';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params?.id);

  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    if (!projectId) return;
    setLoading(true);
    const data = await fetchProjectDetails(projectId);
    setProject(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDetails();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center items-center">
        <AuroraBackground />
        <div className="text-purple-400 font-mono text-sm animate-pulse">Loading Repository Recovery Workspace...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center items-center space-y-4">
        <AuroraBackground />
        <div className="text-white text-lg font-bold">Project Not Found</div>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FolderGit2 },
    { key: 'roadmap', label: 'Recovery Roadmap', icon: Calendar },
    { key: 'architecture', label: 'Architecture Graph', icon: Layers },
    { key: 'chat', label: 'Repo Assistant Chat', icon: Bot },
    { key: 'docs', label: 'Documentation', icon: FileText },
    { key: 'health', label: 'Code Health', icon: Activity },
    { key: 'reports', label: 'Executive Reports', icon: Download },
  ];

  return (
    <div className="min-h-screen relative flex flex-col">
      <AuroraBackground />
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto min-w-0">
          {/* Top Breadcrumb & Repo Header */}
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>

            <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono text-slate-400 truncate">{project.owner}</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300">
                    {project.framework}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{project.repo_name}</h1>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono truncate max-w-full"
                >
                  <span className="truncate">{project.repo_url}</span> <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>

              {/* Recovery Score Compact Card */}
              <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 flex-shrink-0">
                <RecoveryScoreGauge score={project.recovery_score || 75} size={90} />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">Revive AI Verdict</div>
                  <p className="text-slate-400 text-[11px] max-w-[160px] leading-relaxed">
                    Repository analyzed by 5 AI agents. Ready for recovery execution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Workspace Tabs — horizontally scrollable on mobile */}
          <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-md shadow-purple-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Workspace Tab Contents */}
          <div className="pt-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Summary & Diagnosis */}
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Executive Diagnosis & Summary
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {project.summary ||
                        'Full-stack application codebase requiring dependency updates, documentation completion, and test suite expansion.'}
                    </p>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        Detected Tech Stack
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.map((st, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-xs font-mono"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Health Breakdown Overview */}
                  <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Health Metrics
                    </h3>
                    <div className="space-y-3 text-xs">
                      {Object.entries(project.health_metrics || { documentation: 75, testing: 45, maintainability: 72 }).map(
                        ([key, val]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between font-semibold capitalize text-slate-300">
                              <span>{key}</span>
                              <span className="font-mono text-purple-400">{val}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-purple-500" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Priority Tasks Preview */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Immediate Milestone Priorities
                    </h3>
                    <button
                      onClick={() => setActiveTab('roadmap')}
                      className="text-xs text-purple-400 hover:underline font-semibold"
                    >
                      View All {project.tasks?.length || 0} Tasks →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.tasks?.slice(0, 4).map((t) => (
                      <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">Week {t.week}: {t.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                            {t.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTab tasks={project.tasks || []} onTaskUpdated={loadDetails} />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureVisualizer
                graph={project.architecture || { nodes: [], links: [] }}
              />
            )}

            {activeTab === 'chat' && (
              <RepoChatTab projectId={project.id} initialChats={project.chats} />
            )}

            {activeTab === 'docs' && (
              <DocumentationTab docs={project.docs || {}} />
            )}

            {activeTab === 'health' && (
              <CodeHealthTab
                metrics={project.health_metrics}
                recoveryScore={project.recovery_score || 75}
              />
            )}

            {activeTab === 'reports' && <ReportsTab project={project} />}
          </div>
        </main>
      </div>
    </div>
  );
}
