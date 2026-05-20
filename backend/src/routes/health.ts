import { Router } from 'express';
import { db } from '../db/client';

const router = Router();

// GET /health
// Used by Docker's healthcheck and any uptime monitoring.
// Returns db connectivity status alongside app info.
router.get('/', async (_req, res) => {
  let dbStatus = 'ok';

  try {
    await db.query('SELECT 1');
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'ok' ? 200 : 503;

  res.status(status).json({
    status:    dbStatus === 'ok' ? 'ok' : 'degraded',
    app:       'FreightFlow AI',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    database:  dbStatus,
  });
});

export default router;
