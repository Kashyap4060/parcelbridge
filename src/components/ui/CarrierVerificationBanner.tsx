'use client';

import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { formatCurrency } from '../../lib/utils';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
  IdentificationIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface VerificationStatus {
  canAccept: boolean;
  message: string;
  action?: string;
  actionText?: string;
  currentBalance?: number;
  requiredAmount?: number;
}

interface CarrierVerificationBannerProps {
  status: VerificationStatus;
  isLoading?: boolean;
  className?: string;
}

export function CarrierVerificationBanner({ 
  status, 
  isLoading = false, 
  className = '' 
}: CarrierVerificationBannerProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Checking verification status...</p>
        </div>
      </div>
    );
  }

  const handleAction = () => {
    switch (status.action) {
      case 'verify-aadhaar':
        router.push('/auth/aadhaar-verification');
        break;
      case 'add-funds':
        router.push('/dashboard/wallet');
        break;
      default:
        break;
    }
  };

  const getBannerStyle = () => {
    if (status.canAccept) {
      return 'bg-green-50 border-green-200';
    }
    if (status.action === 'add-funds') {
      return 'bg-amber-50 border-amber-200';
    }
    return 'bg-red-50 border-red-200';
  };

  const getIcon = () => {
    if (status.canAccept) {
      return <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />;
    }
    if (status.action === 'add-funds') {
      return <WalletIcon className="h-6 w-6 text-amber-500 flex-shrink-0" />;
    }
    if (status.action === 'verify-aadhaar') {
      return <IdentificationIcon className="h-6 w-6 text-red-500 flex-shrink-0" />;
    }
    return <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />;
  };

  const getTextColor = () => {
    if (status.canAccept) return 'text-green-800';
    if (status.action === 'add-funds') return 'text-amber-800';
    return 'text-red-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${getBannerStyle()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${getTextColor()}`}>
            {status.canAccept ? 'Ready to Accept Parcels!' : 'Action Required'}
          </p>
          <p className={`text-sm mt-1 ${getTextColor()}`}>
            {status.message}
          </p>
          
          {/* Additional info for collateral shortfall */}
          {status.action === 'add-funds' && status.currentBalance !== undefined && status.requiredAmount !== undefined && (
            <div className="mt-2 text-sm text-amber-700">
              <p>Current balance: {formatCurrency(status.currentBalance)}</p>
              <p>Add {formatCurrency(status.requiredAmount)} to start accepting parcels</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                <InformationCircleIcon className="h-3 w-3" />
                <span>Refundable security deposit - forfeited only if cancelled within 24hrs of journey</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        {status.actionText && status.action && (
          <Button
            onClick={handleAction}
            size="sm"
            variant={status.canAccept ? 'default' : 'outline'}
            className={
              status.action === 'add-funds' 
                ? 'border-amber-300 text-amber-700 hover:bg-amber-100' 
                : ''
            }
          >
            {status.actionText}
          </Button>
        )}
      </div>
    </div>
  );
}
