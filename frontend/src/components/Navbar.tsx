'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Terminal, Key, Menu, X, LayoutDashboard, History, Settings } from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { useReviveStore } from '@/store/useReviveStore';

export const Navbar = () => {
  const { openaiKey } = useReviveStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-card border-b border-white/10 px-4 sm:px-6 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Revive<span className="text-purple-400">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Code Recovery Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`hover:text-purple-400 transition-colors ${pathname === l.href ? 'text-purple-400' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* API Key Status Pill */}
            <Link
              href="/settings"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                openaiKey
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              {openaiKey ? 'GPT-4o Active' : 'Zero-Config Mode'}
            </Link>

            {/* Analyze Repo CTA — hidden on very small screens */}
            <Link
              href="/dashboard"
              className="hidden xs:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze Repo</span>
              <span className="sm:hidden">Analyze</span>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-[#0a0d1a] border-l border-white/10 flex flex-col p-6 gap-6 transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-lg">
            Revive<span className="text-purple-400">AI</span>
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono border ${
          openaiKey
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
        }`}>
          <Key className="w-3.5 h-3.5" />
          {openaiKey ? 'GPT-4o Active' : 'Zero-Config Mode'}
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2">
          {navLinks.map((l) => {
            const Icon = l.icon;
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Analyze CTA */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-purple-600/30 mt-auto"
        >
          <Terminal className="w-4 h-4" />
          Analyze Repo
        </Link>
      </aside>
    </>
  );
};
