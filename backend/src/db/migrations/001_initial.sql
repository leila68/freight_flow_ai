-- ============================================================
-- FreightFlow AI — Initial Schema
-- Migration: 001_initial
-- ============================================================

-- Enable pgvector extension (no-op if not installed yet;
-- will be used in Phase 3 for semantic search)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LANES ────────────────────────────────────────────────────────────────────
-- Pre-seeded city pairs with base rates and distances.
-- A "lane" is a known origin → destination pair used as the
-- pricing foundation for quote calculations.
CREATE TABLE IF NOT EXISTS lanes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Origin
  origin_city         VARCHAR(100) NOT NULL,
  origin_province     VARCHAR(10)  NOT NULL,
  origin_postal       VARCHAR(20)  NOT NULL,

  -- Destination
  destination_city    VARCHAR(100) NOT NULL,
  destination_province VARCHAR(10) NOT NULL,
  destination_postal  VARCHAR(20)  NOT NULL,

  -- Pricing inputs
  base_rate           NUMERIC(10, 2) NOT NULL,  -- flat base rate in CAD
  distance_km         INTEGER        NOT NULL,
  transit_days        INTEGER        NOT NULL,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Fast city-name search for autocomplete endpoint
CREATE INDEX IF NOT EXISTS idx_lanes_origin_city      ON lanes (LOWER(origin_city));
CREATE INDEX IF NOT EXISTS idx_lanes_destination_city ON lanes (LOWER(destination_city));

