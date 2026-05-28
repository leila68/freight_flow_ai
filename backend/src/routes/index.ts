import { Router } from 'express';
import healthRouter from './health';
import lanesRouter  from './lanes';
import quotesRouter from './quotes';
import accessorialsRouter from './accessorials';
import equipmentMultipliersRouter from './equipmentMultipliers'

const router = Router();

// All API routes are versioned under /api.
// New resource routers get added here — nothing else changes.
router.use('/health',  healthRouter);
router.use('/api/lanes',  lanesRouter);
router.use('/api/quotes', quotesRouter);
router.use('/api/accessorials', accessorialsRouter)
router.use('/api/equipment-multipliers', equipmentMultipliersRouter)

export default router;
