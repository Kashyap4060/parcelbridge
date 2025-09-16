-- =============================================
-- COMPREHENSIVE RAILWAY DATA MANAGEMENT SYSTEM
-- Enhanced Database Schema for Parcel-Bridge
-- =============================================

-- =============================================
-- 1. ENHANCED TRAINS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS trains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(10) UNIQUE NOT NULL,
    train_name VARCHAR(200) NOT NULL,
    train_type VARCHAR(50) NOT NULL, -- Express, Passenger, Superfast, etc.
    
    -- Source and destination
    source_station_code VARCHAR(10) NOT NULL,
    source_station_name VARCHAR(200) NOT NULL,
    destination_station_code VARCHAR(10) NOT NULL,
    destination_station_name VARCHAR(200) NOT NULL,
    
    -- Schedule information
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    journey_duration INTERVAL NOT NULL,
    
    -- Operational details
    frequency VARCHAR(50) DEFAULT 'Daily', -- Daily, Weekly, etc.
    operational_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    zone VARCHAR(10), -- Railway zone
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_train_number CHECK (char_length(train_number) > 0),
    CONSTRAINT valid_train_name CHECK (char_length(train_name) > 0),
    CONSTRAINT different_source_destination CHECK (source_station_code != destination_station_code)
);

-- =============================================
-- 2. ENHANCED ROUTES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(10) NOT NULL,
    
    -- Station information
    station_code VARCHAR(10) NOT NULL,
    station_name VARCHAR(200) NOT NULL,
    sequence_number INTEGER NOT NULL,
    
    -- Timing information
    arrival_time TIME,
    departure_time TIME,
    halt_duration INTERVAL DEFAULT '0 minutes',
    
    -- Distance and location
    distance_from_source DECIMAL(8, 2) NOT NULL DEFAULT 0,
    platform_number VARCHAR(10),
    
    -- Status
    is_technical_halt BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE,
    FOREIGN KEY (station_code) REFERENCES railway_stations(code),
    
    -- Constraints
    CONSTRAINT positive_sequence CHECK (sequence_number > 0),
    CONSTRAINT positive_distance CHECK (distance_from_source >= 0),
    CONSTRAINT unique_train_sequence UNIQUE (train_number, sequence_number),
    CONSTRAINT unique_train_station UNIQUE (train_number, station_code)
);

-- =============================================
-- 3. TRAIN SCHEDULES TABLE (for variations)
-- =============================================

CREATE TABLE IF NOT EXISTS train_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(10) NOT NULL,
    
    -- Schedule variation details
    effective_from DATE NOT NULL,
    effective_to DATE,
    day_of_week INTEGER, -- 1=Monday, 7=Sunday, NULL=all days
    
    -- Modified timing
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    
    -- Reason for variation
    variation_reason VARCHAR(200), -- Festival, Maintenance, etc.
    is_cancelled BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    FOREIGN KEY (train_number) REFERENCES trains(train_number) ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT valid_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 1 AND day_of_week <= 7))
);

-- =============================================
-- 4. ENHANCED STATIONS TABLE (extend existing)
-- =============================================

-- Add additional columns to existing railway_stations table
ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    station_type VARCHAR(50) DEFAULT 'Regular'; -- Junction, Terminal, Halt, etc.

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    zone_code VARCHAR(10); -- NR, SR, WR, etc.

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    division VARCHAR(100);

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    elevation_meters INTEGER;

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    platforms_count INTEGER DEFAULT 1;

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    is_major_station BOOLEAN DEFAULT false;

ALTER TABLE railway_stations ADD COLUMN IF NOT EXISTS 
    facilities TEXT[]; -- ['parking', 'wifi', 'restaurant', etc.]

-- =============================================
-- 5. ROUTE SEGMENTS TABLE (for analysis)
-- =============================================

CREATE TABLE IF NOT EXISTS route_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Segment definition
    from_station_code VARCHAR(10) NOT NULL,
    to_station_code VARCHAR(10) NOT NULL,
    
    -- Multiple trains can serve this segment
    train_numbers VARCHAR(10)[] NOT NULL,
    
    -- Segment details
    distance_km DECIMAL(8, 2) NOT NULL,
    average_travel_time INTERVAL NOT NULL,
    segment_type VARCHAR(50) DEFAULT 'regular', -- express, local, etc.
    
    -- Analytics
    popularity_score DECIMAL(5, 2) DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    FOREIGN KEY (from_station_code) REFERENCES railway_stations(code),
    FOREIGN KEY (to_station_code) REFERENCES railway_stations(code),
    CONSTRAINT different_segment_stations CHECK (from_station_code != to_station_code),
    CONSTRAINT positive_segment_distance CHECK (distance_km > 0),
    CONSTRAINT unique_segment UNIQUE (from_station_code, to_station_code)
);

