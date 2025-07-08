-- Check if posts exist
SELECT 
  p.id,
  p.caption,
  p.image_url,
  p.created_at,
  p.user_id,
  pr.username,
  pr.level
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Check if profiles exist
SELECT 
  id,
  username,
  full_name,
  points,
  level,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check storage bucket
SELECT 
  name,
  bucket_id,
  created_at
FROM storage.objects
WHERE bucket_id = 'post-images'
ORDER BY created_at DESC
LIMIT 10;
