import { Router } from 'express';

import healthRouter from './health';
import lanesRouter from './lanes';
import quotesRouter from './quotes';
import accessorialsRouter from './accessorials';
import equipmentTypesRouter from './equipmentTypes';
import chatRoutes from './chat';

const router = Router();

// ─── API Routes ───────────────────────────────────────────
router.use('/health', healthRouter);
router.use('/lanes', lanesRouter);
router.use('/quotes', quotesRouter);
router.use('/accessorials', accessorialsRouter);

// renamed from equipmentMultipliers → equipmentTypes
router.use('/equipment-types', equipmentTypesRouter);

router.use('/chat', chatRoutes);

export default router;