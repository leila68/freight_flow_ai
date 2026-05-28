// ─── Database row types ───────────────────────────────────────────────────────
// These mirror the PostgreSQL table columns exactly.
// Use these as return types from db.query() calls.

export type EquipmentType = 'dry_van' | 'reefer' | 'flatbed';
export type QuoteStatus   = 'draft' | 'sent' | 'accepted' | 'expired';

export interface Lane {
  id:                    string;
  origin_city:           string;
  origin_province:       string;
  origin_postal:         string;
  destination_city:      string;
  destination_province:  string;
  destination_postal:    string;
  base_rate:             string; // pg returns NUMERIC as string
  distance_km:           number;
  transit_days:          number;
  created_at:            Date;
  updated_at:            Date;
}

export interface Quote {
  id:                    string;
  lane_id:               string | null;
  origin_city:           string;
  origin_province:       string;
  destination_city:      string;
  destination_province:  string;
  distance_km:           number;
  transit_days:          number;
  equipment_type:        EquipmentType;
  weight_lbs:            string; // pg NUMERIC → string
  pickup_date:           Date;
  base_rate:             string;
  equipment_surcharge:   string;
  weight_surcharge:      string;
  fuel_surcharge:        string;
  total_rate:            string;
  status:                QuoteStatus;
  notes:                 string | null;
  created_at:            Date;
  updated_at:            Date;
  accessorials:          string[];
}

export interface EquipmentMultiplier {
  id:             number;
  equipment_type: EquipmentType;
  multiplier:     string; // pg NUMERIC → string
  label:          string;
}

// ─── Service / API types ──────────────────────────────────────────────────────

// Parsed and validated input for creating a quote
export interface CreateQuoteInput {
  origin_city:         string;
  origin_province:     string;
  destination_city:    string;
  destination_province: string;
  equipment_type:      EquipmentType;
  weight_lbs:          number;
  pickup_date:         string; // ISO date string YYYY-MM-DD
  accessorials:        string[];
}

// Human-readable rate breakdown returned with each quote
export interface RateBreakdown {
  base_rate:           number;
  equipment_surcharge: number;
  weight_surcharge:    number;
  fuel_surcharge:      number;
  total_rate:          number;
}

// Filters for GET /api/quotes
export interface QuoteFilters {
  equipment_type?: EquipmentType;
  date_from?:      string;
  date_to?:        string;
  status?:         QuoteStatus;
  limit?:          number;
  offset?:         number;
}

export interface Accessorial {
  id:          number
  code:        string
  label:       string
  price:       string  // pg returns NUMERIC as string
  description: string | null
  is_active:   boolean
  created_at:  Date
}
