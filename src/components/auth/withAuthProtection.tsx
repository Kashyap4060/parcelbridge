/**
 * Enhanced Protected Route System
 * A more powerful and flexible authentication wrapper
 * Eliminates the need for manual auth checks in individual components
 */

'use client';

import { ComponentType } from 'react';
import { AuthErrorBoundary } from './AuthErrorBoundary';

interface ProtectedPageOptions {
  requireAuth?: boolean;
  requireRole?: 'sender' | 'carrier' | 'admin';
  redirectTo?: string;
  fallbackComponent?: ComponentType;
}

/**
 * Higher-order component that wraps any page with authentication logic
 * Usage: export default withAuthProtection(YourPageComponent, { requireRole: 'sender' })
 */
export function withAuthProtection<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: ProtectedPageOptions = {}
) {
  const {
    requireAuth = true,
    requireRole,
    redirectTo = '/auth/login',
    fallbackComponent
  } = options;

  const ProtectedComponent = (props: P) => {
    return (
      <AuthErrorBoundary
        requireAuth={requireAuth}
        requireRole={requireRole}
        redirectTo={redirectTo}
        fallbackComponent={fallbackComponent}
      >
        <WrappedComponent {...props} />
      </AuthErrorBoundary>
    );
  };

  // Preserve component name for debugging
  ProtectedComponent.displayName = `withAuthProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}

/**
 * Decorator-style auth protection for classes (if using class components)
 */
export function AuthProtected(options: ProtectedPageOptions = {}) {
  return function <T extends ComponentType<any>>(target: T): T {
    return withAuthProtection(target, options) as any;
  };
}

/**
 * Pre-configured HOCs for common use cases
 */
export const withSenderAuth = <P extends object>(component: ComponentType<P>) =>
  withAuthProtection(component, { requireRole: 'sender' });

export const withCarrierAuth = <P extends object>(component: ComponentType<P>) =>
  withAuthProtection(component, { requireRole: 'carrier' });

export const withAdminAuth = <P extends object>(component: ComponentType<P>) =>
  withAuthProtection(component, { requireRole: 'admin' });

export const withBasicAuth = <P extends object>(component: ComponentType<P>) =>
  withAuthProtection(component, { requireAuth: true });

/**
 * Hook for manual auth checking (for complex logic)
 */
export function useAuthGuard(options: ProtectedPageOptions) {
  // Implementation would go here for cases where HOC isn't suitable
  // This would return auth state and helper functions
}