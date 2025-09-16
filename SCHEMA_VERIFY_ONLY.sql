-- =============================================
-- SIMPLE SCHEMA VERIFICATION ONLY
-- No data insertion - just verify structure
-- =============================================

-- 1. Verify all enhanced tables exist
SELECT 'Enhanced Railway Tables:' as check_type;

SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'trains', 'routes', 'train_schedules', 
    'route_segments', 'train_real_time', 
    'route_analytics', 'fare_rules'
)
ORDER BY table_name;

-- 2. Verify enhanced station columns were added
SELECT 'Enhanced Station Columns:' as check_type;

SELECT 
    column_name,
    data_type,
    CASE WHEN column_name IS NOT NULL THEN '✅' ELSE '❌' END as status
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
SELECT 'Enhanced Functions:' as check_type;

SELECT 
    routine_name,
    routine_type,
    CASE WHEN routine_name IS NOT NULL THEN '✅' ELSE '❌' END as status
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
SELECT 'Enhanced Views:' as check_type;

SELECT 
    table_name as view_name,
    table_type,
    CASE WHEN table_name IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
AND table_name IN ('popular_routes', 'live_train_status')
ORDER BY table_name;

-- 5. Check existing data counts
SELECT 'Current Data Status:' as check_type;

SELECT 
    'trains' as table_name, 
    count(*) as record_count
FROM trains
UNION ALL
SELECT 
    'routes' as table_name, 
    count(*) as record_count
FROM routes
UNION ALL
SELECT 
    'railway_stations' as table_name, 
    count(*) as record_count
FROM railway_stations
UNION ALL
SELECT 
    'station_distances' as table_name, 
    count(*) as record_count
FROM station_distances
UNION ALL
SELECT 
    'fare_rules' as table_name, 
    count(*) as record_count
FROM fare_rules
ORDER BY table_name;

-- 6. Summary count
SELECT 'Schema Verification Summary:' as final_check;

WITH table_check AS (
    SELECT COUNT(*) as table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'trains', 'routes', 'train_schedules', 
        'route_segments', 'train_real_time', 
        'route_analytics', 'fare_rules'
    )
),
function_check AS (
    SELECT COUNT(*) as function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN (
        'calculate_journey_time', 
        'get_trains_between_stations',
        'update_updated_at_column',
        'calculate_train_duration'
    )
),
view_check AS (
    SELECT COUNT(*) as view_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'VIEW'
    AND table_name IN ('popular_routes', 'live_train_status')
)
SELECT 
    tc.table_count || '/7 Tables' as tables_status,
    fc.function_count || '/4 Functions' as functions_status,
    vc.view_count || '/2 Views' as views_status,
    CASE 
        WHEN tc.table_count = 7 AND fc.function_count = 4 AND vc.view_count = 2 
        THEN '🎉 Schema Fully Deployed!' 
        ELSE '⚠️ Some components missing' 
    END as overall_status
FROM table_check tc, function_check fc, view_check vc;