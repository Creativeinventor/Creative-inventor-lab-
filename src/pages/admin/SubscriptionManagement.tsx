import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api.js';
import type { UserProfile } from '../../types/index.js';
import { formatToKolkata, getRemainingDays, isExpiringSoon } from '../../services/dateUtils.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { CalendarClock, AlertTriangle, CalendarPlus, Search, CheckCircle2 } from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'EXPIRING_SOON' | 'EXPIRED'>('ALL');
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.users.filter((u) => u.role === 'SUBSCRIBER'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'EXPIRING_SOON') {
        return isExpiringSoon(u.subscriptionExpiry) && u.status === 'ACTIVE';
      }
      if (filterMode === 'EXPIRED') {
        return u.status === 'EXPIRED' || getRemainingDays(u.subscriptionExpiry) <= 0;
      }
      return true;
    });
  }, [users, search, filterMode]);

  const handleQuickExtend = async (uid: string, days: number, userId: string) => {
    try {
      await api.manageUser(uid, 'EXTEND', { additionalDays: days });
      setStatusMsg(`Extended subscription for ${userId} by ${days} days.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-cyan-400" />
          Subscription Life Cycle Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor access expirations, automatically calculate UTC timestamps, and extend durations for YouTube audience subscribers.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-xs text-cyan-300 flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User ID or Name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'ALL'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Subscribers ({users.length})
          </button>
          <button
            onClick={() => setFilterMode('EXPIRING_SOON')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              filterMode === 'EXPIRING_SOON'
                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Expiring Soon</span>
          </button>
          <button
            onClick={() => setFilterMode('EXPIRED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'EXPIRED'
                ? 'bg-slate-800 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Subscription Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading subscription records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No subscribers match this criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">User ID</th>
                  <th className="py-3 px-4 font-medium">Name & Email</th>
                  <th className="py-3 px-4 font-medium">Account Status</th>
                  <th className="py-3 px-4 font-medium">Start Date (IST)</th>
                  <th className="py-3 px-4 font-medium">Expiry Date (IST)</th>
                  <th className="py-3 px-4 font-medium">Remaining Time</th>
                  <th className="py-3 px-4 font-medium text-right">Quick Extend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((u) => {
                  const rem = getRemainingDays(u.subscriptionExpiry);
                  const soon = isExpiringSoon(u.subscriptionExpiry) && u.status === 'ACTIVE';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">{u.userId}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        {formatToKolkata(u.subscriptionStart, false)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200 tabular-nums">
                        {formatToKolkata(u.subscriptionExpiry, false)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {u.status === 'ACTIVE' ? (
                          <span className={soon ? 'text-amber-400 font-bold flex items-center gap-1' : 'text-slate-300'}>
                            {soon && <AlertTriangle className="w-3.5 h-3.5" />}
                            {rem} {rem === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold">Expired</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {[30, 90, 180].map((days) => (
                            <button
                              key={days}
                              onClick={() => handleQuickExtend(u.uid, days, u.userId)}
                              className="px-2 py-1 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 font-mono text-[11px] rounded transition-colors"
                              title={`Add ${days} Days`}
                            >
                              +{days}d
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
