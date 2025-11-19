-- Enhanced Parcel Matching System Migration
-- Implements payment-driven workflow with automatic carrier matching

-- Step 1: Update parcel_status enum to include new workflow states
ALTER TYPE parcel_status RENAME TO parcel_status_old;

CREATE TYPE parcel_status AS ENUM (
    'PENDING_PAYMENT',    -- Initial state after creation, waiting for payment
    'SEARCHING_CARRIER',  -- Payment successful, actively searching for carrier
    'MATCHED',           -- Carrier matched and assigned
    'ACCEPTED',          -- Carrier accepted the parcel (legacy compatibility)
    'IN_TRANSIT',        -- Parcel is being transported
    'DELIVERED',         -- Successfully delivered
    'CANCELLED'          -- Request cancelled
);

-- Step 2: Create payment_status enum
CREATE TYPE payment_status AS ENUM (
    'PENDING',           -- Payment not yet made
    'PROCESSING',        -- Payment being processed
    'SUCCESSFUL',        -- Payment completed successfully
    'FAILED',           -- Payment failed
    'REFUNDED'          -- Payment refunded
);

-- Step 3: Add new columns to parcel_requests table
ALTER TABLE parcel_requests 
ADD COLUMN payment_status payment_status DEFAULT 'PENDING',
ADD COLUMN matched_carrier_id UUID REFERENCES user_profiles(id),
ADD COLUMN matched_journey_id UUID,
ADD COLUMN matching_attempted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_matching_attempt TIMESTAMP WITH TIME ZONE,
ADD COLUMN razorpay_payment_id VARCHAR(100),
ADD COLUMN razorpay_order_id VARCHAR(100),
ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Update existing records to new status system
UPDATE parcel_requests 
SET status = CASE 
    WHEN status::text = 'PENDING' AND payment_held > 0 THEN 'SEARCHING_CARRIER'::parcel_status
    WHEN status::text = 'PENDING' THEN 'PENDING_PAYMENT'::parcel_status
    ELSE status::text::parcel_status
END;

UPDATE parcel_requests 
SET payment_status = CASE 
    WHEN payment_held > 0 THEN 'SUCCESSFUL'::payment_status
    ELSE 'PENDING'::payment_status
END;

-- Step 5: Update the status column to use new enum
ALTER TABLE parcel_requests 
ALTER COLUMN status TYPE parcel_status USING status::text::parcel_status;

-- Step 6: Drop old enum
DROP TYPE parcel_status_old;

-- Step 7: Enhanced train_journeys table for PNR-based matching
-- Check if train_journeys table exists, if not create it
CREATE TABLE IF NOT EXISTS train_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    pnr VARCHAR(20) NOT NULL,
    train_number VARCHAR(10),
    train_name VARCHAR(200),
    source_station VARCHAR(200) NOT NULL,
    source_station_code VARCHAR(10) NOT NULL,
    destination_station VARCHAR(200) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    journey_date DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME,
    stations JSONB, -- Array of station details with times
    coach_type VARCHAR(50),
    seat_number VARCHAR(20),
    status journey_status DEFAULT 'AVAILABLE',
    is_active BOOLEAN DEFAULT TRUE,
    pnr_verified BOOLEAN DEFAULT FALSE,
    pnr_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_carrier_pnr UNIQUE(carrier_id, pnr),
    CONSTRAINT valid_journey_date CHECK (journey_date >= CURRENT_DATE),
    CONSTRAINT different_journey_stations CHECK (source_station_code != destination_station_code)
);

-- Step 8: Create journey_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE journey_status AS ENUM ('AVAILABLE', 'PARCEL_ASSIGNED', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update journey status column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'train_journeys' AND column_name = 'status') THEN
        ALTER TABLE train_journeys 
        ALTER COLUMN status TYPE journey_status USING status::text::journey_status;
    ELSE
        ALTER TABLE train_journeys 
        ADD COLUMN status journey_status DEFAULT 'AVAILABLE';
    END IF;
END $$;

-- Step 9: Create parcel_matching_attempts table to track matching history
CREATE TABLE IF NOT EXISTS parcel_matching_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    carriers_searched INTEGER DEFAULT 0,
    matches_found INTEGER DEFAULT 0,
    best_match_score DECIMAL(5,2),
    matching_criteria JSONB,
    result VARCHAR(50), -- 'MATCHED', 'NO_MATCHES', 'ERROR'
    matched_carrier_id UUID REFERENCES user_profiles(id),
    matched_journey_id UUID REFERENCES train_journeys(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_parcel_attempt UNIQUE(parcel_id, attempt_number)
);

