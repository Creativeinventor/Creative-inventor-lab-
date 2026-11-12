import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, FieldPath } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}
export const isFirebaseAdminConfigured = Boolean(projectId &&
    clientEmail &&
    privateKey &&
    !clientEmail.includes('xxxxx') &&
    !privateKey.includes('MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD'));
let adminApp = null;
let adminAuth = null;
let adminDb = null;
let adminStorage = null;
if (isFirebaseAdminConfigured) {
    try {
        if (getApps().length === 0) {
            adminApp = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
            });
        }
        else {
            adminApp = getApps()[0];
        }
        adminAuth = getAuth(adminApp);
        adminDb = getFirestore(adminApp);
        adminStorage = getStorage(adminApp);
        console.log('[Firebase Admin] Successfully initialized with live credentials for project:', projectId);
    }
    catch (error) {
        console.error('[Firebase Admin Initialization Failed]:', error);
    }
}
else {
    console.log('[Firebase Admin] Environment credentials not set. Running in development mock-ready store mode.');
}
export { adminApp, adminAuth, adminDb, adminStorage, FieldValue, FieldPath };
