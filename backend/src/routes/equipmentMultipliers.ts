import { Router } from 'express'
import { db } from '../db/client'

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT equipment_type, multiplier, label FROM equipment_multipliers ORDER BY equipment_type`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

export default router