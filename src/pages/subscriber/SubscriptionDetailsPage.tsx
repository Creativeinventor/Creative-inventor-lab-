import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { formatToKolkata, getRemainingDays } from '../../services/dateUtils.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { CalendarClock, AlertTriangle, CheckCircle2, Youtube, ExternalLink, ShieldAlert } from 'lucide-react';

export const SubscriptionDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const rem = user ? getRemainingDays(user.subscriptionExpiry) : 0;
  const isExpiringSoon = rem > 0 && rem <= 7;
  const isExpired = rem <= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-cyan-400" />
          Subscription Access Details
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time verification of your subscriber access duration and renewal guidance.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs text-slate-400">Current Status</div>
            <div className="mt-1">
              <StatusBadge status={user?.status || 'ACTIVE'} />
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Assigned User ID</div>
            <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{user?.userId}</div>
          </div>
        </div>

        {/* Big Countdown Box */}
        <div className={`p-6 rounded-xl border text-center space-y-2 ${
          isExpired
            ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
            : isExpiringSoon
            ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
            : 'bg-slate-950 border-slate-800 text-cyan-400'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isExpired ? 'Access Expired' : 'Remaining Subscription Access'}
          </div>
          <div className="text-4xl font-extrabold font-mono tabular-nums">
            {rem} {rem === 1 ? 'DAY' : 'DAYS'}
          </div>
          <div className="text-xs text-slate-400">
            Valid until: <strong className="text-white">{formatToKolkata(user?.subscriptionExpiry)}</strong>
          </div>
        </div>

        {/* Timestamps in Asia/Kolkata */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-400">Activation Date (IST):</span>
            <span className="font-mono text-white font-medium">
              {formatToKolkata(user?.subscriptionStart)}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-400">Expiry Date (IST):</span>
            <span className="font-mono text-cyan-400 font-bold">
              {formatToKolkata(user?.subscriptionExpiry)}
            </span>
          </div>

          <div className="flex justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
            <span className="text-slate-400">Total Duration Assigned:</span>
            <span className="font-mono text-white">{user?.durationDays || 30} Days</span>
          </div>
        </div>

        {/* Renewal Instructions */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            How to Renew Your Subscription
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Because Creative Inventor operates with <strong>no automated payment gateway</strong>, all extensions are handled manually. To extend your subscription duration:
          </p>
          <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <li>Message the creator on WhatsApp or comment on a YouTube membership post.</li>
            <li>Provide your unique User ID: <strong className="font-mono text-cyan-400">{user?.userId}</strong>.</li>
            <li>Upon manual verification of your renewal, the admin will immediately extend your expiry timestamp without requiring a new account.</li>
          </ol>

          <div className="pt-2">
            <a
              href="https://youtube.com/@creativeinventorlab"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Contact Creator on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
