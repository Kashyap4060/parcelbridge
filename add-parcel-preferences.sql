-- Add preferred date and coach type fields to parcel_requests table
-- Migration to support sender preferences for date and coach type

-- Add preferred_date column for when sender wants to send the parcel
ALTER TABLE parcel_requests 
ADD COLUMN preferred_date DATE;

-- Add coach_type column for preferred railway coach type
ALTER TABLE parcel_requests 
ADD COLUMN coach_type VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN parcel_requests.preferred_date IS 'The date when the sender wants to send their parcel';
COMMENT ON COLUMN parcel_requests.coach_type IS 'Preferred railway coach type (1A, 2A, 3A, SL, etc.)';

-- Create index for efficient querying by preferred date
CREATE INDEX idx_parcel_requests_preferred_date ON parcel_requests(preferred_date);

-- Create index for coach type filtering
CREATE INDEX idx_parcel_requests_coach_type ON parcel_requests(coach_type);

-- Add constraint to ensure preferred_date is not in the past (only for new records)
-- Note: This constraint will allow existing records with NULL dates
ALTER TABLE parcel_requests 
ADD CONSTRAINT check_preferred_date_future 
CHECK (preferred_date IS NULL OR preferred_date >= CURRENT_DATE);

-- Add constraint for valid coach types
ALTER TABLE parcel_requests 
ADD CONSTRAINT check_valid_coach_type 
CHECK (coach_type IS NULL OR coach_type IN (
    '1A', '2A', '3A', '3E', 'EC', 'CC',  -- Luxury/High-end
    'SL', '2S', 'GN',                      -- Middle & Budget
    'Anubhuti', 'Vistadome', 'DDCC'        -- Special AC
));