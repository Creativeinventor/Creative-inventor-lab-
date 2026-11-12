import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Settings, Server, Database, KeyRound, Youtube, ExternalLink, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          System Settings & Cloud Diagnostics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review Firebase Firestore connection, Vercel Serverless runtime status, and environment variables.
        </p>
      </div>

      {/* Cloud Services Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
          Cloud Infrastructure Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Database Engine</span>
            </div>
            <div className="font-mono text-white font-semibold">
              {health?.services?.database || 'FIRESTORE'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Firebase Admin SDK</span>
            </div>
            <div className="font-mono text-cyan-400 font-semibold">
              {health?.services?.firebaseAdmin || 'ACTIVE'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Storage Service</span>
            </div>
            <div className="font-mono text-white font-semibold">
              {health?.services?.storage || 'FIREBASE_STORAGE'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
            <div className="text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Resend Email Service</span>
            </div>
            <div className="font-mono text-purple-400 font-semibold">
              {health?.services?.resendEmail || 'ACTIVE'}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {health?.message}
        </p>
      </div>

      {/* Brand & Channel Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
          Channel & Brand Details
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Brand Name</span>
            <span className="font-semibold text-white">Creative Inventor</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Official YouTube Channel</span>
            <a
              href="https://youtube.com/@creativeinventorlab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-mono"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>https://youtube.com/@creativeinventorlab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Timezone Display</span>
            <span className="font-mono text-slate-200">Asia/Kolkata (IST, UTC+05:30)</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Internal Database Timestamp Encoding</span>
            <span className="font-mono text-slate-200">UTC (ISO 8601)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
