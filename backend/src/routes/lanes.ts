import { Router } from 'express';
import { validate } from '../middleware/validate';
import { laneSearchSchema } from '../schemas/quote';
import { getAllLanes, searchLanes } from '../services/laneService';

const router = Router();

// GET /api/lanes
// Returns all seeded lanes. Used to populate dropdowns in the UI.
router.get('/', async (_req, res, next) => {
  try {
    const lanes = await getAllLanes();
    res.json({ success: true, data: lanes, total: lanes.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/lanes/search?q=Toronto&field=origin
// Autocomplete endpoint. Returns up to 10 matching lanes.
// The frontend calls this as the user types in the city field.
router.get(
  '/search',
  validate(laneSearchSchema, 'query'),
  async (req, res, next) => {
    try {
      const { q, field } = req.query as { q: string; field: 'origin' | 'destination' | 'both' };
      const lanes = await searchLanes(q, field);
      res.json({ success: true, data: lanes, total: lanes.length });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
