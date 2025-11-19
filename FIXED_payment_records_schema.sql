-- Fixed Payment Records Schema for Supabase
-- Run this in Supabase SQL Editor

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Parcel and User Information
    parcel_request_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    
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

-- Add foreign key constraints (separate from table creation for better compatibility)
ALTER TABLE payment_records 
ADD CONSTRAINT fk_payment_records_parcel_request 
FOREIGN KEY (parcel_request_id) REFERENCES parcel_requests(id) ON DELETE CASCADE;

ALTER TABLE payment_records 
ADD CONSTRAINT fk_payment_records_sender 
FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Create indexes for better query performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_payment_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER payment_records_updated_at
    BEFORE UPDATE ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_records_updated_at();

-- Add payment status column to parcel_requests table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parcel_requests' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE parcel_requests 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'unpaid' 
            CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded', 'cancelled'));
    END IF;
END $$;

-- Add payment_record_id column to parcel_requests table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parcel_requests' 
        AND column_name = 'payment_record_id'
    ) THEN
        ALTER TABLE parcel_requests 
        ADD COLUMN payment_record_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE parcel_requests 
        ADD CONSTRAINT fk_parcel_requests_payment_record 
        FOREIGN KEY (payment_record_id) REFERENCES payment_records(id);
    END IF;
END $$;

-- Create indexes for parcel_requests payment columns
CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_status 
    ON parcel_requests(payment_status);

CREATE INDEX IF NOT EXISTS idx_parcel_requests_payment_record 
    ON parcel_requests(payment_record_id);

-- Create function to update parcel payment status when payment record changes
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
DROP TRIGGER IF EXISTS update_parcel_payment_status_trigger ON payment_records;
CREATE TRIGGER update_parcel_payment_status_trigger
    AFTER INSERT OR UPDATE OF status ON payment_records
    FOR EACH ROW
    EXECUTE FUNCTION update_parcel_payment_status();

-- Enable RLS on payment_records
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own payment records or records for parcels they're carrying
CREATE POLICY "Users can view payment records" ON payment_records
    FOR SELECT 
    USING (
        -- Sender can view their own payment records
        sender_id = auth.uid() OR
        -- Carrier can view payment records for parcels they accepted
        EXISTS (
            SELECT 1 FROM parcel_requests pr 
            WHERE pr.id = payment_records.parcel_request_id 
            AND pr.carrier_id = auth.uid()
        )
    );

-- RLS Policy: Only authenticated senders can create payment records for their own parcels
CREATE POLICY "Senders can create payment records" ON payment_records
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM parcel_requests pr 
            WHERE pr.id = payment_records.parcel_request_id 
            AND pr.sender_id = auth.uid()
        )
    );

-- RLS Policy: System/webhook can update payment records (will be restricted at application level)
CREATE POLICY "System can update payment records" ON payment_records
    FOR UPDATE 
    USING (true) -- Application will handle authorization
    WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE payment_records IS 'Stores all payment transactions for parcel delivery fees via Razorpay';
COMMENT ON COLUMN payment_records.amount IS 'Amount in paise (INR) - multiply by 100 from rupees';
COMMENT ON COLUMN payment_records.fee_breakdown IS 'JSON structure containing fee calculation details';
COMMENT ON COLUMN payment_records.gateway_response IS 'Full Razorpay response for debugging and audit trail';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Payment Records schema created successfully!';
    RAISE NOTICE 'Tables: payment_records with indexes and triggers';
    RAISE NOTICE 'Updated: parcel_requests with payment columns';
    RAISE NOTICE 'Enabled: Row Level Security policies';
END $$;