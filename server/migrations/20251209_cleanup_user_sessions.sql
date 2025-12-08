-- Drop user_sessions if sessions exists (cleanup)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_sessions') 
     AND EXISTS (SELECT FROM pg_tables WHERE tablename = 'sessions') THEN
    DROP TABLE user_sessions CASCADE;
  END IF;
END $$;
