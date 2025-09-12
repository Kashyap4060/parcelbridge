/**
 * Role Guard Component
 * Ensures users have selected a role before accessing protected features
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  requireRole?: boolean;
  allowedRoles?: ('sender' | 'carrier')[];
  redirectTo?: string;
}

export function RoleGuard({ 
  children, 
  requireRole = true,
  allowedRoles,
  redirectTo 
}: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useSimpleAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Pages that don't require role selection
  const excludedPages = [
    '/auth/login',
    '/auth/signup', 
    '/auth/select-role',
    '/dashboard/profile',
    '/dashboard/wallet',
    '/',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ];

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;
    
    // Don't redirect if not authenticated (ProtectedRoute will handle this)
    if (!isAuthenticated || !user) return;
    
    // Don't redirect on excluded pages
    if (excludedPages.some(page => pathname.startsWith(page))) return;
    
    // Check if role is required and user doesn't have one
    if (requireRole && !user.role) {
      const redirectUrl = redirectTo || `/auth/select-role?mandatory=true&redirect=${encodeURIComponent(pathname)}`;
      console.log('RoleGuard: User has no role, redirecting to:', redirectUrl);
      router.push(redirectUrl);
      return;
    }
    
    // Check if user has required role
    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
      console.log('RoleGuard: User role not allowed for this page');
      router.push('/dashboard?error=role-not-allowed');
      return;
    }
    
  }, [user, isAuthenticated, loading, pathname, requireRole, allowedRoles, redirectTo, router]);

  // Show loading while checking authentication/role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if user needs to select role
  if (isAuthenticated && user && requireRole && !user.role && !excludedPages.some(page => pathname.startsWith(page))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RoleGuard;



