-- Create a test user in the auth.users table
-- Note: In a real Supabase setup, you would typically create users through the Auth API
-- This is for development/testing purposes only

-- Insert test user into auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@skjaergardshelt.no',
  crypt('testpassword123', gen_salt('bf')), -- Password: testpassword123
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "test@skjaergardshelt.no"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the test user
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@skjaergardshelt.no';
    
    -- Insert corresponding profile
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        bio,
        points,
        level,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'kystopprydder',
        'Test Bruker',
        'Jeg elsker å rydde opp langs kysten! 🌊♻️',
        150,
        3,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        bio = EXCLUDED.bio,
        points = EXCLUDED.points,
        level = EXCLUDED.level,
        updated_at = NOW();
        
    -- Create some sample posts for the test user
    INSERT INTO public.posts (
        user_id,
        caption,
        image_url,
        location,
        waste_type,
        estimated_weight,
        points_earned,
        created_at
    ) VALUES 
    (
        test_user_id,
        'Fantastisk dag ved Oslofjorden! Samlet masse plast og glass. 🌊',
        '/placeholder.svg?height=400&width=400',
        'Oslofjorden, Oslo',
        ARRAY['Plast', 'Glass', 'Metall'],
        2.5,
        25,
        NOW() - INTERVAL '2 days'
    ),
    (
        test_user_id,
        'Morgentur langs Stavanger strand. Utrolig hvor mye søppel som skyller i land! 😔',
        '/placeholder.svg?height=400&width=400',
        'Stavanger Strand',
        ARRAY['Plast', 'Sigarettstumper', 'Papir'],
        1.8,
        18,
        NOW() - INTERVAL '5 days'
    ),
    (
        test_user_id,
        'Sammen med venner på Lofoten! Vi ryddet hele bukta ren 💪',
        '/placeholder.svg?height=400&width=400',
        'Lofoten',
        ARRAY['Fiskeutstyr', 'Plast', 'Tau'],
        4.2,
        42,
        NOW() - INTERVAL '1 week'
    );
    
END $$;
