-- =============================================
-- MIGRATION: REMOVE ADMIN FUNCTIONALITY
-- =============================================
-- This script removes all admin-related functionality from the ParcelBridge database
-- Run this AFTER backing up your database

-- Step 1: Update user_role enum to remove 'admin'
-- Note: This requires recreating the enum type
BEGIN;

-- Create new enum without admin
CREATE TYPE user_role_new AS ENUM ('sender', 'carrier');

-- Update user_profiles table to use new enum
-- First, update any existing admin users to carrier (or sender)
UPDATE user_profiles SET role = 'carrier' WHERE role = 'admin';

-- Alter the table to use new enum
ALTER TABLE user_profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Drop old enum and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

COMMIT;

-- Step 2: Remove admin_logs table
DROP TABLE IF EXISTS admin_logs CASCADE;

-- Step 3: Remove admin_notes column from aadhaar_verifications table
ALTER TABLE aadhaar_verifications DROP COLUMN IF EXISTS admin_notes;

-- Step 4: Remove admin-related RLS policies
DROP POLICY IF EXISTS "Admins can view all users" ON user_profiles;

-- Step 5: Remove any admin-related indexes (already removed with table drop)
-- No additional cleanup needed for indexes

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the migration was successful:

-- 1. Check that no admin role exists in user_profiles
-- SELECT role, COUNT(*) FROM user_profiles GROUP BY role;

-- 2. Verify user_role enum only has 'sender' and 'carrier'
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- 3. Check that admin_logs table no longer exists
-- SELECT tablename FROM pg_tables WHERE tablename = 'admin_logs';

-- 4. Verify admin_notes column is removed
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'aadhaar_verifications' AND column_name = 'admin_notes';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
