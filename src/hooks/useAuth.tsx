/**
 * Backward compatible useAuth hook
 * Maps old Supabase Auth interface to new Hybrid Auth
 */

'use client';

import { useHybridAuth } from './useHybridAuth';

// Map hybrid auth to old interface for backward compatibility
export function useAuth() {
  // Handle SSR by returning safe defaults when context is unavailable
  try {
    const {
      user: hybridUser,
      isLoading,
      error,
      signOut: hybridSignOut,
      updateProfile: hybridUpdateProfile,
      updateRole: hybridUpdateRole,
      isAuthenticated,
      isPhoneVerified,
      hasSelectedRole
    } = useHybridAuth();

    // Map hybrid user to old user format
    const user = hybridUser ? {
      id: hybridUser.supabaseId || hybridUser.firebaseUid,
      email: hybridUser.email || '',
      phone: hybridUser.phoneNumber || '',
      user_metadata: {
        role: hybridUser.role,
        display_name: hybridUser.fullName || hybridUser.firstName,
        phone: hybridUser.phoneNumber,
        is_phone_verified: hybridUser.isPhoneVerified,
        is_aadhaar_verified: hybridUser.isAadhaarVerified,
        wallet_balance: 0, // TODO: Fetch from wallet service
        locked_amount: 0   // TODO: Fetch from wallet service
      },
      // Additional Supabase user properties for compatibility
      app_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: hybridUser.createdAt,
      created_at: hybridUser.createdAt,
      email_confirmed_at: hybridUser.isEmailVerified ? hybridUser.createdAt : undefined,
      identities: [],
      last_sign_in_at: hybridUser.updatedAt,
      phone_confirmed_at: hybridUser.isPhoneVerified ? hybridUser.createdAt : undefined,
      role: 'authenticated',
      updated_at: hybridUser.updatedAt
    } : null;

  // Session object for compatibility
  const session = hybridUser ? {
    access_token: 'hybrid_token',
    expires_at: Date.now() + 3600000, // 1 hour from now
    expires_in: 3600,
    refresh_token: 'hybrid_refresh',
    token_type: 'bearer',
    user: user!
  } : null;

  return {
    user,
    session,
    loading: isLoading,
    
    // Auth methods (placeholder implementations for now)
    signUp: async (email: string, password: string, metadata?: any) => {
      throw new Error('Use phone authentication instead');
    },
    
    signIn: async (email: string, password: string) => {
      throw new Error('Use phone authentication instead');
    },
    
    signInWithPhone: async (phone: string) => {
      throw new Error('Use sendOTP method from useHybridAuth');
    },
    
    verifyOtp: async (phone: string, otp: string) => {
      throw new Error('Use verifyOTP method from useHybridAuth');
    },
    
    signOut: hybridSignOut,
    
    updateProfile: async (updates: any) => {
      return await hybridUpdateProfile(updates);
    }
  };
  
  } catch (error) {
    // Handle SSR or context unavailable scenarios
    console.warn('Auth context not available, likely during SSR:', error);
    
    return {
      user: null,
      session: null,
      loading: true,
      
      // Auth methods (placeholder implementations)
      signUp: async (email: string, password: string, metadata?: any) => {
        throw new Error('Auth not available during SSR');
      },
      
      signIn: async (email: string, password: string) => {
        throw new Error('Auth not available during SSR');
      },
      
      signInWithPhone: async (phone: string) => {
        throw new Error('Auth not available during SSR');
      },
      
      verifyOtp: async (phone: string, otp: string) => {
        throw new Error('Auth not available during SSR');
      },
      
      signOut: async () => {
        throw new Error('Auth not available during SSR');
      },
      
      updateProfile: async (updates: any) => {
        throw new Error('Auth not available during SSR');
      }
    };
  }
}
