-- =============================================
-- COPY THIS ENTIRE CODE BLOCK TO SUPABASE SQL EDITOR
-- =============================================

-- Step 1: Add missing columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'phone';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

-- Step 2: Modify existing columns to be nullable
ALTER TABLE user_profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE user_profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Step 3: Add unique constraint (might fail if column already has constraint)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE user_profiles ADD CONSTRAINT unique_firebase_uid UNIQUE (firebase_uid);
    EXCEPTION 
        WHEN duplicate_object THEN 
            -- Constraint already exists, ignore
            NULL;
    END;
END $$;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);

-- Step 5: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
