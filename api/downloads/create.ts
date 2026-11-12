import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb, adminStorage } from '../lib/firebaseAdmin.js';

const downloadSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  fileId: z.string().min(1, 'File ID is required'),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = (req.headers.authorization as string) || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Authentication required to download project files.' });
    }

    const parts = token.split('_');
    const uid = parts.length >= 3 ? parts.slice(2, -1).join('_') : null;

    if (!uid) {
      return res.status(401).json({ error: 'Invalid authentication session.' });
    }

    const parseResult = downloadSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid parameters' });
    }

    const { projectId, fileId } = parseResult.data;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const nowIso = new Date().toISOString();

    let user: any = null;
    let project: any = null;
    let targetFile: any = null;

    // 1. Fetch user & verify account status
    if (isFirebaseAdminConfigured && adminDb) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User account not found.' });
      user = userDoc.data();

      // Check account status
      if (user.status === 'DISABLED') {
        recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'REVOKED');
        return res.status(403).json({ error: 'Account disabled. Download permission revoked.' });
      }

      // Check subscription expiry
      if (user.role === 'SUBSCRIBER') {
        const isExp = new Date(user.subscriptionExpiry).getTime() <= Date.now();
        if (isExp) {
          recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'DENIED');
          return res.status(403).json({ error: 'Subscription expired. Please renew your access with the admin.' });
        }

        // Verify project assignment
        const asgnSnap = await adminDb
          .collection('projectAssignments')
          .where('userId', '==', uid)
          .where('projectId', '==', projectId)
          .limit(1)
          .get();

        if (asgnSnap.empty) {
          recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'DENIED');
          return res.status(403).json({ error: 'This project is not assigned to your account.' });
        }
      }

      // Fetch project & file metadata
      const projDoc = await adminDb.collection('projects').doc(projectId).get();
      if (!projDoc.exists) return res.status(404).json({ error: 'Project not found.' });
      project = projDoc.data();

      targetFile = project.files?.find((f: any) => f.id === fileId);
      if (!targetFile) {
        return res.status(404).json({ error: 'Requested file not found in this project.' });
      }

      // Generate short-lived signed URL (15 minutes) from Firebase Storage
      let downloadUrl = '';
      if (adminStorage) {
        try {
          const bucket = adminStorage.bucket();
          const fileRef = bucket.file(targetFile.storagePath);
          const [signedUrl] = await fileRef.getSignedUrl({
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000,
          });
          downloadUrl = signedUrl;
        } catch (storageErr) {
          console.warn('[Storage signed url error]', storageErr);
          // Fallback authorized preview url
          downloadUrl = `/api/downloads/stream?fileId=${fileId}&token=${token}`;
        }
      } else {
        downloadUrl = `/api/downloads/stream?fileId=${fileId}&token=${token}`;
      }

      // Increment download counter
      targetFile.downloadCount = (targetFile.downloadCount || 0) + 1;
      await adminDb.collection('projects').doc(projectId).update({ files: project.files });

      // Record successful download log
      recordDownloadLog(
        uid,
        user.userId,
        user.name,
        projectId,
        project.title,
        fileId,
        targetFile.fileName,
        targetFile.fileSizeBytes,
        clientIp,
        'SUCCESS'
      );

      return res.status(200).json({
        success: true,
        downloadUrl,
        fileName: targetFile.fileName,
        fileSizeBytes: targetFile.fileSizeBytes,
        expiresInSeconds: 900,
      });
    } else {
      // Local dev mock store
      user = globalStore.users.find((u) => u.uid === uid);
      if (!user) return res.status(404).json({ error: 'User account not found.' });

      if (user.status === 'DISABLED') {
        recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'REVOKED');
        return res.status(403).json({ error: 'Account disabled. Download permission revoked.' });
      }

      if (user.role === 'SUBSCRIBER') {
        const isExp = new Date(user.subscriptionExpiry).getTime() <= Date.now();
        if (isExp) {
          recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'DENIED');
          return res.status(403).json({ error: 'Subscription expired. Please renew your access with the admin.' });
        }

        const isAssigned = globalStore.assignments.some(
          (a) => a.userId === uid && a.projectId === projectId
        );

        if (!isAssigned) {
          recordDownloadLog(uid, user.userId, user.name, projectId, 'Unknown', fileId, 'Unknown', 0, clientIp, 'DENIED');
          return res.status(403).json({ error: 'This project is not assigned to your account.' });
        }
      }

      project = globalStore.projects.find((p) => p.id === projectId);
      if (!project) return res.status(404).json({ error: 'Project not found.' });

      targetFile = project.files?.find((f: any) => f.id === fileId);
      if (!targetFile) {
        return res.status(404).json({ error: 'Requested file not found in this project.' });
      }

      targetFile.downloadCount = (targetFile.downloadCount || 0) + 1;

      // Record download log
      recordDownloadLog(
        uid,
        user.userId,
        user.name,
        projectId,
        project.title,
        fileId,
        targetFile.fileName,
        targetFile.fileSizeBytes,
        clientIp,
        'SUCCESS'
      );

      // In mock mode: generate simulated secure download payload
      return res.status(200).json({
        success: true,
        downloadUrl: `data:application/octet-stream;charset=utf-8,${encodeURIComponent(
          `/* Creative Inventor Project File: ${targetFile.fileName} */\n/* Authorized for ${user.name} (${user.userId}) */\n/* Timestamp: ${nowIso} */\n`
        )}`,
        fileName: targetFile.fileName,
        fileSizeBytes: targetFile.fileSizeBytes,
        expiresInSeconds: 900,
        isSimulated: true,
      });
    }
  } catch (error) {
    console.error('[Download Create Error]', error);
    return res.status(500).json({ error: 'Failed to authorize download' });
  }
}

function recordDownloadLog(
  userId: string,
  userCode: string,
  userName: string,
  projectId: string,
  projectTitle: string,
  fileId: string,
  fileName: string,
  fileSize: number,
  ipAddress: string,
  status: 'SUCCESS' | 'DENIED' | 'REVOKED'
) {
  const log = {
    id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    userCode,
    userName,
    projectId,
    projectTitle,
    fileId,
    fileName,
    fileSize,
    ipAddress,
    timestamp: new Date().toISOString(),
    status,
  };

  globalStore.downloads.unshift(log);

  if (isFirebaseAdminConfigured && adminDb) {
    adminDb.collection('downloadLogs').add(log).catch(console.error);
  }
}
