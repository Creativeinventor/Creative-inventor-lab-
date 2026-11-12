import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderGit2,
  UploadCloud,
  Layers,
  CalendarClock,
  Download,
  ShieldCheck,
  Mail,
  Settings,
  LogOut,
  FolderCheck,
  KeyRound,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { label: 'Create New User', path: '/admin/create-user', icon: UserPlus },
    { label: 'Manage Projects', path: '/admin/projects', icon: FolderGit2 },
    { label: 'Upload Project', path: '/admin/upload-project', icon: UploadCloud },
    { label: 'Assign Projects', path: '/admin/assign-projects', icon: Layers },
    { label: 'Subscription Management', path: '/admin/subscriptions', icon: CalendarClock },
    { label: 'Download History', path: '/admin/downloads', icon: Download },
    { label: 'Login Activity', path: '/admin/logins', icon: ShieldCheck },
    { label: 'Email Management', path: '/admin/emails', icon: Mail },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const subscriberNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Projects', path: '/my-projects', icon: FolderCheck },
    { label: 'Download History', path: '/downloads', icon: Download },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
    { label: 'Change Password', path: '/change-password', icon: KeyRound },
    { label: 'Subscription Details', path: '/subscription', icon: CalendarClock },
  ];

  const navItems = isAdmin ? adminNavItems : subscriberNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-40 md:top-[57px] h-screen md:h-[calc(100vh-57px)] w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto">
          {/* User Profile Mini Block */}
          <div className="p-3 mb-4 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {isAdmin ? 'Channel Administrator' : 'Verified Subscriber'}
            </div>
            <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
            <div className="text-xs font-mono text-cyan-400">{user?.userId}</div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-slate-900/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
