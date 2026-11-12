import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    let users: any[] = [];
    let projects: any[] = [];
    let downloadsCount = 0;

    if (isFirebaseAdminConfigured && adminDb) {
      const usersSnap = await adminDb.collection('users').get();
      users = usersSnap.docs.map((d: any) => d.data());

      const projSnap = await adminDb.collection('projects').get();
      projects = projSnap.docs.map((d: any) => d.data());

      const dlSnap = await adminDb.collection('downloadLogs').count().get();
      downloadsCount = dlSnap.data().count;
    } else {
      users = globalStore.users;
      projects = globalStore.projects;
      downloadsCount = globalStore.downloads.length;
    }

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // Filter subscribers
    const subscribers = users.filter((u) => u.role === 'SUBSCRIBER');
    let activeUsers = 0;
    let expiredUsers = 0;
    let disabledUsers = 0;
    let expiringSoon = 0;

    subscribers.forEach((u) => {
      const expiry = new Date(u.subscriptionExpiry).getTime();
      if (u.status === 'DISABLED') {
        disabledUsers++;
      } else if (expiry <= now || u.status === 'EXPIRED') {
        expiredUsers++;
      } else {
        activeUsers++;
        if (expiry - now <= sevenDaysMs) {
          expiringSoon++;
        }
      }
    });

    return res.status(200).json({
      totalUsers: subscribers.length,
      activeUsers,
      expiredUsers,
      disabledUsers,
      totalProjects: projects.length,
      totalDownloads: downloadsCount,
      subscriptionsExpiringSoon: expiringSoon,
    });
  } catch (error) {
    console.error('[Admin Stats Error]', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}
