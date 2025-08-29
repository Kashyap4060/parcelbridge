'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { formatCurrency } from '../../lib/utils';
import { 
  WalletIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  PlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface CollateralStatusProps {
  totalBalance: number;
  lockedAmount: number;
  availableBalance: number;
  minimumRequired: number;
  canAcceptMore: boolean;
  shortfall: number;
  className?: string;
}

export function CollateralStatus({
  totalBalance,
  lockedAmount,
  availableBalance,
  minimumRequired,
  canAcceptMore,
  shortfall,
  className = ''
}: CollateralStatusProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCollateralInfo, setShowCollateralInfo] = useState(false);

  const handleAddFunds = () => {
    router.push('/dashboard/wallet');
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Collateral Status</h3>
          <button
            onClick={() => setShowCollateralInfo(!showCollateralInfo)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Learn about collateral"
          >
            <InformationCircleIcon className="h-4 w-4 text-blue-500" />
          </button>
        </div>
        {canAcceptMore ? (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        ) : (
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
        )}
      </div>

      {/* Collateral Information Panel */}
      {showCollateralInfo && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-2">About Collateral</h4>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>₹{minimumRequired} is temporarily locked as security when you accept a parcel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span><strong>Full refund</strong> upon successful parcel delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">⚠</span>
                  <span><strong>Important:</strong> Collateral is forfeited if you cancel the parcel delivery within 24 hours of journey date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You can accept multiple parcels if you have sufficient balance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className={`p-3 rounded-md mb-3 ${
        canAcceptMore 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        {canAcceptMore ? (
          <p className="text-green-800 text-sm">
            ✓ You can accept parcels! Available balance: <strong>{formatCurrency(availableBalance)}</strong>
          </p>
        ) : (
          <p className="text-amber-800 text-sm">
            ⚠ Add <strong>{formatCurrency(shortfall)}</strong> more to accept parcels
            (Minimum: {formatCurrency(minimumRequired)})
          </p>
        )}
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Total Balance</p>
          <p className="font-semibold text-gray-900">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-600 mb-1">Available</p>
          <p className="font-semibold text-gray-900">{formatCurrency(availableBalance)}</p>
        </div>
      </div>

      {/* Detailed View Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-sm text-blue-600 hover:text-blue-700 mb-3"
      >
        {isExpanded ? 'Hide' : 'Show'} details
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Locked Amount:</span>
            <span className="text-gray-900">{formatCurrency(lockedAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minimum Required:</span>
            <span className="text-gray-900">{formatCurrency(minimumRequired)}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            * Collateral is locked when you accept a parcel and released upon successful delivery
            <br />
            * Forfeited if cancelled within 24 hours of journey date
          </div>
        </div>
      )}

      {/* Action Button */}
      {!canAcceptMore && (
        <Button
          onClick={handleAddFunds}
          className="w-full mt-3"
          variant="outline"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add ₹{shortfall} to Wallet
        </Button>
      )}
    </div>
  );
}
