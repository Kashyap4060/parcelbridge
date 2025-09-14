/**
 * User Profile Service
 * Handles profile operations after authentication is established
 */

import { supabase } from '@/lib/supabase';
import { UserProfile } from './simpleAuth';

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'sender' | 'carrier';
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export class ProfileService {
  /**
   * Get current user's profile from database
   * This ensures we get the latest data including trigger-created profiles
   */
  async getCurrentProfile(): Promise<{ profile?: UserProfile; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { error: 'No authenticated user found' };
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { error: 'Failed to fetch user profile' };
      }

      const profile: UserProfile = {
        id: profileData.id,
        email: profileData.email,
        phone: profileData.phone_number,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        isEmailVerified: profileData.is_email_verified,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at
      };

      return { profile };
    } catch (error) {
      console.error('Get profile error:', error);
      return { error: 'An unexpected error occurred while fetching profile' };
    }
  }

  /**
   * Update user profile
   * Only allows updating specific fields, not core auth data
   */
  async updateProfile(updates: ProfileUpdateData): Promise<{ error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { error: 'No authenticated user found' };
      }

      // Map frontend field names to database field names
      const dbUpdates: any = {};
      
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
      if (updates.phone !== undefined) dbUpdates.phone_number = updates.phone;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.state !== undefined) dbUpdates.state = updates.state;
      if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode;

      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        return { error: 'Failed to update user profile' };
      }

      return {};
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred while updating profile' };
    }
  }

  /**
   * Check if user profile exists
   * Used to verify trigger-created profiles
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Profile exists check error:', error);
      return false;
    }
  }

  /**
   * Wait for profile creation by trigger
   * Used after signup to ensure profile is available
   */
  async waitForProfile(userId: string, maxAttempts: number = 10): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const exists = await this.profileExists(userId);
      if (exists) {
        return true;
      }
      
      // Wait before next attempt (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 200));
    }
    
    return false;
  }

  /**
   * Complete profile setup after initial signup
   * Used when user needs to add additional information
   */
  async completeProfileSetup(userId: string, additionalData: ProfileUpdateData): Promise<{ error?: string }> {
    try {
      // Wait for trigger-created profile to be available
      const profileReady = await this.waitForProfile(userId, 5);
      
      if (!profileReady) {
        return { error: 'Profile not ready. Please try again.' };
      }

      // Update profile with additional data
      const updateResult = await this.updateProfile(additionalData);
      if (updateResult.error) {
        return updateResult;
      }

      // Mark profile as complete
      await this.updateProfile({ ...additionalData });

      return {};
    } catch (error) {
      console.error('Complete profile setup error:', error);
      return { error: 'An unexpected error occurred during profile setup' };
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();




