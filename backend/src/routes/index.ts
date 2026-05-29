import { Router } from 'express';
import healthRouter from './health';
import lanesRouter  from './lanes';
import quotesRouter from './quotes';
import accessorialsRouter from './accessorials';
import equipmentMultipliersRouter from './equipmentMultipliers'
import chatRoutes from './chat'

const router = Router();

// All API routes are versioned under /api.
// New resource routers get added here — nothing else changes.
router.use('/health',  healthRouter);
router.use('/lanes',  lanesRouter);
router.use('/quotes', quotesRouter);
router.use('/accessorials', accessorialsRouter)
router.use('/equipment-multipliers', equipmentMultipliersRouter)
router.use('/chat', chatRoutes)

export default router;
