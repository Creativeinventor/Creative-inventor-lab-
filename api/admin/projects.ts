import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    let projects: any[] = [];

    if (isFirebaseAdminConfigured && adminDb) {
      const snap = await adminDb.collection('projects').orderBy('createdAt', 'desc').get();
      projects = snap.docs.map((doc: any) => doc.data());
    } else {
      projects = [...globalStore.projects];
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('[Admin Projects Error]', error);
    return res.status(500).json({ error: 'Failed to fetch projects' });
  }
}
