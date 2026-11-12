import React, { useState } from 'react';
import { api } from '../services/api.js';
import { KeyRound, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

interface SetupPasswordPageProps {
  onSuccess: () => void;
}

export const SetupPasswordPage: React.FC<SetupPasswordPageProps> = ({ onSuccess }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const uid = urlParams.get('uid') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.setupPassword(uid, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Set Your Portal Password</h2>
          <p className="text-xs text-slate-400">
            Create a secure password to access your assigned Creative Inventor projects.
          </p>
        </div>

        {success ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-semibold text-emerald-300">
              Password Saved Successfully!
            </div>
            <p className="text-xs text-slate-400">
              You can now sign in using your User ID or email address and this new password.
            </p>
            <button
              onClick={onSuccess}
              className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating Password...' : 'Save & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
