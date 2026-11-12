import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminDb } from '../lib/firebaseAdmin.js';

const fileItemSchema = z.object({
  fileName: z.string().min(1),
  fileSizeBytes: z.number().min(1),
  fileType: z.string(),
  storagePath: z.string().optional(),
});

const createProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters'),
  description: z.string().min(10, 'Project description is required'),
  category: z.string().min(1, 'Category is required'),
  thumbnailUrl: z.string().optional(),
  instructions: z.string().default(''),
  version: z.string().default('v1.0'),
  isPublished: z.boolean().default(true),
  files: z.array(fileItemSchema).default([]),
  assignToAllActiveUsers: z.boolean().default(false),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input data' });
    }

    const data = parseResult.data;
    const nowIso = new Date().toISOString();
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Prepare files metadata
    const filesWithId = data.files.map((f, idx) => ({
      id: `file_${projectId}_${idx + 1}`,
      projectId,
      fileName: f.fileName,
      fileSizeBytes: f.fileSizeBytes,
      fileType: f.fileType.toUpperCase(),
      storagePath: f.storagePath || `projects/${projectId}/${f.fileName}`,
      uploadedAt: nowIso,
      downloadCount: 0,
    }));

    const newProject = {
      id: projectId,
      title: data.title,
      description: data.description,
      category: data.category,
      thumbnailUrl: data.thumbnailUrl || '/src/assets/images/thumb_esp32_iot_1794412649331.jpg',
      instructions: data.instructions,
      version: data.version,
      isPublished: data.isPublished,
      createdAt: nowIso,
      updatedAt: nowIso,
      files: filesWithId,
    };

    if (isFirebaseAdminConfigured && adminDb) {
      await adminDb.collection('projects').doc(projectId).set(newProject);

      for (const f of filesWithId) {
        await adminDb.collection('projectFiles').doc(f.id).set(f);
      }

      if (data.assignToAllActiveUsers) {
        const activeUsersSnap = await adminDb
          .collection('users')
          .where('role', '==', 'SUBSCRIBER')
          .where('status', '==', 'ACTIVE')
          .get();

        const batch = adminDb.batch();
        activeUsersSnap.docs.forEach((uDoc: any) => {
          const asgnRef = adminDb!.collection('projectAssignments').doc();
          batch.set(asgnRef, {
            id: asgnRef.id,
            userId: uDoc.id,
            projectId,
            assignedAt: nowIso,
            assignedBy: 'ADMIN_AUTO_BROADCAST',
          });
        });
        await batch.commit();
      }
    } else {
      globalStore.projects.unshift(newProject);

      if (data.assignToAllActiveUsers) {
        const activeUsers = globalStore.users.filter(
          (u) => u.role === 'SUBSCRIBER' && u.status === 'ACTIVE'
        );
        activeUsers.forEach((u) => {
          globalStore.assignments.push({
            id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: u.uid,
            projectId,
            assignedAt: nowIso,
            assignedBy: 'ADMIN_AUTO_BROADCAST',
          });
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Project "${data.title}" created successfully.`,
      project: newProject,
    });
  } catch (error) {
    console.error('[Create Project Error]', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}
