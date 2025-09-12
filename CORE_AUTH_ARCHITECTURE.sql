-- PRODUCTION SOLUTION: Proper Database-Driven Profile Creation
-- This replaces the current flawed approach with a robust, secure solution

-- 1. Drop the current problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create a robust profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    profile_exists BOOLEAN;
BEGIN
    -- Check if profile already exists (prevent duplicates)
    SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = NEW.id) INTO profile_exists;
    
    IF NOT profile_exists THEN
        -- Create user profile with all required fields
        INSERT INTO public.user_profiles (
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
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
            false, -- phone verification starts as false
            false, -- aadhaar verification starts as false
            CASE 
                WHEN COALESCE(NEW.raw_user_meta_data->>'first_name', '') != '' 
                AND COALESCE(NEW.raw_user_meta_data->>'last_name', '') != ''
                AND COALESCE(NEW.raw_user_meta_data->>'phone', '') != ''
                THEN true 
                ELSE false 
            END, -- profile_complete based on required fields
            NOW(),
            NOW()
        );
        
        RAISE LOG 'User profile created successfully for user ID: %', NEW.id;
    ELSE
        RAISE LOG 'User profile already exists for user ID: %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't prevent user creation
        RAISE WARNING 'Failed to create user profile for user ID %: % %', NEW.id, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- 4. Set proper RLS policies that work with this architecture
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON user_profiles;
DROP POLICY IF EXISTS "Allow insert for new authenticated users" ON user_profiles;

-- Create production-ready RLS policies
-- 5a. SELECT policy: Users can only view their own profile
CREATE POLICY "profile_select_policy" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 5b. UPDATE policy: Users can only update their own profile
CREATE POLICY "profile_update_policy" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5c. INSERT policy: BLOCK all direct client inserts (only trigger can insert)
CREATE POLICY "profile_insert_policy" ON user_profiles
    FOR INSERT
    WITH CHECK (false); -- Completely block client inserts

-- 5d. DELETE policy: Users can only delete their own profile (optional)
CREATE POLICY "profile_delete_policy" ON user_profiles
    FOR DELETE
    USING (auth.uid() = id);

-- 6. Grant proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE user_profiles TO postgres, service_role;
GRANT SELECT, UPDATE, DELETE ON TABLE user_profiles TO authenticated;
-- Note: No INSERT permission for authenticated users - only triggers can insert

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);

-- 8. Add table comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles created automatically via database trigger on auth.users INSERT';
COMMENT ON COLUMN user_profiles.id IS 'Foreign key to auth.users.id - set by trigger only';
COMMENT ON POLICY profile_insert_policy ON user_profiles IS 'Blocks all client inserts - profiles created by trigger only';

-- 9. Verification query
SELECT 
    'Core architecture setup complete' as status,
    (SELECT COUNT(*) FROM user_profiles) as existing_profiles,
    (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_auth_user_created') as trigger_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_profiles') as policy_count;
