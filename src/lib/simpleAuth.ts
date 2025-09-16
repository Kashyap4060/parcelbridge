/**
 * Simple Supabase Authentication Service
 * Handles signup and login with basic profile management
 */

import { supabase } from '@/lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface UserProfile {
  id: string; // Supabase auth.uid()
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role?: 'sender' | 'carrier';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user?: UserProfile;
  error?: string;
  session?: Session;
}

export class SimpleAuthService {
  /**
   * Sign up a new user with email and password
   */
  /**
   * Sign up a new user with email and password
   * Profile creation is handled automatically by database trigger
   */
  async signUp(signupData: SignupData): Promise<AuthResponse> {
    try {
      // Create the user in Supabase Auth with metadata for the trigger
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            phone: signupData.phone
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError.message };
      }

      if (!data.user) {
        return { error: 'Failed to create user account' };
      }

      // Profile is created automatically by database trigger
      // We don't need to manually create it anymore
      
      // Return user data based on the signup information
      // The actual profile will be available after email confirmation
      const userProfile: UserProfile = {
        id: data.user.id,
        email: signupData.email,
        phone: signupData.phone,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        isEmailVerified: data.user.email_confirmed_at ? true : false,
        createdAt: data.user.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return { 
        user: userProfile, 
        session: data.session || undefined,
        error: undefined 
      };

    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'An unexpected error occurred during signup' };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth signin error:', authError);
        return { error: authError.message };
      }

      if (!data.user || !data.session) {
        return { error: 'Failed to sign in' };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { error: 'Failed to fetch user profile' };
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        phone: profileData.phone_number,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        isEmailVerified: profileData.is_email_verified,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at || profileData.created_at
      };

      return { 
        user: userProfile, 
        session: data.session || undefined,
        error: undefined 
      };

    } catch (error) {
      console.error('Signin error:', error);
      return { error: 'An unexpected error occurred during signin' };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Signout error:', error);
        return { error: error.message };
      }
      return {};
    } catch (error) {
      console.error('Signout error:', error);
      return { error: 'An unexpected error occurred during signout' };
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        return { error: sessionError.message };
      }

      if (!session?.user) {
        return { error: 'No authenticated user found' };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { error: 'Failed to fetch user profile' };
      }

      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        phone: profileData.phone_number,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        isEmailVerified: profileData.is_email_verified,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at || profileData.created_at
      };

      return { 
        user: userProfile, 
        session: session || undefined,
        error: undefined 
      };

    } catch (error) {
      console.error('Get current user error:', error);
      return { error: 'An unexpected error occurred while fetching user' };
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'sender' | 'carrier'): Promise<{ error?: string }> {
    try {
      // First, get the current role for audit logging
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current role:', fetchError);
        return { error: 'Failed to fetch current role' };
      }

      const previousRole = currentProfile?.role || null;

      // Update the user's role
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return { error: 'Failed to update user role' };
      }

      // Log the role change for audit purposes
      try {
        const { error: logError } = await supabase
          .from('user_role_history')
          .insert({
            firebase_uid: userId,
            previous_role: previousRole,
            new_role: role,
            reason: 'User initiated role change',
            created_at: new Date().toISOString()
          });

        if (logError) {
          console.warn('Failed to log role change:', logError);
          // Don't fail the main operation if logging fails
        }
      } catch (logError) {
        console.warn('Error logging role change:', logError);
      }

      return {};
    } catch (error) {
      console.error('Update role error:', error);
      return { error: 'An unexpected error occurred while updating role' };
    }
  }

  /**
   * Check if email is already registered
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (error) {
        console.error('Error checking email:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Check email error:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const simpleAuth = new SimpleAuthService();




