import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminAuth, adminDb } from '../lib/firebaseAdmin.js';

const setupSchema = z.object({
  uid: z.string().min(1, 'User UID is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = setupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input' });
    }

    const { uid, newPassword } = parseResult.data;

    if (isFirebaseAdminConfigured && adminAuth && adminDb) {
      await adminAuth.updateUser(uid, { password: newPassword });
      await adminDb.collection('users').doc(uid).update({
        updatedAt: new Date().toISOString(),
      });
    } else {
      const user = globalStore.users.find((u) => u.uid === uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.rawPassword = newPassword;
      user.updatedAt = new Date().toISOString();
    }

    return res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now log in with your credentials.',
    });
  } catch (error) {
    console.error('[Setup Password Error]', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}
