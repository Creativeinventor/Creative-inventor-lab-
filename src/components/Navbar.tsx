import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Youtube, ExternalLink, ShieldAlert, LogOut, User } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, quickSwitchDemo, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <a href="/" className="flex items-center gap-2 tracking-tight text-white font-bold text-lg whitespace-nowrap shrink-0">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 inline-block" />
          <span>Creative Inventor</span>
          <span className="text-xs font-mono font-normal text-cyan-400 tracking-wider ml-1">PORTAL</span>
        </a>
      </div>

      {/* Zone 2: Concise Nav Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
        <a
          href="https://youtube.com/@creativeinventorlab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube Channel</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </nav>

      {/* Zone 3: Account Info & Quick Demo Switch */}
      <div className="flex items-center gap-3 shrink-0">
        {user ? (
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher for fast verification */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-md text-xs">
              <button
                onClick={() => quickSwitchDemo('ADMIN')}
                className={`px-2 py-1 rounded transition-colors ${
                  isAdmin ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Admin View (Rohit)"
              >
                Admin View
              </button>
              <button
                onClick={() => quickSwitchDemo('SUBSCRIBER')}
                className={`px-2 py-1 rounded transition-colors ${
                  !isAdmin ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Subscriber View (Rahul)"
              >
                Subscriber View
              </button>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div className="hidden sm:block">
                <div className="text-xs font-medium text-slate-200">{user.name}</div>
                <div className="text-[11px] font-mono text-cyan-400">{user.userId}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <a
            href="/login"
            className="px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            Portal Sign In
          </a>
        )}
      </div>
    </header>
  );
};
