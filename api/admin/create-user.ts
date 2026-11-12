import type { Request, Response } from 'express';
import { z } from 'zod';
import { globalStore } from '../lib/mockStore.js';
import { isFirebaseAdminConfigured, adminAuth, adminDb } from '../lib/firebaseAdmin.js';
import { sendPortalEmail } from '../lib/resend.js';

const createUserSchema = z.object({
  userId: z.string().min(2, 'User ID is required (e.g. CI1004)'),
  name: z.string().min(2, 'Subscriber name is required'),
  email: z.string().email('Valid email address is required'),
  durationDays: z.number().min(1, 'Duration must be at least 1 day'),
  customExpiryIso: z.string().optional(),
  temporaryPassword: z.string().min(6).optional(),
  sendWelcomeEmail: z.boolean().default(true),
  assignedProjectIds: z.array(z.string()).optional(),
});

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid input data' });
    }

    const {
      userId,
      name,
      email,
      durationDays,
      customExpiryIso,
      temporaryPassword,
      sendWelcomeEmail,
      assignedProjectIds = [],
    } = parseResult.data;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUserId = userId.toUpperCase().trim();

    // 1. Check duplicate userId and email
    if (isFirebaseAdminConfigured && adminDb) {
      const emailCheck = await adminDb.collection('users').where('email', '==', normalizedEmail).limit(1).get();
      if (!emailCheck.empty) {
        return res.status(409).json({ error: `An account with email ${normalizedEmail} already exists.` });
      }

      const idCheck = await adminDb.collection('users').where('userId', '==', normalizedUserId).limit(1).get();
      if (!idCheck.empty) {
        return res.status(409).json({ error: `User ID ${normalizedUserId} is already taken. Please choose another.` });
      }
    } else {
      const emailExists = globalStore.users.some((u) => u.email.toLowerCase() === normalizedEmail);
      if (emailExists) {
        return res.status(409).json({ error: `An account with email ${normalizedEmail} already exists.` });
      }

      const idExists = globalStore.users.some((u) => u.userId.toUpperCase() === normalizedUserId);
      if (idExists) {
        return res.status(409).json({ error: `User ID ${normalizedUserId} is already taken. Please choose another.` });
      }
    }

    // 2. Calculate Start and Expiry Timestamps in UTC
    const now = new Date();
    const startIso = now.toISOString();

    let expiryIso: string;
    if (customExpiryIso) {
      const parsed = new Date(customExpiryIso);
      parsed.setUTCHours(23, 59, 59, 999);
      expiryIso = parsed.toISOString();
    } else {
      const expDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      expDate.setUTCHours(23, 59, 59, 999);
      expiryIso = expDate.toISOString();
    }

    const initialPassword = temporaryPassword || generateRandomPassword();
    let createdUid = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Create in Firebase Auth & Firestore
    if (isFirebaseAdminConfigured && adminAuth && adminDb) {
      try {
        const userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          displayName: name,
          password: initialPassword,
          emailVerified: true,
        });
        createdUid = userRecord.uid;

        // Set role claim
        await adminAuth.setCustomUserClaims(createdUid, { role: 'SUBSCRIBER' });
      } catch (authErr: any) {
        return res.status(500).json({ error: `Firebase Auth creation failed: ${authErr.message}` });
      }
    }

    const newUser = {
      uid: createdUid,
      userId: normalizedUserId,
      name,
      email: normalizedEmail,
      role: 'SUBSCRIBER' as const,
      status: 'ACTIVE' as const,
      subscriptionStart: startIso,
      subscriptionExpiry: expiryIso,
      durationDays,
      createdAt: startIso,
      updatedAt: startIso,
      rawPassword: initialPassword,
    };

    if (isFirebaseAdminConfigured && adminDb) {
      await adminDb.collection('users').doc(createdUid).set(newUser);

      // Create subscription record
      await adminDb.collection('subscriptions').add({
        userId: createdUid,
        userCode: normalizedUserId,
        startDate: startIso,
        expiryDate: expiryIso,
        durationDays,
        status: 'ACTIVE',
        createdAt: startIso,
      });

      // Handle assigned projects
      for (const projId of assignedProjectIds) {
        await adminDb.collection('projectAssignments').add({
          userId: createdUid,
          projectId: projId,
          assignedAt: startIso,
          assignedBy: 'ADMIN',
        });
      }
    } else {
      globalStore.users.unshift(newUser);

      for (const projId of assignedProjectIds) {
        globalStore.assignments.push({
          id: `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: createdUid,
          projectId: projId,
          assignedAt: startIso,
          assignedBy: 'ADMIN',
        });
      }
    }

    // 4. Send Welcome Email via Resend if requested
    let emailStatus = 'SKIPPED';
    if (sendWelcomeEmail) {
      const emailResult = await sendPortalEmail({
        to: normalizedEmail,
        subject: `Welcome to Creative Inventor Project Portal - Your Credentials (${normalizedUserId})`,
        templateType: 'WELCOME',
        data: {
          name,
          userId: normalizedUserId,
          email: normalizedEmail,
          uid: createdUid,
          durationDays,
          subscriptionStart: new Date(startIso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
          subscriptionExpiry: new Date(expiryIso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
      });

      emailStatus = emailResult.success ? 'SENT' : 'FAILED';
      globalStore.emailLogs.unshift({
        id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        recipientEmail: normalizedEmail,
        subject: `Welcome to Creative Inventor Project Portal - Your Credentials (${normalizedUserId})`,
        templateType: 'WELCOME',
        sentAt: new Date().toISOString(),
        status: emailResult.success ? 'SENT' : 'FAILED',
        errorDetails: emailResult.error,
      });
    }

    return res.status(201).json({
      success: true,
      message: `Subscriber ${name} (${normalizedUserId}) created successfully.`,
      user: {
        ...newUser,
        temporaryPassword: initialPassword,
      },
      emailStatus,
    });
  } catch (error) {
    console.error('[Create User Error]', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}
