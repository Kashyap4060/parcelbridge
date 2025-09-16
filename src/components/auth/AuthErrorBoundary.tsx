/**
 * Centralized Auth Error Boundary
 * Handles all authentication-related errors and redirects
 * Prevents hardcoded access denied messages throughout the app
 * Now includes redirect functionality for post-login navigation
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import AuthRedirectManager from '@/lib/authRedirect';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: 'sender' | 'carrier' | 'admin';
  fallbackComponent?: React.ComponentType;
  redirectTo?: string;
}

interface AuthErrorProps {
  type: 'not-authenticated' | 'insufficient-role' | 'loading';
  expectedRole?: string;
  currentRole?: string;
}

const AuthError: React.FC<AuthErrorProps> = ({ type, expectedRole, currentRole }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    // Store current URL before redirecting to login
    const currentUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '');
    const loginUrl = AuthRedirectManager.createLoginUrl(currentUrl);
    router.push(loginUrl);
  };

  const handleRoleSelection = () => {
    router.push('/auth/select-role');
  };

  if (type === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (type === 'not-authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">
              You need to be logged in to access this page. Please sign in to continue.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (type === 'insufficient-role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
            <p className="text-gray-600 mb-2">
              This page requires <span className="font-semibold">{expectedRole}</span> role access.
            </p>
            {currentRole && (
              <p className="text-sm text-gray-500 mb-4">
                Your current role: <span className="font-medium">{currentRole}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <button
              onClick={handleRoleSelection}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Change Role
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export const AuthErrorBoundary: React.FC<AuthErrorBoundaryProps> = ({
  children,
  requireAuth = true,
  requireRole,
  fallbackComponent: FallbackComponent,
  redirectTo
}) => {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Auto-redirect for unauthenticated users if redirectTo is specified
    if (requireAuth && !isAuthenticated && redirectTo) {
      // Store current URL before redirecting
      const currentUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '');
      AuthRedirectManager.storeIntendedUrl(currentUrl, 'protected_route');
      
      router.replace(redirectTo);
      return;
    }

    // Auto-redirect for role mismatches if redirectTo is specified
    if (requireRole && user && user.role !== requireRole && redirectTo) {
      router.replace(redirectTo);
      return;
    }
  }, [user, isAuthenticated, loading, requireAuth, requireRole, redirectTo, router, pathname]);

  // Show loading state
  if (loading) {
    if (FallbackComponent) return <FallbackComponent />;
    return <AuthError type="loading" />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    if (redirectTo) return null; // Will redirect via useEffect
    if (FallbackComponent) return <FallbackComponent />;
    return <AuthError type="not-authenticated" />;
  }

  // Check role requirement
  if (requireRole && (!user || user.role !== requireRole)) {
    if (redirectTo) return null; // Will redirect via useEffect
    if (FallbackComponent) return <FallbackComponent />;
    return (
      <AuthError 
        type="insufficient-role" 
        expectedRole={requireRole}
        currentRole={user?.role}
      />
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default AuthErrorBoundary;