-- ─── QUOTES ───────────────────────────────────────────────────────────────────
-- Every quote request and its calculated result.
-- Stores both the inputs and the full rate breakdown so
-- history can be displayed without recalculating.
CREATE TABLE IF NOT EXISTS quotes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Link to the seeded lane (nullable: custom lanes allowed later)
  lane_id             UUID REFERENCES lanes(id) ON DELETE SET NULL,

  -- Shipment inputs (denormalised for history display independence)
  origin_city         VARCHAR(100) NOT NULL,
  origin_province     VARCHAR(10)  NOT NULL,
  destination_city    VARCHAR(100) NOT NULL,
  destination_province VARCHAR(10) NOT NULL,
  distance_km         INTEGER      NOT NULL,
  transit_days        INTEGER      NOT NULL,

  equipment_type      VARCHAR(20)  NOT NULL
                        CHECK (equipment_type IN ('dry_van', 'reefer', 'flatbed')),

  weight_lbs          NUMERIC(10, 2) NOT NULL
                        CHECK (weight_lbs > 0 AND weight_lbs <= 48000),

  pickup_date         DATE NOT NULL,

  -- Rate breakdown (stored individually for transparency)
  base_rate           NUMERIC(10, 2) NOT NULL,  -- from lane
  equipment_surcharge NUMERIC(10, 2) NOT NULL,  -- base × (multiplier - 1)
  weight_surcharge    NUMERIC(10, 2) NOT NULL,  -- $0.10 per 100lbs over 10,000
  fuel_surcharge      NUMERIC(10, 2) NOT NULL DEFAULT 0, -- reserved for Phase 2
  total_rate          NUMERIC(10, 2) NOT NULL,  -- sum of all components

  -- Metadata
  status              VARCHAR(20) DEFAULT 'draft'
                        CHECK (status IN ('draft', 'sent', 'accepted', 'expired')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Common query patterns
CREATE INDEX IF NOT EXISTS idx_quotes_created_at      ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_equipment_type  ON quotes (equipment_type);
CREATE INDEX IF NOT EXISTS idx_quotes_pickup_date     ON quotes (pickup_date);
CREATE INDEX IF NOT EXISTS idx_quotes_status          ON quotes (status);
CREATE INDEX IF NOT EXISTS idx_quotes_lane_id         ON quotes (lane_id);

-- ─── EQUIPMENT MULTIPLIERS ────────────────────────────────────────────────────
-- Stored in DB so they can be updated without a code deploy.
CREATE TABLE IF NOT EXISTS equipment_multipliers (
  id              SERIAL PRIMARY KEY,
  equipment_type  VARCHAR(20) NOT NULL UNIQUE,
  multiplier      NUMERIC(4, 2) NOT NULL,
  label           VARCHAR(50),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

-- Equipment multipliers
INSERT INTO equipment_multipliers (equipment_type, multiplier, label) VALUES
  ('dry_van', 1.00, 'Dry Van'),
  ('reefer',  1.30, 'Refrigerated'),
  ('flatbed', 1.15, 'Flatbed')
ON CONFLICT (equipment_type) DO NOTHING;

-- Canadian city-pair lanes
INSERT INTO lanes
  (origin_city, origin_province, origin_postal, destination_city, destination_province, destination_postal, base_rate, distance_km, transit_days)
VALUES
  ('Toronto',       'ON', 'M5H 2N2', 'Montreal',      'QC', 'H3B 4W8', 520.00, 541,  1),
  ('Vancouver',     'BC', 'V6B 1A1', 'Calgary',        'AB', 'T2P 2M5', 680.00, 972,  2),
  ('Montreal',      'QC', 'H3B 4W8', 'Ottawa',         'ON', 'K1P 1J1', 380.00, 199,  1),
  ('Calgary',       'AB', 'T2P 2M5', 'Edmonton',       'AB', 'T5J 2R7', 420.00, 299,  1),
  ('Toronto',       'ON', 'M5H 2N2', 'Ottawa',         'ON', 'K1P 1J1', 450.00, 450,  1),
  ('Vancouver',     'BC', 'V6B 1A1', 'Victoria',       'BC', 'V8W 1P6', 280.00, 115,  1),
  ('Winnipeg',      'MB', 'R3C 3H8', 'Regina',         'SK', 'S4P 3Y2', 480.00, 571,  2),
  ('Halifax',       'NS', 'B3J 1S9', 'Moncton',        'NB', 'E1C 8R9', 340.00, 262,  1),
  ('Quebec City',   'QC', 'G1R 4P5', 'Montreal',       'QC', 'H3B 4W8', 320.00, 253,  1),
  ('Toronto',       'ON', 'M5H 2N2', 'Windsor',        'ON', 'N9A 6S3', 480.00, 370,  1),
  ('Edmonton',      'AB', 'T5J 2R7', 'Saskatoon',      'SK', 'S7K 1M3', 520.00, 525,  2),
  ('Vancouver',     'BC', 'V6B 1A1', 'Kelowna',        'BC', 'V1Y 1Z4', 450.00, 395,  1),
  ('Ottawa',        'ON', 'K1P 1J1', 'Kingston',       'ON', 'K7L 2Z5', 240.00, 180,  1),
  ('Calgary',       'AB', 'T2P 2M5', 'Vancouver',      'BC', 'V6B 1A1', 680.00, 972,  2),
  ('Montreal',      'QC', 'H3B 4W8', 'Toronto',        'ON', 'M5H 2N2', 520.00, 541,  1),
  ('Mississauga',   'ON', 'L5B 3C1', 'Hamilton',       'ON', 'L8P 4W9', 190.00, 45,   1),
  ('Surrey',        'BC', 'V3T 4W4', 'Burnaby',        'BC', 'V5H 4M1', 150.00, 25,   1),
  ('London',        'ON', 'N6A 5C1', 'Kitchener',      'ON', 'N2G 1C5', 180.00, 95,   1),
  ('Quebec City',   'QC', 'G1R 4P5', 'Sherbrooke',     'QC', 'J1H 1Z1', 220.00, 155,  1),
  ('St. John''s',   'NL', 'A1C 5M3', 'Corner Brook',   'NL', 'A2H 6J8', 380.00, 684,  2)
ON CONFLICT DO NOTHING;

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
-- Automatically update updated_at on any row change.
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_updated_at_lanes
  BEFORE UPDATE ON lanes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_quotes
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
