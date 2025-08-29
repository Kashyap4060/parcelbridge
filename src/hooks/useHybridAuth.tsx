/**
 * Hybrid Authentication Hook
 * Firebase Auth + Supabase Database with Session Management
 */

'use client';

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { hybridAuth, HybridUser } from '../lib/hybridAuth-simple';

interface AuthContextType {
  user: HybridUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Authentication methods
  sendOTP: (phoneNumber: string) => Promise<any>;
  verifyOTP: (confirmationResult: any, otp: string, role?: 'sender' | 'carrier') => Promise<void>;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  verifyPhoneForExistingUser: (phoneNumber: string) => Promise<any>;
  completePhoneVerification: (confirmationResult: any, otp: string) => Promise<void>;
  updateRole: (role: 'sender' | 'carrier') => Promise<void>;
  updateProfile: (updates: Partial<HybridUser>) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Session management methods
  switchRole: (newRole: 'sender' | 'carrier') => Promise<void>;
  validateAndRedirect: () => Promise<void>;
  
  // Utility methods
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  hasSelectedRole: boolean;
  profileComplete: boolean;
  sessionValid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HybridUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionValid, setSessionValid] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = hybridAuth.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      // Temporarily disable session validation to prevent redirect loops
      // Only validate session without automatic redirects
      // if (authUser) {
      //   try {
      //     const isValid = await hybridAuth.validateSession();
      //     setSessionValid(isValid);
      //   } catch (error) {
      //     console.warn('Session validation failed:', error);
      //     setSessionValid(false);
      //   }
      // } else {
      //   setSessionValid(true); // No user means no session to validate
      // }
      
      setSessionValid(true); // Temporarily always valid
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Set up session timeout monitoring (temporarily disabled for debugging)
  useEffect(() => {
    if (!user || !sessionValid) return;

    // Temporarily disable to prevent refresh loops
    // const interval = setInterval(async () => {
    //   try {
    //     const isValid = await hybridAuth.validateSession();
    //     setSessionValid(isValid);
    //     if (!isValid) {
    //       console.warn('Session expired, signing out');
    //       await signOut();
    //     }
    //   } catch (error) {
    //     console.warn('Session expired, signing out');
    //     setSessionValid(false);
    //     await signOut();
    //   }
    // }, 60000); // Check every minute

    // return () => clearInterval(interval);
  }, [user, sessionValid]);

  // Send OTP
  const sendOTP = useCallback(async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize reCAPTCHA
      const recaptchaVerifier = await hybridAuth.initializePhoneAuth();
      
      // Send OTP
      const confirmationResult = await hybridAuth.sendOTP(phoneNumber, recaptchaVerifier);
      
      return confirmationResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify OTP
  const verifyOTP = useCallback(async (confirmationResult: any, otp: string, role?: 'sender' | 'carrier') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const hybridUser = await hybridAuth.verifyOTP(confirmationResult, otp, role);
      setUser(hybridUser);
      setSessionValid(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify OTP';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUpWithEmail = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const hybridUser = await hybridAuth.signUpWithEmail(email, password, firstName, lastName);
      setUser(hybridUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign up with email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const hybridUser = await hybridAuth.signInWithEmail(email, password);
      setUser(hybridUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const hybridUser = await hybridAuth.signInWithGoogle();
      setUser(hybridUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in with Google';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify phone for existing user
  const verifyPhoneForExistingUser = useCallback(async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const recaptchaVerifier = await hybridAuth.initializePhoneAuth('recaptcha-container-phone');
      const result = await hybridAuth.sendOTP(phoneNumber, recaptchaVerifier);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send phone verification';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete phone verification
  const completePhoneVerification = useCallback(async (confirmationResult: any, otp: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await hybridAuth.verifyOTP(confirmationResult, otp);
      setUser(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to verify phone';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update user role
  const updateRole = useCallback(async (role: 'sender' | 'carrier') => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hybridAuth.updateUserRole(role);
      
      // Update local user state
      if (user) {
        setUser({ ...user, role });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<HybridUser>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hybridAuth.updateUserProfile(updates);
      
      // Update local user state
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hybridAuth.signOut();
      setUser(null);
      setSessionValid(true); // Reset session state
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch role (with session management)
  const switchRole = useCallback(async (newRole: 'sender' | 'carrier') => {
    try {
      setIsLoading(true);
      setError(null);
      
      await hybridAuth.switchRole(newRole);
      
      // Update local user state
      if (user) {
        setUser({ ...user, role: newRole });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to switch role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Validate session and redirect if needed
  const validateAndRedirect = useCallback(async () => {
    try {
      const isValid = await hybridAuth.validateSession();
      setSessionValid(isValid);
      if (!isValid) {
        throw new Error('Session expired');
      }
    } catch (err: any) {
      setSessionValid(false);
      setError('Session expired');
      throw err;
    }
  }, []);

  // Computed properties
  const isAuthenticated = !!user && sessionValid;
  const isPhoneVerified = user?.isPhoneVerified || false;
  const isEmailVerified = user?.isEmailVerified || false;
  const hasSelectedRole = !!user?.role;
  const profileComplete = user?.profileComplete || false;

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    sendOTP,
    verifyOTP,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    verifyPhoneForExistingUser,
    completePhoneVerification,
    updateRole,
    updateProfile,
    signOut,
    switchRole,
    validateAndRedirect,
    isAuthenticated,
    isPhoneVerified,
    isEmailVerified,
    hasSelectedRole,
    profileComplete,
    sessionValid
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useHybridAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // During SSR or if provider is not available, return safe defaults
    if (typeof window === 'undefined') {
      // Server-side rendering
      return {
        user: null,
        isLoading: true,
        error: null,
        sendOTP: async () => { throw new Error('Auth not available during SSR'); },
        verifyOTP: async () => { throw new Error('Auth not available during SSR'); },
        signUpWithEmail: async () => { throw new Error('Auth not available during SSR'); },
        signInWithEmail: async () => { throw new Error('Auth not available during SSR'); },
        signInWithGoogle: async () => { throw new Error('Auth not available during SSR'); },
        verifyPhoneForExistingUser: async () => { throw new Error('Auth not available during SSR'); },
        completePhoneVerification: async () => { throw new Error('Auth not available during SSR'); },
        updateRole: async () => { throw new Error('Auth not available during SSR'); },
        updateProfile: async () => { throw new Error('Auth not available during SSR'); },
        signOut: async () => { throw new Error('Auth not available during SSR'); },
        switchRole: async () => { throw new Error('Auth not available during SSR'); },
        validateAndRedirect: async () => { throw new Error('Auth not available during SSR'); },
        isAuthenticated: false,
        isPhoneVerified: false,
        isEmailVerified: false,
        hasSelectedRole: false,
        profileComplete: false,
        sessionValid: true
      };
    }
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
}

// Backward compatibility - alias to existing useAuth
export const useAuth = useHybridAuth;
