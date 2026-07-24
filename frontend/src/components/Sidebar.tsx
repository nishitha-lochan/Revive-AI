'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, Sparkles } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'History', icon: History, href: '/history' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className="hidden md:flex w-64 glass-card border-r border-white/10 flex-col justify-between p-4 min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md shadow-purple-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Badge Card */}
      <div className="p-4 rounded-xl bg-gradient-to-b from-purple-900/30 to-indigo-950/40 border border-purple-500/20 text-center space-y-2">
        <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs font-semibold text-slate-200">AI Recovery Engine</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AI recovery workflow active. Instant automated architecture mapping.
        </p>
      </div>
    </aside>
  );
};
