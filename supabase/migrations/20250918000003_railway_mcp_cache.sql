-- Railway MCP Cache Migration
-- Adds caching infrastructure for Railway MCP API responses

-- Railway MCP Cache Table
CREATE TABLE IF NOT EXISTS railway_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_railway_cache_key ON railway_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_railway_cache_expires ON railway_cache(expires_at);

-- Enable RLS
ALTER TABLE railway_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Allow all authenticated users to read/write cache
CREATE POLICY "authenticated_users_railway_cache" ON railway_cache
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_railway_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM railway_cache WHERE expires_at < NOW();
    RAISE NOTICE 'Cleaned up expired Railway MCP cache entries';
END;
$$ LANGUAGE plpgsql;

-- Function to get cached data with automatic cleanup
CREATE OR REPLACE FUNCTION get_railway_cache(cache_key_param VARCHAR)
RETURNS JSONB AS $$
DECLARE
    cached_data JSONB;
BEGIN
    -- Clean up expired entries first
    DELETE FROM railway_cache WHERE expires_at < NOW();
    
    -- Get cached data if it exists and is not expired
    SELECT data INTO cached_data 
    FROM railway_cache 
    WHERE cache_key = cache_key_param 
    AND expires_at > NOW();
    
    RETURN cached_data;
END;
$$ LANGUAGE plpgsql;

-- Function to set cache data
CREATE OR REPLACE FUNCTION set_railway_cache(
    cache_key_param VARCHAR,
    data_param JSONB,
    expires_hours INTEGER DEFAULT 24
)
RETURNS void AS $$
BEGIN
    INSERT INTO railway_cache (cache_key, data, expires_at)
    VALUES (cache_key_param, data_param, NOW() + (expires_hours || ' hours')::INTERVAL)
    ON CONFLICT (cache_key) 
    DO UPDATE SET 
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON railway_cache TO authenticated;

-- Comment for documentation
COMMENT ON TABLE railway_cache IS 'Cache for Railway MCP API responses to improve performance and reduce API calls';