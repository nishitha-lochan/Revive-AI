'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, ArrowLeft, Clock, Activity, FolderGit2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuroraBackground } from '@/components/AuroraBackground';
import { fetchHistory } from '@/lib/api';

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory().then(setLogs);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col">
      <AuroraBackground />
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-purple-400" />
              Analysis Activity Log
            </h1>
            <p className="text-xs text-slate-400">
              Audit trail of all repository scans, LangGraph agent workflows, and report exports.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                No activity recorded yet. Run a repository analysis from the dashboard.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{log.action}</div>
                        <div className="text-slate-300 mt-0.5">{log.details}</div>
                      </div>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px] shrink-0 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
