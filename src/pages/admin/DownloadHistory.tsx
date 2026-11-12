import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api.js';
import type { DownloadLog } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import { Download, Search, ShieldCheck, ShieldAlert, FileCode } from 'lucide-react';

export const DownloadHistory: React.FC = () => {
  const [logs, setLogs] = useState<DownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getLogs('downloads')
      .then((res) => setLogs(res.logs as DownloadLog[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) =>
      l.userCode?.toLowerCase().includes(search.toLowerCase()) ||
      l.userName?.toLowerCase().includes(search.toLowerCase()) ||
      l.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      l.projectTitle?.toLowerCase().includes(search.toLowerCase()) ||
      l.ipAddress?.includes(search)
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-400" />
          Authorized File Download Audit Log
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete forensic log of subscriber file requests, verification checkpoints, timestamps, and IP addresses.
        </p>
      </div>

      {/* Search */}
      <div className="bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User ID, Name, File, or IP Address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading download logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No download activity found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">User ID / Name</th>
                  <th className="py-3 px-4 font-medium">Requested File</th>
                  <th className="py-3 px-4 font-medium">Project</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">IP Address</th>
                  <th className="py-3 px-4 font-medium">Timestamp (IST)</th>
                  <th className="py-3 px-4 font-medium text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-cyan-400">{log.userCode || '—'}</div>
                      <div className="text-[11px] text-slate-400">{log.userName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-white flex items-center gap-1.5 mt-1.5">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{log.fileName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                      {log.projectTitle}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {(log.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {formatToKolkata(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          AUTHORIZED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold font-mono text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {log.status}
                        </span>
                      )}
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
