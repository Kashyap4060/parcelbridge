/**
 * User-friendly error notification component
 * Shows beautiful error messages instead of technical Firebase errors
 */

'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { getUserFriendlyError, UserError } from '@/lib/errorMessages';

interface ErrorNotificationProps {
  error: any;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ErrorNotification({ 
  error, 
  onClose, 
  autoClose = true, 
  autoCloseDelay = 5000 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const userError: UserError = getUserFriendlyError(error);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (userError.type) {
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
    }
  };

  const getBorderColor = () => {
    switch (userError.type) {
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-red-200';
    }
  };

  const getBackgroundColor = () => {
    switch (userError.type) {
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-red-50';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`rounded-lg border ${getBorderColor()} ${getBackgroundColor()} p-4 shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {userError.title}
            </h3>
            <div className="mt-1 text-sm text-gray-700">
              {userError.message}
            </div>
            {userError.action && (
              <div className="mt-2 text-xs text-gray-600 italic">
                💡 {userError.action}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple error toast for inline display
 */
interface ErrorToastProps {
  error: any;
  className?: string;
}

export function ErrorToast({ error, className = "" }: ErrorToastProps) {
  const userError: UserError = getUserFriendlyError(error);

  const getStyles = () => {
    switch (userError.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`rounded-md border p-3 ${getStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {userError.type === 'error' && <XCircleIcon className="h-5 w-5 text-red-400" />}
          {userError.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />}
          {userError.type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-400" />}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            {userError.title}
          </h3>
          <div className="mt-1 text-sm">
            {userError.message}
          </div>
          {userError.action && (
            <div className="mt-1 text-xs opacity-75">
              💡 {userError.action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




