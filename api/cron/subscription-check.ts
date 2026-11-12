import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';
import { sendPortalEmail } from '../lib/resend.js';

export default async function handler(req: Request | any, res: Response | any) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || '';
  const querySecret = req.query.secret;

  if (cronSecret && cronSecret !== 'generate_a_secure_random_cron_secret_key_here') {
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      querySecret === cronSecret;

    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized cron request. Invalid CRON_SECRET.' });
    }
  }

  try {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    let users: any[] = [];

    if (isFirebaseAdminConfigured && adminDb) {
      const snap = await adminDb.collection('users').where('role', '==', 'SUBSCRIBER').get();
      users = snap.docs.map((d: any) => d.data());
    } else {
      users = globalStore.users.filter((u) => u.role === 'SUBSCRIBER');
    }

    let expiredCount = 0;
    let remindersSent = 0;

    for (const u of users) {
      const expiry = new Date(u.subscriptionExpiry).getTime();

      // Check if expired
      if (expiry <= now) {
        if (u.status === 'ACTIVE') {
          u.status = 'EXPIRED';
          expiredCount++;
          if (isFirebaseAdminConfigured && adminDb) {
            await adminDb.collection('users').doc(u.uid).update({ status: 'EXPIRED' });
          }

          // Send expiry notice
          await sendPortalEmail({
            to: u.email,
            subject: `Subscription Expired - Creative Inventor (${u.userId})`,
            templateType: 'EXPIRED',
            data: {
              userId: u.userId,
              message: 'Your subscription access has expired. Please contact the channel administrator to renew your access.',
            },
          });
        }
      } else if (expiry - now <= sevenDaysMs && u.status === 'ACTIVE') {
        // Expiring soon reminder
        const remainingDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        await sendPortalEmail({
          to: u.email,
          subject: `Subscription Expiring in ${remainingDays} Days - Creative Inventor`,
          templateType: 'EXPIRY_REMINDER',
          data: {
            name: u.name,
            userId: u.userId,
            subscriptionExpiry: new Date(u.subscriptionExpiry).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
            remainingDays,
          },
        });
        remindersSent++;
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedUsers: users.length,
      newlyExpired: expiredCount,
      remindersSent,
    });
  } catch (error) {
    console.error('[Cron Expiry Error]', error);
    return res.status(500).json({ error: 'Failed to run subscription cron' });
  }
}
