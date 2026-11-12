import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  const authHeader = (req.headers.authorization as string) || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  // Extract uid from token format: ci_token_<uid>_<timestamp>
  const parts = token.split('_');
  const uid = parts.length >= 3 ? parts.slice(2, -1).join('_') : null;

  if (!uid) {
    return res.status(401).json({ error: 'Invalid token structure' });
  }

  let user: any = null;

  if (isFirebaseAdminConfigured && adminDb) {
    const docSnap = await adminDb.collection('users').doc(uid).get();
    if (docSnap.exists) {
      user = docSnap.data();
    }
  } else {
    user = globalStore.users.find((u) => u.uid === uid);
  }

  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  // Live expiry verification
  if (user.role === 'SUBSCRIBER') {
    const isExpired = new Date(user.subscriptionExpiry).getTime() <= Date.now();
    if (isExpired && user.status === 'ACTIVE') {
      user.status = 'EXPIRED';
      if (isFirebaseAdminConfigured && adminDb) {
        await adminDb.collection('users').doc(uid).update({ status: 'EXPIRED' });
      }
    }
  }

  const safeUser = { ...user };
  delete safeUser.rawPassword;
  delete safeUser.passwordHash;

  return res.status(200).json({ user: safeUser });
}
