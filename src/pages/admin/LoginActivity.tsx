import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import type { LoginLog } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import { ShieldCheck, ShieldAlert, Monitor, CheckCircle2 } from 'lucide-react';

export const LoginActivity: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs('logins')
      .then((res) => setLogs(res.logs as LoginLog[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          Login & Session Security Log
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed sign-in attempts, client IP addresses, user agents, and authorization outcomes.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading session logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No login attempts logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">User ID / Email</th>
                  <th className="py-3 px-4 font-medium">IP Address</th>
                  <th className="py-3 px-4 font-medium">User Agent</th>
                  <th className="py-3 px-4 font-medium">Timestamp (IST)</th>
                  <th className="py-3 px-4 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-cyan-400">{log.userCode || '—'}</div>
                      <div className="text-[11px] text-slate-400">{log.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-slate-400 max-w-[260px] truncate">
                      {log.userAgent || 'Web Browser'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {formatToKolkata(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold font-mono text-[11px] inline-flex items-center gap-1 ${
                          log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {log.status}
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
