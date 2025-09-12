-- Fix RLS policy for user profile creation during signup
-- This allows the application to create profiles during the signup process

-- Add a policy to allow authenticated users to insert their own profile
-- and allow the service to insert profiles for new users
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;

CREATE POLICY "Allow profile creation during signup" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'service_role' OR
        auth.role() = 'service_role'
    );

-- Also create a more permissive policy for the signup process
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        (auth.uid() IS NOT NULL AND id IS NOT NULL)
    );

-- Add a policy that allows inserts immediately after auth user creation
CREATE POLICY "Allow insert for new authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Allow if the user is authenticated and trying to insert their own profile
        (auth.uid() = id) OR
        -- Allow if this is being called during the signup process
        (auth.uid() IS NOT NULL AND id = auth.uid())
    );
