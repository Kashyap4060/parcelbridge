-- Enhanced Parcel Matching System Migration (SAFE VERSION)
-- Implements payment-driven workflow with automatic carrier matching
-- This version safely handles existing columns and data

-- Step 1: Update parcel_status enum to include new workflow states
DO $$
DECLARE
    view_definition TEXT;
BEGIN
    -- Check if new enum values already exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING_PAYMENT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'parcel_status')) THEN
        
        -- Store the view definition before dropping it
        SELECT pg_get_viewdef('active_parcel_requests', true) INTO view_definition;
        
        -- Drop the view that depends on the status column
        DROP VIEW IF EXISTS active_parcel_requests;
        
        -- Save and drop time-sensitive check constraints that may fail on UPDATE (e.g., future_pickup)
        CREATE TEMP TABLE IF NOT EXISTS _saved_constraints (
            name TEXT PRIMARY KEY,
            definition TEXT
        );
        INSERT INTO _saved_constraints(name, definition)
        SELECT c.conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        WHERE c.conname = 'future_pickup' AND c.conrelid = 'parcel_requests'::regclass
        ON CONFLICT (name) DO NOTHING;
        ALTER TABLE parcel_requests DROP CONSTRAINT IF EXISTS future_pickup;
        
    -- First, remove the default constraint temporarily
    ALTER TABLE parcel_requests ALTER COLUMN status DROP DEFAULT;

    -- Temporarily disable user-defined triggers on parcel_requests to avoid trigger errors during migration
    ALTER TABLE parcel_requests DISABLE TRIGGER USER;
        
        -- Add a temporary text column to store converted values
        ALTER TABLE parcel_requests ADD COLUMN status_temp TEXT;
        
        -- Copy and convert the old enum values to text
        UPDATE parcel_requests SET status_temp = 
            CASE status::text
                WHEN 'PENDING' THEN 'PENDING_PAYMENT'
                WHEN 'ACCEPTED' THEN 'ACCEPTED'
                WHEN 'IN_TRANSIT' THEN 'IN_TRANSIT'
                WHEN 'DELIVERED' THEN 'DELIVERED'
                WHEN 'CANCELLED' THEN 'CANCELLED'
                ELSE 'PENDING_PAYMENT'
            END;
        
        -- Drop the old status column
        ALTER TABLE parcel_requests DROP COLUMN status;
        
        -- Rename old enum type
        ALTER TYPE parcel_status RENAME TO parcel_status_old;

        -- Create new enum type
        CREATE TYPE parcel_status AS ENUM (
            'PENDING_PAYMENT',    -- Initial state after creation, waiting for payment
            'SEARCHING_CARRIER',  -- Payment successful, actively searching for carrier
            'MATCHED',           -- Carrier matched and assigned
            'ACCEPTED',          -- Carrier accepted the parcel (legacy compatibility)
            'IN_TRANSIT',        -- Parcel is being transported
            'DELIVERED',         -- Successfully delivered
            'CANCELLED'          -- Request cancelled
        );

        -- Add the new status column with the new enum type
        ALTER TABLE parcel_requests ADD COLUMN status parcel_status;
        
        -- Update the new column with converted values
        UPDATE parcel_requests SET status = status_temp::parcel_status;
        
        -- Set NOT NULL constraint and default value
        ALTER TABLE parcel_requests ALTER COLUMN status SET NOT NULL;
        ALTER TABLE parcel_requests ALTER COLUMN status SET DEFAULT 'PENDING_PAYMENT'::parcel_status;
        
    -- Drop the temporary column and old enum
    ALTER TABLE parcel_requests DROP COLUMN status_temp;
    DROP TYPE parcel_status_old;

    -- Re-enable user-defined triggers on parcel_requests
    ALTER TABLE parcel_requests ENABLE TRIGGER USER;
        
        -- Recreate the view with updated enum types if it existed
        IF view_definition IS NOT NULL THEN
            -- Adjust old enum type/value references in the saved view definition
            view_definition := replace(view_definition, '::parcel_status_old', '::parcel_status');
            view_definition := replace(view_definition, '''PENDING''::parcel_status', '''PENDING_PAYMENT''::parcel_status');
            view_definition := replace(view_definition, 'status = ''PENDING''' , 'status = ''PENDING_PAYMENT''');
            EXECUTE 'CREATE VIEW active_parcel_requests AS ' || view_definition;
        END IF;
    END IF;
END
$$;

-- Step 2: Create payment_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM (
            'PENDING',           -- Payment not yet made
            'PROCESSING',        -- Payment being processed
            'SUCCESSFUL',        -- Payment completed successfully
            'FAILED',           -- Payment failed
            'REFUNDED'          -- Payment refunded
        );
    END IF;
END
$$;

-- Step 3: Add new columns to parcel_requests table (only if they don't exist)
DO $$
BEGIN
    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'payment_status') THEN
        ALTER TABLE parcel_requests ADD COLUMN payment_status payment_status DEFAULT 'PENDING';
    END IF;

    -- Add matched_carrier_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'matched_carrier_id') THEN
        ALTER TABLE parcel_requests ADD COLUMN matched_carrier_id UUID REFERENCES user_profiles(id);
    END IF;

    -- Add matched_journey_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'matched_journey_id') THEN
        ALTER TABLE parcel_requests ADD COLUMN matched_journey_id UUID;
    END IF;

    -- Add matching_attempted_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'matching_attempted_at') THEN
        ALTER TABLE parcel_requests ADD COLUMN matching_attempted_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add last_matching_attempt column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'last_matching_attempt') THEN
        ALTER TABLE parcel_requests ADD COLUMN last_matching_attempt TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add razorpay_payment_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'razorpay_payment_id') THEN
        ALTER TABLE parcel_requests ADD COLUMN razorpay_payment_id VARCHAR(100);
    END IF;

    -- Add razorpay_order_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'razorpay_order_id') THEN
        ALTER TABLE parcel_requests ADD COLUMN razorpay_order_id VARCHAR(100);
    END IF;

    -- Add payment_completed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'payment_completed_at') THEN
        ALTER TABLE parcel_requests ADD COLUMN payment_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add preferred_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'preferred_date') THEN
        ALTER TABLE parcel_requests ADD COLUMN preferred_date DATE;
    END IF;

    -- Add coach_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parcel_requests' AND column_name = 'coach_type') THEN
        ALTER TABLE parcel_requests ADD COLUMN coach_type VARCHAR(10);
    END IF;
