-----------------------------------------------------------------
-- 1.  Ensure ONE clear foreign-key from posts.user_id -> profiles.id
--     Drop whatever is there, then add the correct constraint.
-----------------------------------------------------------------
DO $$
DECLARE
  fk text;
BEGIN
  SELECT conname
    INTO fk
    FROM   pg_constraint
   WHERE  conrelid = 'public.posts'::regclass
     AND  contype  = 'f'
     AND  array_position(conkey, (
            SELECT attnum FROM pg_attribute
             WHERE attrelid = 'public.posts'::regclass
               AND attname  = 'user_id')) IS NOT NULL;

  IF fk IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.posts DROP CONSTRAINT %I', fk);
  END IF;
END $$;

ALTER TABLE public.posts
  ADD CONSTRAINT posts_user_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;
