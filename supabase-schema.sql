-- =============================================
-- PARCEL BRIDGE SUPABASE DATABASE SCHEMA
-- Complete PostgreSQL schema for the application
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('sender', 'carrier');
CREATE TYPE parcel_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT', 'LOCK', 'UNLOCK', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('SUCCESS', 'PENDING', 'FAILED');
CREATE TYPE chat_message_type AS ENUM ('TEXT', 'IMAGE', 'SYSTEM');

-- =============================================
-- USER PROFILES TABLE (Hybrid: Firebase Auth + Supabase Data)
-- =============================================

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL, -- Firebase Auth UID
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    full_name VARCHAR(100),
    role user_role DEFAULT NULL,
    
    -- Authentication method
    auth_method VARCHAR(20) DEFAULT 'phone', -- 'phone', 'email', 'google'
    
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
    locked_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT positive_wallet_balance CHECK (wallet_balance >= 0),
    CONSTRAINT positive_locked_amount CHECK (locked_amount >= 0),
    CONSTRAINT valid_aadhaar_length CHECK (char_length(aadhaar_number) = 12 OR aadhaar_number IS NULL)
);

-- =============================================
-- AADHAAR VERIFICATIONS TABLE
-- =============================================

CREATE TABLE aadhaar_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Aadhaar details
    aadhaar_number VARCHAR(12) NOT NULL,
    aadhaar_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    
    -- Document uploads
    front_image_url TEXT NOT NULL,
    back_image_url TEXT NOT NULL,
    
    -- Verification status
    status verification_status DEFAULT 'PENDING',
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_aadhaar_length CHECK (char_length(aadhaar_number) = 12),
    CONSTRAINT unique_user_aadhaar UNIQUE (user_id, aadhaar_number)
);

-- =============================================
-- RAILWAY STATIONS TABLE
-- =============================================

CREATE TABLE railway_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    state VARCHAR(100),
    zone VARCHAR(10),
    
    -- Geographic data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location POINT, -- PostGIS point for spatial queries
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- =============================================
-- STATION DISTANCES TABLE
-- =============================================

CREATE TABLE station_distances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_station_code VARCHAR(10) NOT NULL,
    from_station_name VARCHAR(200) NOT NULL,
    to_station_code VARCHAR(10) NOT NULL,
    to_station_name VARCHAR(200) NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL,
    
    -- Route information
    train_no VARCHAR(10),
    train_name VARCHAR(200),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_distance CHECK (distance_km > 0),
    CONSTRAINT different_stations CHECK (from_station_code != to_station_code),
    CONSTRAINT unique_route UNIQUE (from_station_code, to_station_code, train_no)
);

-- =============================================
-- TRAIN DATA TABLE
-- =============================================

CREATE TABLE train_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_no VARCHAR(10) NOT NULL,
    train_name VARCHAR(200),
    station_code VARCHAR(10) NOT NULL,
    station_name VARCHAR(200),
    sequence INTEGER NOT NULL,
    
    -- Timing information
    arrival_time TIME,
    departure_time TIME,
    halt_minutes INTEGER DEFAULT 0,
    distance_km DECIMAL(8, 2),
    
    -- Additional details
    day INTEGER, -- Journey day (1, 2, 3, etc.)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_sequence CHECK (sequence > 0),
    CONSTRAINT valid_halt CHECK (halt_minutes >= 0),
    CONSTRAINT valid_distance CHECK (distance_km >= 0),
    CONSTRAINT unique_train_station_seq UNIQUE (train_no, station_code, sequence)
);

-- =============================================
-- TRAIN JOURNEYS TABLE
-- =============================================

CREATE TABLE train_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Journey details
    pnr VARCHAR(10) NOT NULL,
    train_number VARCHAR(10) NOT NULL,
    train_name VARCHAR(200),
    
    -- Route information
    source_station VARCHAR(200) NOT NULL,
    source_station_code VARCHAR(10) NOT NULL,
    destination_station VARCHAR(200) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    stations TEXT[], -- Array of station codes along the route
    
    -- Timing
    journey_date DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME,
    arrival_date DATE,
    
    -- Booking details
    coach_number VARCHAR(10),
    seat_number VARCHAR(10),
    class VARCHAR(20),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT future_journey_date CHECK (journey_date >= CURRENT_DATE),
    CONSTRAINT different_source_destination CHECK (source_station_code != destination_station_code)
);

-- =============================================
-- PARCEL REQUESTS TABLE
-- =============================================

