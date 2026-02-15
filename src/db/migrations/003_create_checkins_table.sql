-- Check-ins table
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,

  -- Check-in/out tracking
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  auto_expired BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_court_id ON checkins(court_id);
CREATE INDEX idx_checkins_checked_in_at ON checkins(checked_in_at);

-- Partial index for active check-ins (most common query)
CREATE INDEX idx_checkins_active ON checkins(user_id, checked_out_at)
  WHERE checked_out_at IS NULL;

-- Partial index for court occupancy queries
CREATE INDEX idx_checkins_court_active ON checkins(court_id, checked_out_at)
  WHERE checked_out_at IS NULL;

-- Constraint: User can only have ONE active check-in at a time
CREATE UNIQUE INDEX idx_checkins_one_active_per_user
  ON checkins(user_id)
  WHERE checked_out_at IS NULL;

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_checkins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER checkins_updated_at_trigger
  BEFORE UPDATE ON checkins
  FOR EACH ROW
  EXECUTE FUNCTION update_checkins_updated_at();
