import { db } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { findLane } from './laneService';
import {
  Quote,
  CreateQuoteInput,
  RateBreakdown,
  QuoteFilters,
  EquipmentType,
} from '../types';

// ─── Rate Engine ──────────────────────────────────────────────────────────────
// All pricing logic is isolated here so it can be tested and extended
// independently from HTTP handling.

const EQUIPMENT_MULTIPLIERS: Record<EquipmentType, number> = {
  dry_van: 1.00,
  reefer:  1.30,
  flatbed: 1.15,
};

const WEIGHT_SURCHARGE_THRESHOLD_LBS = 10_000;
const WEIGHT_SURCHARGE_PER_100_LBS   = 0.10;

// Calculates a full rate breakdown from raw inputs.
// Returns every component separately so the UI can show a breakdown.
export function calculateRate(
  baseLaneRate:  number,
  equipmentType: EquipmentType,
  weightLbs:     number,
): RateBreakdown {
  const multiplier       = EQUIPMENT_MULTIPLIERS[equipmentType];
  const equipmentSurcharge = baseLaneRate * (multiplier - 1);

  // $0.10 per 100 lbs over 10,000 lbs
  const excessLbs       = Math.max(0, weightLbs - WEIGHT_SURCHARGE_THRESHOLD_LBS);
  const weightSurcharge = (excessLbs / 100) * WEIGHT_SURCHARGE_PER_100_LBS;

  // Placeholder for Phase 2 fuel surcharge logic
  const fuelSurcharge = 0;

  const totalRate =
    baseLaneRate + equipmentSurcharge + weightSurcharge + fuelSurcharge;

  return {
    base_rate:           round2(baseLaneRate),
    equipment_surcharge: round2(equipmentSurcharge),
    weight_surcharge:    round2(weightSurcharge),
    fuel_surcharge:      round2(fuelSurcharge),
    total_rate:          round2(totalRate),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Quote CRUD ───────────────────────────────────────────────────────────────

// Creates a new quote:
// 1. Looks up the matching seeded lane for base rate + distance
// 2. Runs the rate engine
// 3. Persists the full breakdown to the DB
// 4. Returns the saved quote row
export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  // Step 1: Lane lookup
  const lane = await findLane(
    input.origin_city,
    input.origin_province,
    input.destination_city,
    input.destination_province,
  );

  if (!lane) {
    throw new AppError(
      `No lane found for ${input.origin_city}, ${input.origin_province} → ${input.destination_city}, ${input.destination_province}. Check available lanes via GET /api/lanes.`,
      404,
    );
  }

  // Step 2: Rate calculation
  const baseRate   = parseFloat(lane.base_rate);
  const breakdown  = calculateRate(baseRate, input.equipment_type, input.weight_lbs);

  // Step 3: Persist
  const result = await db.query<Quote>(
    `INSERT INTO quotes (
        lane_id,
        origin_city, origin_province,
        destination_city, destination_province,
        distance_km, transit_days,
        equipment_type, weight_lbs, pickup_date,
        base_rate, equipment_surcharge, weight_surcharge,
        fuel_surcharge, total_rate, accessorials
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16
      )
      RETURNING *`,
    [
      lane.id,
      input.origin_city,        input.origin_province,
      input.destination_city,   input.destination_province,
      lane.distance_km,         lane.transit_days,
      input.equipment_type,     input.weight_lbs, input.pickup_date,
      breakdown.base_rate,      breakdown.equipment_surcharge,
      breakdown.weight_surcharge, breakdown.fuel_surcharge,
      breakdown.total_rate,
      JSON.stringify(input.accessorials ?? []),
    ],
  );

  return result.rows[0];
}

// Returns a paginated, filtered list of quotes.
export async function getQuotes(filters: QuoteFilters): Promise<{
  quotes: Quote[];
  total:  number;
}> {
  const conditions: string[] = [];
  const params: unknown[]    = [];
  let   p = 1;

  if (filters.equipment_type) {
    conditions.push(`equipment_type = $${p++}`);
    params.push(filters.equipment_type);
  }
  if (filters.status) {
    conditions.push(`status = $${p++}`);
    params.push(filters.status);
  }
  if (filters.date_from) {
    conditions.push(`pickup_date >= $${p++}`);
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`pickup_date <= $${p++}`);
    params.push(filters.date_to);
  }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit  = filters.limit  ?? 20;
  const offset = filters.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    db.query<Quote>(
      `SELECT * FROM quotes ${where} ORDER BY created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, limit, offset],
    ),
    db.query<{ count: string }>(
      `SELECT COUNT(*) FROM quotes ${where}`,
      params,
    ),
  ]);

  return {
    quotes: dataResult.rows,
    total:  parseInt(countResult.rows[0].count, 10),
  };
}

// Returns a single quote by ID.
export async function getQuoteById(id: string): Promise<Quote> {
  const result = await db.query<Quote>(
    `SELECT * FROM quotes WHERE id = $1`,
    [id],
  );
  if (!result.rows[0]) {
    throw new AppError(`Quote with id '${id}' not found`, 404);
  }
  return result.rows[0];
}
