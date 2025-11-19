/**
 * Fee Display Component
 * Shows calculated delivery fees with breakdown
 */

'use client';

import { useState, useEffect } from 'react';
import { CurrencyRupeeIcon, CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { formatFee, calculateDeliveryFee, type FeeBreakdown } from '@/lib/feeCalculation';

interface FeeDisplayProps {
  pickupStation: string;
  dropStation: string;
  weight: number;
  onFeeCalculated?: (feeBreakdown: FeeBreakdown) => void;
  showPayButton?: boolean;
  onPayClick?: (feeBreakdown: FeeBreakdown) => void;
  className?: string;
}

export default function FeeDisplay({
  pickupStation,
  dropStation,
  weight,
  onFeeCalculated,
  showPayButton = false,
  onPayClick,
  className = ''
}: FeeDisplayProps) {
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (pickupStation && dropStation && weight > 0) {
      calculateFee();
    }
  }, [pickupStation, dropStation, weight]);

  const calculateFee = async () => {
    setIsLoading(true);
    setError('');

    try {
      const breakdown = await calculateDeliveryFee({
        fromStation: pickupStation,
        toStation: dropStation,
        weight
      });

      setFeeBreakdown(breakdown);
      
      if (onFeeCalculated) {
        onFeeCalculated(breakdown);
      }
    } catch (error: any) {
      console.error('Fee calculation failed:', error);
      setError(error.message || 'Failed to calculate delivery fee');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 border ${className}`}>
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-gray-600">Calculating delivery fee...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 rounded-lg p-4 border border-red-200 ${className}`}>
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <Button
          onClick={calculateFee}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          <CalculatorIcon className="h-4 w-4 mr-1" />
          Retry Calculation
        </Button>
      </div>
    );
  }

  if (!feeBreakdown) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 border border-gray-200 ${className}`}>
        <div className="flex items-center text-gray-600">
          <CalculatorIcon className="h-5 w-5 mr-2" />
          <span>Enter pickup station, drop station, and weight to calculate fee</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 rounded-lg p-6 border border-blue-200 ${className}`}>
      <div className="flex items-center mb-4">
        <CurrencyRupeeIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-blue-900">Delivery Fee</h3>
      </div>

      {/* Route Info */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Route:</span>
            <span className="font-medium text-gray-900">
              {feeBreakdown.fromStation || pickupStation} → {feeBreakdown.toStation || dropStation}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-medium text-gray-900">{feeBreakdown.distance} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Weight:</span>
            <span className="font-medium text-gray-900">{feeBreakdown.weight} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Weight Category:</span>
            <span className="font-medium text-gray-900">{feeBreakdown.weightTier}</span>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-700">Base Fee:</span>
          <span className="font-medium">{formatFee(feeBreakdown.baseFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Distance Fee:</span>
          <span className="font-medium">{formatFee(feeBreakdown.distanceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-medium">{formatFee(feeBreakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">GST (18%):</span>
          <span className="font-medium">{formatFee(feeBreakdown.gst)}</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-900">Total Amount:</span>
          <span className="text-xl font-bold text-blue-900">
            {formatFee(feeBreakdown.totalAmount)}
          </span>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="text-xs text-gray-600 mb-4 p-3 bg-white rounded border">
        <p className="font-medium mb-1">Pricing Information:</p>
        <ul className="space-y-1">
          <li>• Light parcels (≤2kg): ₹20 base fee</li>
          <li>• Medium parcels (2-10kg): ₹40 base fee</li>
          <li>• Heavy parcels ({'>'}10kg): ₹60 base fee</li>
          <li>• Distance fees: ₹2/km (0-50km), ₹3/km (51-200km), ₹4/km ({'>'} 200km)</li>
          <li>• All prices include 18% GST</li>
        </ul>
      </div>

      {showPayButton && (
        <Button
          onClick={() => onPayClick?.(feeBreakdown)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
          Pay {formatFee(feeBreakdown.totalAmount)}
        </Button>
      )}
    </div>
  );
}