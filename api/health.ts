import type { Request, Response } from 'express';
import { isFirebaseAdminConfigured } from './lib/firebaseAdmin.js';

export default async function handler(req: Request | any, res: Response | any) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Creative Inventor Project Portal API',
    version: '1.0.0',
    services: {
      firebaseAdmin: isFirebaseAdminConfigured ? 'CONNECTED' : 'MOCK_STORE_READY',
      database: isFirebaseAdminConfigured ? 'FIRESTORE' : 'IN_MEMORY_PERSISTED',
      storage: isFirebaseAdminConfigured ? 'FIREBASE_STORAGE' : 'LOCAL_MEDIA_STORE',
      resendEmail: Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('123456789'))
        ? 'CONFIGURED'
        : 'SIMULATED',
    },
    message: isFirebaseAdminConfigured
      ? 'Connected to live Firebase services.'
      : 'Running in development mode. To connect live Firebase, fill your credentials in .env.',
  });
}
