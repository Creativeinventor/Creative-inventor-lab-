export type UserRole = 'ADMIN' | 'SUBSCRIBER' | 'admin' | 'subscriber';

export type UserStatus = 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'active' | 'expired' | 'disabled';

export type SubscriptionDuration = '7' | '15' | '30' | '90' | '180' | '365' | 'custom';

export interface UserProfile {
  uid: string;
  userId: string; // e.g. CI1001
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  subscriptionStart: string; // ISO UTC
  subscriptionExpiry: string; // ISO UTC
  durationDays: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  disabledReason?: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string; // ZIP, RAR, PDF, INO, etc.
  storagePath: string;
  uploadedAt: string;
  downloadCount: number;
}

export type ProjectCategory =
  | 'Arduino Projects'
  | 'ESP8266 Projects'
  | 'ESP32 Projects'
  | 'Raspberry Pi Pico'
  | 'Electronics Projects'
  | 'DIY Projects'
  | 'PCB Projects'
  | 'Other Projects';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  thumbnailUrl: string;
  instructions: string;
  version: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
  tags?: string[];
}

export interface ProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface DownloadLog {
  id: string;
  userId: string;
  userCode: string;
  userName: string;
  projectId: string;
  projectTitle: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'REVOKED';
}

export interface LoginLog {
  id: string;
  userId: string;
  userCode: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  templateType: 'WELCOME' | 'PASSWORD_RESET' | 'EXPIRY_REMINDER' | 'EXPIRED' | 'RENEWED' | 'DISABLED';
  sentAt: string;
  status: 'SENT' | 'FAILED';
  errorDetails?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  expiredUsers: number;
  disabledUsers: number;
  totalProjects: number;
  totalDownloads: number;
  subscriptionsExpiringSoon: number; // within next 7 days
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}
