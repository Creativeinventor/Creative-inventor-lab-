export interface ApiUser {
  uid: string;
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUBSCRIBER' | 'admin' | 'subscriber';
  status: 'ACTIVE' | 'EXPIRED' | 'DISABLED' | 'active' | 'expired' | 'disabled';
  subscriptionStart: string;
  subscriptionExpiry: string;
  durationDays: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  disabledReason?: string;
  passwordHash?: string;
  rawPassword?: string;
}

export interface ApiProject {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  instructions: string;
  version: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  files: ApiProjectFile[];
}

export interface ApiProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  storagePath: string;
  uploadedAt: string;
  downloadCount: number;
}

export interface ApiProjectAssignment {
  id: string;
  userId: string;
  projectId: string;
  assignedAt: string;
  assignedBy: string;
}

export interface ApiDownloadLog {
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

export interface ApiLoginLog {
  id: string;
  userId: string;
  userCode: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface ApiEmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  templateType: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
  errorDetails?: string;
}
