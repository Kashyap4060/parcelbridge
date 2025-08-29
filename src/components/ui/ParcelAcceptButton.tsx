'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '../../hooks/useHybridAuth';
import { useCarrierVerification } from '../../hooks/useCarrierVerification';
import { acceptParcelWithCollateral, MINIMUM_COLLATERAL } from '../../lib/collateralService';
import { Button } from './Button';
import { formatCurrency } from '../../lib/utils';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WalletIcon,
  TruckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ParcelAcceptButtonProps {
  parcelId: string;
  pickupStation: string;
  deliveryStation: string;
  amount: number;
  weight: number;
  senderName: string;
  className?: string;
}

export function ParcelAcceptButton({
  parcelId,
  pickupStation,
  deliveryStation,
  amount,
  weight,
  senderName,
  className = ''
}: ParcelAcceptButtonProps) {
  const { user } = useHybridAuth();
  const {
    canAcceptParcels,
    getParcelAcceptanceStatus,
    walletBalance,
    lockedAmount
  } = useCarrierVerification();
  
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [showCollateralInfo, setShowCollateralInfo] = useState(false);
  const [acceptanceResult, setAcceptanceResult] = useState<{
    success: boolean;
    message: string;
    requiresPayment?: boolean;
    shortfall?: number;
  } | null>(null);

  const acceptanceStatus = getParcelAcceptanceStatus();

  const handleAcceptParcel = async () => {
    if (!user) return;

    setIsAccepting(true);
    setAcceptanceResult(null);

    try {
      const result = await acceptParcelWithCollateral(
        user.firebaseUid,
        parcelId,
        walletBalance,
        lockedAmount
      );

      setAcceptanceResult({
        success: result.success,
        message: result.message || result.error || 'Unknown result'
      });

      if (result.success) {
        // Refresh the page or update local state
        setTimeout(() => {
          window.location.reload(); // In real app, use proper state management
        }, 2000);
      }
    } catch (error) {
      setAcceptanceResult({
        success: false,
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAddFunds = () => {
    router.push('/dashboard/wallet');
  };

  // Show acceptance result if available
  if (acceptanceResult) {
    return (
      <div className={`border rounded-lg p-4 ${
        acceptanceResult.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      } ${className}`}>
        <div className="flex items-center gap-3">
          {acceptanceResult.success ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              acceptanceResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {acceptanceResult.success ? 'Parcel Accepted!' : 'Cannot Accept Parcel'}
            </p>
            <p className={`text-sm ${
              acceptanceResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {acceptanceResult.message}
            </p>
          </div>
          {acceptanceResult.requiresPayment && acceptanceResult.shortfall && (
            <Button
              onClick={handleAddFunds}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add ₹{acceptanceResult.shortfall}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show acceptance status if carrier cannot accept parcels
  if (!acceptanceStatus.canAccept) {
    return (
      <div className={`border rounded-lg p-4 bg-amber-50 border-amber-200 ${className}`}>
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium text-amber-800">Action Required</p>
            <p className="text-sm text-amber-700">{acceptanceStatus.message}</p>
            {acceptanceStatus.action === 'add-funds' && acceptanceStatus.requiredAmount && (
              <p className="text-xs text-amber-600 mt-1">
                Add ₹{acceptanceStatus.requiredAmount} to accept parcels
              </p>
            )}
          </div>
          {acceptanceStatus.actionText && (
            <Button
              onClick={() => {
                if (acceptanceStatus.action === 'add-funds') {
                  handleAddFunds();
                } else if (acceptanceStatus.action === 'verify-aadhaar') {
                  router.push('/auth/aadhaar-verification');
                }
              }}
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              {acceptanceStatus.actionText}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show parcel details and accept button
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Parcel Details */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TruckIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Parcel #{parcelId}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">From:</p>
            <p className="font-medium">{pickupStation}</p>
          </div>
          <div>
            <p className="text-gray-600">To:</p>
            <p className="font-medium">{deliveryStation}</p>
          </div>
          <div>
            <p className="text-gray-600">Weight:</p>
            <p className="font-medium">{weight}kg</p>
          </div>
          <div>
            <p className="text-gray-600">Delivery Fee:</p>
            <p className="font-medium text-green-600">{formatCurrency(amount)}</p>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">Sender: <span className="font-medium">{senderName}</span></p>
        </div>
      </div>

      {/* Collateral Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">Security Deposit Required</p>
          </div>
          <button
            onClick={() => setShowCollateralInfo(!showCollateralInfo)}
            className="p-1 hover:bg-blue-100 rounded-full transition-colors"
            title="Learn more about collateral policy"
          >
            <InformationCircleIcon className="h-4 w-4 text-blue-600" />
          </button>
        </div>
        
        {showCollateralInfo ? (
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-medium">Collateral Policy:</p>
            <ul className="space-y-1 pl-4">
              <li>• ₹{MINIMUM_COLLATERAL} will be temporarily locked from your wallet</li>
              <li>• <span className="font-medium text-green-700">Full refund</span> upon successful delivery</li>
              <li>• <span className="font-medium text-red-600">Forfeited if you cancel within 24 hours</span> of journey date</li>
              <li>• This ensures commitment to parcel delivery</li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-blue-700">
            {formatCurrency(MINIMUM_COLLATERAL)} refundable security deposit. 
            <span className="font-medium"> Click ⓘ for cancellation terms.</span>
          </p>
        )}
      </div>

      {/* Accept Button */}
      <Button
        onClick={handleAcceptParcel}
        disabled={isAccepting}
        className="w-full"
      >
        {isAccepting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Accepting Parcel...
          </>
        ) : (
          <>
            <TruckIcon className="h-4 w-4 mr-2" />
            Accept Parcel (Lock ₹{MINIMUM_COLLATERAL})
          </>
        )}
      </Button>
    </div>
  );
}
