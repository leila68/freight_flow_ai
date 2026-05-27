import { z } from 'zod';

// ─── Shared enums ─────────────────────────────────────────────────────────────

export const equipmentTypeSchema = z.enum(['dry_van', 'reefer', 'flatbed'], {
  errorMap: () => ({
    message: "Equipment type must be 'dry_van', 'reefer', or 'flatbed'",
  }),
});

export const quoteStatusSchema = z.enum(['draft', 'sent', 'accepted', 'expired']);

// ─── Create quote ─────────────────────────────────────────────────────────────

export const createQuoteSchema = z.object({
  origin_city: z
    .string()
    .min(2, 'Origin city must be at least 2 characters')
    .max(100),

  origin_province: z
    .string()
    .length(2, 'Province must be a 2-letter code (e.g. ON, QC)')
    .toUpperCase(),

  destination_city: z
    .string()
    .min(2, 'Destination city must be at least 2 characters')
    .max(100),

  destination_province: z
    .string()
    .length(2, 'Province must be a 2-letter code (e.g. ON, QC)')
    .toUpperCase(),

  equipment_type: equipmentTypeSchema,

  weight_lbs: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .positive('Weight must be greater than 0')
    .max(48000, 'Maximum weight is 48,000 lbs (legal limit)'),

  pickup_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pickup date must be in YYYY-MM-DD format')
    .refine((d) => {
      const date = new Date(d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Pickup date cannot be in the past'),
    
  accessorials: z
    .array(z.string())
    .default([]),
});

export type CreateQuoteBody = z.infer<typeof createQuoteSchema>;

// ─── Quote list filters (query params) ───────────────────────────────────────

export const quoteFiltersSchema = z.object({
  equipment_type: equipmentTypeSchema.optional(),
  status: quoteStatusSchema.optional(),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
  offset: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
});

// ─── Lane search (query params) ───────────────────────────────────────────────

export const laneSearchSchema = z.object({
  q: z.string().min(1).max(100),
  field: z.enum(['origin', 'destination', 'both']).default('both'),
});
