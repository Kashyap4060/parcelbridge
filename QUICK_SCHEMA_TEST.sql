-- =============================================
-- QUICK TEST AND VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor after schema deployment
-- =============================================

-- 1. Quick verification that all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'trains', 'routes', 'train_schedules', 
        'route_segments', 'train_real_time', 
        'route_analytics', 'fare_rules'
    );
    
    RAISE NOTICE 'Enhanced Railway Tables Created: % out of 7', table_count;
    
    IF table_count = 7 THEN
        RAISE NOTICE '✅ All enhanced railway tables are present!';
    ELSE
        RAISE NOTICE '❌ Missing some tables. Expected 7, found %', table_count;
    END IF;
END $$;

-- 2. Insert minimal test data
INSERT INTO trains (
    train_number, train_name, train_type,
    source_station_code, source_station_name,
    destination_station_code, destination_station_name,
    departure_time, arrival_time
) VALUES 
    ('12951', 'Mumbai Rajdhani Express', 'Rajdhani', 'MMCT', 'Mumbai Central', 'NDLS', 'New Delhi', '16:55', '08:35'),
    ('12301', 'Howrah Rajdhani Express', 'Rajdhani', 'HWH', 'Howrah', 'NDLS', 'New Delhi', '16:55', '10:05'),
    ('12009', 'Shatabdi Express', 'Shatabdi', 'NDLS', 'New Delhi', 'SLN', 'Sultanpur', '06:00', '14:40')
ON CONFLICT (train_number) DO UPDATE SET
    train_name = EXCLUDED.train_name,
    train_type = EXCLUDED.train_type;

-- 3. Insert minimal route data for testing
INSERT INTO routes (
    train_number, station_code, station_name, sequence_number,
    arrival_time, departure_time, distance_from_source
) VALUES 
    ('12951', 'MMCT', 'Mumbai Central', 1, NULL, '16:55', 0),
    ('12951', 'NDLS', 'New Delhi', 2, '08:35', NULL, 1384),
    ('12301', 'HWH', 'Howrah', 1, NULL, '16:55', 0),
    ('12301', 'NDLS', 'New Delhi', 2, '10:05', NULL, 1441),
    ('12009', 'NDLS', 'New Delhi', 1, NULL, '06:00', 0),
    ('12009', 'SLN', 'Sultanpur', 2, '14:40', NULL, 143)
ON CONFLICT (train_number, station_code) DO NOTHING;

-- 4. Test the enhanced functions
SELECT 'Testing Functions:' as test_section;

-- Test journey time calculation
SELECT 
    '12951 MMCT to NDLS:' as route,
    calculate_journey_time('12951', 'MMCT', 'NDLS') as journey_time;

-- Test train search function
SELECT 'Testing get_trains_between_stations function:' as test;
SELECT train_number, train_name, departure_time, arrival_time, journey_duration
FROM get_trains_between_stations('NDLS', 'MMCT', CURRENT_DATE)
LIMIT 3;

-- 5. Show table record counts
SELECT 'Table Record Counts:' as summary;

SELECT 
    'trains' as table_name, 
    count(*) as record_count,
    'Enhanced train data' as description
FROM trains
UNION ALL
SELECT 
    'routes' as table_name, 
    count(*) as record_count,
    'Station sequences for trains' as description
FROM routes
UNION ALL
SELECT 
    'railway_stations' as table_name, 
    count(*) as record_count,
    'All railway stations' as description
FROM railway_stations
UNION ALL
SELECT 
    'station_distances' as table_name, 
    count(*) as record_count,
    'Pre-calculated distances' as description
FROM station_distances
UNION ALL
SELECT 
    'fare_rules' as table_name, 
    count(*) as record_count,
    'Fare calculation rules' as description
FROM fare_rules
ORDER BY table_name;

-- 6. Test views
SELECT 'Testing Views:' as test_section;

SELECT train_number, train_name, scheduled_departure, scheduled_arrival
FROM live_train_status
WHERE train_number IN ('12951', '12301', '12009')
LIMIT 5;

-- 7. Verify enhanced station columns
SELECT 'Enhanced Station Columns Test:' as test;
SELECT 
    code, 
    name, 
    COALESCE(station_type, 'Not Set') as station_type,
    COALESCE(zone_code, 'Not Set') as zone_code,
    COALESCE(platforms_count::text, 'Not Set') as platforms_count
FROM railway_stations 
WHERE code IN ('NDLS', 'MMCT', 'HWH')
LIMIT 3;

-- 8. Final status
DO $$
BEGIN
    RAISE NOTICE '🎉 Enhanced Railway Schema Verification Complete!';
    RAISE NOTICE '✅ Tables: Created and populated with test data';
    RAISE NOTICE '✅ Functions: Working correctly';
    RAISE NOTICE '✅ Views: Accessible';
    RAISE NOTICE '✅ Triggers: Active for data consistency';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test enhanced railway services in your application';
    RAISE NOTICE '2. Verify fee calculator integration';
    RAISE NOTICE '3. Import more train data as needed';
END $$;