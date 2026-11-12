import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { formatToKolkata, getRemainingDays } from '../../services/dateUtils.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { UserCheck, Mail, Calendar, KeyRound, ShieldAlert } from 'lucide-react';

interface MyProfileProps {
  onNavigate: (path: string) => void;
}

export const MyProfile: React.FC<MyProfileProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const rem = user ? getRemainingDays(user.subscriptionExpiry) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          My Subscriber Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your credentials, subscription validity dates, and account status.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="text-base font-bold text-white">{user?.name}</div>
            <div className="text-xs font-mono text-cyan-400 font-semibold">{user?.userId}</div>
          </div>
          <StatusBadge status={user?.status || 'ACTIVE'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <span className="text-slate-400">Registered Email</span>
            <div className="text-white font-medium">{user?.email}</div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <span className="text-slate-400">Account Role</span>
            <div className="text-white font-medium">Verified Subscriber</div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <span className="text-slate-400">Subscription Active Since (IST)</span>
            <div className="text-white font-mono">{formatToKolkata(user?.subscriptionStart, false)}</div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <span className="text-slate-400">Subscription Expiry Date (IST)</span>
            <div className="text-cyan-400 font-mono font-bold">
              {formatToKolkata(user?.subscriptionExpiry, false)}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-400 block">Remaining Access Time</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">
              {rem > 0 ? `${rem} days remaining` : 'Subscription expired'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('/change-password')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Change Password</span>
          </button>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded text-[11px] text-slate-500 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Per the Creative Inventor security policy, subscriber roles and subscription dates can only be modified by the channel administrator.
          </span>
        </div>
      </div>
    </div>
  );
};
