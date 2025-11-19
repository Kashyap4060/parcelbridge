-- Railway MCP Cache Table
-- Stores cached data from Railway MCP API to reduce API calls and improve performance

CREATE TABLE IF NOT EXISTS railway_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Metadata
    api_source VARCHAR(50) DEFAULT 'railway_mcp',
    cache_type VARCHAR(50), -- 'distance', 'train_info', 'live_status', etc.
    
    -- Indexes for performance
    CONSTRAINT railway_cache_key_unique UNIQUE (cache_key)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_railway_cache_key ON railway_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_railway_cache_type ON railway_cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_railway_cache_created ON railway_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_railway_cache_expires ON railway_cache(expires_at);

-- Auto-cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_railway_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM railway_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule auto-cleanup (run daily)
-- Note: This would need to be set up with pg_cron or similar scheduling system

-- Comments for documentation
COMMENT ON TABLE railway_cache IS 'Cache table for Railway MCP API responses';
COMMENT ON COLUMN railway_cache.cache_key IS 'Unique identifier for cached data (e.g., "distance_LTT_NCB")';
COMMENT ON COLUMN railway_cache.data IS 'JSON data from Railway MCP API';
COMMENT ON COLUMN railway_cache.cache_type IS 'Type of cached data for easier management';
COMMENT ON COLUMN railway_cache.expires_at IS 'When this cache entry expires';

-- RLS (Row Level Security) policies
ALTER TABLE railway_cache ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage cache
CREATE POLICY "Allow service role full access to railway_cache" ON railway_cache
    FOR ALL USING (true);

-- Allow authenticated users to read cache (for faster responses)
CREATE POLICY "Allow authenticated users to read railway_cache" ON railway_cache
    FOR SELECT USING (auth.role() = 'authenticated');