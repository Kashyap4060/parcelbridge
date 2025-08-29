/**
 * User Profile Header Component
 * Displays user information with name, role switcher, and logout functionality
 */

'use client';

import { useHybridAuth } from '@/hooks/useHybridAuth';
import RoleSwitcher from './RoleSwitcher';

interface UserProfileHeaderProps {
  showLogout?: boolean;
  showRoleSwitcher?: boolean;
  className?: string;
}

export default function UserProfileHeader({ 
  showLogout = true,
  showRoleSwitcher = true,
  className = '' 
}: UserProfileHeaderProps) {
  const { user, signOut, isLoading } = useHybridAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect will be handled by the hybridAuth service
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.fullName || user.email || 'User';

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <div className="w-12 h-12 shrink-0 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {(user.firstName?.[0] || user.fullName?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </span>
        </div>
        
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
            {user.isPhoneVerified && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Phone Verified
              </span>
            )}
            {user.isEmailVerified && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Email Verified
              </span>
            )}
          </div>
        </div>
        </div>
        
        {showRoleSwitcher && user.role && (
          <div className="hidden sm:block ml-4">
            <RoleSwitcher variant="compact" />
          </div>
        )}

        
        {showLogout && (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`ml-auto sm:ml-0 px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing out...</span>
              </div>
            ) : (
              'Logout'
            )}
          </button>
        )}
      </div>

      {showRoleSwitcher && user.role && (
        <div className="sm:hidden mt-2">
          <RoleSwitcher variant="compact" />
        </div>
      )}
    </div>
  );
}
