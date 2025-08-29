-- =============================================
-- FIX: Convert user_profiles VIEW to TABLE
-- The current user_profiles is a view, not a table
-- We need to drop the view and create a proper table
-- =============================================

-- Step 1: Check what user_profiles currently is
SELECT 
    schemaname, 
    tablename, 
    tableowner 
FROM pg_tables 
WHERE tablename = 'user_profiles'
UNION
SELECT 
    schemaname, 
    viewname as tablename, 
    viewowner as tableowner 
FROM pg_views 
WHERE viewname = 'user_profiles';

-- Step 2: Drop the existing view (if it exists)
DROP VIEW IF EXISTS user_profiles CASCADE;

-- Step 3: Create the actual table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    role user_role DEFAULT NULL,
    
    -- Authentication method
    auth_method VARCHAR(20) DEFAULT 'phone',
    
    -- Verification status
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_aadhaar_verified BOOLEAN DEFAULT FALSE,
    profile_complete BOOLEAN DEFAULT FALSE,
    
    -- Profile information
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Aadhaar verification data
    aadhaar_number VARCHAR(12),
    aadhaar_name VARCHAR(100),
    aadhaar_front_url TEXT,
    aadhaar_back_url TEXT,
    
    -- Wallet information
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone_number);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Step 5: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on firebase_uid" ON user_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 7: Add helpful comments
COMMENT ON TABLE user_profiles IS 'User profiles for hybrid Firebase Auth + Supabase system';
COMMENT ON COLUMN user_profiles.firebase_uid IS 'Firebase Authentication UID - connects to Firebase Auth';
COMMENT ON COLUMN user_profiles.auth_method IS 'Method used for registration: phone, email, or google';
COMMENT ON COLUMN user_profiles.profile_complete IS 'Whether user has completed all onboarding steps';

-- Step 8: Verify the table was created successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
