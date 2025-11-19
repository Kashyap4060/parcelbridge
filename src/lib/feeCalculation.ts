/**
 * Fee Calculation Service
 * Calculates delivery fees based on distance, weight, and other factors
 */

interface WeightTier {
  name: string;
  minWeight: number;
  maxWeight: number;
  baseRate: number; // Rate per km
}

interface FeeStructure {
  baseFee: number; // Minimum charge
  weightTiers: WeightTier[];
  distanceSlabs: {
    range: [number, number]; // [min, max] km
    multiplier: number;
  }[];
  additionalCharges: {
    urgentDelivery: number; // Percentage
    fragileItems: number; // Fixed amount
    insurance: number; // Percentage of declared value
  };
}

const DEFAULT_FEE_STRUCTURE: FeeStructure = {
  baseFee: 50, // ₹50 minimum charge
  weightTiers: [
    { name: 'Light (0-2kg)', minWeight: 0, maxWeight: 2, baseRate: 5 },
    { name: 'Medium (2-5kg)', minWeight: 2, maxWeight: 5, baseRate: 8 },
    { name: 'Heavy (5-10kg)', minWeight: 5, maxWeight: 10, baseRate: 12 },
    { name: 'Extra Heavy (10kg+)', minWeight: 10, maxWeight: Infinity, baseRate: 18 }
  ],
  distanceSlabs: [
    { range: [0, 100], multiplier: 1.0 },    // 0-100km: normal rate
    { range: [100, 300], multiplier: 0.8 },  // 100-300km: 20% discount
    { range: [300, 500], multiplier: 0.7 },  // 300-500km: 30% discount
    { range: [500, Infinity], multiplier: 0.6 } // 500km+: 40% discount
  ],
  additionalCharges: {
    urgentDelivery: 0.25, // 25% extra
    fragileItems: 30,     // ₹30 extra
    insurance: 0.02       // 2% of declared value
  }
};

export interface FeeCalculationInput {
  distance: number; // in km
  weight: number;   // in kg
  declaredValue?: number;
  isUrgent?: boolean;
  isFragile?: boolean;
  requiresInsurance?: boolean;
}

export interface FeeBreakdown {
  baseFee: number;
  distanceFee: number;
  distance: number;
  weight: number;
  fromStation?: string;
  toStation?: string;
  weightTier: string;
  weightRate: number;
  distanceMultiplier: number;
  additionalCharges: {
    urgent?: number;
    fragile?: number;
    insurance?: number;
  };
  subtotal: number;
  gst: number; // 18% GST
  totalAmount: number;
  currency: string;
}

class FeeCalculationService {
  private feeStructure: FeeStructure;

  constructor(customFeeStructure?: Partial<FeeStructure>) {
    this.feeStructure = {
      ...DEFAULT_FEE_STRUCTURE,
      ...customFeeStructure
    };
  }

