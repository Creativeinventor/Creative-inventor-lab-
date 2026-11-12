import type { UserProfile, Project, AdminStats, DownloadLog, LoginLog, EmailLog, ProjectAssignment } from '../types/index.js';

const TOKEN_KEY = 'creative_inventor_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; services: any; message: string }>('/api/health'),

  // Auth
  login: (identifier: string, password: string) =>
    request<{ success: boolean; user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  getMe: () => request<{ user: UserProfile }>('/api/auth/me'),

  setupPassword: (uid: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/api/auth/setup-password', {
      method: 'POST',
      body: JSON.stringify({ uid, newPassword }),
    }),

  // Admin
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),

  getUsers: () => request<{ users: UserProfile[] }>('/api/admin/users'),

  createUser: (payload: {
    userId: string;
    name: string;
    email: string;
    durationDays: number;
    customExpiryIso?: string;
    temporaryPassword?: string;
    sendWelcomeEmail?: boolean;
    assignedProjectIds?: string[];
  }) =>
    request<{ success: boolean; message: string; user: any; emailStatus: string }>('/api/admin/create-user', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  manageUser: (uid: string, action: string, payload?: Record<string, any>) =>
    request<{ success: boolean; message: string; user?: any; temporaryPassword?: string }>('/api/admin/manage-user', {
      method: 'POST',
      body: JSON.stringify({ uid, action, payload }),
    }),

  getAdminProjects: () => request<{ projects: Project[] }>('/api/admin/projects'),

  createProject: (payload: Partial<Project> & { assignToAllActiveUsers?: boolean }) =>
    request<{ success: boolean; message: string; project: Project }>('/api/admin/create-project', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAssignments: () => request<{ assignments: ProjectAssignment[] }>('/api/admin/assign-project'),

  assignProject: (payload: {
    action: 'ASSIGN' | 'REMOVE' | 'ASSIGN_ALL_ACTIVE';
    userId?: string;
    userIds?: string[];
    projectId?: string;
    projectIds?: string[];
  }) =>
    request<{ success: boolean; message: string }>('/api/admin/assign-project', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLogs: (type: 'downloads' | 'logins' | 'emails') =>
    request<{ logs: (DownloadLog | LoginLog | EmailLog)[] }>(`/api/admin/logs?type=${type}`),

  // Subscriber
  getSubscriberProjects: () => request<{ projects: Project[] }>('/api/projects/list'),

  getProjectDetails: (id: string) => request<{ project: Project }>(`/api/projects/details?id=${id}`),

  createDownload: (projectId: string, fileId: string) =>
    request<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
      fileSizeBytes: number;
      expiresInSeconds: number;
      isSimulated?: boolean;
    }>('/api/downloads/create', {
      method: 'POST',
      body: JSON.stringify({ projectId, fileId }),
    }),
};
