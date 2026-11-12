import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminAuth, adminDb, FieldValue } from '../lib/firebaseAdmin.js';
import { sendPortalEmail } from '../lib/resend.js';

const manageActionSchema = z.object({
  uid: z.string().min(1, 'Target user UID is required'),
  action: z.enum(['ENABLE', 'DISABLE', 'REACTIVATE', 'EXTEND', 'RESET_PASSWORD', 'UPDATE_PROFILE', 'DELETE']),
  payload: z.record(z.string(), z.any()).optional(),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = manageActionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input data' });
    }

    const { uid, action, payload = {} } = parseResult.data;

    let user: any = null;

    if (isFirebaseAdminConfigured && adminDb) {
      const snap = await adminDb.collection('users').doc(uid).get();
      if (!snap.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = snap.data();
    } else {
      user = globalStore.users.find((u) => u.uid === uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    }

    const nowIso = new Date().toISOString();

    switch (action) {
      case 'ENABLE':
      case 'REACTIVATE': {
        const isCurrentlyExpired = new Date(user.subscriptionExpiry).getTime() <= Date.now();
        const nextStatus = isCurrentlyExpired ? 'EXPIRED' : 'ACTIVE';
        user.status = nextStatus;
        user.disabledReason = undefined;
        user.updatedAt = nowIso;

        if (isFirebaseAdminConfigured && adminDb) {
          await adminDb.collection('users').doc(uid).update({
            status: nextStatus,
            disabledReason: FieldValue.delete(),
            updatedAt: nowIso,
          });
        }
        return res.status(200).json({ success: true, message: `Account reactivated. Status: ${nextStatus}`, user });
      }

      case 'DISABLE': {
        const reason = payload.reason || 'Account disabled by administrator.';
        user.status = 'DISABLED';
        user.disabledReason = reason;
        user.updatedAt = nowIso;

        if (isFirebaseAdminConfigured && adminDb) {
          await adminDb.collection('users').doc(uid).update({
            status: 'DISABLED',
            disabledReason: reason,
            updatedAt: nowIso,
          });
        }

        // Notify user via email
        sendPortalEmail({
          to: user.email,
          subject: 'Account Notice - Creative Inventor Project Portal',
          templateType: 'DISABLED',
          data: {
            userId: user.userId,
            message: `Your access has been temporarily suspended: ${reason}`,
          },
        }).catch(console.error);

        return res.status(200).json({ success: true, message: 'Account disabled successfully.', user });
      }

      case 'EXTEND': {
        const addDays = Number(payload.additionalDays) || 30;
        const currentExp = new Date(user.subscriptionExpiry).getTime();
        const baseTime = currentExp > Date.now() ? currentExp : Date.now();
        const newExpiryDate = new Date(baseTime + addDays * 24 * 60 * 60 * 1000);
        newExpiryDate.setUTCHours(23, 59, 59, 999);
        const newExpiryIso = newExpiryDate.toISOString();

        user.subscriptionExpiry = newExpiryIso;
        user.durationDays = (user.durationDays || 0) + addDays;
        user.status = 'ACTIVE';
        user.updatedAt = nowIso;

        if (isFirebaseAdminConfigured && adminDb) {
          await adminDb.collection('users').doc(uid).update({
            subscriptionExpiry: newExpiryIso,
            durationDays: user.durationDays,
            status: 'ACTIVE',
            updatedAt: nowIso,
          });

          // Record subscription history
          await adminDb.collection('subscriptionHistory').add({
            userId: uid,
            userCode: user.userId,
            extendedByDays: addDays,
            previousExpiry: user.subscriptionExpiry,
            newExpiry: newExpiryIso,
            extendedAt: nowIso,
          });
        }

        // Send renewal email
        sendPortalEmail({
          to: user.email,
          subject: `Subscription Extended - Creative Inventor Portal (${user.userId})`,
          templateType: 'RENEWED',
          data: {
            userId: user.userId,
            message: `Your subscription has been extended by ${addDays} days! Your new access expiry date is ${new Date(newExpiryIso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
          },
        }).catch(console.error);

        return res.status(200).json({
          success: true,
          message: `Subscription extended by ${addDays} days. New expiry: ${newExpiryIso}`,
          user,
        });
      }

      case 'RESET_PASSWORD': {
        const newTempPass = payload.newPassword || `Ci#${Math.floor(100000 + Math.random() * 900000)}`;
        user.rawPassword = newTempPass;
        user.updatedAt = nowIso;

        if (isFirebaseAdminConfigured && adminAuth && adminDb) {
          await adminAuth.updateUser(uid, { password: newTempPass });
          await adminDb.collection('users').doc(uid).update({ updatedAt: nowIso });
        }

        sendPortalEmail({
          to: user.email,
          subject: `Your Password Has Been Reset - Creative Inventor (${user.userId})`,
          templateType: 'PASSWORD_RESET',
          data: {
            userId: user.userId,
            message: `Your login password has been reset by the administrator. Your new temporary password is: ${newTempPass}`,
          },
        }).catch(console.error);

        return res.status(200).json({
          success: true,
          message: 'Password reset successfully.',
          temporaryPassword: newTempPass,
        });
      }

      case 'UPDATE_PROFILE': {
        if (payload.name) user.name = String(payload.name);
        if (payload.email) user.email = String(payload.email).toLowerCase().trim();
        if (payload.userId) user.userId = String(payload.userId).toUpperCase().trim();
        if (payload.subscriptionExpiry) user.subscriptionExpiry = String(payload.subscriptionExpiry);
        user.updatedAt = nowIso;

        if (isFirebaseAdminConfigured && adminDb) {
          await adminDb.collection('users').doc(uid).update({
            name: user.name,
            email: user.email,
            userId: user.userId,
            subscriptionExpiry: user.subscriptionExpiry,
            updatedAt: nowIso,
          });
        }
        return res.status(200).json({ success: true, message: 'User profile updated.', user });
      }

      case 'DELETE': {
        if (isFirebaseAdminConfigured && adminAuth && adminDb) {
          try {
            await adminAuth.deleteUser(uid);
          } catch (e) {
            console.warn('Firebase Auth user delete warning:', e);
          }
          await adminDb.collection('users').doc(uid).delete();
          // Delete assignments
          const asgnSnap = await adminDb.collection('projectAssignments').where('userId', '==', uid).get();
          for (const doc of asgnSnap.docs) {
            await doc.ref.delete();
          }
        } else {
          globalStore.users = globalStore.users.filter((u) => u.uid !== uid);
          globalStore.assignments = globalStore.assignments.filter((a) => a.userId !== uid);
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully.' });
      }

      default:
        return res.status(400).json({ error: 'Unsupported action' });
    }
  } catch (error) {
    console.error('[Manage User Error]', error);
    return res.status(500).json({ error: 'Failed to manage user' });
  }
}