-- =============================================
-- 6. TRAIN REAL-TIME STATUS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS train_real_time (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(10) NOT NULL,
    
    -- Current status
    current_station_code VARCHAR(10),
    current_status VARCHAR(50) NOT NULL, -- On Time, Delayed, Cancelled, etc.
    
    -- Timing information
    scheduled_arrival TIME,
    actual_arrival TIME,
    scheduled_departure TIME,
    actual_departure TIME,
    delay_minutes INTEGER DEFAULT 0,
    
    -- Journey details
    journey_date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Data source
    data_source VARCHAR(50) DEFAULT 'system', -- system, api, manual
    
    -- Constraints
    FOREIGN KEY (train_number) REFERENCES trains(train_number),
    FOREIGN KEY (current_station_code) REFERENCES railway_stations(code),
    CONSTRAINT valid_journey_date CHECK (journey_date <= CURRENT_DATE + INTERVAL '30 days')
);

-- =============================================
-- 7. ROUTE ANALYTICS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS route_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Route definition
    from_station_code VARCHAR(10) NOT NULL,
    to_station_code VARCHAR(10) NOT NULL,
    
    -- Analytics data
    search_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    popular_trains VARCHAR(10)[],
    average_journey_time INTERVAL,
    
    -- Time-based analytics
    peak_hours INTEGER[] DEFAULT '{}', -- Hours when most searched
    popular_days INTEGER[] DEFAULT '{}', -- Days when most popular
    
    -- Last updated
    last_calculated DATE DEFAULT CURRENT_DATE,
    
    -- Constraints
    FOREIGN KEY (from_station_code) REFERENCES railway_stations(code),
    FOREIGN KEY (to_station_code) REFERENCES railway_stations(code),
    CONSTRAINT unique_route_analytics UNIQUE (from_station_code, to_station_code)
);

-- =============================================
-- 8. FARE CALCULATION RULES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS fare_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Rule definition
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- distance_based, time_based, express_charge, etc.
    
    -- Applicability
    train_types VARCHAR(50)[] DEFAULT '{}', -- Which train types this applies to
    zone_codes VARCHAR(10)[] DEFAULT '{}', -- Which zones this applies to
    
    -- Calculation parameters
    base_rate DECIMAL(8, 2) NOT NULL,
    per_km_rate DECIMAL(8, 2) DEFAULT 0,
    minimum_charge DECIMAL(8, 2) DEFAULT 0,
    maximum_charge DECIMAL(8, 2),
    
    -- Time-based modifiers
    peak_hour_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    off_peak_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_rates CHECK (base_rate >= 0 AND per_km_rate >= 0),
    CONSTRAINT valid_multipliers CHECK (peak_hour_multiplier > 0 AND off_peak_multiplier > 0)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Trains table indexes
CREATE INDEX IF NOT EXISTS idx_trains_number ON trains(train_number);
CREATE INDEX IF NOT EXISTS idx_trains_route ON trains(source_station_code, destination_station_code);
CREATE INDEX IF NOT EXISTS idx_trains_type ON trains(train_type);
CREATE INDEX IF NOT EXISTS idx_trains_active ON trains(is_active) WHERE is_active = true;

-- Routes table indexes
CREATE INDEX IF NOT EXISTS idx_routes_train ON routes(train_number);
CREATE INDEX IF NOT EXISTS idx_routes_station ON routes(station_code);
CREATE INDEX IF NOT EXISTS idx_routes_sequence ON routes(train_number, sequence_number);

-- Station distances indexes (enhance existing)
CREATE INDEX IF NOT EXISTS idx_station_distances_from ON station_distances(from_station_code);
CREATE INDEX IF NOT EXISTS idx_station_distances_to ON station_distances(to_station_code);
CREATE INDEX IF NOT EXISTS idx_station_distances_route ON station_distances(from_station_code, to_station_code);

-- Real-time data indexes
CREATE INDEX IF NOT EXISTS idx_realtime_train_date ON train_real_time(train_number, journey_date);
CREATE INDEX IF NOT EXISTS idx_realtime_station ON train_real_time(current_station_code);
CREATE INDEX IF NOT EXISTS idx_realtime_updated ON train_real_time(last_updated);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_route ON route_analytics(from_station_code, to_station_code);
CREATE INDEX IF NOT EXISTS idx_analytics_calculated ON route_analytics(last_calculated);

-- =============================================
-- FUNCTIONS AND STORED PROCEDURES
-- =============================================

