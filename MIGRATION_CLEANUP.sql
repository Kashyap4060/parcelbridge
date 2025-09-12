-- MIGRATION: Clean up existing data and implement core architecture
-- Run this AFTER the CORE_AUTH_ARCHITECTURE.sql

-- 1. Clean up any existing orphaned profiles
DELETE FROM user_profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. Ensure all existing auth users have profiles
INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    phone_number,
    is_email_verified,
    is_phone_verified,
    is_aadhaar_verified,
    profile_complete,
    created_at,
    updated_at
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', ''),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    COALESCE(au.raw_user_meta_data->>'phone', ''),
    COALESCE(au.email_confirmed_at IS NOT NULL, false),
    false,
    false,
    CASE 
        WHEN COALESCE(au.raw_user_meta_data->>'first_name', '') != '' 
        AND COALESCE(au.raw_user_meta_data->>'last_name', '') != ''
        THEN true 
        ELSE false 
    END,
    COALESCE(au.created_at, NOW()),
    NOW()
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM user_profiles);

-- 3. Update any incomplete profiles
UPDATE user_profiles 
SET 
    profile_complete = CASE 
        WHEN first_name != '' AND last_name != '' AND phone_number != '' 
        THEN true 
        ELSE false 
    END,
    updated_at = NOW()
WHERE profile_complete IS NULL OR updated_at IS NULL;

-- 4. Verification report
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE profile_complete = true) as complete_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE profile_complete = false) as incomplete_profiles;
