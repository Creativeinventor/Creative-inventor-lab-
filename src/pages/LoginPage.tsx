import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Youtube, ShieldAlert, KeyRound, ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSuccess: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(identifier, password);
      onSuccess(user.role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(id, pass);
      onSuccess(user.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80">
        <a href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45" />
          <span>Creative Inventor</span>
          <span className="text-xs font-mono font-normal text-cyan-400 ml-1">PORTAL</span>
        </a>
        <a
          href="https://youtube.com/@creativeinventorlab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          <span>YouTube Channel</span>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Subscriber & Admin Sign In
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Access your authorized hardware designs, firmware source codes, and Gerber production archives.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address or User ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin or CI1001"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Preset Buttons for easy testing */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Quick Test Credentials
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', '123')}
                  className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-white">Admin Login</div>
                  <div className="text-[11px] font-mono text-cyan-400">admin / 123</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('CI1001', 'subscriber123')}
                  className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left text-xs transition-colors"
                >
                  <div className="font-semibold text-white">Rahul (Subscriber)</div>
                  <div className="text-[11px] font-mono text-cyan-400">CI1001 / subscriber123</div>
                </button>
              </div>
            </div>
          </div>

          {/* Business Model Notice (No payment gateway, manual admin verification) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/60 rounded-xl text-xs text-slate-400 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              Manual Subscriber Model Notice
            </div>
            <p>
              This portal operates strictly on a private creator subscription model. There is <strong>no public registration</strong> and <strong>no automated payment gateway</strong>.
            </p>
            <p>
              All subscriber accounts and User IDs are manually created and issued by the channel creator upon subscribing via YouTube or contacting directly.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800/80 bg-slate-950/80">
        &copy; {new Date().getFullYear()} Creative Inventor Lab. All rights reserved.
      </div>
    </div>
  );
};
