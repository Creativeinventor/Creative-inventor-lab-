import type { Request, Response } from 'express';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb, FieldPath } from '../lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    const authHeader = (req.headers.authorization as string) || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const parts = token.split('_');
    const uid = parts.length >= 3 ? parts.slice(2, -1).join('_') : null;

    if (!uid) {
      return res.status(401).json({ error: 'Invalid authentication session' });
    }

    let user: any = null;
    let assignedProjectIds: string[] = [];

    if (isFirebaseAdminConfigured && adminDb) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = userDoc.data();

      // Check status
      if (user.status === 'DISABLED') {
        return res.status(403).json({ error: 'Account disabled' });
      }

      if (user.role === 'SUBSCRIBER') {
        if (new Date(user.subscriptionExpiry).getTime() <= Date.now()) {
          return res.status(403).json({ error: 'Subscription expired', expired: true });
        }

        // Fetch assignments
        const asgnSnap = await adminDb.collection('projectAssignments').where('userId', '==', uid).get();
        assignedProjectIds = asgnSnap.docs.map((d: any) => d.data().projectId);

        if (assignedProjectIds.length === 0) {
          return res.status(200).json({ projects: [] });
        }

        // Fetch the assigned projects
        const projsSnap = await adminDb
          .collection('projects')
          .where(FieldPath.documentId(), 'in', assignedProjectIds.slice(0, 30))
          .get();

        const projects = projsSnap.docs.map((d: any) => d.data()).filter((p: any) => p.isPublished);
        return res.status(200).json({ projects });
      } else {
        // Admin gets all projects
        const allSnap = await adminDb.collection('projects').get();
        return res.status(200).json({ projects: allSnap.docs.map((d: any) => d.data()) });
      }
    } else {
      user = globalStore.users.find((u) => u.uid === uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.status === 'DISABLED') {
        return res.status(403).json({ error: 'Account disabled' });
      }

      if (user.role === 'SUBSCRIBER') {
        if (new Date(user.subscriptionExpiry).getTime() <= Date.now()) {
          return res.status(403).json({ error: 'Subscription expired', expired: true });
        }

        assignedProjectIds = globalStore.assignments
          .filter((a) => a.userId === uid)
          .map((a) => a.projectId);

        const assignedProjects = globalStore.projects.filter(
          (p) => p.isPublished && assignedProjectIds.includes(p.id)
        );

        return res.status(200).json({ projects: assignedProjects });
      } else {
        return res.status(200).json({ projects: globalStore.projects });
      }
    }
  } catch (error) {
    console.error('[Projects List Error]', error);
    return res.status(500).json({ error: 'Failed to retrieve projects' });
  }
}
