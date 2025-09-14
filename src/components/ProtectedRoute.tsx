/**
 * Protected Route Component
 * Ensures users are authenticated and have valid sessions before accessing protected content
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'sender' | 'carrier';
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  redirectTo = '/auth/login',
  loadingComponent 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useSimpleAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      try {
        // If no user, redirect to login
        if (!user || !isAuthenticated) {
          router.replace(redirectTo);
          return;
        }

        // Check role requirement
        if (requireRole && user.role !== requireRole) {
          // If user doesn't have required role, redirect to dashboard
          router.replace('/dashboard');
          return;
        }

        setIsValidating(false);

      } catch (error) {
        console.error('Error in protected route check:', error);
        router.replace(redirectTo);
      }
    };

    checkAccess();
  }, [user, loading, isAuthenticated, requireRole, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading || isValidating) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If we reach here, user is authenticated and authorized
  return <>{children}</>;
}

/**
 * Higher-order component version for easier use
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}




