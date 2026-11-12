import { isFirebaseAdminConfigured, adminAuth, adminDb, FieldValue } from './firebaseAdmin.js';
import { globalStore } from './mockStore.js';
import type { ApiUser } from './types.js';

export interface AdminConfig {
  userId: string;
  email: string;
  password: string;
  name: string;
}

export function getAdminConfig(): AdminConfig {
  return {
    userId: (process.env.ADMIN_USER_ID || 'admin').trim(),
    email: (
      process.env.ADMIN_EMAIL ||
      process.env.ADMIN_BOOTSTRAP_EMAIL ||
      '20sgamingrohit@gmail.com'
    ).toLowerCase().trim(),
    password: (
      process.env.ADMIN_INITIAL_PASSWORD ||
      process.env.ADMIN_PASSWORD ||
      '123'
    ).trim(),
    name: (process.env.ADMIN_NAME || 'Administrator').trim(),
  };
}

let isInitialized = false;

/**
 * Ensures the initial Admin account exists in Firebase Auth & Firestore (or dev store).
 * Safe to call multiple times: will never duplicate or overwrite an existing admin.
 */
export async function ensureInitialAdmin(): Promise<{
  created: boolean;
  user: ApiUser | any;
  message: string;
}> {
  const config = getAdminConfig();

  if (isFirebaseAdminConfigured && adminDb && adminAuth) {
    try {
      // 1. Check if admin profile already exists in Firestore by userId or email
      const usersRef = adminDb.collection('users');
      const [byUserId, byEmail] = await Promise.all([
        usersRef.where('userId', 'in', [config.userId, config.userId.toUpperCase(), 'admin', 'ADMIN']).limit(1).get(),
        usersRef.where('email', '==', config.email).limit(1).get(),
      ]);

      let existingDoc = null;
      if (!byUserId.empty) {
        existingDoc = byUserId.docs[0];
      } else if (!byEmail.empty) {
        existingDoc = byEmail.docs[0];
      }

      if (existingDoc) {
        const existingData = existingDoc.data() as ApiUser;
        isInitialized = true;
        return {
          created: false,
          user: existingData,
          message: 'Admin account already exists in Firestore.',
        };
      }

      // 2. Check if user already exists in Firebase Auth
      let authUser = null;
      try {
        authUser = await adminAuth.getUserByEmail(config.email);
      } catch (err: any) {
        if (err.code !== 'auth/user-not-found') {
          console.warn('[Admin Init Warning]:', err.message);
        }
      }

      let uid = '';
      if (!authUser) {
        // Create in Firebase Auth
        const newAuthUser = await adminAuth.createUser({
          email: config.email,
          password: config.password,
          displayName: config.name,
          emailVerified: true,
        });
        uid = newAuthUser.uid;
        console.log(`[Admin Init] Created Firebase Auth user: ${config.email} (${uid})`);
      } else {
        uid = authUser.uid;
      }

      // Set custom claims for security rules
      await adminAuth.setCustomUserClaims(uid, {
        role: 'admin',
        admin: true,
      });

      // 3. Create Admin Profile in Firestore under users/{uid}
      const nowIso = new Date().toISOString();
      const adminProfile = {
        uid,
        userId: config.userId.toLowerCase(),
        email: config.email,
        name: config.name,
        role: 'admin',
        status: 'active',
        subscriptionStart: nowIso,
        subscriptionExpiry: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        durationDays: 36500,
        createdAt: FieldValue && typeof FieldValue.serverTimestamp === 'function' ? FieldValue.serverTimestamp() : nowIso,
        updatedAt: nowIso,
        lastLogin: nowIso,
      };

      await adminDb.collection('users').doc(uid).set(adminProfile, { merge: true });

      // Also set admins/{uid} document for security rules exists() check
      await adminDb.collection('admins').doc(uid).set({
        email: config.email,
        role: 'admin',
        createdAt: nowIso,
      }, { merge: true });

      isInitialized = true;
      console.log(`[Admin Init] Initial Admin profile established in Firestore users/${uid}`);

      return {
        created: true,
        user: adminProfile,
        message: 'Initial Admin account successfully created in Firebase Auth and Firestore.',
      };
    } catch (error: any) {
      console.error('[Admin Init Error]:', error);
      throw new Error(`Failed to initialize Admin in Firebase: ${error.message}`);
    }
  } else {
    // Development Mock Store Mode
    let existingAdmin = globalStore.users.find(
      (u) =>
        u.userId.toLowerCase() === config.userId.toLowerCase() ||
        u.userId.toLowerCase() === 'admin' ||
        u.email.toLowerCase() === config.email.toLowerCase() ||
        u.role.toLowerCase() === 'admin'
    );

    if (existingAdmin) {
      // Normalize admin properties to match specifications
      existingAdmin.userId = 'admin';
      existingAdmin.email = config.email;
      existingAdmin.name = config.name;
      existingAdmin.role = 'admin';
      existingAdmin.status = 'active';
      existingAdmin.rawPassword = config.password;
      isInitialized = true;
      return {
        created: false,
        user: existingAdmin,
        message: 'Admin account verified in store.',
      };
    }

    const nowIso = new Date().toISOString();
    const newAdmin: ApiUser = {
      uid: 'admin_master_uid',
      userId: 'admin',
      email: config.email,
      name: config.name,
      role: 'admin',
      status: 'active',
      subscriptionStart: nowIso,
      subscriptionExpiry: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      durationDays: 36500,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLogin: nowIso,
      rawPassword: config.password,
    };

    globalStore.users.unshift(newAdmin);
    isInitialized = true;
    console.log(`[Admin Init] Initial Admin account initialized in store: admin / ${config.password}`);

    return {
      created: true,
      user: newAdmin,
      message: 'Initial Admin created in development store.',
    };
  }
}
