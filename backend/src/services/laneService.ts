import { db } from '../db/client';
import { AppError } from '../middleware/errorHandler';
import { Lane } from '../types';

// Returns all seeded lanes
export async function getAllLanes(): Promise<Lane[]> {
  const result = await db.query<Lane>(
    `SELECT * FROM lanes ORDER BY origin_city, destination_city`,
  );
  return result.rows;
}

// Searches lanes by city name (origin, destination, or both).
// Uses ILIKE for case-insensitive partial matching.
export async function searchLanes(
  query: string,
  field: 'origin' | 'destination' | 'both' = 'both',
): Promise<Lane[]> {
  const q = `%${query.trim()}%`;

  let sql: string;
  let params: string[];

  if (field === 'origin') {
    sql    = `SELECT * FROM lanes WHERE origin_city ILIKE $1 ORDER BY origin_city LIMIT 10`;
    params = [q];
  } else if (field === 'destination') {
    sql    = `SELECT * FROM lanes WHERE destination_city ILIKE $1 ORDER BY destination_city LIMIT 10`;
    params = [q];
  } else {
    sql    = `SELECT * FROM lanes WHERE origin_city ILIKE $1 OR destination_city ILIKE $1 ORDER BY origin_city LIMIT 10`;
    params = [q];
  }

  const result = await db.query<Lane>(sql, params);
  return result.rows;
}

// Finds the best matching lane for a given origin → destination pair.
// Returns null when no seeded lane matches (custom lane path, Phase 2).
export async function findLane(
  originCity:           string,
  originProvince:       string,
  destinationCity:      string,
  destinationProvince:  string,
): Promise<Lane | null> {
  const result = await db.query<Lane>(
    `SELECT * FROM lanes
     WHERE LOWER(origin_city)           = LOWER($1)
       AND LOWER(origin_province)       = LOWER($2)
       AND LOWER(destination_city)      = LOWER($3)
       AND LOWER(destination_province)  = LOWER($4)
     LIMIT 1`,
    [originCity, originProvince, destinationCity, destinationProvince],
  );
  return result.rows[0] ?? null;
}

// Fetches a single lane by ID — used internally when building quote responses.
export async function getLaneById(id: string): Promise<Lane> {
  const result = await db.query<Lane>(
    `SELECT * FROM lanes WHERE id = $1`,
    [id],
  );
  if (!result.rows[0]) {
    throw new AppError(`Lane with id '${id}' not found`, 404);
  }
  return result.rows[0];
}
