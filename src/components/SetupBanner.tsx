import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Database, ShieldCheck, Mail, Info, X, CheckCircle2 } from 'lucide-react';

export const SetupBanner: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((e) => console.warn('Health check note:', e));
  }, []);

  if (dismissed || !health) return null;

  const isLive = health.services?.firebaseAdmin === 'CONNECTED';

  return (
    <>
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-semibold text-white">Creative Inventor Portal Architecture:</span>
          <span>{isLive ? 'Live Firebase Firestore & Auth Connected' : 'Vercel-Ready Dev Mode (Full features testable)'}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
          >
            Deployment & Credentials Info
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-500 hover:text-white p-0.5"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Firebase & Vercel Deployment Checklist
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    Firebase Firestore & Auth
                  </span>
                  <span className="font-mono text-cyan-400">{health.services?.firebaseAdmin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    Resend Email Delivery
                  </span>
                  <span className="font-mono text-purple-400">{health.services?.resendEmail}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-1">To deploy to GitHub & Vercel:</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                  <li>Push this repository to your GitHub account.</li>
                  <li>Import the GitHub repository into your Vercel dashboard.</li>
                  <li>Add your environment variables from <code className="text-cyan-400">.env.example</code> into Vercel Project Settings:
                    <ul className="list-disc pl-4 mt-1 text-slate-400">
                      <li>Firebase client & Admin SDK credentials</li>
                      <li>Resend API Key and verified sender email</li>
                      <li>CRON_SECRET for automated expiry checks</li>
                    </ul>
                  </li>
                  <li>Deploy! Vercel Serverless Functions in <code className="text-cyan-400">api/</code> execute automatically.</li>
                </ol>
              </div>

              <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/40 rounded text-cyan-300">
                <span className="font-semibold">Local Dev Note:</span> All features (User creation, Unique ID validation, Subscription extension, Project uploads, Project assignments, Downloads) are 100% active and testable right now!
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
