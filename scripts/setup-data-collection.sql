-- Enhanced data collection tables for future API integration

-- Official reporting queue table
CREATE TABLE IF NOT EXISTS public.official_reports_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Report metadata
  report_type VARCHAR(50) DEFAULT 'cleanup', -- cleanup, survey, monitoring
  status VARCHAR(20) DEFAULT 'pending', -- pending, processed, submitted, failed
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  
  -- Geographic data
  location_name TEXT,
  coordinates POINT,
  municipality VARCHAR(100),
  county VARCHAR(100),
  
  -- Cleanup details
  cleanup_date TIMESTAMP WITH TIME ZONE,
  cleanup_duration_minutes INTEGER,
  volunteer_count INTEGER DEFAULT 1,
  organization_name VARCHAR(200),
  
  -- Waste data (structured for API compatibility)
  waste_categories JSONB, -- Array of waste types with quantities
  total_weight_kg DECIMAL(8,2),
  total_volume_liters DECIMAL(8,2),
  bag_count INTEGER,
  
  -- Environmental conditions
  weather_conditions VARCHAR(100),
  tide_level VARCHAR(50),
  accessibility_rating INTEGER, -- 1-5 scale
  
  -- Photo documentation
  before_photos TEXT[], -- Array of image URLs
  after_photos TEXT[], -- Array of image URLs
  waste_photos TEXT[], -- Array of waste documentation URLs
  
  -- API integration fields
  external_ids JSONB, -- Store IDs from different systems
  api_payload JSONB, -- Store formatted data for APIs
  submission_attempts INTEGER DEFAULT 0,
  last_submission_attempt TIMESTAMP WITH TIME ZONE,
  submission_errors JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- User activity tracking for analytics
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type VARCHAR(50) NOT NULL, -- post_created, weight_estimated, location_added, etc.
  activity_data JSONB,
  
  -- Context
  session_id VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location intelligence table
CREATE TABLE IF NOT EXISTS public.location_intelligence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Location identification
  location_name TEXT NOT NULL,
  coordinates POINT,
  location_hash VARCHAR(64), -- For deduplication
  
  -- Administrative divisions
  municipality VARCHAR(100),
  county VARCHAR(100),
  postal_code VARCHAR(10),
  
  -- Cleanup statistics
  total_cleanups INTEGER DEFAULT 0,
  total_weight_kg DECIMAL(10,2) DEFAULT 0,
  total_volunteers INTEGER DEFAULT 0,
  
  -- Waste patterns
  common_waste_types JSONB,
  seasonal_patterns JSONB,
  
  -- Environmental data
  accessibility_score DECIMAL(3,2), -- Average accessibility
  pollution_severity INTEGER, -- 1-5 scale
  
  -- Metadata
  first_cleanup_date TIMESTAMP WITH TIME ZONE,
  last_cleanup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(location_hash)
);

-- API integration configuration
CREATE TABLE IF NOT EXISTS public.api_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Integration details
  api_name VARCHAR(50) NOT NULL, -- 'rydde', 'ssb', 'miljodirektoratet'
  api_version VARCHAR(20),
  endpoint_url TEXT,
  
  -- Configuration
  is_active BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT true,
  rate_limit_per_hour INTEGER,
  
  -- Credentials (encrypted)
  api_key_encrypted TEXT,
  auth_config JSONB,
  
  -- Field mappings
  field_mappings JSONB, -- Map our fields to API fields
  
  -- Statistics
  total_submissions INTEGER DEFAULT 0,
  successful_submissions INTEGER DEFAULT 0,
  last_successful_submission TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default API configurations
INSERT INTO public.api_integrations (api_name, api_version, is_active, field_mappings) VALUES
('rydde', 'v1', false, '{
  "location": "location_name",
  "coordinates": "coordinates",
  "waste_types": "waste_categories",
  "weight": "total_weight_kg",
  "date": "cleanup_date"
}'),
('ssb', 'v1', false, '{
  "municipality": "municipality",
  "waste_amount": "total_weight_kg",
  "activity_date": "cleanup_date",
  "participant_count": "volunteer_count"
}'),
('miljodirektoratet', 'v1', false, '{
  "location": "coordinates",
  "waste_data": "waste_categories",
  "environmental_impact": "total_weight_kg"
}');

-- RLS Policies
ALTER TABLE public.official_reports_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

-- Official reports queue policies
CREATE POLICY "Users can view their own reports" ON public.official_reports_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.official_reports_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Location intelligence policies (public read)
CREATE POLICY "Location intelligence is viewable by everyone" ON public.location_intelligence
  FOR SELECT USING (true);

-- API integrations policies (admin only for now)
CREATE POLICY "API integrations viewable by authenticated users" ON public.api_integrations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Functions for data processing
CREATE OR REPLACE FUNCTION update_location_intelligence()
RETURNS TRIGGER AS $$
BEGIN
  -- Update location statistics when new cleanup is added
  INSERT INTO public.location_intelligence (
    location_name,
    coordinates,
    location_hash,
    total_cleanups,
    total_weight_kg,
    total_volunteers,
    first_cleanup_date,
    last_cleanup_date
  )
  VALUES (
    NEW.location_name,
    NEW.coordinates,
    md5(COALESCE(NEW.location_name, '') || COALESCE(NEW.coordinates::text, '')),
    1,
    COALESCE(NEW.total_weight_kg, 0),
    COALESCE(NEW.volunteer_count, 1),
    NEW.cleanup_date,
    NEW.cleanup_date
  )
  ON CONFLICT (location_hash) DO UPDATE SET
    total_cleanups = location_intelligence.total_cleanups + 1,
    total_weight_kg = location_intelligence.total_weight_kg + COALESCE(NEW.total_weight_kg, 0),
    total_volunteers = location_intelligence.total_volunteers + COALESCE(NEW.volunteer_count, 1),
    last_cleanup_date = NEW.cleanup_date,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update location intelligence
CREATE TRIGGER update_location_stats
  AFTER INSERT ON public.official_reports_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_location_intelligence();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_activity_type VARCHAR(50),
  p_activity_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (user_id, activity_type, activity_data)
  VALUES (p_user_id, p_activity_type, p_activity_data)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;