END
$$;

-- Step 4: Update existing records to new status system (only if needed)
DO $$
DECLARE
    _def TEXT;
BEGIN
    -- Temporarily disable user-defined triggers to prevent issues with legacy timestamp triggers
    ALTER TABLE parcel_requests DISABLE TRIGGER USER;
    -- Update payment status based on existing data
    UPDATE parcel_requests 
    SET payment_status = CASE 
        WHEN payment_held > 0 THEN 'SUCCESSFUL'::payment_status
        ELSE 'PENDING'::payment_status
    END
    WHERE payment_status IS NULL OR payment_status = 'PENDING';
    
    -- Further refine status based on payment status
    UPDATE parcel_requests 
    SET status = CASE 
        WHEN status = 'PENDING_PAYMENT' AND payment_held > 0 THEN 'SEARCHING_CARRIER'::parcel_status
        ELSE status
    END;
    -- Re-enable user-defined triggers after updates
    ALTER TABLE parcel_requests ENABLE TRIGGER USER;

    -- Recreate previously dropped time-sensitive check constraints as NOT VALID to avoid re-checking old rows
    -- Safely attempt to read from the temp table; if it doesn't exist, ignore
    BEGIN
        SELECT definition INTO _def FROM _saved_constraints WHERE name = 'future_pickup';
        IF _def IS NOT NULL THEN
            EXECUTE 'ALTER TABLE parcel_requests ADD CONSTRAINT future_pickup ' || _def || ' NOT VALID';
        END IF;
    EXCEPTION WHEN undefined_table THEN
        -- No saved constraints; skip recreation
        NULL;
    END;
END
$$;

