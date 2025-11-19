-- Add missing DELETE policy for parcel_requests table
-- This allows senders to delete their own parcel requests

-- First check if the policy already exists to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'parcel_requests' 
        AND policyname = 'Senders can delete their own parcel requests'
    ) THEN
        CREATE POLICY "Senders can delete their own parcel requests" 
        ON parcel_requests 
        FOR DELETE 
        USING (auth.uid() = sender_id);
    END IF;
END $$;