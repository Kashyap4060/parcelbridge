-- =============================================
-- QUICK FIX: Add missing columns to user_profiles table
-- Run this in your Supabase SQL Editor Dashboard
-- =============================================

-- Add the missing firebase_uid column (most important for immediate fix)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128);

-- Add other missing columns for the new auth system
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'phone';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

-- Make role nullable (users select role after signup)
ALTER TABLE user_profiles ALTER COLUMN role DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN role DROP DEFAULT;

-- Make phone_number nullable (email users add phone later)
ALTER TABLE user_profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Add unique constraint on firebase_uid (after adding the column)
ALTER TABLE user_profiles ADD CONSTRAINT unique_firebase_uid UNIQUE (firebase_uid);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
