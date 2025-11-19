-- Add payment tracking columns to parcel_requests table
ALTER TABLE parcel_requests 
ADD COLUMN payment_id VARCHAR(255),
ADD COLUMN payment_order_id VARCHAR(255),
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'PENDING';

-- Add indexes for payment fields
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_id ON parcel_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_order_id ON parcel_requests(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_status ON parcel_requests(payment_status);

-- Add check constraint for payment_status
ALTER TABLE parcel_requests 
ADD CONSTRAINT chk_payment_status 
CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));