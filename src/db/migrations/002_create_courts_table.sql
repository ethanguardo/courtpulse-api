-- Migration: Create courts table for basketball court discovery
-- Description: Basketball courts with geolocation support for Sydney, Australia

CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic information
  name VARCHAR(255) NOT NULL,
  address TEXT,

  -- Location data (dual storage for flexibility)
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  location POINT NOT NULL,  -- PostGIS point for efficient spatial queries

  -- Location metadata
  suburb VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postcode VARCHAR(10),
  country VARCHAR(100) NOT NULL DEFAULT 'Australia',

  -- Court details
  num_hoops INTEGER DEFAULT 1,
  indoor BOOLEAN DEFAULT false,
  surface_type VARCHAR(50),  -- 'concrete', 'asphalt', 'wooden', 'rubber'
  has_lights BOOLEAN DEFAULT false,

  -- Additional info
  description TEXT,
  facilities JSONB,  -- { "parking": true, "restrooms": true, "water": true, "seating": true }

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_courts_location ON courts USING GIST(location);
CREATE INDEX idx_courts_city ON courts(city);
CREATE INDEX idx_courts_suburb ON courts(suburb);
CREATE INDEX idx_courts_coordinates ON courts(latitude, longitude);

-- Optional: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_courts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courts_updated_at_trigger
BEFORE UPDATE ON courts
FOR EACH ROW
EXECUTE FUNCTION update_courts_updated_at();
