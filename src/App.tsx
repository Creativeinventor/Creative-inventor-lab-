import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import type { Project } from './types/index.js';

// Layouts
import { AdminLayout } from './layouts/AdminLayout.js';
import { SubscriberLayout } from './layouts/SubscriberLayout.js';

// Auth Pages
import { LoginPage } from './pages/LoginPage.js';
import { SetupPasswordPage } from './pages/SetupPasswordPage.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { ManageUsers } from './pages/admin/ManageUsers.js';
import { CreateUser } from './pages/admin/CreateUser.js';
import { ManageProjects } from './pages/admin/ManageProjects.js';
import { UploadProject } from './pages/admin/UploadProject.js';
import { AssignProjects } from './pages/admin/AssignProjects.js';
import { SubscriptionManagement } from './pages/admin/SubscriptionManagement.js';
import { DownloadHistory } from './pages/admin/DownloadHistory.js';
import { LoginActivity } from './pages/admin/LoginActivity.js';
import { EmailManagement } from './pages/admin/EmailManagement.js';
import { SettingsPage } from './pages/admin/SettingsPage.js';

// Subscriber Pages
import { SubscriberDashboard } from './pages/subscriber/SubscriberDashboard.js';
import { MyProjects } from './pages/subscriber/MyProjects.js';
import { ProjectDetailsPage } from './pages/subscriber/ProjectDetailsPage.js';
import { SubscriberDownloads } from './pages/subscriber/SubscriberDownloads.js';
import { MyProfile } from './pages/subscriber/MyProfile.js';
import { ChangePasswordPage } from './pages/subscriber/ChangePasswordPage.js';
import { SubscriptionDetailsPage } from './pages/subscriber/SubscriptionDetailsPage.js';

function MainRouter() {
  const { user, isLoading, isAdmin, isSubscriber } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If loading session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050b18] flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider">INITIALIZING CREATIVE INVENTOR PORTAL...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (window.location.pathname === '/setup-password') {
      return <SetupPasswordPage onSuccess={() => navigate('/login')} />;
    }
    return (
      <LoginPage
        onSuccess={(role) => {
          if (role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }}
      />
    );
  }

  // Admin Routes
  if (isAdmin) {
    let content: React.ReactNode = <AdminDashboard onNavigate={navigate} />;

    switch (currentPath) {
      case '/admin':
      case '/':
        content = <AdminDashboard onNavigate={navigate} />;
        break;
      case '/admin/users':
        content = <ManageUsers onNavigate={navigate} />;
        break;
      case '/admin/create-user':
        content = <CreateUser onNavigate={navigate} />;
        break;
      case '/admin/projects':
        content = <ManageProjects onNavigate={navigate} />;
        break;
      case '/admin/upload-project':
        content = <UploadProject onNavigate={navigate} />;
        break;
      case '/admin/assign-projects':
        content = <AssignProjects />;
        break;
      case '/admin/subscriptions':
        content = <SubscriptionManagement />;
        break;
      case '/admin/downloads':
        content = <DownloadHistory />;
        break;
      case '/admin/logins':
        content = <LoginActivity />;
        break;
      case '/admin/emails':
        content = <EmailManagement />;
        break;
      case '/admin/settings':
        content = <SettingsPage />;
        break;
      default:
        content = <AdminDashboard onNavigate={navigate} />;
        break;
    }

    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigate}>
        {content}
      </AdminLayout>
    );
  }

  // Subscriber Routes
  if (isSubscriber) {
    // If viewing project details
    if (selectedProject) {
      return (
        <SubscriberLayout currentPath="/my-projects" onNavigate={navigate}>
          <ProjectDetailsPage
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
          />
        </SubscriberLayout>
      );
    }

    let content: React.ReactNode = (
      <SubscriberDashboard
        onNavigate={navigate}
        onSelectProject={(proj) => setSelectedProject(proj)}
      />
    );

    switch (currentPath) {
      case '/dashboard':
      case '/':
        content = (
          <SubscriberDashboard
            onNavigate={navigate}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        );
        break;
      case '/my-projects':
        content = (
          <MyProjects
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        );
        break;
      case '/downloads':
        content = <SubscriberDownloads />;
        break;
      case '/profile':
        content = <MyProfile onNavigate={navigate} />;
        break;
      case '/change-password':
        content = <ChangePasswordPage />;
        break;
      case '/subscription':
        content = <SubscriptionDetailsPage />;
        break;
      default:
        content = (
          <SubscriberDashboard
            onNavigate={navigate}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        );
        break;
    }

    return (
      <SubscriberLayout currentPath={currentPath} onNavigate={navigate}>
        {content}
      </SubscriberLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b18] flex items-center justify-center p-6 text-slate-300">
      Invalid account role configuration.
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
