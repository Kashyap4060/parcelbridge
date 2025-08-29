'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from './useHybridAuth';

/**
 * useRequireRole
 * Ensures the user is authenticated and has the required role.
 * Redirects to login if unauthenticated, or dashboard if role mismatch.
 * Returns loading flag to help caller avoid flicker.
 */
export function useRequireRole(requiredRole: 'sender' | 'carrier') {
  const router = useRouter();
  const { user, isLoading } = useHybridAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [isLoading, user, requiredRole, router]);

  const isAuthorized = !!user && user.role === requiredRole;
  return { isLoading, isAuthorized, user } as const;
}


