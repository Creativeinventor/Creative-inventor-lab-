import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    let users: any[] = [];

    if (isFirebaseAdminConfigured && adminDb) {
      const snap = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
      users = snap.docs.map((doc: any) => doc.data());
    } else {
      users = [...globalStore.users];
    }

    // Refresh dynamic expired statuses
    const now = Date.now();
    users = users.map((u) => {
      if (u.role === 'SUBSCRIBER') {
        const isExp = new Date(u.subscriptionExpiry).getTime() <= now;
        if (isExp && u.status === 'ACTIVE') {
          return { ...u, status: 'EXPIRED' };
        }
      }
      return u;
    });

    // Sanitize passwords
    const safeUsers = users.map((u) => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });

    return res.status(200).json({ users: safeUsers });
  } catch (error) {
    console.error('[Admin Users List Error]', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}
