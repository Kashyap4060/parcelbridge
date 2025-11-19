import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CurrencyRupeeIcon, 
  ClockIcon, 
  ScaleIcon,
  MapPinIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { DetailedFeeBreakdown } from '@/lib/centralizedFeeCalculator';

interface FeeBreakdownProps {
  result: DetailedFeeBreakdown;
  fromStation?: string;
  toStation?: string;
  weight?: number;
  className?: string;
  showHeader?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function FeeBreakdown({ 
  result, 
  fromStation, 
  toStation, 
  weight,
  className = '',
  showHeader = true,
  variant = 'default'
}: FeeBreakdownProps) {
  const formatAmount = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDeliveryTime = (hours: number) => 
    hours > 24 ? `${Math.ceil(hours / 24)} days` : `${hours} hours`;

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg border ${className}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Total Fee</span>
          </div>
          <span className="text-xl font-bold text-green-600">
            {formatAmount(result.totalFee)}
          </span>
        </div>
        {result.estimatedDeliveryHours && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>Estimated delivery: {formatDeliveryTime(result.estimatedDeliveryHours)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
            Fee Breakdown
          </CardTitle>
          {(fromStation || toStation || weight) && (
            <CardDescription className="space-y-1">
              {fromStation && toStation && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{fromStation} → {toStation}</span>
                </div>
              )}
              {weight && (
                <div className="flex items-center gap-2 text-sm">
                  <ScaleIcon className="h-4 w-4" />
                  <span>Weight: {weight} kg</span>
                </div>
              )}
            </CardDescription>
          )}
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Fee breakdown items */}
        <div className="space-y-3">
          {result.breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.value && <span className="text-xs text-gray-400">{item.value}</span>}
              </div>
              <span className="font-medium">{formatAmount(item.amount)}</span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Fee</span>
          <span className="text-xl font-bold text-green-600">
            {formatAmount(result.totalFee)}
          </span>
        </div>

        {/* Delivery estimate */}
        {result.estimatedDeliveryHours && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Estimated Delivery</span>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {formatDeliveryTime(result.estimatedDeliveryHours)}
              </Badge>
            </div>
          </>
        )}

        {/* Additional info for detailed variant */}
        {variant === 'detailed' && (
          <>
            <Separator />
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <ArchiveBoxIcon className="h-4 w-4" />
                What's included?
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Secure packaging and handling</li>
                <li>• Real-time tracking</li>
                <li>• OTP-verified delivery</li>
                <li>• Insurance coverage up to ₹{Math.min(result.totalFee * 10, 10000)}</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for quick display
export function FeeBreakdownCompact({ 
  result, 
  className = '' 
}: { 
  result: DetailedFeeBreakdown; 
  className?: string; 
}) {
  return (
    <FeeBreakdown 
      result={result} 
      className={className} 
      showHeader={false} 
      variant="compact" 
    />
  );
}

// Loading state component
export function FeeBreakdownSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Error state component
export function FeeBreakdownError({ 
  error, 
  onRetry, 
  className = '' 
}: { 
  error: string; 
  onRetry?: () => void;
  className?: string; 
}) {
  return (
    <Card className={`border-red-200 bg-red-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <CurrencyRupeeIcon className="h-5 w-5" />
          <span className="font-medium">Fee Calculation Error</span>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );
}