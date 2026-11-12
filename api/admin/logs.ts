import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    const logType = (req.query.type as string) || 'downloads';

    if (isFirebaseAdminConfigured && adminDb) {
      if (logType === 'logins') {
        const snap = await adminDb.collection('loginLogs').orderBy('timestamp', 'desc').limit(100).get();
        return res.status(200).json({ logs: snap.docs.map((d: any) => d.data()) });
      } else if (logType === 'emails') {
        const snap = await adminDb.collection('emailLogs').orderBy('sentAt', 'desc').limit(100).get();
        return res.status(200).json({ logs: snap.docs.map((d: any) => d.data()) });
      } else {
        const snap = await adminDb.collection('downloadLogs').orderBy('timestamp', 'desc').limit(100).get();
        return res.status(200).json({ logs: snap.docs.map((d: any) => d.data()) });
      }
    } else {
      if (logType === 'logins') {
        return res.status(200).json({ logs: globalStore.loginLogs });
      } else if (logType === 'emails') {
        return res.status(200).json({ logs: globalStore.emailLogs });
      } else {
        return res.status(200).json({ logs: globalStore.downloads });
      }
    }
  } catch (error) {
    console.error('[Admin Logs Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve logs' });
  }
}
