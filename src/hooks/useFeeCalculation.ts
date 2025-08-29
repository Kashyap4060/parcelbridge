import { useState, useCallback } from 'react';
import { getFeeEstimate, WEIGHT_TIERS, MAX_ALLOWED_WEIGHT } from '@/lib/feeCalculation';

interface UseFeeCalculationResult {
  fee: number | null;
  breakdown: any | null;
  isCalculating: boolean;
  error: string | null;
  requiresManualQuote: boolean;
  calculateFee: (weight: number, fromStation: string, toStation: string) => void;
  clearCalculation: () => void;
  weightTiers: typeof WEIGHT_TIERS;
  maxWeight: number;
}

export function useFeeCalculation(): UseFeeCalculationResult {
  const [fee, setFee] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresManualQuote, setRequiresManualQuote] = useState(false);

  const calculateFee = useCallback(async (weight: number, fromStation: string, toStation: string) => {
    setIsCalculating(true);
    setError(null);
    setRequiresManualQuote(false);

    try {
      // Now using async getFeeEstimate
      const result = await getFeeEstimate(weight, fromStation, toStation);

      if (result.success) {
        setFee(result.fee || 0);
        setBreakdown(result.breakdown || null);
      } else {
        setError(result.error || 'Failed to calculate fee');
        setFee(null);
        setBreakdown(null);
        setRequiresManualQuote(result.requiresManualQuote || false);
      }
    } catch (error) {
      setError('Failed to calculate fee. Please try again.');
      setFee(null);
      setBreakdown(null);
      console.error('Fee calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const clearCalculation = useCallback(() => {
    setFee(null);
    setBreakdown(null);
    setError(null);
    setRequiresManualQuote(false);
    setIsCalculating(false);
  }, []);

  return {
    fee,
    breakdown,
    isCalculating,
    error,
    requiresManualQuote,
    calculateFee,
    clearCalculation,
    weightTiers: WEIGHT_TIERS,
    maxWeight: MAX_ALLOWED_WEIGHT
  };
}
