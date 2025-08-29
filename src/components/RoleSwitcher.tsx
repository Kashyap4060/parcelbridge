/**
 * Role Switcher Component
 * Compact toggle design with roles side by side and animated switch
 */

'use client';

import { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { ArrowsRightLeftIcon, TruckIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface RoleSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
}

export default function RoleSwitcher({ className = '', variant = 'default' }: RoleSwitcherProps) {
  const { user, switchRole, isLoading } = useHybridAuth();
  const [switching, setSwitching] = useState(false);

  const handleRoleToggle = async () => {
    if (!user?.role || switching || isLoading) return;

    const newRole = user.role === 'sender' ? 'carrier' : 'sender';
    
    try {
      setSwitching(true);
      await switchRole(newRole);
    } catch (error) {
      console.error('Failed to switch role:', error);
    } finally {
      setSwitching(false);
    }
  };

  if (!user || !user.role) return null;

  const currentRole = user.role;
  const otherRole = currentRole === 'sender' ? 'carrier' : 'sender';

  // Compact minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* Mini Toggle Pill */}
        <div className="relative">
          <div 
            className={`w-20 h-8 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${
              currentRole === 'sender' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-500' 
                : 'bg-gradient-to-r from-green-400 to-green-500'
            }`}
            onClick={handleRoleToggle}
          >
            {/* Mini Sliding Button */}
            <div 
              className={`w-7 h-7 bg-white rounded-full shadow-sm transition-all duration-300 ease-out transform flex items-center justify-center ${
                currentRole === 'sender' ? 'translate-x-0' : 'translate-x-12'
              } ${switching || isLoading ? 'scale-90' : 'hover:scale-105'}`}
            >
              {switching || isLoading ? (
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  currentRole === 'sender' ? 'bg-blue-500' : 'bg-green-500'
                }`}></div>
              )}
            </div>
          </div>
          
          {/* Disabled overlay */}
          {(switching || isLoading) && (
            <div className="absolute inset-0 bg-gray-200 bg-opacity-30 rounded-full cursor-not-allowed"></div>
          )}
        </div>

        {/* Role Text */}
        <span className={`ml-2 text-sm font-medium capitalize transition-colors duration-300 ${
          currentRole === 'sender' ? 'text-blue-700' : 'text-green-700'
        }`}>
          {currentRole}
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {/* Modern Toggle Switch */}
        <div className="relative">
          {/* Toggle Container */}
          <div 
            className={`relative w-32 h-10 rounded-full p-1 transition-all duration-300 cursor-pointer ${
              currentRole === 'sender' 
                ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                : 'bg-gradient-to-r from-green-400 to-green-600'
            }`}
            onClick={handleRoleToggle}
          >
            {/* Sliding Pill */}
            <div 
              className={`absolute top-1 w-16 h-8 bg-white rounded-full shadow-lg transition-all duration-300 ease-out transform flex items-center justify-center ${
                currentRole === 'sender' ? 'translate-x-0' : 'translate-x-14'
              } ${switching || isLoading ? 'scale-95' : 'hover:scale-105'}`}
            >
              {switching || isLoading ? (
                <svg className="w-4 h-4 animate-spin text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  {currentRole === 'sender' ? (
                    <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
                  ) : (
                    <TruckIcon className="h-5 w-5 text-green-600" />
                  )}
                </>
              )}
            </div>

            {/* Static Labels */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              <span className={`text-xs font-semibold transition-opacity duration-300 ${
                currentRole === 'sender' ? 'opacity-0' : 'opacity-100 text-white'
              }`}>
                Send
              </span>
              <span className={`text-xs font-semibold transition-opacity duration-300 ${
                currentRole === 'carrier' ? 'opacity-0' : 'opacity-100 text-white'
              }`}>
                Carry
              </span>
            </div>
          </div>

          {/* Disabled overlay */}
          {(switching || isLoading) && (
            <div className="absolute inset-0 bg-gray-200 bg-opacity-50 rounded-full cursor-not-allowed"></div>
          )}
        </div>

        {/* Current Role Label */}
        <div className="ml-4 flex flex-col">
          <span className="text-sm font-bold text-gray-800 capitalize">{currentRole}</span>
          <span className="text-xs text-gray-500">
            {currentRole === 'sender' ? 'Send parcels' : 'Carry parcels'}
          </span>
        </div>
      </div>
    );
  }

  // Default variant - side by side with toggle button
  return (
    <div className={`inline-flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-2 ${className}`}>
      {/* Current Role */}
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        currentRole === 'sender' 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
          : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
      }`}>
        {currentRole === 'sender' ? (
          <PaperAirplaneIcon className="h-5 w-5" />
        ) : (
          <TruckIcon className="h-5 w-5" />
        )}
        <span className="font-semibold text-sm capitalize">{currentRole}</span>
      </div>

      {/* Toggle Switch Button */}
      <div className="mx-4">
        <button
          onClick={handleRoleToggle}
          disabled={switching || isLoading}
          className={`group relative p-3 rounded-full border-2 transition-all duration-300 ${
            switching || isLoading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 cursor-pointer hover:scale-110 hover:rotate-180'
          }`}
          title={`Switch to ${otherRole}`}
        >
          {switching || isLoading ? (
            <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600 transition-transform duration-300 group-hover:scale-110" />
          )}
        </button>
      </div>

      {/* Other Role (Preview) */}
      <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 transition-all duration-300 hover:bg-gray-150">
        {otherRole === 'sender' ? (
          <PaperAirplaneIcon className="h-5 w-5" />
        ) : (
          <TruckIcon className="h-5 w-5" />
        )}
        <span className="font-medium text-sm capitalize">{otherRole}</span>
      </div>
    </div>
  );
}
