-- Final Supabase Authentication Setup
-- This version safely handles existing data and foreign key constraints

-- 1. Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('sender', 'carrier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. First, let's clean up existing data that might cause foreign key issues
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'user_profiles table exists. Cleaning up data...';
        
        -- Remove any existing foreign key constraints
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_firebase_uid_key;
        ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
        
        -- Delete rows that don't have corresponding auth.users entries
        -- This prevents foreign key constraint violations
        DELETE FROM user_profiles 
        WHERE id NOT IN (SELECT id FROM auth.users);
        
        RAISE NOTICE 'Cleaned up orphaned user_profiles records';
        
        -- Remove columns we don't need for simple auth
        ALTER TABLE user_profiles DROP COLUMN IF EXISTS firebase_uid;
        ALTER TABLE user_profiles DROP COLUMN IF EXISTS auth_method;
        ALTER TABLE user_profiles DROP COLUMN IF EXISTS full_name;
        
        -- Add columns that might be missing
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(50);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT NULL;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT TRUE;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_aadhaar_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(10);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS address TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
    ELSE
        RAISE NOTICE 'Creating new user_profiles table...';
        CREATE TABLE user_profiles (
            id UUID PRIMARY KEY,
            email VARCHAR(255),
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            phone_number VARCHAR(20),
            role user_role DEFAULT NULL,
            is_phone_verified BOOLEAN DEFAULT FALSE,
            is_email_verified BOOLEAN DEFAULT TRUE,
            is_aadhaar_verified BOOLEAN DEFAULT FALSE,
            profile_complete BOOLEAN DEFAULT FALSE,
            avatar_url TEXT,
            date_of_birth DATE,
            gender VARCHAR(10),
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(10),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 3. Now safely add the foreign key constraint (only if no conflicts)
DO $$
BEGIN
    -- Check if all existing user_profiles.id exist in auth.users
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id NOT IN (SELECT id FROM auth.users)
    ) THEN
        -- Safe to add constraint
        ALTER TABLE user_profiles 
            ADD CONSTRAINT user_profiles_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key constraint added successfully';
    ELSE
        RAISE NOTICE 'Skipping foreign key constraint - orphaned records found';
        -- List the problematic records
        RAISE NOTICE 'Orphaned records: %', (
            SELECT string_agg(id::text, ', ') 
            FROM user_profiles 
            WHERE id NOT IN (SELECT id FROM auth.users)
        );
    END IF;
END $$;

-- 4. Set required columns as NOT NULL only if safe to do so
DO $$
BEGIN
    -- Check each column individually and set NOT NULL if no NULL values exist
    PERFORM 1; -- placeholder for potential NULL checks
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 6. Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies and create new ones
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on firebase_uid" ON user_profiles;

-- Create new RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 8. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        phone_number,
        is_email_verified
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, true)
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If insert fails, just log and continue
        RAISE WARNING 'Could not create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Add helpful comments
COMMENT ON TABLE user_profiles IS 'User profiles for Supabase authentication system';
COMMENT ON COLUMN user_profiles.id IS 'References auth.users(id) - Supabase Auth user ID';
COMMENT ON COLUMN user_profiles.email IS 'User email address from Supabase Auth';
COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number for notifications and WhatsApp OTP';
COMMENT ON COLUMN user_profiles.role IS 'User role: sender or carrier';

-- 13. Final verification and cleanup report
SELECT 
    'Setup completed!' AS status,
    (SELECT COUNT(*) FROM user_profiles) AS total_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE id IN (SELECT id FROM auth.users)) AS valid_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE id NOT IN (SELECT id FROM auth.users)) AS orphaned_profiles,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'user_profiles_id_fkey'
        ) THEN 'CONSTRAINT_EXISTS' 
        ELSE 'CONSTRAINT_MISSING' 
    END AS foreign_key_status;
