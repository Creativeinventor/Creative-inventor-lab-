import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Handlers
import healthHandler from './api/health.js';
import loginHandler from './api/auth/login.js';
import meHandler from './api/auth/me.js';
import setupPasswordHandler from './api/auth/setup-password.js';
import statsHandler from './api/admin/stats.js';
import usersHandler from './api/admin/users.js';
import createUserHandler from './api/admin/create-user.js';
import manageUserHandler from './api/admin/manage-user.js';
import projectsHandler from './api/admin/projects.js';
import createProjectHandler from './api/admin/create-project.js';
import assignProjectHandler from './api/admin/assign-project.js';
import logsHandler from './api/admin/logs.js';
import subscriberProjectsHandler from './api/projects/list.js';
import projectDetailsHandler from './api/projects/details.js';
import downloadCreateHandler from './api/downloads/create.js';
import cronCheckHandler from './api/cron/subscription-check.js';
import initAdminHandler from './api/auth/init-admin.js';
import { ensureInitialAdmin } from './api/lib/adminAuth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Mount API Endpoints
  app.all('/api/health', healthHandler);
  app.all('/api/auth/login', loginHandler);
  app.all('/api/auth/me', meHandler);
  app.all('/api/auth/setup-password', setupPasswordHandler);
  app.all('/api/admin/stats', statsHandler);
  app.all('/api/admin/users', usersHandler);
  app.all('/api/admin/create-user', createUserHandler);
  app.all('/api/admin/manage-user', manageUserHandler);
  app.all('/api/admin/projects', projectsHandler);
  app.all('/api/admin/create-project', createProjectHandler);
  app.all('/api/admin/assign-project', assignProjectHandler);
  app.all('/api/admin/logs', logsHandler);
  app.all('/api/projects/list', subscriberProjectsHandler);
  app.all('/api/projects/details', projectDetailsHandler);
  app.all('/api/downloads/create', downloadCreateHandler);
  app.all('/api/cron/subscription-check', cronCheckHandler);
  app.all('/api/auth/init-admin', initAdminHandler);

  // Auto-initialize Admin account securely on startup if not already created
  ensureInitialAdmin().catch((e) => console.warn('[Auto-Init Admin Notice]:', e.message));

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Creative Inventor Portal] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Failure]:', err);
  process.exit(1);
});
