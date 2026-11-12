import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

const assignSchema = z.object({
  action: z.enum(['ASSIGN', 'REMOVE', 'LIST_USER_PROJECTS', 'LIST_PROJECT_USERS', 'ASSIGN_ALL_ACTIVE']),
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  projectIds: z.array(z.string()).optional(),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method === 'GET') {
    // List all assignments
    if (isFirebaseAdminConfigured && adminDb) {
      const snap = await adminDb.collection('projectAssignments').get();
      const assignments = snap.docs.map((d: any) => d.data());
      return res.status(200).json({ assignments });
    }
    return res.status(200).json({ assignments: globalStore.assignments });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = assignSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input data' });
    }

    const { action, userId, userIds = [], projectId, projectIds = [] } = parseResult.data;
    const nowIso = new Date().toISOString();

    switch (action) {
      case 'ASSIGN': {
        // Handle single or multiple targets
        const targetUsers = userId ? [userId] : userIds;
        const targetProjects = projectId ? [projectId] : projectIds;

        if (targetUsers.length === 0 || targetProjects.length === 0) {
          return res.status(400).json({ error: 'Please specify both user(s) and project(s)' });
        }

        let addedCount = 0;

        if (isFirebaseAdminConfigured && adminDb) {
          const batch = adminDb.batch();
          for (const uId of targetUsers) {
            for (const pId of targetProjects) {
              // Check if already assigned
              const existing = await adminDb
                .collection('projectAssignments')
                .where('userId', '==', uId)
                .where('projectId', '==', pId)
                .limit(1)
                .get();

              if (existing.empty) {
                const asgnRef = adminDb.collection('projectAssignments').doc();
                batch.set(asgnRef, {
                  id: asgnRef.id,
                  userId: uId,
                  projectId: pId,
                  assignedAt: nowIso,
                  assignedBy: 'ADMIN',
                });
                addedCount++;
              }
            }
          }
          await batch.commit();
        } else {
          for (const uId of targetUsers) {
            for (const pId of targetProjects) {
              const exists = globalStore.assignments.some((a) => a.userId === uId && a.projectId === pId);
              if (!exists) {
                globalStore.assignments.push({
                  id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  userId: uId,
                  projectId: pId,
                  assignedAt: nowIso,
                  assignedBy: 'ADMIN',
                });
                addedCount++;
              }
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: `Successfully granted access (${addedCount} assignment link${addedCount === 1 ? '' : 's'} created).`,
        });
      }

      case 'ASSIGN_ALL_ACTIVE': {
        if (!projectId) {
          return res.status(400).json({ error: 'Project ID is required' });
        }

        let count = 0;
        if (isFirebaseAdminConfigured && adminDb) {
          const activeUsersSnap = await adminDb
            .collection('users')
            .where('role', '==', 'SUBSCRIBER')
            .where('status', '==', 'ACTIVE')
            .get();

          const batch = adminDb.batch();
          for (const uDoc of activeUsersSnap.docs) {
            const existing = await adminDb
              .collection('projectAssignments')
              .where('userId', '==', uDoc.id)
              .where('projectId', '==', projectId)
              .limit(1)
              .get();

            if (existing.empty) {
              const asgnRef = adminDb.collection('projectAssignments').doc();
              batch.set(asgnRef, {
                id: asgnRef.id,
                userId: uDoc.id,
                projectId,
                assignedAt: nowIso,
                assignedBy: 'ADMIN_ALL_ACTIVE',
              });
              count++;
            }
          }
          await batch.commit();
        } else {
          const activeUsers = globalStore.users.filter((u) => u.role === 'SUBSCRIBER' && u.status === 'ACTIVE');
          activeUsers.forEach((u) => {
            const exists = globalStore.assignments.some((a) => a.userId === u.uid && a.projectId === projectId);
            if (!exists) {
              globalStore.assignments.push({
                id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                userId: u.uid,
                projectId,
                assignedAt: nowIso,
                assignedBy: 'ADMIN_ALL_ACTIVE',
              });
              count++;
            }
          });
        }

        return res.status(200).json({
          success: true,
          message: `Project assigned to all active subscribers (${count} subscribers assigned).`,
        });
      }

      case 'REMOVE': {
        if (!userId || !projectId) {
          return res.status(400).json({ error: 'Both userId and projectId are required for removal' });
        }

        if (isFirebaseAdminConfigured && adminDb) {
          const snap = await adminDb
            .collection('projectAssignments')
            .where('userId', '==', userId)
            .where('projectId', '==', projectId)
            .get();

          for (const doc of snap.docs) {
            await doc.ref.delete();
          }
        } else {
          globalStore.assignments = globalStore.assignments.filter(
            (a) => !(a.userId === userId && a.projectId === projectId)
          );
        }

        return res.status(200).json({ success: true, message: 'Access revoked successfully.' });
      }

      default:
        return res.status(400).json({ error: 'Unsupported assignment action' });
    }
  } catch (error) {
    console.error('[Assign Project Error]', error);
    return res.status(500).json({ error: 'Failed to process project assignment' });
  }
}
