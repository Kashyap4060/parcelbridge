-- Fix and add remaining performance indexes
-- Only add indexes that don't already exist

-- Index for train journeys by source/destination stations (corrected column names)
CREATE INDEX IF NOT EXISTS idx_train_journeys_route 
ON train_journeys(source_station_code, destination_station_code);

-- Index for train journeys by journey date
CREATE INDEX IF NOT EXISTS idx_train_journeys_journey_date 
ON train_journeys(journey_date);

-- Index for parcel requests by pickup/drop stations (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_parcel_requests_route') THEN
        CREATE INDEX idx_parcel_requests_route 
        ON parcel_requests(pickup_station_code, drop_station_code);
    END IF;
END $$;

-- Index for user profiles by phone number
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone 
ON user_profiles(phone_number);

-- Index for wallet transactions by user (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id 
        ON wallet_transactions(user_id);
        
        CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at 
        ON wallet_transactions(created_at DESC);
    END IF;
END $$;

-- Composite index for active parcel requests by route
CREATE INDEX IF NOT EXISTS idx_parcel_requests_active_route 
ON parcel_requests(pickup_station_code, drop_station_code, status) 
WHERE status IN ('PENDING', 'ACCEPTED');