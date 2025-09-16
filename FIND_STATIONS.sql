-- =============================================
-- FIND AVAILABLE STATIONS AND FIX TEST DATA
-- Run this first to find valid station codes
-- =============================================

-- 1. Find some common major station codes that exist in your database
SELECT 'Available Major Stations:' as info;

SELECT code, name, state 
FROM railway_stations 
WHERE UPPER(name) LIKE '%DELHI%' 
   OR UPPER(name) LIKE '%MUMBAI%'
   OR UPPER(name) LIKE '%KOLKATA%'
   OR UPPER(name) LIKE '%CHENNAI%'
   OR UPPER(name) LIKE '%BANGALORE%'
   OR UPPER(name) LIKE '%HYDERABAD%'
ORDER BY name
LIMIT 10;

-- 2. Check if common station codes exist
SELECT 'Station Code Check:' as info;

SELECT 
    code,
    name,
    CASE WHEN code IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as status
FROM railway_stations 
WHERE code IN ('NDLS', 'CSMT', 'HWH', 'MAS', 'SBC', 'HYB', 'ADI', 'CNB', 'AGC', 'JHS')
ORDER BY code;

-- 3. Find stations that contain common city names
SELECT 'Search by City Names:' as info;

SELECT code, name, state
FROM railway_stations 
WHERE UPPER(name) LIKE '%NEW DELHI%'
   OR UPPER(name) LIKE '%MUMBAI%'
   OR UPPER(name) LIKE '%HOWRAH%'
   OR code IN ('NDLS', 'CSMT', 'LTT', 'HWH', 'SBC', 'MAS')
ORDER BY name
LIMIT 10;

-- 4. Get a sample of available stations for testing
SELECT 'Sample Available Stations for Testing:' as info;

SELECT code, name, state
FROM railway_stations 
WHERE code IS NOT NULL 
  AND name IS NOT NULL
  AND LENGTH(code) BETWEEN 2 AND 6
ORDER BY RANDOM()
LIMIT 10;