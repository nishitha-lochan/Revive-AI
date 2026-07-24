'use client';

import React from 'react';
import { FileText, Download, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import { ProjectData } from '@/lib/api';

export const ReportsTab: React.FC<{ project: ProjectData }> = ({ project }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.repo_name}_revive_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMD = () => {
    const content = `# Revive AI Executive Audit Report: ${project.owner}/${project.repo_name}

## Executive Summary
- **Repository**: ${project.repo_url}
- **Framework**: ${project.framework}
- **AI Recovery Score**: ${project.recovery_score} / 100
- **Primary Language**: ${project.primary_language}
- **Status**: ${project.status}

## Summary Diagnosis
${project.summary || 'Deep analysis performed by Revive AI multi-agent workflow.'}

## Technical Stack
${project.tech_stack ? project.tech_stack.map(s => `- ${s}`).join('\n') : '- TypeScript/FastAPI'}

## Recovery Tasks
${project.tasks ? project.tasks.map(t => `- [${t.is_completed ? 'x' : ' '}] Week ${t.week}: ${t.title} (${t.priority} Priority, ${t.estimated_hours}h)`).join('\n') : ''}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.repo_name}_revive_report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            Executive Audit & Recovery Report
          </h3>
          <p className="text-xs text-slate-400">
            Export comprehensive analysis report in PDF, Markdown, or JSON formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-purple-400" />
            Print / Export PDF
          </button>
          <button
            onClick={handleDownloadMD}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20"
          >
            <Download className="w-4 h-4" />
            Download Markdown
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-card rounded-2xl p-8 border border-white/10 bg-slate-950/90 space-y-6 text-slate-200 print:bg-white print:text-black">
        <div className="flex items-center justify-between border-b border-white/10 pb-6 print:border-black">
          <div>
            <div className="text-xs uppercase tracking-widest text-purple-400 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Official Revive AI Audit Report
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1 print:text-black">
              {project.owner} / {project.repo_name}
            </h2>
            <div className="text-xs text-slate-400 mt-1 font-mono">{project.repo_url}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black font-mono text-purple-400 print:text-black">
              {project.recovery_score}/100
            </div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Recovery Score</div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono print:text-black">
            1. Executive Diagnosis
          </h4>
          <p className="text-xs leading-relaxed text-slate-300 print:text-black">
            {project.summary || 'The repository exhibits high potential for recovery. Key dependencies require updates and unit test coverage should be expanded.'}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono print:text-black">
            2. Tech Stack & Framework Analysis
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono">
              Framework: {project.framework}
            </span>
            <span className="px-3 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              Language: {project.primary_language}
            </span>
            {project.tech_stack?.map((st, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                {st}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono print:text-black">
            3. Key Milestones Summary
          </h4>
          <div className="space-y-2">
            {project.tasks?.map((t, idx) => (
              <div key={idx} className="text-xs p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                <span>Week {t.week}: {t.title}</span>
                <span className="font-mono text-purple-400">{t.priority} Priority ({t.estimated_hours}h)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
