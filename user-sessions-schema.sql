-- Add user sessions table for proper session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) NOT NULL REFERENCES user_profiles(firebase_uid) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add user credentials table for login history and role preferences
CREATE TABLE user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) NOT NULL REFERENCES user_profiles(firebase_uid) ON DELETE CASCADE,
    preferred_role user_role, -- User's preferred role for auto-redirect
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    last_ip_address INET,
    last_device_info JSONB,
    auto_login_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_firebase_uid UNIQUE (firebase_uid)
);

-- Add role history table to track role switches
CREATE TABLE user_role_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) NOT NULL REFERENCES user_profiles(firebase_uid) ON DELETE CASCADE,
    previous_role user_role,
    new_role user_role NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    reason TEXT
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_firebase_uid ON user_sessions(firebase_uid);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX idx_user_credentials_firebase_uid ON user_credentials(firebase_uid);
CREATE INDEX idx_user_role_history_firebase_uid ON user_role_history(firebase_uid);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create function to update session activity
CREATE OR REPLACE FUNCTION update_session_activity(session_token_param TEXT)
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET last_activity = NOW(), updated_at = NOW()
    WHERE session_token = session_token_param AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;
