-- Payment Records Table Schema
-- This table stores all payment transactions and their status

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Parcel and User Information
    parcel_request_id UUID NOT NULL REFERENCES parcel_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Razorpay Payment Details
    razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    
    -- Payment Amount and Currency
    amount INTEGER NOT NULL, -- Amount in paise (or smallest currency unit)
    currency VARCHAR(3) DEFAULT 'INR' NOT NULL,
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'pending' NOT NULL 
        CHECK (status IN ('pending', 'processing', 'captured', 'failed', 'refunded', 'cancelled')),
    
    -- Fee Breakdown (stored as JSONB for flexibility)
    fee_breakdown JSONB NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Payment Method and Gateway
    payment_method VARCHAR(50), -- card, netbanking, upi, wallet, etc.
    gateway_response JSONB, -- Store full gateway response for debugging
    
    -- Failure Information
    failure_reason TEXT,
    failure_code VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    payment_completed_at TIMESTAMPTZ,
    
    -- Metadata for additional information
    metadata JSONB DEFAULT '{}'
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER payment_records_updated_at
    BEFORE UPDATE ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_records_updated_at();

-- Add payment status column to parcel_requests table
ALTER TABLE parcel_requests 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'cancelled'));

-- Add payment_id reference to parcel_requests
ALTER TABLE parcel_requests 
ADD COLUMN IF NOT EXISTS payment_record_id UUID REFERENCES payment_records(id);

-- Create payment status update function
CREATE OR REPLACE FUNCTION update_parcel_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update parcel request payment status when payment record status changes
    UPDATE parcel_requests 
    SET 
        payment_status = CASE 
            WHEN NEW.status = 'captured' THEN 'paid'
            WHEN NEW.status = 'failed' THEN 'failed'
            WHEN NEW.status = 'refunded' THEN 'refunded'
            WHEN NEW.status = 'cancelled' THEN 'cancelled'
            WHEN NEW.status = 'pending' THEN 'pending'
            ELSE payment_status
        END,
        payment_record_id = NEW.id,
        updated_at = NOW()
    WHERE id = NEW.parcel_request_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update parcel payment status
CREATE TRIGGER update_parcel_payment_status_trigger
    AFTER INSERT OR UPDATE OF status ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_parcel_payment_status();

-- RLS Policies for payment_records
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own payment records
CREATE POLICY "Users can view own payment records" ON payment_records
    FOR SELECT 
    USING (
        sender_id = auth.uid() OR
        -- Allow carriers to view payment records for accepted requests
        EXISTS (
            SELECT 1 FROM parcel_requests pr 
            WHERE pr.id = parcel_request_id 
            AND pr.carrier_id = auth.uid()
        )
    );

-- Policy: Only authenticated users can insert payment records
CREATE POLICY "Authenticated users can create payment records" ON payment_records
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        sender_id = auth.uid()
    );

-- Policy: Only system can update payment records (via webhook/API)
CREATE POLICY "System can update payment records" ON payment_records
    FOR UPDATE 
    USING (true) -- This will be restricted at the application level
    WITH CHECK (true);

-- Create indexes separately (after table creation)
CREATE INDEX IF NOT EXISTS idx_payment_records_parcel_request 
    ON payment_records(parcel_request_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_sender 
    ON payment_records(sender_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_status 
    ON payment_records(status);

CREATE INDEX IF NOT EXISTS idx_payment_records_razorpay_payment 
    ON payment_records(razorpay_payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_created_at 
    ON payment_records(created_at);

-- Indexes for parcel_requests table
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_status 
    ON parcel_requests(payment_status);

CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_record 
    ON parcel_requests(payment_record_id);

-- Comments for documentation
COMMENT ON TABLE payment_records IS 'Stores all payment transactions for parcel delivery fees';
COMMENT ON COLUMN payment_records.amount IS 'Amount in paise (INR) or smallest currency unit';
COMMENT ON COLUMN payment_records.fee_breakdown IS 'JSON breakdown of how the fee was calculated';
COMMENT ON COLUMN payment_records.gateway_response IS 'Full response from payment gateway for debugging';
COMMENT ON COLUMN payment_records.metadata IS 'Additional parcel and delivery information';

-- Sample query to get payment summary
/*
SELECT 
    pr.id as parcel_id,
    pr.pickup_station,
    pr.drop_station,
    pr.payment_status,
    pay.amount / 100.0 as amount_inr,
    pay.status as payment_status,
    pay.payment_method,
    pay.created_at as payment_created,
    pay.payment_completed_at
FROM parcel_requests pr
LEFT JOIN payment_records pay ON pr.payment_record_id = pay.id
WHERE pr.sender_id = 'user-uuid'
ORDER BY pr.created_at DESC;
*/