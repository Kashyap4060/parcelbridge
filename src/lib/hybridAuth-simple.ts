/**
 * Simplified Hybrid Authentication Service
 * Firebase Auth + Supabase Database (without complex session management)
 */

import { auth } from './firebase';
import { supabase } from './supabase';
import { 
  User as FirebaseUser,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

export interface HybridUser {
  // Firebase Auth data
  firebaseUid: string;
  phoneNumber?: string;
  email?: string;
  isEmailVerified: boolean;
  
  // Supabase profile data
  supabaseId?: string;
  role?: 'sender' | 'carrier';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  isPhoneVerified: boolean;
  isAadhaarVerified: boolean;
  profileComplete: boolean;
  authMethod: 'phone' | 'email' | 'google';
  createdAt: string;
  updatedAt: string;
}

class HybridAuthService {
  private currentUser: HybridUser | null = null;

  /**
   * Initialize phone authentication with reCAPTCHA
   */
  async initializePhoneAuth(containerId: string = 'recaptcha-container'): Promise<RecaptchaVerifier> {
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'normal',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    return recaptchaVerifier;
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and sign in
   */
  async verifyOTP(confirmationResult: ConfirmationResult, otp: string, role?: 'sender' | 'carrier'): Promise<HybridUser> {
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      // Sync user to Supabase
      const hybridUser = await this.syncFirebaseUserToSupabase(firebaseUser, 'phone');
      
      // Update role if provided
      if (role) {
        await this.updateUserRole(role);
        hybridUser.role = role;
      }
      
      this.currentUser = hybridUser;
      return hybridUser;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, firstName: string, lastName: string): Promise<HybridUser> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Sync user to Supabase with additional profile info
      const hybridUser = await this.syncFirebaseUserToSupabase(firebaseUser, 'email', {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`
      });

      this.currentUser = hybridUser;
      return hybridUser;
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<HybridUser> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Sync user to Supabase
      const hybridUser = await this.syncFirebaseUserToSupabase(firebaseUser, 'email');
      this.currentUser = hybridUser;
      return hybridUser;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<HybridUser> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Sync user to Supabase
      const hybridUser = await this.syncFirebaseUserToSupabase(firebaseUser, 'google');
      this.currentUser = hybridUser;
      return hybridUser;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
      
      // Redirect to landing page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(role: 'sender' | 'carrier'): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', this.currentUser.firebaseUid);

      if (error) throw error;

      // Update current user
      this.currentUser.role = role;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<HybridUser>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('firebase_uid', this.currentUser.firebaseUid);

      if (error) throw error;

      // Update current user
      this.currentUser = { ...this.currentUser, ...updates };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: HybridUser | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user from Supabase
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('firebase_uid', firebaseUser.uid)
            .single();

          if (error || !data) {
            // Create user in Supabase if doesn't exist
            const hybridUser = await this.syncFirebaseUserToSupabase(firebaseUser, 'email');
            this.currentUser = hybridUser;
            callback(hybridUser);
          } else {
            // Map Supabase data to HybridUser
            const hybridUser: HybridUser = {
              firebaseUid: data.firebase_uid,
              supabaseId: data.id,
              email: firebaseUser.email || data.email,
              phoneNumber: firebaseUser.phoneNumber || data.phone_number,
              isEmailVerified: firebaseUser.emailVerified,
              isPhoneVerified: data.is_phone_verified || false,
              isAadhaarVerified: data.is_aadhaar_verified || false,
              role: data.role,
              firstName: data.first_name,
              lastName: data.last_name,
              fullName: data.full_name || firebaseUser.displayName,
              profileComplete: data.profile_complete || false,
              authMethod: data.auth_method || 'email',
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };

            this.currentUser = hybridUser;
            callback(hybridUser);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  /**
   * Sync Firebase user to Supabase
   */
  private async syncFirebaseUserToSupabase(
    firebaseUser: FirebaseUser, 
    authMethod: 'phone' | 'email' | 'google',
    additionalData?: Partial<HybridUser>
  ): Promise<HybridUser> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (existingUser) {
        // Update existing user
        const updateData = {
          email: firebaseUser.email,
          phone_number: firebaseUser.phoneNumber,
          full_name: firebaseUser.displayName,
          auth_method: authMethod,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('firebase_uid', firebaseUser.uid)
          .select()
          .single();

        if (error) throw error;

        return {
          firebaseUid: firebaseUser.uid,
          supabaseId: data.id,
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          isEmailVerified: firebaseUser.emailVerified,
          isPhoneVerified: data.is_phone_verified || false,
          isAadhaarVerified: data.is_aadhaar_verified || false,
          role: data.role,
          firstName: data.first_name || additionalData?.firstName,
          lastName: data.last_name || additionalData?.lastName,
          fullName: data.full_name || firebaseUser.displayName || '',
          profileComplete: data.profile_complete || false,
          authMethod: authMethod,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      } else {
        // Create new user
        const newUserData = {
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          phone_number: firebaseUser.phoneNumber,
          full_name: firebaseUser.displayName || `${additionalData?.firstName || ''} ${additionalData?.lastName || ''}`.trim(),
          first_name: additionalData?.firstName,
          last_name: additionalData?.lastName,
          auth_method: authMethod,
          is_phone_verified: authMethod === 'phone',
          is_aadhaar_verified: false,
          profile_complete: false
        };

        const { data, error } = await supabase
          .from('user_profiles')
          .insert(newUserData)
          .select()
          .single();

        if (error) throw error;

        return {
          firebaseUid: firebaseUser.uid,
          supabaseId: data.id,
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          isEmailVerified: firebaseUser.emailVerified,
          isPhoneVerified: authMethod === 'phone',
          isAadhaarVerified: false,
          role: data.role,
          firstName: additionalData?.firstName,
          lastName: additionalData?.lastName,
          fullName: firebaseUser.displayName || `${additionalData?.firstName || ''} ${additionalData?.lastName || ''}`.trim(),
          profileComplete: false,
          authMethod: authMethod,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): HybridUser | null {
    return this.currentUser;
  }

  /**
   * Switch user role
   */
  async switchRole(newRole: 'sender' | 'carrier'): Promise<HybridUser> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      await this.updateUserRole(newRole);
      this.currentUser.role = newRole;
      return this.currentUser;
    } catch (error) {
      console.error('Error switching role:', error);
      throw error;
    }
  }

  /**
   * Basic session validation (simplified)
   */
  async validateSession(): Promise<boolean> {
    try {
      return !!this.currentUser && !!auth.currentUser;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Legacy method for backward compatibility - simplified
   */
  async validateAndRedirect(): Promise<void> {
    const isValid = await this.validateSession();
    if (!isValid) {
      throw new Error('Session expired');
    }
  }
}

// Export singleton instance
export const hybridAuth = new HybridAuthService();
export default hybridAuth;
