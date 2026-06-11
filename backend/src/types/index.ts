// ─────────────────────────────────────────────────────────────
// Database row types
// ─────────────────────────────────────────────────────────────

export type EquipmentType =
  | 'dry_van'
  | 'reefer'
  | 'flatbed';

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'expired';

export interface Company {
  id: string;
  name: string;
  created_at: Date;
}

export interface User {
  id: string;

  company_id: string;

  email: string;

  password_hash: string;

  role: 'admin' | 'dispatcher' | 'user';

  created_at: Date;
}

export interface Lane {
  id: string;

  origin_city: string;
  origin_province: string;

  destination_city: string;
  destination_province: string;

  base_rate: string; // NUMERIC -> string
  distance_km: number;
  transit_days: number;

  created_at: Date;
  updated_at: Date;
}

export interface EquipmentTypeRow {
  id: number;

  code: EquipmentType;

  name: string;
}

export interface CompanyEquipmentRate {
  id: string;

  company_id: string;

  equipment_id: number;

  multiplier: string;

  updated_at?: Date;
}

export interface Accessorial {
  id: number;

  code: string;

  name: string;
}

export interface CompanyAccessorialRate {
  id: string;

  company_id: string;

  accessorial_id: number;

  price: string;
}

export interface Quote {
  id: string;

  company_id: string;

  lane_id: string | null;

  origin_city: string;
  origin_province: string;

  destination_city: string;
  destination_province: string;

  distance_km: number;
  transit_days: number;

  equipment_type: EquipmentType;

  weight_lbs: string;

  pickup_date: Date;

  base_rate: string;
  equipment_surcharge: string;
  weight_surcharge: string;
  fuel_surcharge: string;
  total_rate: string;

  status: QuoteStatus;

  notes: string | null;

  created_at: Date;
  updated_at: Date;
}

export interface RetrievalDocument {
  id: string;

  company_id: string;

  entity_type: string;

  entity_id: string | null;

  content: string;

  embedding: number[] | null;

  created_at: Date;
}

// ─────────────────────────────────────────────────────────────
// Service / API types
// ─────────────────────────────────────────────────────────────

export interface CreateQuoteInput {
  company_id: string;

  origin_city: string;
  origin_province: string;

  destination_city: string;
  destination_province: string;

  equipment_type: EquipmentType;

  weight_lbs: number;

  pickup_date: string;

  accessorials?: string[];
}

export interface RateBreakdown {
  base_rate: number;

  equipment_surcharge: number;

  weight_surcharge: number;

  fuel_surcharge: number;

  total_rate: number;
}

export interface QuoteFilters {
  equipment_type?: EquipmentType;

  status?: QuoteStatus;

  date_from?: string;

  date_to?: string;

  limit?: number;

  offset?: number;
}