CREATE TABLE parcel_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    carrier_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Parcel details
    pickup_station VARCHAR(200) NOT NULL,
    pickup_station_code VARCHAR(10) NOT NULL,
    drop_station VARCHAR(200) NOT NULL,
    drop_station_code VARCHAR(10) NOT NULL,
    
    -- Physical specifications
    weight DECIMAL(6, 2) NOT NULL,
    length DECIMAL(6, 2),
    width DECIMAL(6, 2),
    height DECIMAL(6, 2),
    description TEXT,
    
    -- Timing
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Payment and fees
    estimated_fare DECIMAL(8, 2) NOT NULL,
    payment_held DECIMAL(8, 2) DEFAULT 0.00,
    fee_breakdown JSONB, -- Store fee calculation details
    
    -- Status and verification
    status parcel_status DEFAULT 'PENDING',
    otp_code VARCHAR(6),
    
    -- Important timestamps
    accepted_at TIMESTAMP WITH TIME ZONE,
    otp_verified_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_weight CHECK (weight > 0),
    CONSTRAINT positive_dimensions CHECK (length > 0 AND width > 0 AND height > 0),
    CONSTRAINT positive_fare CHECK (estimated_fare > 0),
    CONSTRAINT different_stations CHECK (pickup_station_code != drop_station_code),
    CONSTRAINT future_pickup CHECK (pickup_time > NOW()),
    CONSTRAINT valid_otp CHECK (otp_code IS NULL OR char_length(otp_code) = 6)
);

-- =============================================
-- WALLET TRANSACTIONS TABLE
-- =============================================

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Transaction details
    type transaction_type NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status transaction_status DEFAULT 'SUCCESS',
    
    -- Related entities
    related_parcel_id UUID REFERENCES parcel_requests(id),
    
    -- Payment gateway information
    payment_id VARCHAR(100), -- Razorpay payment ID
    order_id VARCHAR(100), -- Razorpay order ID
    
    -- Additional metadata
    metadata JSONB, -- Store additional transaction data
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- =============================================
-- CHAT ROOMS TABLE
-- =============================================

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_request_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    
    -- Participants
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    carrier_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_parcel_chat UNIQUE (parcel_request_id),
    CONSTRAINT different_participants CHECK (sender_id != carrier_id)
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Message content
    message_type chat_message_type DEFAULT 'TEXT',
    content TEXT NOT NULL,
    image_url TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_content CHECK (
        (message_type = 'TEXT' AND char_length(content) > 0) OR
        (message_type = 'IMAGE' AND image_url IS NOT NULL) OR
        message_type = 'SYSTEM'
    )
);

-- =============================================
-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Station indexes
CREATE INDEX idx_stations_code ON railway_stations(code);
CREATE INDEX idx_stations_name ON railway_stations(name);
CREATE INDEX idx_stations_state ON railway_stations(state);

-- Distance indexes
CREATE INDEX idx_distances_from_station ON station_distances(from_station_code);
CREATE INDEX idx_distances_to_station ON station_distances(to_station_code);
CREATE INDEX idx_distances_route ON station_distances(from_station_code, to_station_code);

-- Train data indexes
CREATE INDEX idx_train_data_train_no ON train_data(train_no);
CREATE INDEX idx_train_data_station_code ON train_data(station_code);
CREATE INDEX idx_train_data_sequence ON train_data(train_no, sequence);

-- Journey indexes
CREATE INDEX idx_journeys_carrier_id ON train_journeys(carrier_id);
CREATE INDEX idx_journeys_date ON train_journeys(journey_date);
CREATE INDEX idx_journeys_active ON train_journeys(is_active);
CREATE INDEX idx_journeys_source_dest ON train_journeys(source_station_code, destination_station_code);

-- Parcel request indexes
CREATE INDEX idx_parcel_requests_sender_id ON parcel_requests(sender_id);
CREATE INDEX idx_parcel_requests_carrier_id ON parcel_requests(carrier_id);
CREATE INDEX idx_parcel_requests_status ON parcel_requests(status);
CREATE INDEX idx_parcel_requests_pickup_station ON parcel_requests(pickup_station_code);
CREATE INDEX idx_parcel_requests_drop_station ON parcel_requests(drop_station_code);
CREATE INDEX idx_parcel_requests_created_at ON parcel_requests(created_at);

-- Transaction indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Chat indexes
CREATE INDEX idx_chat_rooms_parcel_id ON chat_rooms(parcel_request_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aadhaar_verifications_updated_at BEFORE UPDATE ON aadhaar_verifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_railway_stations_updated_at BEFORE UPDATE ON railway_stations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_train_journeys_updated_at BEFORE UPDATE ON train_journeys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parcel_requests_updated_at BEFORE UPDATE ON parcel_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aadhaar_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE train_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Parcel requests policies
CREATE POLICY "Anyone can view parcel requests" ON parcel_requests FOR SELECT USING (true);
CREATE POLICY "Senders can create parcel requests" ON parcel_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Senders can update their own parcel requests" ON parcel_requests FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Carriers can accept parcel requests" ON parcel_requests FOR UPDATE USING (
    auth.uid() = carrier_id OR 
    (carrier_id IS NULL AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'carrier'))
);

-- Journey policies
CREATE POLICY "Anyone can view journeys" ON train_journeys FOR SELECT USING (true);
CREATE POLICY "Carriers can manage their own journeys" ON train_journeys FOR ALL USING (auth.uid() = carrier_id);

