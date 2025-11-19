-- Performance optimization indexes for Parcel Bridge
-- These indexes will improve query performance for common operations

-- Index for parcel requests by sender (for user's requests page)
CREATE INDEX IF NOT EXISTS idx_parcel_requests_sender_id 
ON parcel_requests(sender_id);

-- Index for parcel requests by status (for filtering)
CREATE INDEX IF NOT EXISTS idx_parcel_requests_status 
ON parcel_requests(status);

-- Index for parcel requests by carrier (for carrier dashboard)
CREATE INDEX IF NOT EXISTS idx_parcel_requests_carrier_id 
ON parcel_requests(carrier_id);

-- Index for parcel requests by pickup/drop stations (for route matching)
CREATE INDEX IF NOT EXISTS idx_parcel_requests_stations 
ON parcel_requests(pickup_station_code, drop_station_code);

-- Index for parcel requests by created date (for recent requests)
CREATE INDEX IF NOT EXISTS idx_parcel_requests_created_at 
ON parcel_requests(created_at DESC);

-- Index for train journeys by carrier (for carrier's journeys)
CREATE INDEX IF NOT EXISTS idx_train_journeys_carrier_id 
ON train_journeys(carrier_id);

-- Index for train journeys by departure/arrival stations
CREATE INDEX IF NOT EXISTS idx_train_journeys_stations 
ON train_journeys(source_station_code, destination_station_code);

-- Index for train journeys by date (for current/upcoming journeys)
CREATE INDEX IF NOT EXISTS idx_train_journeys_journey_date 
ON train_journeys(journey_date);

-- Index for user profiles by phone number (for phone-based lookup)
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone 
ON user_profiles(phone_number);

-- Index for wallet transactions by user (for transaction history)
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id 
ON wallet_transactions(user_id);

-- Index for wallet transactions by date (for recent transactions)
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at 
ON wallet_transactions(created_at DESC);

-- Composite index for active parcel requests by route
CREATE INDEX IF NOT EXISTS idx_parcel_requests_active_route 
ON parcel_requests(pickup_station_code, drop_station_code, status) 
WHERE status IN ('PENDING', 'ACCEPTED');

-- Composite index for user sessions (if we have user_sessions table)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_active 
        ON user_sessions(user_id, expires_at) 
        WHERE expires_at > NOW();
    END IF;
END $$;