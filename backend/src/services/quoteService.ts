import { pool } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { findLane } from './laneService';
import {
  Quote,
  CreateQuoteInput,
  RateBreakdown,
  QuoteFilters,
  EquipmentType,
} from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const WEIGHT_SURCHARGE_THRESHOLD_LBS = 10_000;
const WEIGHT_SURCHARGE_PER_100_LBS = 0.10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Get company-specific equipment multiplier
async function getEquipmentMultiplier(
  companyId: string,
  equipmentType: EquipmentType,
): Promise<number> {
  const result = await pool.query<{ multiplier: string }>(
    `
    SELECT cer.multiplier
    FROM company_equipment_rates cer
    JOIN equipment_types et ON et.id = cer.equipment_id
    WHERE cer.company_id = $1
      AND et.code = $2
    LIMIT 1
    `,
    [companyId, equipmentType],
  );

  return result.rows[0] ? Number(result.rows[0].multiplier) : 1.0;
}

// ─── Rate Engine ──────────────────────────────────────────────────────────────

export async function calculateRate(
  companyId: string,
  baseLaneRate: number,
  equipmentType: EquipmentType,
  weightLbs: number,
  accessorialTotal: number = 0,
): Promise<RateBreakdown> {

  const multiplier = await getEquipmentMultiplier(companyId, equipmentType);

  const equipmentSurcharge = baseLaneRate * (multiplier - 1);

  const excessLbs = Math.max(
    0,
    weightLbs - WEIGHT_SURCHARGE_THRESHOLD_LBS,
  );

  const weightSurcharge =
    (excessLbs / 100) * WEIGHT_SURCHARGE_PER_100_LBS;

  const fuelSurcharge = 0;

  const totalRate =
    baseLaneRate +
    equipmentSurcharge +
    weightSurcharge +
    fuelSurcharge +
    accessorialTotal;

  return {
    base_rate: round2(baseLaneRate),
    equipment_surcharge: round2(equipmentSurcharge),
    weight_surcharge: round2(weightSurcharge),
    fuel_surcharge: round2(fuelSurcharge),
    total_rate: round2(totalRate),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Quote CRUD ───────────────────────────────────────────────────────────────

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
      `No lane found for ${input.origin_city}, ${input.origin_province} → ${input.destination_city}, ${input.destination_province}`,
      404,
    );
  }

  const baseRate = Number(lane.base_rate);

  // Step 2: Accessorial pricing (company-specific)
  let accessorialTotal = 0;

  if (input.accessorials?.length) {
    const placeholders = input.accessorials
      .map((_, i) => `$${i + 2}`)
      .join(',');

    const result = await pool.query<{ price: string }>(
      `
      SELECT car.price
      FROM company_accessorial_rates car
      JOIN accessorials a ON a.id = car.accessorial_id
      WHERE car.company_id = $1
        AND a.name IN (${placeholders})
      `,
      [input.company_id, ...input.accessorials],
    );

    accessorialTotal = result.rows.reduce(
      (sum, row) => sum + Number(row.price),
      0,
    );
  }

  // Step 3: Rate calculation
  const breakdown = await calculateRate(
    input.company_id,
    baseRate,
    input.equipment_type,
    input.weight_lbs,
    accessorialTotal,
  );

  // Step 4: Save quote
  const result = await pool.query<Quote>(
    `
    INSERT INTO quotes (
      company_id,
      lane_id,
      origin_city,
      origin_province,
      destination_city,
      destination_province,
      distance_km,
      transit_days,
      equipment_type,
      weight_lbs,
      pickup_date,
      base_rate,
      equipment_surcharge,
      weight_surcharge,
      fuel_surcharge,
      total_rate,
      status,
      notes
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18
    )
    RETURNING *
    `,
    [
      input.company_id,
      lane.id,
      input.origin_city,
      input.origin_province,
      input.destination_city,
      input.destination_province,
      lane.distance_km,
      lane.transit_days,
      input.equipment_type,
      input.weight_lbs,
      input.pickup_date,
      breakdown.base_rate,
      breakdown.equipment_surcharge,
      breakdown.weight_surcharge,
      breakdown.fuel_surcharge,
      breakdown.total_rate,
      'draft',
      null,
    ],
  );

  return result.rows[0];
}

// ─── GET QUOTES (COMPANY SCOPED) ─────────────────────────────────────────────

export async function getQuotes(filters: QuoteFilters, companyId: string): Promise<{
  quotes: Quote[];
  total: number;
}> {
  const conditions: string[] = [`company_id = $1`];
  const params: unknown[] = [companyId];
  let p = 2;

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

  const where = `WHERE ${conditions.join(' AND ')}`;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    pool.query<Quote>(
      `
      SELECT * FROM quotes
      ${where}
      ORDER BY created_at DESC
      LIMIT $${p} OFFSET $${p + 1}
      `,
      [...params, limit, offset],
    ),
    pool.query<{ count: string }>(
      `
      SELECT COUNT(*) FROM quotes
      ${where}
      `,
      params,
    ),
  ]);

  return {
    quotes: dataResult.rows,
    total: Number(countResult.rows[0].count),
  };
}

// ─── GET SINGLE QUOTE ────────────────────────────────────────────────────────

export async function getQuoteById(
  id: string,
  companyId: string,
): Promise<Quote> {
  const result = await pool.query<Quote>(
    `
    SELECT * FROM quotes
    WHERE id = $1 AND company_id = $2
    `,
    [id, companyId],
  );

  if (!result.rows[0]) {
    throw new AppError(`Quote not found`, 404);
  }

  return result.rows[0];
}