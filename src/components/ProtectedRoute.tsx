/**
 * Protected Route Component
 * Ensures users are authenticated and have valid sessions before accessing protected content
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'sender' | 'carrier';
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requireRole,
  redirectTo = '/',
  loadingComponent 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, sessionValid, validateAndRedirect } = useHybridAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      try {
        // If no user, redirect to login
        if (!user || !isAuthenticated) {
          router.replace(redirectTo);
          return;
        }

        // Validate session
        if (!sessionValid) {
          try {
            await validateAndRedirect();
            setIsValidating(false);
          } catch (error) {
            console.warn('Session validation failed, redirecting to login');
            router.replace(redirectTo);
            return;
          }
        } else {
          setIsValidating(false);
        }

        // Check role requirement
        if (requireRole && user.role !== requireRole) {
          // If user doesn't have required role, redirect to dashboard
          router.replace('/dashboard');
          return;
        }

      } catch (error) {
        console.error('Error in protected route check:', error);
        router.replace(redirectTo);
      }
    };

    checkAccess();
  }, [user, isLoading, isAuthenticated, sessionValid, requireRole, router, redirectTo, validateAndRedirect]);

  // Show loading state while checking authentication
  if (isLoading || isValidating) {
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
