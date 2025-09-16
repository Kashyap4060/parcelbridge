/**
 * Auth Redirect Utility
 * Manages storing and retrieving intended URLs for post-login redirects
 * Supports both URL query parameters and localStorage for persistence
 */

const REDIRECT_KEY = 'auth_intended_url';
const REDIRECT_PARAM = 'redirect';

export interface RedirectInfo {
  url: string;
  timestamp: number;
  source: 'protected_route' | 'direct_link' | 'manual';
}

export class AuthRedirectManager {
  /**
   * Store the intended URL for post-login redirect
   */
  static storeIntendedUrl(url: string, source: RedirectInfo['source'] = 'protected_route'): void {
    if (typeof window === 'undefined') return;

    const redirectInfo: RedirectInfo = {
      url,
      timestamp: Date.now(),
      source
    };

    try {
      localStorage.setItem(REDIRECT_KEY, JSON.stringify(redirectInfo));
      console.log(`[AuthRedirect] Stored intended URL: ${url} (source: ${source})`);
    } catch (error) {
      console.warn('[AuthRedirect] Failed to store intended URL:', error);
    }
  }

  /**
   * Get the stored intended URL
   */
  static getIntendedUrl(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(REDIRECT_KEY);
      if (!stored) return null;

      const redirectInfo: RedirectInfo = JSON.parse(stored);
      
      // Check if stored URL is still valid (not older than 1 hour)
      const maxAge = 60 * 60 * 1000; // 1 hour
      const isExpired = Date.now() - redirectInfo.timestamp > maxAge;
      
      if (isExpired) {
        this.clearIntendedUrl();
        console.log('[AuthRedirect] Stored URL expired, cleared');
        return null;
      }

      console.log(`[AuthRedirect] Retrieved intended URL: ${redirectInfo.url}`);
      return redirectInfo.url;
    } catch (error) {
      console.warn('[AuthRedirect] Failed to retrieve intended URL:', error);
      this.clearIntendedUrl();
      return null;
    }
  }

  /**
   * Clear the stored intended URL
   */
  static clearIntendedUrl(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(REDIRECT_KEY);
      console.log('[AuthRedirect] Cleared intended URL');
    } catch (error) {
      console.warn('[AuthRedirect] Failed to clear intended URL:', error);
    }
  }

  /**
   * Get redirect URL from query parameters
   */
  static getRedirectFromQuery(): string | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get(REDIRECT_PARAM);
    
    if (redirectUrl) {
      // Validate that it's a safe internal URL
      if (this.isSafeRedirectUrl(redirectUrl)) {
        console.log(`[AuthRedirect] Found redirect in query: ${redirectUrl}`);
        return decodeURIComponent(redirectUrl);
      } else {
        console.warn(`[AuthRedirect] Unsafe redirect URL blocked: ${redirectUrl}`);
      }
    }
    
    return null;
  }

  /**
   * Validate that redirect URL is safe (internal to app)
   */
  static isSafeRedirectUrl(url: string): boolean {
    try {
      // Allow relative URLs starting with /
      if (url.startsWith('/')) {
        // Block external protocols
        if (url.startsWith('//')) return false;
        return true;
      }

      // For absolute URLs, check if they're from the same origin
      const redirectUrl = new URL(url);
      const currentOrigin = window.location.origin;
      
      return redirectUrl.origin === currentOrigin;
    } catch {
      return false;
    }
  }

  /**
   * Handle post-login redirect logic
   */
  static handlePostLoginRedirect(): string {
    // Priority 1: URL query parameter
    const queryRedirect = this.getRedirectFromQuery();
    if (queryRedirect) {
      this.clearIntendedUrl(); // Clear stored URL since we're using query
      return queryRedirect;
    }

    // Priority 2: Stored intended URL
    const storedRedirect = this.getIntendedUrl();
    if (storedRedirect) {
      this.clearIntendedUrl();
      return storedRedirect;
    }

    // Priority 3: Default dashboard
    return '/dashboard';
  }

  /**
   * Create login URL with redirect parameter
   */
  static createLoginUrl(intendedUrl: string): string {
    const loginUrl = new URL('/auth/login', window.location.origin);
    
    if (this.isSafeRedirectUrl(intendedUrl)) {
      loginUrl.searchParams.set(REDIRECT_PARAM, encodeURIComponent(intendedUrl));
    }
    
    return loginUrl.pathname + loginUrl.search;
  }

  /**
   * Redirect user after successful login
   */
  static executePostLoginRedirect(router: any): void {
    const redirectUrl = this.handlePostLoginRedirect();
    
    console.log(`[AuthRedirect] Executing post-login redirect to: ${redirectUrl}`);
    
    // Use replace to avoid adding to history stack
    router.replace(redirectUrl);
  }

  /**
   * Check if current URL should trigger auth redirect flow
   */
  static shouldStoreCurrentUrl(): boolean {
    if (typeof window === 'undefined') return false;

    const pathname = window.location.pathname;
    
    // Don't store auth-related pages
    const authPages = ['/auth/login', '/auth/signup', '/auth/select-role', '/auth/complete-profile'];
    if (authPages.some(page => pathname.startsWith(page))) {
      return false;
    }

    // Don't store public pages
    const publicPages = ['/', '/about', '/contact', '/privacy', '/terms'];
    if (publicPages.includes(pathname)) {
      return false;
    }

    // Store dashboard and protected pages
    return pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  }

  /**
   * Auto-store current URL if it's a protected page
   */
  static autoStoreCurrentUrl(): void {
    if (this.shouldStoreCurrentUrl()) {
      const currentUrl = window.location.pathname + window.location.search;
      this.storeIntendedUrl(currentUrl, 'direct_link');
    }
  }
}

// Convenience exports
export const storeIntendedUrl = AuthRedirectManager.storeIntendedUrl.bind(AuthRedirectManager);
export const getIntendedUrl = AuthRedirectManager.getIntendedUrl.bind(AuthRedirectManager);
export const clearIntendedUrl = AuthRedirectManager.clearIntendedUrl.bind(AuthRedirectManager);
export const handlePostLoginRedirect = AuthRedirectManager.handlePostLoginRedirect.bind(AuthRedirectManager);
export const createLoginUrl = AuthRedirectManager.createLoginUrl.bind(AuthRedirectManager);
export const executePostLoginRedirect = AuthRedirectManager.executePostLoginRedirect.bind(AuthRedirectManager);

export default AuthRedirectManager;