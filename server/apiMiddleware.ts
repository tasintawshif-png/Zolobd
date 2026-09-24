import type { Connect } from 'vite';
import crypto from 'crypto';

// In-memory / server-side admin credential storage (NEVER sent to client)
let currentAdminPasswordHash = crypto.createHash('sha256').update('12111209').digest('hex');
const activeTokens = new Set<string>();

export function createApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url || '';

    if (!url.startsWith('/api/')) {
      return next();
    }

    // CORS & JSON headers
    res.setHeader('Content-Type', 'application/json');

    const parseBody = async (): Promise<any> => {
      return new Promise((resolve) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk;
        });
        req.on('end', () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch {
            resolve({});
          }
        });
      });
    };

    if (url === '/api/admin/login' && req.method === 'POST') {
      const body = await parseBody();
      const inputPassword = (body.password || '').trim();
      const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');

      if (inputHash === currentAdminPasswordHash) {
        const token = 'admin_sess_' + crypto.randomBytes(32).toString('hex');
        activeTokens.add(token);
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          token,
          user: {
            role: 'admin',
            email: body.email || 'admin@store.com',
            name: 'Store Administrator'
          }
        }));
        return;
      } else {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid administrator password'
        }));
        return;
      }
    }

    if (url === '/api/admin/verify' && (req.method === 'GET' || req.method === 'POST')) {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (token && activeTokens.has(token)) {
        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          authenticated: true,
          user: { role: 'admin', name: 'Store Administrator' }
        }));
        return;
      } else {
        res.statusCode = 401;
        res.end(JSON.stringify({
          success: false,
          authenticated: false,
          error: 'Session expired or invalid token'
        }));
        return;
      }
    }

    if (url === '/api/admin/change-password' && req.method === 'POST') {
      res.statusCode = 403;
      res.end(JSON.stringify({
        success: false,
        error: 'Admin password cannot be changed. It is permanently fixed to default system credentials.'
      }));
      return;
    }

    if (url === '/api/admin/logout' && req.method === 'POST') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        activeTokens.delete(token);
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Default API 404
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  };
}
