import type { Request, Response } from 'express';
import { ensureInitialAdmin, getAdminConfig } from '../lib/adminAuth.js';

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getAdminConfig();
    const result = await ensureInitialAdmin();

    return res.status(200).json({
      success: true,
      created: result.created,
      message: result.message,
      admin: {
        userId: result.user.userId,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        status: result.user.status,
      },
    });
  } catch (error: any) {
    console.error('[Init Admin Endpoint Error]', error);
    return res.status(500).json({
      error: 'Failed to initialize Admin account',
      details: error.message,
    });
  }
}
