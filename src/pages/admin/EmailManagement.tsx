import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import type { EmailLog } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import { Mail, Send, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const EmailManagement: React.FC = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLogs('emails')
      .then((res) => setLogs(res.logs as EmailLog[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          Resend Email Notification Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor transactional welcome emails, password setup links, and subscription expiry alerts.
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
        <div className="font-semibold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-cyan-400" />
          Resend Integration Architecture
        </div>
        <p>
          Transactional emails are powered by the official <strong>Resend API</strong>. In development mode without an API key, emails are simulated with detailed log tracking. Upon adding <code className="text-cyan-400 font-mono">RESEND_API_KEY</code> to your Vercel or local environment, live emails are automatically delivered.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading email logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No emails dispatched yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Recipient</th>
                  <th className="py-3 px-4 font-medium">Subject</th>
                  <th className="py-3 px-4 font-medium">Template</th>
                  <th className="py-3 px-4 font-medium">Sent At (IST)</th>
                  <th className="py-3 px-4 font-medium text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">{log.recipientEmail}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate">{log.subject}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400 text-[11px]">{log.templateType}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                      {formatToKolkata(log.sentAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold font-mono text-[11px] inline-flex items-center gap-1 ${
                          log.status === 'SENT' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {log.status === 'SENT' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
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