-- Step 10: Add indexes for efficient matching queries
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_status ON parcel_requests(payment_status);
CREATE INDEX IF NOT EXISTS idx_parcel_requests_status_payment ON parcel_requests(status, payment_status);
CREATE INDEX IF NOT EXISTS idx_parcel_requests_searching ON parcel_requests(status) WHERE status = 'SEARCHING_CARRIER';

CREATE INDEX IF NOT EXISTS idx_train_journeys_active ON train_journeys(is_active, status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_train_journeys_stations ON train_journeys(source_station_code, destination_station_code);
CREATE INDEX IF NOT EXISTS idx_train_journeys_date ON train_journeys(journey_date);
CREATE INDEX IF NOT EXISTS idx_train_journeys_carrier_active ON train_journeys(carrier_id, is_active);

CREATE INDEX IF NOT EXISTS idx_matching_attempts_parcel ON parcel_matching_attempts(parcel_id);
CREATE INDEX IF NOT EXISTS idx_matching_attempts_result ON parcel_matching_attempts(result);

-- Step 11: Add foreign key constraint for matched_journey_id
ALTER TABLE parcel_requests 
ADD CONSTRAINT fk_parcel_requests_matched_journey 
FOREIGN KEY (matched_journey_id) REFERENCES train_journeys(id);

-- Step 12: Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_train_journeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_train_journeys_updated_at_trigger
    BEFORE UPDATE ON train_journeys
    FOR EACH ROW
    EXECUTE FUNCTION update_train_journeys_updated_at();

-- Step 13: Add comments for documentation
COMMENT ON COLUMN parcel_requests.payment_status IS 'Current payment status of the parcel request';
COMMENT ON COLUMN parcel_requests.matched_carrier_id IS 'ID of the carrier matched to this parcel';
COMMENT ON COLUMN parcel_requests.matched_journey_id IS 'ID of the specific journey assigned to this parcel';
COMMENT ON COLUMN parcel_requests.matching_attempted_at IS 'When the first matching attempt was made';
COMMENT ON COLUMN parcel_requests.last_matching_attempt IS 'When the last matching attempt was made';

COMMENT ON TABLE train_journeys IS 'Stores carrier journey information extracted from PNR data';
COMMENT ON TABLE parcel_matching_attempts IS 'Tracks all matching attempts for debugging and optimization';

-- Step 14: Update RLS policies for new tables
ALTER TABLE train_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_matching_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for train_journeys
CREATE POLICY "Carriers can manage their own journeys" ON train_journeys
    FOR ALL USING (auth.uid() = carrier_id);

CREATE POLICY "Anyone can view active journeys for matching" ON train_journeys
    FOR SELECT USING (is_active = TRUE);

-- Policies for parcel_matching_attempts  
CREATE POLICY "Users can view their parcel matching attempts" ON parcel_matching_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parcel_requests pr 
            WHERE pr.id = parcel_id 
            AND pr.sender_id = auth.uid()
        )
    );

CREATE POLICY "System can insert matching attempts" ON parcel_matching_attempts
    FOR INSERT WITH CHECK (true);

-- Step 15: Create function to trigger automatic matching after payment
CREATE OR REPLACE FUNCTION trigger_automatic_matching()
RETURNS TRIGGER AS $$
BEGIN
    -- If payment status changed to SUCCESSFUL, update parcel status and trigger matching
    IF OLD.payment_status != 'SUCCESSFUL' AND NEW.payment_status = 'SUCCESSFUL' THEN
        -- Update status to SEARCHING_CARRIER
        NEW.status = 'SEARCHING_CARRIER';
        NEW.payment_completed_at = NOW();
        
        -- Note: Actual matching logic will be triggered by application code
        -- This just ensures the status is updated correctly
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parcel_payment_status_trigger
    BEFORE UPDATE ON parcel_requests
    FOR EACH ROW
    EXECUTE FUNCTION trigger_automatic_matching();

-- Final step: Add constraints and validation
ALTER TABLE parcel_requests
ADD CONSTRAINT check_payment_and_status 
CHECK (
    (payment_status = 'PENDING' AND status IN ('PENDING_PAYMENT')) OR
    (payment_status = 'SUCCESSFUL' AND status IN ('SEARCHING_CARRIER', 'MATCHED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED')) OR
    (payment_status IN ('FAILED', 'REFUNDED') AND status IN ('CANCELLED', 'PENDING_PAYMENT'))
);

COMMENT ON CONSTRAINT check_payment_and_status ON parcel_requests IS 'Ensures status and payment_status are consistent';