'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Key, User, Save, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuroraBackground } from '@/components/AuroraBackground';
import { fetchUserProfile, updateUserSettings } from '@/lib/api';
import { useReviveStore } from '@/store/useReviveStore';

export default function SettingsPage() {
  const { setApiKeys } = useReviveStore();
  const [name, setName] = useState('Lead Developer');
  const [openaiKey, setOpenaiKey] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchUserProfile().then((u) => {
      if (u) {
        setName(u.name || 'Lead Developer');
        // Restore key presence in the store so the Navbar shows the correct status.
        // We don't expose the raw key — use a sentinel value so the store knows a key exists.
        if (u.has_openai_key || u.has_github_token) {
          setApiKeys(
            u.has_openai_key ? '••••••••' : '',
            u.has_github_token ? '••••••••' : ''
          );
        }
      }
    });
  }, []);

  const handleSave = async () => {
    await updateUserSettings({
      name,
      openai_key: openaiKey,
      github_token: githubToken,
    });
    setApiKeys(openaiKey, githubToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <AuroraBackground />
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Settings & AI Configurations
            </h1>
            <p className="text-xs text-slate-400">
              Configure OpenAI API keys, GitHub tokens, and developer profile credentials.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 border border-white/10 space-y-6 max-w-2xl">
            {/* Zero Config Callout */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" /> Zero-Config Mode Active Out Of The Box
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Revive AI will function out of the box using specialized local heuristic agents if no API keys are provided. Add your key below to activate live GPT-4o LLM reasoning.
              </p>
            </div>

            {/* Profile Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" /> Developer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Used for live GPT-4o repository chat and reasoning agents.
              </p>
            </div>

            {/* GitHub Personal Access Token */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-cyan-400" /> GitHub Personal Access Token (Optional)
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Required for analyzing private GitHub repositories or bypassing rate limits.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
            >
              {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {saved ? 'Settings Saved!' : 'Save Credentials'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
