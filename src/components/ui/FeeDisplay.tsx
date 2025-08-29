'use client';

import { formatFee } from '@/lib/feeCalculation';
import { CurrencyRupeeIcon, TruckIcon } from '@heroicons/react/24/outline';

interface FeeDisplayProps {
  fee: number;
  breakdown?: {
    baseFee: number;
    distanceFee: number;
    distance: number;
    weightTier: string;
  };
  showBreakdown?: boolean;
  className?: string;
}

export function FeeDisplay({ 
  fee, 
  breakdown, 
  showBreakdown = false, 
  className = '' 
}: FeeDisplayProps) {
  if (!breakdown && showBreakdown) {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          <CurrencyRupeeIcon className="h-5 w-5 text-gray-400 mr-2" />
          <span className="font-semibold text-gray-900">{formatFee(fee)}</span>
        </div>
      </div>
    );
  }

  if (!showBreakdown) {
    return (
      <span className={`font-semibold text-gray-900 ${className}`}>
        {formatFee(fee)}
      </span>
    );
  }

  return (
    <div className={`bg-blue-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-center mb-3">
        <CurrencyRupeeIcon className="h-5 w-5 text-blue-600 mr-2" />
        <h4 className="font-semibold text-blue-900">Fee Breakdown</h4>
      </div>
      
      {breakdown && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-medium">{breakdown.distance} km</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Weight Tier:</span>
            <span className="font-medium">{breakdown.weightTier}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Base Fee:</span>
            <span className="font-medium">{formatFee(breakdown.baseFee)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Distance Fee:</span>
            <span className="font-medium">{formatFee(breakdown.distanceFee)}</span>
          </div>
          
          <hr className="my-2" />
          
          <div className="flex justify-between font-bold text-lg">
            <span className="text-blue-900">Total Fee:</span>
            <span className="text-blue-900">{formatFee(fee)}</span>
          </div>
        </div>
      )}

      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
        <div className="flex items-center">
          <TruckIcon className="h-4 w-4 mr-1" />
          <span>Includes base charge and distance-based delivery cost</span>
        </div>
      </div>
    </div>
  );
}
