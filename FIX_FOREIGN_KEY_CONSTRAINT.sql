-- Fix foreign key constraint for parcel_requests table
-- Change from referencing 'users' table to 'user_profiles' table

-- First, drop the existing foreign key constraint
ALTER TABLE parcel_requests 
DROP CONSTRAINT IF EXISTS parcel_requests_sender_id_fkey;

ALTER TABLE parcel_requests 
DROP CONSTRAINT IF EXISTS parcel_requests_carrier_id_fkey;

-- Add the correct foreign key constraints pointing to user_profiles
ALTER TABLE parcel_requests 
ADD CONSTRAINT parcel_requests_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE parcel_requests 
ADD CONSTRAINT parcel_requests_carrier_id_fkey 
FOREIGN KEY (carrier_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Verify the constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'parcel_requests';
