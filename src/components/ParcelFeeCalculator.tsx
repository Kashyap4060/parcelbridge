'use client';

/**
 * Parcel Fee Calculator Component
 * Allows users to estimate shipping costs before creating parcel requests
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StationSelector } from '@/components/ui/StationSelector';
import { Station } from '@/lib/stationService';
import FeeCalculatorService, { 
  FeeCalculationResult, 
  ParcelDimensions, 
  FeeCalculationInput 
} from '@/lib/feeCalculator';
import { 
  CalculatorIcon, 
  PaperAirplaneIcon, 
  InformationCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Form data interface (strings for inputs)
interface FormDimensions {
  length: string;
  breadth: string;
  height: string;
  weight: string;
}

interface CalculationHistory {
  id: string;
  timestamp: Date;
  fromStation: Station;
  toStation: Station;
  dimensions: ParcelDimensions;
  result: FeeCalculationResult;
}

export default function ParcelFeeCalculator() {
  const router = useRouter();
  
  // Form state
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  const [dimensions, setDimensions] = useState<FormDimensions>({
    length: '',
    breadth: '',
    height: '',
    weight: ''
  });
  
  // Calculation state
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<FeeCalculationResult | null>(null);
  const [error, setError] = useState<string>('');
  
  // History state
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistory[]>([]);
  
  // Load calculation history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('parcelFeeHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setCalculationHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error loading calculation history:', error);
      }
    }
  }, []);

  // Save calculation history to localStorage
  const saveCalculationHistory = (history: CalculationHistory[]) => {
    try {
      localStorage.setItem('parcelFeeHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving calculation history:', error);
    }
  };

  // Validation
  const isValidForm = () => {
    return fromStation && 
           toStation && 
           parseFloat(dimensions.length) > 0 &&
           parseFloat(dimensions.breadth) > 0 &&
           parseFloat(dimensions.height) > 0 &&
           parseFloat(dimensions.weight) > 0;
  };

  // Calculate fee
  const handleCalculate = async () => {
    if (!isValidForm()) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const input: FeeCalculationInput = {
        fromStationCode: fromStation!.code,
        toStationCode: toStation!.code,
        dimensions: {
          length: parseFloat(dimensions.length),
          breadth: parseFloat(dimensions.breadth),
          height: parseFloat(dimensions.height),
          weight: parseFloat(dimensions.weight)
        }
      };

      const result = await FeeCalculatorService.calculateFee(input);
      setCalculationResult(result);

      // Add to history
      const newCalculation: CalculationHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fromStation: fromStation!,
        toStation: toStation!,
        dimensions: input.dimensions,
        result
      };

      const updatedHistory = [newCalculation, ...calculationHistory.slice(0, 9)]; // Keep only last 10
      setCalculationHistory(updatedHistory);
      saveCalculationHistory(updatedHistory);

    } catch (error) {
      console.error('Error calculating fee:', error);
      setError('Failed to calculate fee. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFromStation(null);
    setToStation(null);
    setDimensions({
      length: '',
      breadth: '',
      height: '',
      weight: ''
    });
    setCalculationResult(null);
    setError('');
  };

  // Create request with calculated data
  const handleCreateRequest = () => {
    if (!calculationResult || !fromStation || !toStation) return;

    const queryParams = new URLSearchParams();
    queryParams.set('fromStation', fromStation.code);
    queryParams.set('toStation', toStation.code);
    if (dimensions.length) queryParams.set('length', dimensions.length);
    if (dimensions.breadth) queryParams.set('breadth', dimensions.breadth);
    if (dimensions.height) queryParams.set('height', dimensions.height);
    if (dimensions.weight) queryParams.set('weight', dimensions.weight);

    router.push(`/dashboard/sender/create-request?${queryParams.toString()}`);
  };

  // Load calculation from history
  const handleLoadFromHistory = (calculation: CalculationHistory) => {
    setFromStation(calculation.fromStation);
    setToStation(calculation.toStation);
    setDimensions({
      length: calculation.dimensions.length.toString(),
      breadth: calculation.dimensions.breadth.toString(),
      height: calculation.dimensions.height.toString(),
      weight: calculation.dimensions.weight.toString()
    });
    setCalculationResult(calculation.result);
  };

  // Handle input changes
  const handleDimensionChange = (field: keyof FormDimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
    setCalculationResult(null); // Clear previous result when inputs change
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Parcel Fee Calculator
          </CardTitle>
          <CardDescription>
            Calculate shipping costs for your parcel before creating a request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Station Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Station</Label>
              <StationSelector
                label="From Station"
                value={fromStation}
                onChange={setFromStation}
                placeholder="Select pickup station"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>To Station</Label>
              <StationSelector
                label="To Station"
                value={toStation}
                onChange={setToStation}
                placeholder="Select destination station"
                className="w-full"
              />
            </div>
          </div>

          {/* Parcel Dimensions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                id="length"
                type="number"
                placeholder="0"
                value={dimensions.length}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breadth">Breadth (cm)</Label>
              <Input
                id="breadth"
                type="number"
                placeholder="0"
                value={dimensions.breadth}
                onChange={(e) => handleDimensionChange('breadth', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="0"
                value={dimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="0"
                value={dimensions.weight}
                onChange={(e) => handleDimensionChange('weight', e.target.value)}
                min="0"
                step="0.1"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleCalculate}
              disabled={!isValidForm() || isCalculating}
              className="flex items-center gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              {isCalculating ? 'Calculating...' : 'Calculate Fee'}
            </Button>
            
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Result */}
      {calculationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyRupeeIcon className="h-5 w-5" />
              Fee Calculation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total Fee */}
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border">
                <span className="text-lg font-semibold">Total Fee:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{calculationResult.totalFee.toFixed(2)}
                </span>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Fee Breakdown:</h4>
                <div className="grid gap-2">
                  {calculationResult.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600">{item.description}</span>
                      <span className="font-medium">₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <ClockIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Estimated delivery: {calculationResult.estimatedDeliveryHours}h
                  {calculationResult.estimatedDeliveryHours > 24 
                    ? ` (${Math.ceil(calculationResult.estimatedDeliveryHours / 24)} days)` 
                    : ''
                  }
                </span>
              </div>

              {/* Create Request Button */}
              <Button 
                onClick={handleCreateRequest}
                className="w-full flex items-center justify-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Create Parcel Request with These Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Calculations History */}
      {calculationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>
              Your recent fee calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculationHistory.slice(0, 5).map((calculation) => (
                <div 
                  key={calculation.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleLoadFromHistory(calculation)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{calculation.fromStation.code}</span>
                      <span className="text-gray-400">→</span>
                      <span>{calculation.toStation.code}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {calculation.dimensions.length}×{calculation.dimensions.breadth}×{calculation.dimensions.height}cm, {calculation.dimensions.weight}kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      ₹{calculation.result.totalFee.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {calculation.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}