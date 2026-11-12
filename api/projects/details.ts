import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    const authHeader = (req.headers.authorization as string) || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const projectId = (req.query.id as string) || (req.body?.id as string);

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parts = token.split('_');
    const uid = parts.length >= 3 ? parts.slice(2, -1).join('_') : null;

    if (!uid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let user: any = null;
    let project: any = null;

    if (isFirebaseAdminConfigured && adminDb) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
      user = userDoc.data();

      if (user.status === 'DISABLED') return res.status(403).json({ error: 'Account disabled' });

      if (user.role === 'SUBSCRIBER') {
        if (new Date(user.subscriptionExpiry).getTime() <= Date.now()) {
          return res.status(403).json({ error: 'Subscription expired', expired: true });
        }

        // Verify assignment
        const asgnSnap = await adminDb
          .collection('projectAssignments')
          .where('userId', '==', uid)
          .where('projectId', '==', projectId)
          .limit(1)
          .get();

        if (asgnSnap.empty) {
          return res.status(403).json({ error: 'You do not have access to this project. Please contact the admin.' });
        }
      }

      const projDoc = await adminDb.collection('projects').doc(projectId).get();
      if (!projDoc.exists) return res.status(404).json({ error: 'Project not found' });
      project = projDoc.data();
    } else {
      user = globalStore.users.find((u) => u.uid === uid);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.status === 'DISABLED') return res.status(403).json({ error: 'Account disabled' });

      if (user.role === 'SUBSCRIBER') {
        if (new Date(user.subscriptionExpiry).getTime() <= Date.now()) {
          return res.status(403).json({ error: 'Subscription expired', expired: true });
        }

        const isAssigned = globalStore.assignments.some(
          (a) => a.userId === uid && a.projectId === projectId
        );

        if (!isAssigned) {
          return res.status(403).json({ error: 'You do not have access to this project. Please contact the admin.' });
        }
      }

      project = globalStore.projects.find((p) => p.id === projectId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error('[Project Details Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve project details' });
  }
}