-- Function to calculate journey time between stations
CREATE OR REPLACE FUNCTION calculate_journey_time(
    p_train_number VARCHAR(10),
    p_from_station VARCHAR(10),
    p_to_station VARCHAR(10)
) RETURNS INTERVAL AS $$
DECLARE
    v_from_departure TIME;
    v_to_arrival TIME;
    v_journey_time INTERVAL;
BEGIN
    -- Get departure time from source station
    SELECT departure_time INTO v_from_departure
    FROM routes 
    WHERE train_number = p_train_number 
    AND station_code = p_from_station;
    
    -- Get arrival time at destination station
    SELECT arrival_time INTO v_to_arrival
    FROM routes 
    WHERE train_number = p_train_number 
    AND station_code = p_to_station;
    
    -- Calculate journey time (handle next day arrivals)
    IF v_to_arrival >= v_from_departure THEN
        v_journey_time := v_to_arrival - v_from_departure;
    ELSE
        v_journey_time := (v_to_arrival + INTERVAL '1 day') - v_from_departure;
    END IF;
    
    RETURN v_journey_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get trains between stations
CREATE OR REPLACE FUNCTION get_trains_between_stations(
    p_from_station VARCHAR(10),
    p_to_station VARCHAR(10),
    p_departure_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    train_number VARCHAR(10),
    train_name VARCHAR(200),
    departure_time TIME,
    arrival_time TIME,
    journey_duration INTERVAL,
    distance_km DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        t.train_number,
        t.train_name,
        r1.departure_time,
        r2.arrival_time,
        calculate_journey_time(t.train_number, p_from_station, p_to_station),
        COALESCE(sd.distance_km, 0) as distance_km
    FROM trains t
    JOIN routes r1 ON t.train_number = r1.train_number AND r1.station_code = p_from_station
    JOIN routes r2 ON t.train_number = r2.train_number AND r2.station_code = p_to_station
    LEFT JOIN station_distances sd ON 
        (sd.from_station_code = p_from_station AND sd.to_station_code = p_to_station)
        OR (sd.from_station_code = p_to_station AND sd.to_station_code = p_from_station)
    WHERE t.is_active = true
    AND r1.sequence_number < r2.sequence_number
    ORDER BY r1.departure_time;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for popular routes
CREATE OR REPLACE VIEW popular_routes AS
SELECT 
    ra.from_station_code,
    ra.to_station_code,
    fs.name as from_station_name,
    ts.name as to_station_name,
    ra.search_count,
    ra.booking_count,
    ra.popular_trains,
    ra.average_journey_time
FROM route_analytics ra
JOIN railway_stations fs ON ra.from_station_code = fs.code
JOIN railway_stations ts ON ra.to_station_code = ts.code
WHERE ra.search_count > 0
ORDER BY ra.search_count DESC;

-- View for train schedules with real-time data
CREATE OR REPLACE VIEW live_train_status AS
SELECT 
    t.train_number,
    t.train_name,
    t.source_station_name,
    t.destination_station_name,
    t.departure_time as scheduled_departure,
    t.arrival_time as scheduled_arrival,
    rt.current_station_code,
    cs.name as current_station_name,
    rt.current_status,
    rt.delay_minutes,
    rt.journey_date,
    rt.last_updated
FROM trains t
LEFT JOIN train_real_time rt ON t.train_number = rt.train_number 
    AND rt.journey_date = CURRENT_DATE
LEFT JOIN railway_stations cs ON rt.current_station_code = cs.code
WHERE t.is_active = true;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE train_real_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE fare_rules ENABLE ROW LEVEL SECURITY;

-- Policies for train_real_time (read-only for regular users)
CREATE POLICY "train_real_time_read" ON train_real_time
    FOR SELECT USING (true);

CREATE POLICY "train_real_time_insert_admin" ON train_real_time
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policies for fare_rules (admin only for modifications)
CREATE POLICY "fare_rules_read" ON fare_rules
    FOR SELECT USING (is_active = true);

CREATE POLICY "fare_rules_admin" ON fare_rules
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- =============================================
-- TRIGGERS FOR DATA CONSISTENCY
-- =============================================

-- Function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for trains table
CREATE TRIGGER update_trains_updated_at 
    BEFORE UPDATE ON trains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically calculate journey duration
CREATE OR REPLACE FUNCTION calculate_train_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate journey duration based on departure and arrival times
    IF NEW.arrival_time >= NEW.departure_time THEN
        NEW.journey_duration := NEW.arrival_time - NEW.departure_time;
    ELSE
        NEW.journey_duration := (NEW.arrival_time + INTERVAL '1 day') - NEW.departure_time;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_trains_duration
    BEFORE INSERT OR UPDATE ON trains
    FOR EACH ROW EXECUTE FUNCTION calculate_train_duration();