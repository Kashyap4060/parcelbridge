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
import { FeeBreakdown, FeeBreakdownSkeleton, FeeBreakdownError } from '@/components/ui/FeeBreakdown';
import { Station } from '@/lib/stationService';
import { useFeeCalculation, createFeeCalculationInput } from '@/hooks/useFeeCalculation';
import { DetailedFeeBreakdown, ParcelDetails } from '@/lib/centralizedFeeCalculator';
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
  dimensions: {
    length: number;
    breadth: number;
    height: number;
    weight: number;
  };
  result: DetailedFeeBreakdown;
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
  
  // Fee calculation hook
  const feeCalculation = useFeeCalculation();
  
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

  // Calculate fee using the hook
  const handleCalculate = async () => {
    if (!isValidForm()) {
      return;
    }

    const parcelDetails: ParcelDetails = {
      weight: parseFloat(dimensions.weight),
      length: parseFloat(dimensions.length),
      breadth: parseFloat(dimensions.breadth),
      height: parseFloat(dimensions.height),
      fromStationCode: fromStation!.code,
      toStationCode: toStation!.code
    };

    try {
      const result = await feeCalculation.calculateFee(parcelDetails);

      // Add to history
      const newCalculation: CalculationHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        fromStation: fromStation!,
        toStation: toStation!,
        dimensions: {
          length: parseFloat(dimensions.length),
          breadth: parseFloat(dimensions.breadth),
          height: parseFloat(dimensions.height),
          weight: parseFloat(dimensions.weight)
        },
        result
      };

      const updatedHistory = [newCalculation, ...calculationHistory.slice(0, 9)]; // Keep only last 10
      setCalculationHistory(updatedHistory);
      saveCalculationHistory(updatedHistory);

    } catch (error) {
      console.error('Error calculating fee:', error);
    }
  };

  // Clear all form data
  const handleClear = () => {
    setFromStation(null);
    setToStation(null);
    setDimensions({
      length: '',
      breadth: '',
      height: '',
      weight: ''
    });
    feeCalculation.clearCalculation();
  };

  // Create request with calculated data
  const handleCreateRequest = () => {
    if (!feeCalculation.result || !fromStation || !toStation) return;

    const queryParams = new URLSearchParams();
    queryParams.set('fromStation', JSON.stringify(fromStation));
    queryParams.set('toStation', JSON.stringify(toStation));
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
    
    // Trigger recalculation with loaded data
    const parcelDetails: ParcelDetails = {
      weight: calculation.dimensions.weight,
      length: calculation.dimensions.length,
      breadth: calculation.dimensions.breadth,
      height: calculation.dimensions.height,
      fromStationCode: calculation.fromStation.code,
      toStationCode: calculation.toStation.code
    };
    
    feeCalculation.calculateFee(parcelDetails);
  };

  // Handle input changes
  const handleDimensionChange = (field: keyof FormDimensions, value: string) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
    feeCalculation.clearCalculation(); // Clear previous result when inputs change
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Calculator Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6" />
            Parcel Fee Calculator
          </CardTitle>
          <CardDescription>
            Calculate estimated shipping costs for your parcel before creating a request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Route Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Select valid railway stations for accurate fee calculation based on train route distances.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <StationSelector
                label="From Station"
                value={fromStation}
                onChange={setFromStation}
                placeholder="Search for departure station..."
                required
              />
              <StationSelector
                label="To Station"
                value={toStation}
                onChange={setToStation}
                placeholder="Search for destination station..."
                required
              />
            </div>
          </div>

          {/* Package Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Package Dimensions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  min="1"
                  max="100"
                  value={dimensions.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breadth">Breadth (cm)</Label>
                <Input
                  id="breadth"
                  type="number"
                  min="1"
                  max="100"
                  value={dimensions.breadth}
                  onChange={(e) => handleDimensionChange('breadth', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  max="100"
                  value={dimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={dimensions.weight}
                  onChange={(e) => handleDimensionChange('weight', e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCalculate}
              disabled={!isValidForm() || feeCalculation.isCalculating}
              className="flex items-center gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              {feeCalculation.isCalculating ? 'Calculating...' : 'Calculate Fee'}
            </Button>
            
            <Button variant="outline" onClick={handleClear}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Result */}
      {feeCalculation.isCalculating && (
        <FeeBreakdownSkeleton />
      )}
      
      {feeCalculation.error && !feeCalculation.isCalculating && (
        <FeeBreakdownError 
          error={feeCalculation.error}
          onRetry={handleCalculate}
        />
      )}
      
      {feeCalculation.result && !feeCalculation.isCalculating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyRupeeIcon className="h-5 w-5" />
              Fee Calculation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeeBreakdown 
              result={feeCalculation.result}
              fromStation={fromStation?.name}
              toStation={toStation?.name}
              weight={parseFloat(dimensions.weight) || undefined}
              showHeader={false}
              variant="detailed"
            />

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button 
                onClick={handleCreateRequest}
                className="flex items-center gap-2"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                Create Request with These Details
              </Button>
              
              <Button variant="outline" onClick={handleClear}>
                Calculate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculation History */}
      {calculationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>
              Your recent fee calculations (stored locally)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculationHistory.slice(0, 5).map((calculation) => (
                <div
                  key={calculation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleLoadFromHistory(calculation)}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {calculation.fromStation.name} → {calculation.toStation.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {calculation.dimensions.weight}kg • {calculation.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{calculation.result.totalFee.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Click to load</p>
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