  calculateFee(input: FeeCalculationInput): FeeBreakdown {
    // Find appropriate weight tier
    const weightTier = this.getWeightTier(input.weight);
    
    // Calculate base distance fee
    const distanceMultiplier = this.getDistanceMultiplier(input.distance);
    const distanceFee = input.distance * weightTier.baseRate * distanceMultiplier;
    
    // Calculate additional charges
    const additionalCharges: FeeBreakdown['additionalCharges'] = {};
    let additionalTotal = 0;

    if (input.isUrgent) {
      additionalCharges.urgent = (this.feeStructure.baseFee + distanceFee) * this.feeStructure.additionalCharges.urgentDelivery;
      additionalTotal += additionalCharges.urgent;
    }

    if (input.isFragile) {
      additionalCharges.fragile = this.feeStructure.additionalCharges.fragileItems;
      additionalTotal += additionalCharges.fragile;
    }

    if (input.requiresInsurance && input.declaredValue) {
      additionalCharges.insurance = input.declaredValue * this.feeStructure.additionalCharges.insurance;
      additionalTotal += additionalCharges.insurance;
    }

    // Calculate subtotal
    const subtotal = Math.max(this.feeStructure.baseFee, distanceFee) + additionalTotal;
    
    // Calculate GST (18%)
    const gst = subtotal * 0.18;
    
    // Calculate total amount
    const totalAmount = Math.round((subtotal + gst) * 100) / 100; // Round to 2 decimal places

    return {
      baseFee: this.feeStructure.baseFee,
      distanceFee: Math.round(distanceFee * 100) / 100,
      distance: input.distance,
      weight: input.weight,
      weightTier: weightTier.name,
      weightRate: weightTier.baseRate,
      distanceMultiplier,
      additionalCharges,
      subtotal: Math.round(subtotal * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      totalAmount,
      currency: 'INR'
    };
  }

  private getWeightTier(weight: number): WeightTier {
    return this.feeStructure.weightTiers.find(
      tier => weight >= tier.minWeight && weight < tier.maxWeight
    ) || this.feeStructure.weightTiers[this.feeStructure.weightTiers.length - 1];
  }

  private getDistanceMultiplier(distance: number): number {
    const slab = this.feeStructure.distanceSlabs.find(
      slab => distance >= slab.range[0] && distance < slab.range[1]
    );
    return slab?.multiplier || 1.0;
  }

  // Static method for quick fee calculation
  static calculateQuickFee(distance: number, weight: number): number {
    const service = new FeeCalculationService();
    const breakdown = service.calculateFee({ distance, weight });
    return breakdown.totalAmount;
  }

  // Format fee for display
  static formatFee(amount: number, currency = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  }

  // Get fee structure for display
  getFeeStructure(): FeeStructure {
    return { ...this.feeStructure };
  }

  // Update fee structure (admin functionality)
  updateFeeStructure(updates: Partial<FeeStructure>): void {
    this.feeStructure = {
      ...this.feeStructure,
      ...updates
    };
  }
}

export const feeCalculationService = new FeeCalculationService();
export { FeeCalculationService };

// Export the formatFee function for use in components
export const formatFee = FeeCalculationService.formatFee;

// Simplified interface for station-based calculations
export interface StationBasedFeeInput {
  fromStation: string;
  toStation: string;
  weight: number;
  isUrgent?: boolean;
  isFragile?: boolean;
  declaredValue?: number;
  requiresInsurance?: boolean;
}

// Mock function to calculate distance between stations
// In production, this would call a real distance API or use a station distance database
async function getStationDistance(fromStation: string, toStation: string): Promise<number> {
  // Mock distance calculation - replace with actual implementation
  const mockDistances: Record<string, Record<string, number>> = {
    'New Delhi': {
      'Mumbai Central': 1384,
      'Kolkata': 1472,
      'Chennai Central': 2180,
      'Bangalore City': 2150
    },
    'Mumbai Central': {
      'New Delhi': 1384,
      'Kolkata': 1968,
      'Chennai Central': 1279,
      'Bangalore City': 981
    },
    // Add more mock distances as needed
  };
  
  // Simple distance calculation based on station names
  const distance = mockDistances[fromStation]?.[toStation] || 
                   mockDistances[toStation]?.[fromStation] ||
                   Math.floor(Math.random() * 1000) + 200; // Random fallback
  
  return Promise.resolve(distance);
}

// Calculate delivery fee based on station names
export async function calculateDeliveryFee(input: StationBasedFeeInput): Promise<FeeBreakdown> {
  try {
    const distance = await getStationDistance(input.fromStation, input.toStation);
    
    const feeInput: FeeCalculationInput = {
      distance,
      weight: input.weight,
      declaredValue: input.declaredValue,
      isUrgent: input.isUrgent,
      isFragile: input.isFragile,
      requiresInsurance: input.requiresInsurance
    };
    
    const breakdown = feeCalculationService.calculateFee(feeInput);
    
    // Add station information to the breakdown
    return {
      ...breakdown,
      fromStation: input.fromStation,
      toStation: input.toStation
    };
  } catch (error) {
    console.error('Failed to calculate delivery fee:', error);
    throw new Error('Unable to calculate delivery fee. Please try again.');
  }
}