import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import type { Project, SubscriptionDuration } from '../../types/index.js';
import { formatToKolkata, calculateExpiry } from '../../services/dateUtils.js';
import {
  UserPlus,
  Mail,
  ShieldCheck,
  Calendar,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
} from 'lucide-react';

interface CreateUserProps {
  onNavigate: (path: string) => void;
}

export const CreateUser: React.FC<CreateUserProps> = ({ onNavigate }) => {
  const [userId, setUserId] = useState('CI1004');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [durationPreset, setDurationPreset] = useState<SubscriptionDuration>('30');
  const [customDays, setCustomDays] = useState(30);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate random temporary password by default
    generatePassword();

    // Fetch projects for assignment checklist
    api.getAdminProjects().then((res) => {
      setAvailableProjects(res.projects);
    }).catch(console.error);

    // Auto-calculate next User ID based on users count
    api.getUsers().then((res) => {
      const subs = res.users.filter((u) => u.userId.startsWith('CI'));
      const nextNum = 1001 + subs.length;
      setUserId(`CI${nextNum}`);
    }).catch(console.error);
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789#@!';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTemporaryPassword(pass);
  };

  const effectiveDurationDays = durationPreset === 'custom' ? customDays : Number(durationPreset);
  const { expiryIso } = calculateExpiry(new Date(), effectiveDurationDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.createUser({
        userId: userId.trim(),
        name: name.trim(),
        email: email.trim(),
        durationDays: effectiveDurationDays,
        temporaryPassword,
        sendWelcomeEmail,
        assignedProjectIds: selectedProjects,
      });

      setSuccessResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to create subscriber');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successResult) return;
    const text = `Creative Inventor Portal Login Credentials:\nUser ID: ${successResult.user.userId}\nEmail: ${successResult.user.email}\nTemporary Password: ${successResult.user.temporaryPassword}\nLogin URL: ${window.location.origin}/login\nSubscription Expiry: ${formatToKolkata(successResult.user.subscriptionExpiry)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleProject = (projId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          Create New Subscriber Account
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manually register a subscriber who purchased project access through YouTube or direct communication.
        </p>
      </div>

      {successResult ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-6 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Subscriber Created Successfully!</h2>
              <p className="text-xs text-slate-400">
                Email Dispatch: <span className="font-semibold text-emerald-400">{successResult.emailStatus}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned User ID:</span>
              <span className="text-cyan-400 font-bold">{successResult.user.userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subscriber Name:</span>
              <span className="text-white">{successResult.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email Address:</span>
              <span className="text-white">{successResult.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Temporary Password:</span>
              <span className="text-amber-400 font-bold">{successResult.user.temporaryPassword}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expiry (Asia/Kolkata):</span>
              <span className="text-white">{formatToKolkata(successResult.user.subscriptionExpiry)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyCredentials}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials for WhatsApp / Email'}</span>
            </button>

            <button
              onClick={() => {
                setSuccessResult(null);
                setName('');
                setEmail('');
                generatePassword();
              }}
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              Create Another Subscriber
            </button>

            <button
              onClick={() => onNavigate('/admin/users')}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              View in Users List &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Identity & Credentials */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              1. Account Identity & User ID
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Unique User ID <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toUpperCase())}
                  placeholder="e.g. CI1004"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 uppercase"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Must be unique across all portal users.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subscriber Full Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subscriber Email Address <span className="text-cyan-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Initial Temporary Password
                </label>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Generate New</span>
                </button>
              </div>
              <input
                type="text"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                The subscriber can also use the secure setup link in their welcome email to set their own password.
              </span>
            </div>
          </div>

          {/* Section 2: Subscription Duration */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              2. Subscription Duration & Expiry
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Preset Duration
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {(['7', '15', '30', '90', '180', '365', 'custom'] as SubscriptionDuration[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationPreset(d)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      durationPreset === d
                        ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {d === 'custom' ? 'Custom' : `${d} Days`}
                  </button>
                ))}
              </div>
            </div>

            {durationPreset === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Duration (Number of Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={customDays}
                  onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                  className="w-full max-w-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            )}

            {/* Real-time Expiry Preview in Asia/Kolkata */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-400">Calculated Expiry (Asia/Kolkata):</span>
              <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                {formatToKolkata(expiryIso)}
              </span>
            </div>
          </div>

          {/* Section 3: Initial Project Access */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>3. Initial Project Access (Optional)</span>
              <span className="text-[11px] font-normal text-slate-400">
                {selectedProjects.length} of {availableProjects.length} selected
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Select which projects this subscriber can immediately download upon login:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
              {availableProjects.map((p) => {
                const isSelected = selectedProjects.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProject(p.id)}
                    className={`p-2.5 rounded-md text-left text-xs border transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-white truncate">{p.title}</div>
                      <div className="text-[11px] text-cyan-400">{p.category}</div>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Email Notification */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWelcomeEmail}
                onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700 focus:ring-cyan-500"
              />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white block">Send Professional Welcome Email</span>
                <span>Dispatches login instructions, User ID, and account setup link via Resend.</span>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/users')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Create Subscriber'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
