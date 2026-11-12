import React, { useState } from 'react';
import { Navbar } from '../components/Navbar.js';
import { Sidebar } from '../components/Sidebar.js';
import { SetupBanner } from '../components/SetupBanner.js';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <SetupBanner />

      <div className="flex-1 flex w-full max-w-[1700px] mx-auto">
        <Sidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
