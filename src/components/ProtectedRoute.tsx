/**
 * Protected Route Component
 * Ensures users are authenticated and have valid sessions before accessing protected content
 * Now includes auth redirect functionality to return users to intended pages after login
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import AuthRedirectManager from '@/lib/authRedirect';
import RoleMismatchHandler from '@/components/auth/RoleMismatchHandler';

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
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useSimpleAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [showRoleMismatch, setShowRoleMismatch] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      try {
        // If no user, store current URL and redirect to login
        if (!user || !isAuthenticated) {
          // Store the current URL as the intended destination
          const currentUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '');
          AuthRedirectManager.storeIntendedUrl(currentUrl, 'protected_route');
          
          // Create login URL with redirect parameter as fallback
          const loginUrl = AuthRedirectManager.createLoginUrl(currentUrl);
          
          console.log(`[ProtectedRoute] Storing intended URL: ${currentUrl}`);
          console.log(`[ProtectedRoute] Redirecting to: ${loginUrl}`);
          
          router.replace(loginUrl);
          return;
        }

        // Check role requirement
        if (requireRole) {
          const userRole = user.role;
          
          // Since roles are mandatory during signup, this should not happen
          // But we'll keep a safety check and log it as an unexpected error
          if (!userRole) {
            console.error('ProtectedRoute: User has no role - this should not happen with mandatory role selection');
            router.replace('/auth/select-role');
            return;
          }
          
          // Check if user role matches required role
          if (userRole !== requireRole) {
            console.log('ProtectedRoute: Role mismatch detected', { userRole, requiredRole: requireRole });
            setShowRoleMismatch(true);
            setIsValidating(false);
            return;
          }
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

  // Show role mismatch handler if role doesn't match
  // Note: user.role should always exist due to mandatory role selection during signup
  if (showRoleMismatch && user && user.role) {
    return (
      <RoleMismatchHandler
        currentRole={user.role}
        requiredRole={requireRole as 'sender' | 'carrier'}
        requestedUrl={pathname}
      />
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




