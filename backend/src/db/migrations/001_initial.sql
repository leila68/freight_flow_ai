CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  role VARCHAR(30) DEFAULT 'user'
    CHECK (role IN ('admin', 'dispatcher', 'user')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lanes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  origin_city VARCHAR(100) NOT NULL,
  origin_province VARCHAR(10) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  destination_province VARCHAR(10) NOT NULL,

  base_rate NUMERIC(10,2) NOT NULL,
  distance_km INTEGER NOT NULL,
  transit_days INTEGER NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipment_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE company_equipment_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  equipment_id INT NOT NULL REFERENCES equipment_types(id),

  multiplier NUMERIC(4,2) NOT NULL,

  UNIQUE(company_id, equipment_id)
);

INSERT INTO accessorials (code, name) VALUES
('liftgate_pickup', 'Liftgate Pickup'),
('liftgate_delivery', 'Liftgate Delivery'),
('residential_pickup', 'Residential Pickup'),
('residential_delivery', 'Residential Delivery'),
('inside_pickup', 'Inside Pickup'),
('inside_delivery', 'Inside Delivery'),
('limited_access', 'Limited Access'),
('appointment_required', 'Appointment Required'),
('temperature_control', 'Temperature Control'),
('tarping', 'Tarping'),
('hazmat', 'Hazmat'),
('team_drivers', 'Team Drivers')
ON CONFLICT DO NOTHING;

CREATE TABLE company_accessorial_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  accessorial_id INT NOT NULL REFERENCES accessorials(id),

  price NUMERIC(10,2) NOT NULL,

  UNIQUE(company_id, accessorial_id)
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  lane_id UUID REFERENCES lanes(id),

  origin_city VARCHAR(100) NOT NULL,
  origin_province VARCHAR(10) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  destination_province VARCHAR(10) NOT NULL,

  distance_km INTEGER NOT NULL,
  transit_days INTEGER NOT NULL,

  equipment_type VARCHAR(20) NOT NULL
    CHECK (equipment_type IN ('dry_van', 'reefer', 'flatbed')),

  weight_lbs NUMERIC(10,2) NOT NULL,

  pickup_date DATE NOT NULL,

  base_rate NUMERIC(10,2) NOT NULL,
  equipment_surcharge NUMERIC(10,2) NOT NULL,
  weight_surcharge NUMERIC(10,2) NOT NULL,
  fuel_surcharge NUMERIC(10,2) DEFAULT 0,
  total_rate NUMERIC(10,2) NOT NULL,

  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'expired')),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE retrieval_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT,

  content TEXT NOT NULL,

  embedding VECTOR(1024),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_created ON quotes(created_at DESC);

CREATE INDEX idx_retrieval_company ON retrieval_index(company_id);
CREATE INDEX idx_retrieval_type ON retrieval_index(entity_type);

INSERT INTO lanes
(origin_city, origin_province, destination_city, destination_province, base_rate, distance_km, transit_days)
VALUES

-- Ontario ↔ Quebec (high volume corridor)
('Toronto', 'ON', 'Montreal', 'QC', 520.00, 541, 1),
('Montreal', 'QC', 'Toronto', 'ON', 520.00, 541, 1),
('Toronto', 'ON', 'Ottawa', 'ON', 450.00, 450, 1),
('Ottawa', 'ON', 'Toronto', 'ON', 450.00, 450, 1),
('Toronto', 'ON', 'Windsor', 'ON', 480.00, 370, 1),
('Windsor', 'ON', 'Toronto', 'ON', 480.00, 370, 1),
('Quebec City', 'QC', 'Montreal', 'QC', 320.00, 253, 1),
('Montreal', 'QC', 'Quebec City', 'QC', 320.00, 253, 1),

-- Ontario intra-province
('Mississauga', 'ON', 'Hamilton', 'ON', 190.00, 45, 1),
('Hamilton', 'ON', 'Mississauga', 'ON', 190.00, 45, 1),
('Toronto', 'ON', 'London', 'ON', 300.00, 190, 1),
('London', 'ON', 'Toronto', 'ON', 300.00, 190, 1),
('Kitchener', 'ON', 'Toronto', 'ON', 280.00, 110, 1),
('Toronto', 'ON', 'Kitchener', 'ON', 280.00, 110, 1),

-- Alberta corridor
('Calgary', 'AB', 'Edmonton', 'AB', 420.00, 299, 1),
('Edmonton', 'AB', 'Calgary', 'AB', 420.00, 299, 1),
('Calgary', 'AB', 'Saskatoon', 'SK', 520.00, 525, 2),
('Saskatoon', 'SK', 'Calgary', 'AB', 520.00, 525, 2),

-- BC routes
('Vancouver', 'BC', 'Victoria', 'BC', 280.00, 115, 1),
('Victoria', 'BC', 'Vancouver', 'BC', 280.00, 115, 1),
('Vancouver', 'BC', 'Calgary', 'AB', 680.00, 972, 2),
('Calgary', 'AB', 'Vancouver', 'BC', 680.00, 972, 2),
('Vancouver', 'BC', 'Kelowna', 'BC', 450.00, 395, 1),
('Kelowna', 'BC', 'Vancouver', 'BC', 450.00, 395, 1),

-- Prairies
('Winnipeg', 'MB', 'Regina', 'SK', 480.00, 571, 2),
('Regina', 'SK', 'Winnipeg', 'MB', 480.00, 571, 2),

-- Atlantic Canada
('Halifax', 'NS', 'Moncton', 'NB', 340.00, 262, 1),
('Moncton', 'NB', 'Halifax', 'NS', 340.00, 262, 1),
('St. John''s', 'NL', 'Corner Brook', 'NL', 380.00, 684, 2),
('Corner Brook', 'NL', 'St. John''s', 'NL', 380.00, 684, 2),

-- Mixed long-haul
('Toronto', 'ON', 'Calgary', 'AB', 900.00, 2700, 4),
('Calgary', 'AB', 'Toronto', 'ON', 900.00, 2700, 4),
('Montreal', 'QC', 'Vancouver', 'BC', 1100.00, 4500, 5),
('Vancouver', 'BC', 'Montreal', 'QC', 1100.00, 4500, 5);