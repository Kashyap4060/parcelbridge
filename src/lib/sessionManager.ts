import { supabase } from './supabase';

export interface UserSession {
  id: string;
  firebaseUid: string;
  sessionToken: string;
  deviceInfo?: any;
  ipAddress?: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

export interface UserCredentials {
  id: string;
  firebaseUid: string;
  preferredRole?: 'sender' | 'carrier';
  lastLoginAt?: string;
  loginCount: number;
  autoLoginEnabled: boolean;
}

class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute

  private constructor() {
    this.startSessionCheck();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Generate a secure session token
  private generateSessionToken(): string {
    return crypto.randomUUID() + '_' + Date.now().toString(36);
  }

  // Get device info
  private getDeviceInfo() {
    if (typeof window === 'undefined') return null;
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Get IP address (this would typically be done server-side)
  private async getIpAddress(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return null;
    }
  }

  // Create a new session
  async createSession(firebaseUid: string): Promise<string> {
    try {
      const sessionToken = this.generateSessionToken();
      const deviceInfo = this.getDeviceInfo();
      const ipAddress = await this.getIpAddress();
      const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT).toISOString();

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          firebase_uid: firebaseUid,
          session_token: sessionToken,
          device_info: deviceInfo,
          ip_address: ipAddress,
          expires_at: expiresAt,
          last_activity: new Date().toISOString()
        });

      if (error) throw error;

      // Store session token in localStorage
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('session_expires', expiresAt);

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Update session activity
  async updateActivity(sessionToken?: string): Promise<void> {
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      if (!token) return;

      const { error } = await supabase
        .rpc('update_session_activity', { session_token_param: token });

      if (error) throw error;

      // Update local storage
      const newExpiry = new Date(Date.now() + this.SESSION_TIMEOUT).toISOString();
      localStorage.setItem('session_expires', newExpiry);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Check if session is valid
  async isSessionValid(sessionToken?: string): Promise<boolean> {
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      if (!token) return false;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;

      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const lastActivity = new Date(data.last_activity);
      const timeSinceActivity = now.getTime() - lastActivity.getTime();

      // Check if session has expired or been inactive too long
      if (expiresAt < now || timeSinceActivity > this.SESSION_TIMEOUT) {
        await this.destroySession(token);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  // Destroy a session
  async destroySession(sessionToken?: string): Promise<void> {
    try {
      const token = sessionToken || localStorage.getItem('session_token');
      if (!token) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', token);

      if (error) throw error;

      // Clear local storage
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_expires');
    } catch (error) {
      console.error('Error destroying session:', error);
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_expired_sessions');
      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }

  // Start automatic session checking
  private startSessionCheck(): void {
    if (typeof window === 'undefined') return;

    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.isSessionValid();
      if (!isValid) {
        this.handleSessionExpiry();
      } else {
        await this.updateActivity();
      }
    }, this.CHECK_INTERVAL);
  }

  // Handle session expiry
  private handleSessionExpiry(): void {
    this.destroySession();
    
    // Dispatch custom event for logout
    window.dispatchEvent(new CustomEvent('sessionExpired'));
    
    // Redirect to landing page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  // Stop session checking
  stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  // Save user credentials and preferences
  async saveUserCredentials(
    firebaseUid: string, 
    preferredRole?: 'sender' | 'carrier'
  ): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      const credentialsData = {
        firebase_uid: firebaseUid,
        preferred_role: preferredRole,
        last_login_at: new Date().toISOString(),
        login_count: (existing?.login_count || 0) + 1,
        last_ip_address: await this.getIpAddress(),
        last_device_info: this.getDeviceInfo(),
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('user_credentials')
          .update(credentialsData)
          .eq('firebase_uid', firebaseUid);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_credentials')
          .insert(credentialsData);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving user credentials:', error);
      throw error;
    }
  }

  // Get user credentials
  async getUserCredentials(firebaseUid: string): Promise<UserCredentials | null> {
    try {
      const { data, error } = await supabase
        .from('user_credentials')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user credentials:', error);
      return null;
    }
  }

  // Log role change
  async logRoleChange(
    firebaseUid: string, 
    previousRole: string | null, 
    newRole: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_role_history')
        .insert({
          firebase_uid: firebaseUid,
          previous_role: previousRole,
          new_role: newRole,
          reason: reason || 'User initiated role change'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging role change:', error);
    }
  }
}

export const sessionManager = SessionManager.getInstance();
