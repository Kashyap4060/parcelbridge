// Parcel fee calculation utilities
import { getStationDistance } from './stationService';

export interface WeightTier {
  minWeight: number;
  maxWeight: number;
  baseFee: number;
  costPerKm: number;
  label: string;
}

export interface StationDistance {
  fromStation: string;
  toStation: string;
  distanceKm: number;
}

// Weight-based fee tiers
export const WEIGHT_TIERS: WeightTier[] = [
  {
    minWeight: 0,
    maxWeight: 2,
    baseFee: 50,
    costPerKm: 1,
    label: 'Under 2 kg'
  },
  {
    minWeight: 2,
    maxWeight: 5,
    baseFee: 100,
    costPerKm: 1,
    label: '2-5 kg'
  },
  {
    minWeight: 5,
    maxWeight: 10,
    baseFee: 150,
    costPerKm: 1.5,
    label: '5-10 kg'
  }
];

// Maximum allowed weight
export const MAX_ALLOWED_WEIGHT = 10;

/**
 * Get weight tier for a given weight
 */
export function getWeightTier(weight: number): WeightTier | null {
  if (weight > MAX_ALLOWED_WEIGHT) {
    return null; // Not allowed, needs manual quote
  }

  return WEIGHT_TIERS.find(tier => 
    weight > tier.minWeight && weight <= tier.maxWeight
  ) || null;
}

/**
 * Calculate parcel delivery fee
 */
export function calculateParcelFee(
  weight: number,
  distanceKm: number
): {
  fee: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    weightTier: WeightTier | null;
  };
  isAllowed: boolean;
  requiresManualQuote: boolean;
} {
  const weightTier = getWeightTier(weight);

  if (!weightTier || weight > MAX_ALLOWED_WEIGHT) {
    return {
      fee: 0,
      breakdown: {
        baseFee: 0,
        distanceFee: 0,
        weightTier: null
      },
      isAllowed: false,
      requiresManualQuote: weight > MAX_ALLOWED_WEIGHT
    };
  }

  const baseFee = weightTier.baseFee;
  const distanceFee = Math.round(distanceKm * weightTier.costPerKm);
  const totalFee = baseFee + distanceFee;

  return {
    fee: totalFee,
    breakdown: {
      baseFee,
      distanceFee,
      weightTier
    },
    isAllowed: true,
    requiresManualQuote: false
  };
}

/**
 * Format fee for display
 */
export function formatFee(fee: number): string {
  return `₹${fee}`;
}

/**
 * Get estimated distance between two stations - deprecated
 * Use getStationDistance from stationService instead
 */
export function getEstimatedDistance(
  fromStation: string,
  toStation: string
): number {
  console.warn('getEstimatedDistance is deprecated. Use getStationDistance from stationService.');
  // Return a fallback distance
  return 500;
}

/**
 * Validate weight input
 */
export function validateWeight(weight: number): {
  isValid: boolean;
  error?: string;
} {
  if (weight <= 0) {
    return {
      isValid: false,
      error: 'Weight must be greater than 0'
    };
  }

  if (weight > MAX_ALLOWED_WEIGHT) {
    return {
      isValid: false,
      error: `Maximum allowed weight is ${MAX_ALLOWED_WEIGHT}kg. Please contact support for manual quote.`
    };
  }

  return { isValid: true };
}

/**
 * Get fee estimate with validation
 */
export async function getFeeEstimate(
  weight: number,
  fromStation: string,
  toStation: string
): Promise<{
  success: boolean;
  fee?: number;
  breakdown?: any;
  error?: string;
  requiresManualQuote?: boolean;
}> {
  // Validate weight
  const weightValidation = validateWeight(weight);
  if (!weightValidation.isValid) {
    return {
      success: false,
      error: weightValidation.error,
      requiresManualQuote: weight > MAX_ALLOWED_WEIGHT
    };
  }

  // Validate stations
  if (!fromStation.trim() || !toStation.trim()) {
    return {
      success: false,
      error: 'Please provide both pickup and drop stations'
    };
  }

  if (fromStation.toLowerCase().trim() === toStation.toLowerCase().trim()) {
    return {
      success: false,
      error: 'Pickup and drop stations cannot be the same'
    };
  }

  // Calculate distance and fee
  const distance = await getStationDistance(fromStation, toStation);
  
  if (distance === null) {
    return {
      success: false,
      error: 'Unable to calculate distance between stations. Please try different stations.'
    };
  }
  
  const feeCalculation = calculateParcelFee(weight, distance);

  if (!feeCalculation.isAllowed) {
    return {
      success: false,
      error: 'Weight exceeds maximum limit',
      requiresManualQuote: true
    };
  }

  return {
    success: true,
    fee: feeCalculation.fee,
    breakdown: {
      ...feeCalculation.breakdown,
      distance,
      totalFee: feeCalculation.fee
    }
  };
}