-- Step 5: Create train_journeys table for carrier PNR data (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS train_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    pnr VARCHAR(10) NOT NULL,
    train_number VARCHAR(10) NOT NULL,
    train_name VARCHAR(200),
    
    -- Station information
    source_station VARCHAR(200) NOT NULL,
    source_station_code VARCHAR(10) NOT NULL,
    destination_station VARCHAR(200) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    
    -- Journey details
    stations JSONB, -- Array of all stations with timings
    journey_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    
    -- Coach and seat information
    coach_number VARCHAR(10),
    seat_number VARCHAR(10),
    passenger_name VARCHAR(100),
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create parcel_matching_attempts table for analytics (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS parcel_matching_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Matching criteria and results
    search_criteria JSONB,
    potential_matches JSONB,
    selected_match_id UUID,
    match_confidence_score DECIMAL(3, 2),
    
    -- Status and outcome
    attempt_status VARCHAR(20) DEFAULT 'ATTEMPTED', -- ATTEMPTED, MATCHED, NO_MATCHES, FAILED
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for performance (only if they don't exist)
DO $$
BEGIN
    -- Index on parcel status for quick filtering
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_parcel_requests_status') THEN
        CREATE INDEX idx_parcel_requests_status ON parcel_requests(status);
    END IF;

    -- Index on payment status
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_parcel_requests_payment_status') THEN
        CREATE INDEX idx_parcel_requests_payment_status ON parcel_requests(payment_status);
    END IF;

    -- Index on journey date for train journeys
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_train_journeys_date') THEN
        CREATE INDEX idx_train_journeys_date ON train_journeys(journey_date);
    END IF;

    -- Index on stations for matching
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_train_journeys_stations') THEN
        CREATE INDEX idx_train_journeys_stations ON train_journeys(source_station_code, destination_station_code);
    END IF;

    -- Index on carrier active journeys
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_train_journeys_active') THEN
        CREATE INDEX idx_train_journeys_active ON train_journeys(carrier_id, is_active);
    END IF;
END
$$;

-- Step 8: Add RLS policies for new tables (only if they don't exist)
DO $$
BEGIN
    -- Enable RLS on train_journeys if not already enabled
    ALTER TABLE train_journeys ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on parcel_matching_attempts if not already enabled
    ALTER TABLE parcel_matching_attempts ENABLE ROW LEVEL SECURITY;
END
$$;

-- Create RLS policies for train_journeys (with conflict handling)
DROP POLICY IF EXISTS "Users can view all active train journeys" ON train_journeys;
CREATE POLICY "Users can view all active train journeys" ON train_journeys
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Carriers can manage their own journeys" ON train_journeys;
CREATE POLICY "Carriers can manage their own journeys" ON train_journeys
    FOR ALL USING (carrier_id = auth.uid()::uuid);

-- Create RLS policies for parcel_matching_attempts (with conflict handling)
DROP POLICY IF EXISTS "Users can view matching attempts for their parcels" ON parcel_matching_attempts;
CREATE POLICY "Users can view matching attempts for their parcels" ON parcel_matching_attempts
    FOR SELECT USING (
        parcel_id IN (
            SELECT id FROM parcel_requests WHERE sender_id = auth.uid()::uuid
        )
    );

DROP POLICY IF EXISTS "Service can manage all matching attempts" ON parcel_matching_attempts;
CREATE POLICY "Service can manage all matching attempts" ON parcel_matching_attempts
    FOR ALL USING (true);

-- Step 9: Add constraints for data integrity (only if they don't exist)
DO $$
BEGIN
    -- Add constraint to ensure valid status transitions
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_payment_status_workflow') THEN
        ALTER TABLE parcel_requests 
        ADD CONSTRAINT valid_payment_status_workflow 
        CHECK (
            (payment_status = 'PENDING' AND status IN ('PENDING_PAYMENT')) OR
            (payment_status = 'SUCCESSFUL' AND status IN ('SEARCHING_CARRIER', 'MATCHED', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED')) OR
            (payment_status IN ('FAILED', 'REFUNDED') AND status IN ('CANCELLED', 'PENDING_PAYMENT'))
        );
    END IF;
END
$$;

-- Step 10: Create a function to update timestamps
-- Use a uniquely named function to avoid overriding any existing timestamp trigger functions
CREATE OR REPLACE FUNCTION update_train_journeys_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for train_journeys updated_at
DROP TRIGGER IF EXISTS update_train_journeys_updated_at ON train_journeys;
CREATE TRIGGER update_train_journeys_updated_at
    BEFORE UPDATE ON train_journeys
    FOR EACH ROW
    EXECUTE FUNCTION update_train_journeys_updated_at_column();

-- Migration completed successfully!
-- Summary of changes:
-- 1. Enhanced parcel_status enum with new workflow states
-- 2. Added payment_status enum and column
-- 3. Added new columns for enhanced matching (matched_carrier_id, journey_id, etc.)
-- 4. Added preferred_date and coach_type columns for user preferences
-- 5. Created train_journeys table for PNR-based carrier data
-- 6. Created parcel_matching_attempts table for analytics
-- 7. Added performance indexes
-- 8. Set up RLS policies for security
-- 9. Added data integrity constraints
-- 10. Created triggers for automatic timestamp updates

SELECT 'Enhanced parcel matching migration completed successfully!' AS status;