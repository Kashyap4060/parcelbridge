-- QUICK FIX: Allow first-time profile creation during signup

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a more permissive policy for signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Option 1: Allow if user is authenticated (even if session timing is off)
        auth.uid() IS NOT NULL
        OR
        -- Option 2: Allow if this looks like a valid signup (has required fields)
        (id IS NOT NULL AND email IS NOT NULL)
    );

-- Alternative: Temporarily disable RLS completely for testing
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable later with:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
