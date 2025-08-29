'use client';

import { useState, useEffect } from 'react';
import { calculateParcelFee, getEstimatedDistance, getFeeEstimate, formatFee, WEIGHT_TIERS } from '@/lib/feeCalculation';
import { Button } from '@/components/ui/Button';
import { StationSearchDropdown } from './StationSearchDropdown';
import { CalculatorIcon, TruckIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { Station } from '@/lib/stationService';

interface FeeCalculatorProps {
  onFeeCalculated?: (fee: number, breakdown: any) => void;
  initialFromStation?: string;
  initialToStation?: string;
  initialWeight?: number;
  className?: string;
}

export function FeeCalculator({
  onFeeCalculated,
  initialFromStation = '',
  initialToStation = '',
  initialWeight = 0,
  className = ''
}: FeeCalculatorProps) {
  const [fromStation, setFromStation] = useState(initialFromStation);
  const [toStation, setToStation] = useState(initialToStation);
  const [weight, setWeight] = useState(initialWeight);
  const [feeEstimate, setFeeEstimate] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  const [selectedFromStation, setSelectedFromStation] = useState<Station | null>(null);
  const [selectedToStation, setSelectedToStation] = useState<Station | null>(null);

  const calculateFee = async () => {
    if (!fromStation.trim() || !toStation.trim() || weight <= 0) {
      setError('Please fill in all fields with valid values');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const result = await getFeeEstimate(weight, fromStation, toStation);
      
      if (result.success && result.fee && result.breakdown) {
        setFeeEstimate(result);
        onFeeCalculated?.(result.fee, result.breakdown);
        setError('');
      } else {
        setError(result.error || 'Failed to calculate fee');
        setFeeEstimate(null);
      }
    } catch (error) {
      console.error('Fee calculation error:', error);
      setError('Failed to calculate fee. Please try again.');
      setFeeEstimate(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate when inputs change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromStation.trim() && toStation.trim() && weight > 0) {
        calculateFee();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [fromStation, toStation, weight]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <CalculatorIcon className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Fee Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* From Station */}
        <StationSearchDropdown
          label="From Station"
          placeholder="Search departure station..."
          value={fromStation}
          onChange={setFromStation}
          onStationSelect={setSelectedFromStation}
          required
        />

        {/* To Station */}
        <StationSearchDropdown
          label="To Station"
          placeholder="Search destination station..."
          value={toStation}
          onChange={setToStation}
          onStationSelect={setSelectedToStation}
          required
        />

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (kg) *
          </label>
          <input
            type="number"
            value={weight || ''}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
            placeholder="e.g., 3.5"
            min="0.1"
            max="10"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Maximum 10kg allowed</p>
        </div>

        {/* Weight Tiers Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing Tiers</h4>
          <div className="grid grid-cols-1 gap-2">
            {WEIGHT_TIERS.map((tier, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-600">
                <span>{tier.label}</span>
                <span>₹{tier.baseFee} + ₹{tier.costPerKm}/km</span>
              </div>
            ))}
            <div className="flex justify-between text-xs text-red-600 font-medium">
              <span>10+ kg</span>
              <span>Manual Quote Required</span>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateFee}
          className="w-full"
          disabled={isCalculating || !fromStation.trim() || !toStation.trim() || weight <= 0}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Fee'}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Fee Display */}
        {feeEstimate && feeEstimate.breakdown && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-3">
              <CurrencyRupeeIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Fee Breakdown</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{feeEstimate.breakdown.distance} km</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Weight Tier:</span>
                <span className="font-medium">{feeEstimate.breakdown.weightTier?.label}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fee:</span>
                <span className="font-medium">₹{feeEstimate.breakdown.baseFee}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Distance Fee:</span>
                <span className="font-medium">₹{feeEstimate.breakdown.distanceFee}</span>
              </div>
              
              <hr className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span className="text-blue-900">Total Fee:</span>
                <span className="text-blue-900">₹{feeEstimate.breakdown.totalFee}</span>
              </div>
            </div>

            <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
              <div className="flex items-center">
                <TruckIcon className="h-4 w-4 mr-1" />
                <span>Estimated delivery fee includes base charge and distance cost</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