-- Transaction policies
CREATE POLICY "Users can view their own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Chat policies
CREATE POLICY "Participants can view chat rooms" ON chat_rooms FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = carrier_id
);
CREATE POLICY "Participants can send messages" ON chat_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_room_id AND (sender_id = auth.uid() OR carrier_id = auth.uid()))
);

-- =============================================
-- VIEWS FOR COMPLEX QUERIES
-- =============================================

-- User profile with verification status
CREATE VIEW user_profiles AS
SELECT 
    u.*,
    CASE 
        WHEN u.is_phone_verified AND u.is_aadhaar_verified THEN 'fully_verified'
        WHEN u.is_phone_verified THEN 'phone_verified'
        ELSE 'unverified'
    END as verification_status,
    (SELECT COUNT(*) FROM parcel_requests pr WHERE pr.sender_id = u.id) as parcels_sent,
    (SELECT COUNT(*) FROM parcel_requests pr WHERE pr.carrier_id = u.id) as parcels_carried
FROM users u;

-- Active parcel requests with station information
CREATE VIEW active_parcel_requests AS
SELECT 
    pr.*,
    u.display_name as sender_name,
    u.phone as sender_phone,
    c.display_name as carrier_name,
    c.phone as carrier_phone
FROM parcel_requests pr
LEFT JOIN users u ON pr.sender_id = u.id
LEFT JOIN users c ON pr.carrier_id = c.id
WHERE pr.status IN ('PENDING', 'ACCEPTED', 'IN_TRANSIT');

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to calculate parcel fee
CREATE OR REPLACE FUNCTION calculate_parcel_fee(
    weight_kg DECIMAL,
    distance_km DECIMAL
) RETURNS JSONB AS $$
DECLARE
    base_fee DECIMAL := 50.00;
    distance_fee DECIMAL;
    weight_tier TEXT;
    total_fee DECIMAL;
BEGIN
    -- Determine weight tier and calculate distance fee
    CASE 
        WHEN weight_kg <= 5 THEN 
            weight_tier := 'light';
            distance_fee := distance_km * 2.0;
        WHEN weight_kg <= 15 THEN 
            weight_tier := 'medium';
            distance_fee := distance_km * 3.0;
        ELSE 
            weight_tier := 'heavy';
            distance_fee := distance_km * 4.0;
    END CASE;
    
    total_fee := base_fee + distance_fee;
    
    RETURN jsonb_build_object(
        'baseFee', base_fee,
        'distanceFee', distance_fee,
        'totalFee', total_fee,
        'distance', distance_km,
        'weightTier', weight_tier
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance(
    user_uuid UUID,
    amount DECIMAL,
    transaction_type transaction_type,
    description TEXT DEFAULT ''
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL;
    current_locked DECIMAL;
BEGIN
    -- Get current wallet state
    SELECT wallet_balance, locked_amount INTO current_balance, current_locked
    FROM users WHERE id = user_uuid;
    
    -- Update balance based on transaction type
    CASE transaction_type
        WHEN 'CREDIT' THEN
            UPDATE users SET wallet_balance = wallet_balance + amount WHERE id = user_uuid;
        WHEN 'DEBIT' THEN
            IF current_balance >= amount THEN
                UPDATE users SET wallet_balance = wallet_balance - amount WHERE id = user_uuid;
            ELSE
                RETURN FALSE; -- Insufficient balance
            END IF;
        WHEN 'LOCK' THEN
            IF current_balance >= amount THEN
                UPDATE users SET 
                    wallet_balance = wallet_balance - amount,
                    locked_amount = locked_amount + amount 
                WHERE id = user_uuid;
            ELSE
                RETURN FALSE; -- Insufficient balance
            END IF;
        WHEN 'UNLOCK' THEN
            UPDATE users SET 
                wallet_balance = wallet_balance + amount,
                locked_amount = locked_amount - amount 
            WHERE id = user_uuid;
    END CASE;
    
    -- Record transaction
    INSERT INTO wallet_transactions (user_id, type, amount, description)
    VALUES (user_uuid, transaction_type, amount, description);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Insert some sample railway stations
INSERT INTO railway_stations (code, name, state, zone) VALUES
('NDLS', 'NEW DELHI', 'Delhi', 'NR'),
('BCT', 'MUMBAI CENTRAL', 'Maharashtra', 'WR'),
('MAS', 'CHENNAI CENTRAL', 'Tamil Nadu', 'SR'),
('HWH', 'HOWRAH JN', 'West Bengal', 'ER'),
('SBC', 'KSR BENGALURU', 'Karnataka', 'SWR'),
('PUNE', 'PUNE JN', 'Maharashtra', 'CR'),
('ADI', 'AHMEDABAD JN', 'Gujarat', 'WR'),
('JP', 'JAIPUR', 'Rajasthan', 'NWR'),
('LKO', 'LUCKNOW NR', 'Uttar Pradesh', 'NER'),
('BBS', 'BHUBANESWAR', 'Odisha', 'ECoR');

-- =============================================
-- SCHEMA MIGRATION COMPLETE
-- =============================================
