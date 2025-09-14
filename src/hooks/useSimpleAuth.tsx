'use client';

/**
 * React Hook for Simple Supabase Authentication
 * Provides email/password authentication with profile management
 */

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { simpleAuth, UserProfile, SignupData, AuthResponse } from '@/lib/simpleAuth';
import { supabase } from '@/lib/supabase';

interface SimpleAuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  signUp: (signupData: SignupData) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error?: string }>;
  
  // Profile management
  updateUserRole: (role: 'sender' | 'carrier') => Promise<{ error?: string }>;
  
  // Utility methods
  refreshUser: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentUser = await simpleAuth.getCurrentUser();
        if (currentUser.user) {
          setUser(currentUser.user);
          setSession(currentUser.session || null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile from database (created by trigger)
          const result = await simpleAuth.getCurrentUser();
          if (result.user) {
            setUser(result.user);
            setSession(session);
          } else {
            // Profile might not be ready yet, wait and retry
            setTimeout(async () => {
              const retryResult = await simpleAuth.getCurrentUser();
              if (retryResult.user) {
                setUser(retryResult.user);
                setSession(session);
              }
            }, 1000);
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          // Clear user data when signed out
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (signupData: SignupData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const result = await simpleAuth.signUp(signupData);
      if (result.user) {
        setUser(result.user);
        setSession(result.session || null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const result = await simpleAuth.signIn(email, password);
      if (result.user) {
        setUser(result.user);
        setSession(result.session || null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await simpleAuth.signOut();
      if (!result.error) {
        setUser(null);
        setSession(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (role: 'sender' | 'carrier') => {
    if (!user) {
      return { error: 'No user logged in' };
    }
    const result = await simpleAuth.updateUserRole(user.id, role);
    if (!result.error && user) {
      setUser({ ...user, role });
    }
    return result;
  };

  const refreshUser = async () => {
    const currentUser = await simpleAuth.getCurrentUser();
    if (currentUser.user) {
      setUser(currentUser.user);
      setSession(currentUser.session || null);
    }
  };

  const isAuthenticated = !!user && !!session;

  const value: SimpleAuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateUserRole,
    refreshUser
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth(): SimpleAuthContextType {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export default useSimpleAuth;




