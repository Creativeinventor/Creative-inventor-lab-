import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import type { Project } from '../../types/index.js';
import { formatToKolkata, getRemainingDays } from '../../services/dateUtils.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { ProjectCard } from '../../components/ProjectCard.js';
import {
  FolderCheck,
  Download,
  Calendar,
  Clock,
  Youtube,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface SubscriberDashboardProps {
  onNavigate: (path: string) => void;
  onSelectProject: (project: Project) => void;
}

export const SubscriberDashboard: React.FC<SubscriberDashboardProps> = ({
  onNavigate,
  onSelectProject,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSubscriberProjects()
      .then((res) => setProjects(res.projects))
      .catch((err) => console.error('Failed to load subscriber projects:', err))
      .finally(() => setLoading(false));
  }, []);

  const remainingDays = user ? getRemainingDays(user.subscriptionExpiry) : 0;
  const isExpiringSoon = remainingDays > 0 && remainingDays <= 7;
  const isExpired = remainingDays <= 0;

  return (
    <div className="space-y-8">
      {/* Expiry Warning Callout if needed */}
      {isExpiringSoon && (
        <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between gap-4 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your subscription expires in <strong>{remainingDays} days</strong> on{' '}
              {formatToKolkata(user?.subscriptionExpiry, false)}. Contact channel admin on WhatsApp or YouTube to renew without interruption.
            </span>
          </div>
          <button
            onClick={() => onNavigate('/subscription')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded whitespace-nowrap transition-colors"
          >
            Renewal Details
          </button>
        </div>
      )}

      {/* Hero Welcome Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-cyan-400 font-bold tracking-wider">
              SUBSCRIBER ID: {user?.userId}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <StatusBadge status={user?.status || 'ACTIVE'} />
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.name || 'Maker'}!
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Here are the proprietary hardware schematics, PCB Gerbers, and microcontroller firmware assigned to your subscriber account by Creative Inventor.
          </p>
        </div>

        {/* Quick Expiry Counter Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 w-full md:w-auto shrink-0 flex items-center gap-6">
          <div className="space-y-1">
            <div className="text-[11px] font-medium text-slate-400">Subscription Expiry (IST)</div>
            <div className="font-mono text-xs font-semibold text-white">
              {formatToKolkata(user?.subscriptionExpiry, false)}
            </div>
          </div>
          <div className="border-l border-slate-800 pl-6 text-right">
            <div className="text-[11px] font-medium text-slate-400">Days Remaining</div>
            <div className={`text-xl font-bold font-mono tabular-nums ${
              isExpired ? 'text-rose-400' : isExpiringSoon ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {remainingDays}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Available Projects</div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
              {projects.length}
            </div>
          </div>
          <FolderCheck className="w-8 h-8 text-cyan-400/80" />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Subscription Active Since</div>
            <div className="text-sm font-semibold text-white font-mono tabular-nums mt-1">
              {formatToKolkata(user?.subscriptionStart, false)}
            </div>
          </div>
          <Calendar className="w-8 h-8 text-blue-400/80" />
        </div>

        <a
          href="https://youtube.com/@creativeinventorlab"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-xl p-4 flex items-center justify-between transition-colors group"
        >
          <div>
            <div className="text-xs text-slate-400">Official Channel</div>
            <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors mt-1">
              @creativeinventorlab
            </div>
          </div>
          <Youtube className="w-8 h-8 text-red-500" />
        </a>
      </div>

      {/* Assigned Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Your Assigned Projects</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any project to view build instructions and download authorized firmware and Gerber packages.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/my-projects')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <FolderCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No projects currently assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The channel admin has not yet linked any project archives to your account. Please check back shortly or message the creator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onSelect={(p) => onSelectProject(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
