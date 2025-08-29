-- =============================================
-- ALTERNATIVE: Drop and recreate user_profiles table
-- WARNING: This will delete all existing user data!
-- Only use if you don't have important data to preserve
-- =============================================

-- Drop the existing table (WARNING: This deletes all data!)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Recreate with the correct structure
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

-- Create indexes
CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone_number);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = firebase_uid);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = firebase_uid);

-- Add comments
COMMENT ON TABLE user_profiles IS 'User profiles for hybrid Firebase Auth + Supabase system';
COMMENT ON COLUMN user_profiles.firebase_uid IS 'Firebase Authentication UID';
COMMENT ON COLUMN user_profiles.auth_method IS 'Authentication method: phone, email, or google';
