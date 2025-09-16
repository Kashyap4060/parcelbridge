-- =============================================
-- VERIFICATION QUERIES FOR ENHANCED RAILWAY SCHEMA
-- Run these in Supabase SQL Editor to verify deployment
-- =============================================

-- 1. Verify all new tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'trains', 'routes', 'train_schedules', 
    'route_segments', 'train_real_time', 
    'route_analytics', 'fare_rules'
)
ORDER BY table_name;

-- 2. Check if railway_stations table was enhanced with new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'railway_stations' 
AND table_schema = 'public'
AND column_name IN (
    'station_type', 'zone_code', 'division', 
    'elevation_meters', 'platforms_count', 
    'is_major_station', 'facilities'
)
ORDER BY column_name;

-- 3. Verify functions were created
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'calculate_journey_time', 
    'get_trains_between_stations',
    'update_updated_at_column',
    'calculate_train_duration'
)
ORDER BY routine_name;

-- 4. Verify views were created
SELECT table_name as view_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
AND table_name IN ('popular_routes', 'live_train_status')
ORDER BY table_name;

-- 5. Check indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 6. Verify triggers were created
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name IN ('update_trains_updated_at', 'calculate_trains_duration')
ORDER BY trigger_name;

-- =============================================
-- INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample trains for testing
INSERT INTO trains (
    train_number, train_name, train_type,
    source_station_code, source_station_name,
    destination_station_code, destination_station_name,
    departure_time, arrival_time
) VALUES 
    ('12951', 'Mumbai Rajdhani Express', 'Rajdhani', 'MMCT', 'Mumbai Central', 'NDLS', 'New Delhi', '16:55', '08:35'),
    ('12301', 'Howrah Rajdhani Express', 'Rajdhani', 'HWH', 'Howrah', 'NDLS', 'New Delhi', '16:55', '10:05'),
    ('12009', 'Shatabdi Express', 'Shatabdi', 'NDLS', 'New Delhi', 'SLN', 'Sultanpur', '06:00', '14:40'),
    ('12002', 'Bhopal Shatabdi', 'Shatabdi', 'NDLS', 'New Delhi', 'BPL', 'Bhopal', '06:15', '14:00'),
    ('19019', 'Dehradun Express', 'Express', 'DDN', 'Dehradun', 'MMCT', 'Mumbai Central', '21:50', '23:20')
ON CONFLICT (train_number) DO NOTHING;

-- Insert sample routes for testing
INSERT INTO routes (
    train_number, station_code, station_name, sequence_number,
    arrival_time, departure_time, distance_from_source
) VALUES 
    ('12951', 'MMCT', 'Mumbai Central', 1, NULL, '16:55', 0),
    ('12951', 'BRC', 'Vadodara Junction', 2, '21:02', '21:07', 392),
    ('12951', 'RTM', 'Ratlam Junction', 3, '23:25', '23:30', 589),
    ('12951', 'UJN', 'Ujjain Junction', 4, '00:32', '00:37', 644),
    ('12951', 'BPL', 'Bhopal Junction', 5, '02:00', '02:05', 743),
    ('12951', 'JHS', 'Jhansi Junction', 6, '04:48', '04:53', 1014),
    ('12951', 'AGC', 'Agra Cantt', 7, '06:40', '06:45', 1199),
    ('12951', 'NDLS', 'New Delhi', 8, '08:35', NULL, 1384)
ON CONFLICT (train_number, station_code) DO NOTHING;

-- Insert sample fare rules
INSERT INTO fare_rules (
    rule_name, rule_type, train_types, base_rate, per_km_rate, minimum_charge
) VALUES 
    ('Standard Distance Rate', 'distance_based', '{"Express", "Passenger"}', 50.00, 2.00, 25.00),
    ('Rajdhani Premium', 'train_type_premium', '{"Rajdhani"}', 100.00, 3.50, 100.00),
    ('Shatabdi Premium', 'train_type_premium', '{"Shatabdi"}', 75.00, 3.00, 75.00),
    ('Peak Hour Surcharge', 'time_based', '{}', 0.00, 0.00, 0.00)
ON CONFLICT DO NOTHING;

-- =============================================
-- TEST ENHANCED FUNCTIONS
-- =============================================

-- Test the journey calculation function
SELECT 'Function Test: calculate_journey_time' as test_type;
SELECT calculate_journey_time('12951', 'MMCT', 'NDLS') as journey_duration;

-- Test the train search function
SELECT 'Function Test: get_trains_between_stations' as test_type;
SELECT * FROM get_trains_between_stations('NDLS', 'MMCT', CURRENT_DATE);

-- Test views
SELECT 'View Test: live_train_status' as test_type;
SELECT train_number, train_name, scheduled_departure, scheduled_arrival 
FROM live_train_status 
LIMIT 5;

-- =============================================
-- VERIFICATION SUMMARY
-- =============================================

-- Count records in each new table
SELECT 'trains' as table_name, count(*) as record_count FROM trains
UNION ALL
SELECT 'routes' as table_name, count(*) as record_count FROM routes
UNION ALL
SELECT 'train_schedules' as table_name, count(*) as record_count FROM train_schedules
UNION ALL
SELECT 'route_segments' as table_name, count(*) as record_count FROM route_segments
UNION ALL
SELECT 'train_real_time' as table_name, count(*) as record_count FROM train_real_time
UNION ALL
SELECT 'route_analytics' as table_name, count(*) as record_count FROM route_analytics
UNION ALL
SELECT 'fare_rules' as table_name, count(*) as record_count FROM fare_rules
ORDER BY table_name;