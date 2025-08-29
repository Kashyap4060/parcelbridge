'use client';

import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/20/solid';

interface ErrorAlertProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ 
  message, 
  type = 'error', 
  onDismiss, 
  className = '' 
}: ErrorAlertProps) {
  const baseClasses = "rounded-lg p-4 border";
  
  const typeConfig = {
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: XCircleIcon,
      iconColor: "text-red-400"
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800", 
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-400"
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: InformationCircleIcon, 
      iconColor: "text-blue-400"
    },
    success: {
      container: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircleIcon, 
      iconColor: "text-green-400"
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={`${baseClasses} ${config.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50 ${config.iconColor}`}
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
