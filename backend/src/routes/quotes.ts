import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createQuoteSchema, quoteFiltersSchema } from '../schemas/quote';
import {
  createQuote,
  getQuotes,
  getQuoteById,
} from '../services/quoteService';

const router = Router();

// POST /api/quotes
// Accepts shipment details, runs the rate engine, persists and returns
// the quote with a full price breakdown.
//
// Request body: CreateQuoteBody
// Response:     { success: true, data: Quote }
router.post(
  '/',
  validate(createQuoteSchema, 'body'),
  async (req, res, next) => {
    try {
      const quote = await createQuote(req.body);
      res.status(201).json({ success: true, data: quote });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/quotes
// Returns paginated list of quotes with optional filters.
//
// Query params:
//   equipment_type  dry_van | reefer | flatbed
//   status          draft | sent | accepted | expired
//   date_from       YYYY-MM-DD
//   date_to         YYYY-MM-DD
//   limit           default 20, max 100
//   offset          default 0
router.get(
  '/',
  validate(quoteFiltersSchema, 'query'),
  async (req, res, next) => {
    try {
      const filters = req.query as any;
      const result  = await getQuotes(filters);
      res.json({
        success: true,
        data:    result.quotes,
        total:   result.total,
        limit:   filters.limit,
        offset:  filters.offset,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/quotes/:id
// Returns a single quote by UUID.
router.get('/:id', async (req, res, next) => {
  try {
    const quote = await getQuoteById(req.params.id);
    res.json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
});


export default router;
