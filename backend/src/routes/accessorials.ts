import { Router } from 'express'
import { db } from '../db/client'
import { Accessorial } from '../types'

const router = Router()

// GET /api/accessorials
// Returns all active accessorials with labels and prices.
// Frontend uses this to populate the options step.
router.get('/', async (_req, res, next) => {
  try {
    const result = await db.query<Accessorial>(
      `SELECT * FROM accessorials WHERE is_active = true ORDER BY label`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

export default router