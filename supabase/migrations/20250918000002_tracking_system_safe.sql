-- Phase 2: Real-Time Tracking System Migration (Safe Version)
-- This migration adds comprehensive tracking infrastructure

-- First, let's check what core tables exist and create tracking extensions

-- Table for main package tracking records
CREATE TABLE IF NOT EXISTS package_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL, -- Will reference parcel_requests when it exists
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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for detailed tracking events history
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL, -- Will reference parcel_requests when it exists
    event_type VARCHAR(50) NOT NULL,
    train_status JSONB,
    carrier_location JSONB,
    package_status VARCHAR(50) NOT NULL,
    estimated_arrival TIMESTAMPTZ,
    delay_minutes INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for carrier real-time locations
CREATE TABLE IF NOT EXISTS carrier_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID NOT NULL, -- Will reference profiles when it exists
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2), -- GPS accuracy in meters
    speed DECIMAL(6,2), -- Speed in km/h
    heading DECIMAL(5,2), -- Direction in degrees (0-360)
    is_active BOOLEAN DEFAULT true,
    journey_id UUID, -- Will reference carrier_journeys when it exists
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking notifications
CREATE TABLE IF NOT EXISTS tracking_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL, -- Will reference parcel_requests when it exists
    user_id UUID NOT NULL, -- Will reference profiles when it exists
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for tracking settings per user
CREATE TABLE IF NOT EXISTS tracking_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Will reference profiles when it exists
    real_time_updates BOOLEAN DEFAULT true,
    location_sharing BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    update_frequency INTEGER DEFAULT 2, -- minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for automated status logs
CREATE TABLE IF NOT EXISTS automated_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL, -- Will reference parcel_requests when it exists
    rule_id VARCHAR(50) NOT NULL,
    from_status VARCHAR(50) NOT NULL,
    to_status VARCHAR(50) NOT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Will reference profiles when it exists
    subscription_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for journey verifications cache
CREATE TABLE IF NOT EXISTS journey_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pnr_number VARCHAR(20) NOT NULL,
    train_number VARCHAR(10) NOT NULL,
    departure_date DATE NOT NULL,
    verification_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_package_tracking_active 
ON package_tracking(tracking_active) WHERE tracking_active = true;

CREATE INDEX IF NOT EXISTS idx_package_tracking_status 
ON package_tracking(current_package_status);

CREATE INDEX IF NOT EXISTS idx_tracking_events_package_time 
ON tracking_events(package_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracking_events_type_time 
ON tracking_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carrier_locations_carrier_time 
ON carrier_locations(carrier_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_carrier_locations_active 
ON carrier_locations(is_active, updated_at DESC) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_carrier_locations_journey 
ON carrier_locations(journey_id);

CREATE INDEX IF NOT EXISTS idx_tracking_notifications_user 
ON tracking_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracking_notifications_package 
ON tracking_notifications(package_id);

-- Enable RLS on all tables
ALTER TABLE package_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_verifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for authenticated users
CREATE POLICY "authenticated_users_package_tracking" ON package_tracking
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_tracking_events" ON tracking_events
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_carrier_locations" ON carrier_locations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_tracking_notifications" ON tracking_notifications
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "users_own_tracking_settings" ON tracking_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "authenticated_users_automated_logs" ON automated_status_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "users_own_push_subscriptions" ON push_subscriptions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "authenticated_users_journey_verifications" ON journey_verifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_package_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_package_tracking_timestamp
    BEFORE UPDATE ON package_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_package_tracking_timestamp();

CREATE OR REPLACE FUNCTION update_carrier_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_carrier_location_timestamp
    BEFORE UPDATE ON carrier_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_carrier_location_timestamp();

-- Comments for documentation
COMMENT ON TABLE package_tracking IS 'Main tracking records for packages with current status';
COMMENT ON TABLE tracking_events IS 'Detailed history of all tracking events and status changes';
COMMENT ON TABLE carrier_locations IS 'Real-time location data from carriers during journeys';
COMMENT ON TABLE tracking_notifications IS 'Notifications sent to users about tracking updates';
COMMENT ON TABLE tracking_settings IS 'User preferences for tracking notifications and updates';
COMMENT ON TABLE automated_status_logs IS 'Audit trail for automated status changes';
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions';
COMMENT ON TABLE journey_verifications IS 'Cached PNR and Railway MCP verification results';