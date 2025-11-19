import { useState, useCallback } from 'react';
import CentralizedFeeCalculator, { 
  DetailedFeeBreakdown, 
  ParcelDetails 
} from '@/lib/centralizedFeeCalculator';

interface UseFeeCalculationResult {
  result: DetailedFeeBreakdown | null;
  isCalculating: boolean;
  error: string | null;
  lastCalculatedAt: Date | null;
  calculateFee: (input: ParcelDetails) => Promise<DetailedFeeBreakdown>;
  clearCalculation: () => void;
  canCalculate: (input: Partial<ParcelDetails>) => boolean;
  getFormattedBreakdown: () => any;
}

export function useFeeCalculation(): UseFeeCalculationResult {
  const [result, setResult] = useState<DetailedFeeBreakdown | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculatedAt, setLastCalculatedAt] = useState<Date | null>(null);

  const calculateFee = useCallback(async (input: ParcelDetails): Promise<DetailedFeeBreakdown> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate input before calculation
      if (!input.fromStationCode || !input.toStationCode) {
        throw new Error('Both pickup and destination stations are required');
      }

      if (!input.weight || input.weight <= 0) {
        throw new Error('Valid parcel weight is required');
      }

      const feeResult = await CentralizedFeeCalculator.calculateFee(input);
      
      setResult(feeResult);
      setLastCalculatedAt(new Date());
      
      return feeResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate fee';
      setError(errorMessage);
      setResult(null);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const clearCalculation = useCallback(() => {
    setResult(null);
    setError(null);
    setLastCalculatedAt(null);
  }, []);

  const canCalculate = useCallback((input: Partial<ParcelDetails>) => {
    return CentralizedFeeCalculator.canCalculate(input);
  }, []);

  const getFormattedBreakdown = useCallback(() => {
    if (!result) return null;

    return {
      totalFee: CentralizedFeeCalculator.formatCurrency(result.totalFee),
      deliveryTime: CentralizedFeeCalculator.formatDeliveryTime(result.estimatedDeliveryHours),
      distance: `${result.distance} km`,
      formattedBreakdown: result.breakdown.map((item: any) => ({
        label: item.label,
        value: item.value,
        amount: CentralizedFeeCalculator.formatCurrency(item.amount)
      }))
    };
  }, [result]);

  return {
    result,
    isCalculating,
    error,
    lastCalculatedAt,
    calculateFee,
    clearCalculation,
    canCalculate,
    getFormattedBreakdown
  };
}

// Helper function to create parcel details from form data
export function createFeeCalculationInput(data: {
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  pickupStation?: { station_code?: string };
  destinationStation?: { station_code?: string };
}): ParcelDetails | null {
  const {
    weight,
    length,
    breadth,
    height,
    pickupStation,
    destinationStation
  } = data;

  // Check if all required fields are present
  if (!weight || !length || !breadth || !height || 
      !pickupStation?.station_code || !destinationStation?.station_code) {
    return null;
  }

  return {
    weight,
    length,
    breadth,
    height,
    fromStationCode: pickupStation.station_code,
    toStationCode: destinationStation.station_code
  };
}

export default useFeeCalculation;