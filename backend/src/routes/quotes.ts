import { Router } from 'express';
import { validate } from '../middleware/validate';
import { createQuoteSchema, quoteFiltersSchema } from '../schemas/quote';

import {
  createQuote,
  getQuotes,
  getQuoteById,
} from '../services/quoteService';

const router = Router();

// ─── POST /api/quotes ─────────────────────────────────────
// Create quote (company-scoped via auth middleware)

router.post(
  '/',
  validate(createQuoteSchema, 'body'),
  async (req: any, res, next) => {
    try {
      const companyId = req.user.company_id; // 🔐 IMPORTANT

      const quote = await createQuote({
        ...req.body,
        company_id: companyId,
      });

      res.status(201).json({
        success: true,
        data: quote,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /api/quotes ───────────────────────────────────────
// Company-scoped list

router.get(
  '/',
  validate(quoteFiltersSchema, 'query'),
  async (req: any, res, next) => {
    try {
      const companyId = req.user.company_id;

      const filters = req.query as any;

      const result = await getQuotes(filters, companyId);

      res.json({
        success: true,
        data: result.quotes,
        meta: {
          total: result.total,
          limit: filters.limit ?? 20,
          offset: filters.offset ?? 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /api/quotes/:id ───────────────────────────────────
// Company-scoped single quote

router.get('/:id', async (req: any, res, next) => {
  try {
    const companyId = req.user.company_id;

    const quote = await getQuoteById(req.params.id, companyId);

    res.json({
      success: true,
      data: quote,
    });
  } catch (err) {
    next(err);
  }
});

export default router;