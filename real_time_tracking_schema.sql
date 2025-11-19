-- Real-Time Tracking Database Schema
-- Phase 2: Tables for storing tracking events, train status, and location data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for main package tracking records
CREATE TABLE IF NOT EXISTS package_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    train_number VARCHAR(10) NOT NULL,
    from_station VARCHAR(10) NOT NULL,
    to_station VARCHAR(10) NOT NULL,
    tracking_active BOOLEAN DEFAULT true,
    last_train_status JSONB,
    last_carrier_location JSONB,
    current_package_status VARCHAR(50) DEFAULT 'pending',
    estimated_arrival TIMESTAMPTZ,
    delay_minutes INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_package_tracking UNIQUE(package_id)
);

-- Table for detailed tracking events history
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    train_status JSONB,
    carrier_location JSONB,
    package_status VARCHAR(50) NOT NULL,
    estimated_arrival TIMESTAMPTZ,
    delay_minutes INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite index for efficient queries
    INDEX idx_tracking_events_package_time (package_id, created_at DESC)
);

-- Table for carrier real-time locations
CREATE TABLE IF NOT EXISTS carrier_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2), -- GPS accuracy in meters
    speed DECIMAL(6,2), -- Speed in km/h
    heading DECIMAL(5,2), -- Direction in degrees (0-360)
    is_active BOOLEAN DEFAULT true,
    journey_id UUID REFERENCES carrier_journeys(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Spatial index for location queries
    INDEX idx_carrier_locations_carrier_time (carrier_id, created_at DESC),
    INDEX idx_carrier_locations_journey (journey_id)
);

-- Table for train station sequences and real-time updates
CREATE TABLE IF NOT EXISTS train_station_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(10) NOT NULL,
    station_code VARCHAR(10) NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    distance_from_start INTEGER, -- in kilometers
    day_of_journey INTEGER DEFAULT 1,
    halt_time INTEGER DEFAULT 0, -- in minutes
    sequence_order INTEGER NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for train route queries
    INDEX idx_train_sequences_train_order (train_number, sequence_order),
    INDEX idx_train_sequences_station (station_code)
);

-- Table for tracking notifications
CREATE TABLE IF NOT EXISTS tracking_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for user notifications
    INDEX idx_tracking_notifications_user (user_id, created_at DESC),
    INDEX idx_tracking_notifications_package (package_id)
);

-- Table for tracking settings per user
CREATE TABLE IF NOT EXISTS tracking_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    real_time_updates BOOLEAN DEFAULT true,
    location_sharing BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    update_frequency INTEGER DEFAULT 2, -- minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_tracking_settings UNIQUE(user_id)
);

-- Table for tracking analytics and performance metrics
CREATE TABLE IF NOT EXISTS tracking_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_packages_tracked INTEGER DEFAULT 0,
    average_tracking_accuracy DECIMAL(5,2) DEFAULT 0.0,
    average_delay_minutes INTEGER DEFAULT 0,
    delivery_success_rate DECIMAL(5,2) DEFAULT 0.0,
    api_response_time_ms INTEGER DEFAULT 0,
    cache_hit_rate DECIMAL(5,2) DEFAULT 0.0,
    total_location_updates INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_tracking_analytics_date UNIQUE(date)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_package_tracking_active 
ON package_tracking(tracking_active) WHERE tracking_active = true;

CREATE INDEX IF NOT EXISTS idx_package_tracking_status 
ON package_tracking(current_package_status);

CREATE INDEX IF NOT EXISTS idx_tracking_events_type_time 
ON tracking_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carrier_locations_active 
ON carrier_locations(is_active, updated_at DESC) WHERE is_active = true;

-- RLS (Row Level Security) Policies

-- Package tracking access - users can see their own packages
ALTER TABLE package_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own package tracking" ON package_tracking
    FOR SELECT USING (
        package_id IN (
            SELECT id FROM parcel_requests 
            WHERE sender_id = auth.uid() OR carrier_id = auth.uid()
        )
    );

CREATE POLICY "Carriers can update their package tracking" ON package_tracking
    FOR UPDATE USING (
        package_id IN (
            SELECT id FROM parcel_requests WHERE carrier_id = auth.uid()
        )
    );

-- Tracking events access
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their package tracking events" ON tracking_events
    FOR SELECT USING (
        package_id IN (
            SELECT id FROM parcel_requests 
            WHERE sender_id = auth.uid() OR carrier_id = auth.uid()
        )
    );

CREATE POLICY "System can insert tracking events" ON tracking_events
    FOR INSERT WITH CHECK (true); -- Allow system inserts

