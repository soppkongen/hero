-- Enhanced RLS Policies and Security Rules for Skjærgårdshelt
-- This script sets up comprehensive security and data retention

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bag_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.density_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_pickup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_reports_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_intelligence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

-- PROFILES TABLE POLICIES
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id AND
    username IS NOT NULL AND
    length(username) >= 3 AND
    length(username) <= 30
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (
    auth.uid() = id AND
    username IS NOT NULL AND
    length(username) >= 3 AND
    length(username) <= 30 AND
    points >= 0 AND
    level >= 1
  );

CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- POSTS TABLE POLICIES
CREATE POLICY "posts_select_policy" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_policy" ON public.posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    caption IS NOT NULL AND
    length(caption) >= 10 AND
    length(caption) <= 2000 AND
    image_url IS NOT NULL AND
    points_earned >= 0 AND
    points_earned <= 100
  );

CREATE POLICY "posts_update_policy" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id AND
    caption IS NOT NULL AND
    length(caption) >= 10 AND
    length(caption) <= 2000 AND
    points_earned >= 0 AND
    points_earned <= 100
  );

CREATE POLICY "posts_delete_policy" ON public.posts
  FOR DELETE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND level >= 5 -- Admin level
    )
  );

-- LIKES TABLE POLICIES
CREATE POLICY "likes_select_policy" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_policy" ON public.likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id)
  );

CREATE POLICY "likes_delete_policy" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- WASTE ESTIMATION TABLES POLICIES
CREATE POLICY "bag_weights_select_policy" ON public.bag_weights
  FOR SELECT USING (true);

CREATE POLICY "density_factors_select_policy" ON public.density_factors
  FOR SELECT USING (true);

CREATE POLICY "waste_pickup_select_policy" ON public.waste_pickup
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "waste_pickup_insert_policy" ON public.waste_pickup
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    estimation_method IN ('bag', 'volume', 'photo') AND
    (estimated_weight_kg IS NULL OR estimated_weight_kg >= 0) AND
    (confidence_pct IS NULL OR (confidence_pct >= 0 AND confidence_pct <= 100))
  );

CREATE POLICY "waste_pickup_update_policy" ON public.waste_pickup
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id AND
    estimation_method IN ('bag', 'volume', 'photo')
  );

-- OFFICIAL REPORTS POLICIES
CREATE POLICY "official_reports_select_policy" ON public.official_reports_queue
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND level >= 5 -- Admin level
    )
  );

CREATE POLICY "official_reports_insert_policy" ON public.official_reports_queue
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (total_weight_kg IS NULL OR total_weight_kg >= 0) AND
    (volunteer_count IS NULL OR volunteer_count >= 1) AND
    status = 'pending'
  );

CREATE POLICY "official_reports_update_policy" ON public.official_reports_queue
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND level >= 5 -- Admin level
    )
  );

-- USER ACTIVITY LOG POLICIES
CREATE POLICY "user_activity_select_policy" ON public.user_activity_log
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND level >= 5 -- Admin level
    )
  );

CREATE POLICY "user_activity_insert_policy" ON public.user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- LOCATION INTELLIGENCE POLICIES
CREATE POLICY "location_intelligence_select_policy" ON public.location_intelligence
  FOR SELECT USING (true);

-- STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "post_images_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

CREATE POLICY "post_images_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
  );

CREATE POLICY "post_images_update_policy" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "post_images_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- DATA RETENTION FUNCTIONS
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  -- Delete activity logs older than 90 days
  DELETE FROM public.user_activity_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Log cleanup activity
  INSERT INTO public.user_activity_log (user_id, activity_type, activity_data)
  VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'system_cleanup', 
    jsonb_build_object('action', 'activity_log_cleanup', 'timestamp', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_reports()
RETURNS void AS $$
BEGIN
  -- Archive old submitted reports (older than 1 year)
  UPDATE public.official_reports_queue 
  SET status = 'archived'
  WHERE status = 'submitted' 
    AND processed_at < NOW() - INTERVAL '1 year';
  
  -- Delete failed reports older than 30 days
  DELETE FROM public.official_reports_queue 
  WHERE status = 'failed' 
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
BEGIN
  -- This would be implemented to clean up storage objects
  -- that don't have corresponding posts
  -- Implementation depends on your specific cleanup strategy
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AUDIT FUNCTIONS
CREATE OR REPLACE FUNCTION audit_user_action()
RETURNS trigger AS $$
BEGIN
  -- Log significant user actions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_activity_log (user_id, activity_type, activity_data)
    VALUES (
      NEW.user_id,
      TG_TABLE_NAME || '_created',
      jsonb_build_object('id', NEW.id, 'timestamp', NOW())
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.user_activity_log (user_id, activity_type, activity_data)
    VALUES (
      NEW.user_id,
      TG_TABLE_NAME || '_updated',
      jsonb_build_object('id', NEW.id, 'timestamp', NOW())
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_activity_log (user_id, activity_type, activity_data)
    VALUES (
      OLD.user_id,
      TG_TABLE_NAME || '_deleted',
      jsonb_build_object('id', OLD.id, 'timestamp', NOW())
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER posts_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION audit_user_action();

CREATE TRIGGER official_reports_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.official_reports_queue
  FOR EACH ROW EXECUTE FUNCTION audit_user_action();

-- SCHEDULED CLEANUP (to be set up in Supabase dashboard)
-- These would be configured as cron jobs in Supabase:
-- SELECT cron.schedule('cleanup-activity-logs', '0 2 * * *', 'SELECT cleanup_old_activity_logs();');
-- SELECT cron.schedule('cleanup-reports', '0 3 * * 0', 'SELECT cleanup_old_reports();');
-- SELECT cron.schedule('cleanup-images', '0 4 * * 0', 'SELECT cleanup_orphaned_images();');

-- SECURITY VIEWS
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id,
  p.username,
  p.level,
  p.points,
  COUNT(posts.id) as post_count,
  COUNT(likes.id) as likes_received,
  COALESCE(SUM(posts.estimated_weight), 0) as total_weight_cleaned
FROM public.profiles p
LEFT JOIN public.posts ON p.id = posts.user_id
LEFT JOIN public.likes ON posts.id = likes.post_id
GROUP BY p.id, p.username, p.level, p.points;

-- Grant appropriate permissions
GRANT SELECT ON public.user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_activity_logs() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_reports() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_images() TO service_role;
