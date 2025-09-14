'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from './useSimpleAuth';

/**
 * useRequireRole
 * Ensures the user is authenticated and has the required role.
 * Redirects to login if unauthenticated, or dashboard if role mismatch.
 * Returns loading flag to help caller avoid flicker.
 */
export function useRequireRole(requiredRole: 'sender' | 'carrier' | 'admin') {
  const router = useRouter();
  const { user, loading } = useSimpleAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [loading, user, requiredRole, router]);

  const isAuthorized = !!user && user.role === requiredRole;
  return { isLoading: loading, isAuthorized, user } as const;
}






