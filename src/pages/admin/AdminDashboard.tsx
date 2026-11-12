import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import type { AdminStats, DownloadLog } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import {
  Users,
  UserCheck,
  UserX,
  ShieldBan,
  FolderGit2,
  Download,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  UploadCloud,
  Layers,
  Youtube,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getLogs('downloads')])
      .then(([statsData, logsData]) => {
        setStats(statsData);
        setRecentDownloads(logsData.logs.slice(0, 6) as DownloadLog[]);
      })
      .catch((err) => console.error('Error fetching admin dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Title and Channel Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Administrator Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time subscriber metrics, project files distribution, and security telemetry.
          </p>
        </div>

        <a
          href="https://youtube.com/@creativeinventorlab"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>@creativeinventorlab</span>
          <ExternalLink className="w-3 h-3 text-red-400/80" />
        </a>
      </div>

      {/* Hero Banner with Quick Actions */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="text-xs font-mono font-medium text-cyan-400 tracking-wider">
            MANUAL SUBSCRIBER MANAGEMENT SYSTEM
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            Welcome to the Channel Creator Command Center
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Manage your YouTube channel subscribers, upload proprietary circuit diagrams, firmware, Gerber archives, and selectively assign projects with full audit logging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('/admin/create-user')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/upload-project')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Project</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Subscribers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Manual accounts issued</div>
        </div>

        {/* Active Users */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {stats?.activeUsers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Full download access</div>
        </div>

        {/* Expired Users */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Expired Accounts</span>
            <UserX className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {stats?.expiredUsers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting manual renewal</div>
        </div>

        {/* Disabled Users */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Disabled / Paused</span>
            <ShieldBan className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {stats?.disabledUsers || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Access suspended</div>
        </div>

        {/* Total Projects */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {stats?.totalProjects || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Arduino, ESP32, PCB</div>
        </div>

        {/* Total Downloads */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Downloads</span>
            <Download className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            {stats?.totalDownloads || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified files downloaded</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 md:col-span-2">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Expiring Within 7 Days</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
              {stats?.subscriptionsExpiringSoon || 0}
            </div>
            <button
              onClick={() => onNavigate('/admin/subscriptions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Review & Extend Subscriptions &rarr;
            </button>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Automated reminders queued via Resend</div>
        </div>
      </div>

      {/* Quick Jump Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('/admin/users')}
          className="p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
              User Management
            </div>
            <div className="text-xs text-slate-400">Search, filter, extend, or reset user access</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigate('/admin/assign-projects')}
          className="p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
              Project Assignments
            </div>
            <div className="text-xs text-slate-400">Map specific projects to individual or all users</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={() => onNavigate('/admin/downloads')}
          className="p-5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
              Download Audit History
            </div>
            <div className="text-xs text-slate-400">Audit real-time file access, timestamps & IP logs</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Recent Downloads Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Recent Authorized Downloads</h2>
          <button
            onClick={() => onNavigate('/admin/downloads')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View Full Log &rarr;
          </button>
        </div>

        {recentDownloads.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No downloads recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2 font-medium">User ID / Name</th>
                  <th className="pb-2 font-medium">File Name</th>
                  <th className="pb-2 font-medium">Project</th>
                  <th className="pb-2 font-medium">Timestamp (IST)</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDownloads.map((dl) => (
                  <tr key={dl.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5">
                      <div className="font-mono text-cyan-400 font-semibold">{dl.userCode}</div>
                      <div className="text-slate-400 text-[11px]">{dl.userName}</div>
                    </td>
                    <td className="py-2.5 font-mono text-slate-200">{dl.fileName}</td>
                    <td className="py-2.5 text-slate-400 max-w-[200px] truncate">{dl.projectTitle}</td>
                    <td className="py-2.5 font-mono text-slate-400 tabular-nums">
                      {formatToKolkata(dl.timestamp)}
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      <span className={dl.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {dl.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
