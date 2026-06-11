import { Router } from 'express';
import { pool } from '../db/client';

const router = Router();

// GET /api/equipment-types
// Returns available equipment types (global list)
router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT id, code, name
      FROM equipment_types
      ORDER BY name
      `
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;