-- Carrier locations access
ALTER TABLE carrier_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carriers can manage their own locations" ON carrier_locations
    FOR ALL USING (carrier_id = auth.uid());

CREATE POLICY "Users can view carrier locations for their packages" ON carrier_locations
    FOR SELECT USING (
        carrier_id IN (
            SELECT carrier_id FROM parcel_requests WHERE sender_id = auth.uid()
        )
    );

-- Tracking notifications access
ALTER TABLE tracking_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON tracking_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON tracking_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Tracking settings access
ALTER TABLE tracking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tracking settings" ON tracking_settings
    FOR ALL USING (user_id = auth.uid());

-- Train station sequences - public read access
ALTER TABLE train_station_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to train sequences" ON train_station_sequences
    FOR SELECT USING (true);

-- Tracking analytics - admin only
ALTER TABLE tracking_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin access to tracking analytics" ON tracking_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions for automatic updates

-- Function to update package tracking timestamps
CREATE OR REPLACE FUNCTION update_package_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for package tracking updates
CREATE TRIGGER trigger_update_package_tracking_timestamp
    BEFORE UPDATE ON package_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_package_tracking_timestamp();

-- Function to update carrier location timestamps
CREATE OR REPLACE FUNCTION update_carrier_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for carrier location updates
CREATE TRIGGER trigger_update_carrier_location_timestamp
    BEFORE UPDATE ON carrier_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_carrier_location_timestamp();

-- Function to cleanup old tracking events (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_tracking_events()
RETURNS void AS $$
BEGIN
    DELETE FROM tracking_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    DELETE FROM carrier_locations 
    WHERE created_at < NOW() - INTERVAL '30 days' AND is_active = false;
    
    RAISE NOTICE 'Cleaned up old tracking events and carrier locations';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate tracking analytics
CREATE OR REPLACE FUNCTION update_tracking_analytics()
RETURNS void AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    total_tracked INTEGER;
    avg_accuracy DECIMAL(5,2);
    avg_delay INTEGER;
    success_rate DECIMAL(5,2);
BEGIN
    -- Calculate daily metrics
    SELECT COUNT(*) INTO total_tracked
    FROM package_tracking 
    WHERE DATE(created_at) = current_date;
    
    SELECT AVG(delay_minutes) INTO avg_delay
    FROM package_tracking 
    WHERE DATE(updated_at) = current_date;
    
    SELECT 
        (COUNT(CASE WHEN current_package_status = 'delivered' THEN 1 END) * 100.0 / COUNT(*))
    INTO success_rate
    FROM package_tracking 
    WHERE DATE(updated_at) = current_date;
    
    -- Insert or update analytics
    INSERT INTO tracking_analytics (
        date, total_packages_tracked, average_delay_minutes, delivery_success_rate
    ) VALUES (
        current_date, total_tracked, COALESCE(avg_delay, 0), COALESCE(success_rate, 0)
    ) ON CONFLICT (date) DO UPDATE SET
        total_packages_tracked = EXCLUDED.total_packages_tracked,
        average_delay_minutes = EXCLUDED.average_delay_minutes,
        delivery_success_rate = EXCLUDED.delivery_success_rate,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run analytics daily (requires pg_cron extension)
-- SELECT cron.schedule('daily-tracking-analytics', '0 1 * * *', 'SELECT update_tracking_analytics();');

-- Grant necessary permissions
GRANT ALL ON package_tracking TO authenticated;
GRANT ALL ON tracking_events TO authenticated;
GRANT ALL ON carrier_locations TO authenticated;
GRANT ALL ON tracking_notifications TO authenticated;
GRANT ALL ON tracking_settings TO authenticated;
GRANT SELECT ON train_station_sequences TO authenticated;
GRANT SELECT ON tracking_analytics TO authenticated;

-- Initial data - tracking settings for existing users
INSERT INTO tracking_settings (user_id, real_time_updates, push_notifications, email_notifications)
SELECT id, true, true, true FROM profiles
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE package_tracking IS 'Main tracking records for packages with current status';
COMMENT ON TABLE tracking_events IS 'Detailed history of all tracking events and status changes';
COMMENT ON TABLE carrier_locations IS 'Real-time location data from carriers during journeys';
COMMENT ON TABLE train_station_sequences IS 'Station sequence data for trains to calculate progress';
COMMENT ON TABLE tracking_notifications IS 'Notifications sent to users about tracking updates';
COMMENT ON TABLE tracking_settings IS 'User preferences for tracking notifications and updates';
COMMENT ON TABLE tracking_analytics IS 'Daily analytics and performance metrics for tracking system';