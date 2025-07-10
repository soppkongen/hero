-- Create bag_weights table
CREATE TABLE IF NOT EXISTS bag_weights (
  bag_size TEXT PRIMARY KEY,
  avg_weight_kg REAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create density_factors table  
CREATE TABLE IF NOT EXISTS density_factors (
  waste_type TEXT PRIMARY KEY,
  density_kg_m3 REAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create waste_pickup table for tracking estimations
CREATE TABLE IF NOT EXISTS waste_pickup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id) NULL,
  eal_code TEXT,
  waste_type TEXT,
  estimation_method TEXT CHECK (estimation_method IN ('bag', 'volume', 'photo')),
  estimated_weight_kg REAL,
  confidence_pct INTEGER,
  bag_size TEXT REFERENCES bag_weights(bag_size) NULL,
  bag_count INTEGER NULL,
  volume_length_m REAL NULL,
  volume_width_m REAL NULL,
  volume_height_m REAL NULL,
  photo_url TEXT NULL,
  reference_object TEXT NULL,
  manual_override_kg REAL NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert standard bag weights
INSERT INTO bag_weights (bag_size, avg_weight_kg) VALUES
  ('13-gal', 6.8),
  ('30-gal', 11.3),
  ('55-gal', 18.1),
  ('small-bag', 2.3),
  ('medium-bag', 4.5),
  ('large-bag', 9.1)
ON CONFLICT (bag_size) DO NOTHING;

-- Insert density factors
INSERT INTO density_factors (waste_type, density_kg_m3) VALUES
  ('plastic_bottles', 37.0),
  ('mixed_trash', 138.0),
  ('paper', 85.0),
  ('cardboard', 50.0),
  ('glass', 400.0),
  ('metal_cans', 160.0),
  ('organic_waste', 400.0),
  ('textile', 300.0),
  ('electronics', 200.0),
  ('hazardous', 800.0)
ON CONFLICT (waste_type) DO NOTHING;

-- Add RLS policies
ALTER TABLE bag_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE density_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_pickup ENABLE ROW LEVEL SECURITY;

-- Allow read access to bag_weights and density_factors for all authenticated users
CREATE POLICY "Allow read access to bag_weights" ON bag_weights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to density_factors" ON density_factors FOR SELECT TO authenticated USING (true);

-- Allow users to manage their own waste_pickup records
CREATE POLICY "Users can view own waste_pickup" ON waste_pickup FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste_pickup" ON waste_pickup FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste_pickup" ON waste_pickup FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own waste_pickup" ON waste_pickup FOR DELETE TO authenticated USING (auth.uid() = user_id);
