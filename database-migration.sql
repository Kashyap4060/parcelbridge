-- =============================================
-- MIGRATION SCRIPT: Update user_profiles table for new auth system
-- Run this in your Supabase SQL editor
-- =============================================

-- First, let's see the current table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- ORDER BY ordinal_position;

-- Add missing columns if they don't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

-- Update existing data if needed
-- If you have existing users with 'name' column, split it into first_name and last_name
UPDATE user_profiles 
SET 
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = CASE 
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(name, ' '), 1) > 1 
        THEN SUBSTRING(name FROM LENGTH(SPLIT_PART(name, ' ', 1)) + 2)
        ELSE ''
    END,
    full_name = name
WHERE name IS NOT NULL AND (first_name IS NULL OR last_name IS NULL OR full_name IS NULL);

-- Make firebase_uid NOT NULL after populating it
-- Note: You'll need to populate firebase_uid for existing users first
-- ALTER TABLE user_profiles ALTER COLUMN firebase_uid SET NOT NULL;

-- Update role column to allow NULL (since users need to select role during signup)
ALTER TABLE user_profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;

-- Make phone_number nullable (since email users might not have phone initially)
ALTER TABLE user_profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Update RLS policies if needed
-- DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- CREATE POLICY "Users can view own profile" ON user_profiles
--     FOR SELECT USING (auth.uid()::text = firebase_uid);

-- CREATE POLICY "Users can update own profile" ON user_profiles
--     FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- CREATE POLICY "Users can insert own profile" ON user_profiles
--     FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

COMMENT ON TABLE user_profiles IS 'Updated for hybrid Firebase Auth + Supabase database system';
COMMENT ON COLUMN user_profiles.firebase_uid IS 'Firebase Authentication UID';
COMMENT ON COLUMN user_profiles.auth_method IS 'Method used for authentication: phone, email, or google';
COMMENT ON COLUMN user_profiles.profile_complete IS 'Whether user has completed all required profile steps';
