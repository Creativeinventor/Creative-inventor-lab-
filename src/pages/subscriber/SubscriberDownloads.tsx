import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import type { DownloadLog } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import { Download, FileCode, ShieldCheck } from 'lucide-react';

export const SubscriberDownloads: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs('downloads')
      .then((res) => {
        // Filter personal logs for this user
        const personal = (res.logs as DownloadLog[]).filter(
          (l) => l.userId === user?.uid || l.userCode === user?.userId
        );
        setLogs(personal);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-400" />
          My Download History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review all files and archives downloaded to your workstation through your subscriber account.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading download records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-300">No downloads yet</div>
            <p className="text-xs text-slate-500">
              Visit your assigned projects to download schematics, code, and Gerbers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">File Name</th>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">File Size</th>
                  <th className="py-3 px-4 font-medium">Downloaded At (IST)</th>
                  <th className="py-3 px-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-white flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{log.fileName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[240px] truncate">
                      {log.projectTitle}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {(log.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {formatToKolkata(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-400 font-mono font-semibold text-[11px] inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        SUCCESS
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
