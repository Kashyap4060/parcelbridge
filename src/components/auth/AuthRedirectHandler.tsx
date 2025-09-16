/**
 * Auth Redirect Client Component
 * Handles direct URL access and auto-stores intended URLs
 * Should be mounted in root layout to catch all navigation
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import AuthRedirectManager from '@/lib/authRedirect';

export function AuthRedirectHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useSimpleAuth();

  useEffect(() => {
    // Don't process during loading
    if (loading) return;

    // Get full current URL
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    console.log(`[AuthRedirectHandler] Current URL: ${currentUrl}, Authenticated: ${isAuthenticated}`);

    // If user is not authenticated and accessing a protected page
    if (!isAuthenticated && AuthRedirectManager.shouldStoreCurrentUrl()) {
      console.log(`[AuthRedirectHandler] Storing URL for unauthenticated user: ${currentUrl}`);
      AuthRedirectManager.storeIntendedUrl(currentUrl, 'direct_link');
    }
    
    // If user is authenticated and there's a stored URL, we can optionally clear it
    // (though it will be cleared when they log in again)
    if (isAuthenticated && AuthRedirectManager.shouldStoreCurrentUrl()) {
      const storedUrl = AuthRedirectManager.getIntendedUrl();
      if (storedUrl && storedUrl !== currentUrl) {
        console.log(`[AuthRedirectHandler] User authenticated, had stored URL: ${storedUrl}, current: ${currentUrl}`);
        // Could optionally clear here, but we'll let natural flow handle it
      }
    }
  }, [pathname, searchParams, isAuthenticated, loading]);

  // This component doesn't render anything
  return null;
}

export default AuthRedirectHandler;