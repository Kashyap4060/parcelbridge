/**
 * Centralized Fee Calculator Service
 * Single source of truth for all parcel fee calculations
 * 
 * Rules:
 * - Base fee: ₹50
 * - Weight: ₹2 per kg
 * - Dimensions: ₹1 per cm (length + breadth + height)
 * - Distance: ₹0.5 per km
 */

import { getStationDistance } from './stationService';

export interface ParcelDetails {
  weight: number; // in kg
  length: number; // in cm
  breadth: number; // in cm
  height: number; // in cm
  fromStationCode: string;
  toStationCode: string;
}

export interface FeeBreakdown {
  baseFee: number;
  weightFee: number;
  dimensionFee: number;
  distanceFee: number;
  totalFee: number;
  distance: number; // in km
}

export interface DetailedFeeBreakdown extends FeeBreakdown {
  breakdown: {
    label: string;
    value: string;
    amount: number;
  }[];
  estimatedDeliveryHours: number;
}

export class CentralizedFeeCalculator {
  // Pricing constants as per your specifications
  private static readonly BASE_FEE = 50; // ₹50 base fee
  private static readonly WEIGHT_RATE = 2; // ₹2 per kg
  private static readonly DIMENSION_RATE = 1; // ₹1 per cm
  private static readonly DISTANCE_RATE = 0.5; // ₹0.5 per km
  
  // Limits for validation
  private static readonly MAX_WEIGHT = 50; // kg
  private static readonly MAX_DIMENSION = 200; // cm
  private static readonly MIN_DIMENSION = 1; // cm
  private static readonly MIN_WEIGHT = 0.1; // kg

  /**
   * Calculate parcel fee with breakdown
   */
  static async calculateFee(parcel: ParcelDetails): Promise<DetailedFeeBreakdown> {
    // Validate input
    this.validateParcel(parcel);

    // Get distance between stations with fallback
    let distance = await getStationDistance(parcel.fromStationCode, parcel.toStationCode);
    if (!distance || distance <= 0) {
      console.log(`⚠️ Using fallback distance of 500km for ${parcel.fromStationCode} → ${parcel.toStationCode}`);
      distance = 500; // Fallback distance
    }

    // Calculate fee components
    const baseFee = this.BASE_FEE;
    const weightFee = Math.round(parcel.weight * this.WEIGHT_RATE);
    const dimensionFee = Math.round((parcel.length + parcel.breadth + parcel.height) * this.DIMENSION_RATE);
    const distanceFee = Math.round(distance * this.DISTANCE_RATE);
    const totalFee = baseFee + weightFee + dimensionFee + distanceFee;

    // Create detailed breakdown
    const breakdown = [
      {
        label: 'Base handling fee',
        value: 'Fixed charge',
        amount: baseFee
      },
      {
        label: 'Weight fee',
        value: `${parcel.weight} kg × ₹${this.WEIGHT_RATE}`,
        amount: weightFee
      },
      {
        label: 'Dimension fee',
        value: `${parcel.length + parcel.breadth + parcel.height} cm × ₹${this.DIMENSION_RATE}`,
        amount: dimensionFee
      },
      {
        label: 'Distance fee',
        value: `${distance} km × ₹${this.DISTANCE_RATE}`,
        amount: distanceFee
      }
    ];

    // Estimate delivery time (assuming average train speed of 80 km/h + 6 hours handling)
    const estimatedDeliveryHours = Math.round((distance / 80) + 6);

    return {
      baseFee,
      weightFee,
      dimensionFee,
      distanceFee,
      totalFee,
      distance,
      breakdown,
      estimatedDeliveryHours
    };
  }

  /**
   * Quick fee calculation without detailed breakdown
   */
  static async calculateQuickFee(parcel: ParcelDetails): Promise<FeeBreakdown> {
    const detailed = await this.calculateFee(parcel);
    return {
      baseFee: detailed.baseFee,
      weightFee: detailed.weightFee,
      dimensionFee: detailed.dimensionFee,
      distanceFee: detailed.distanceFee,
      totalFee: detailed.totalFee,
      distance: detailed.distance
    };
  }

  /**
   * Validate parcel details
   */
  private static validateParcel(parcel: ParcelDetails): void {
    const { weight, length, breadth, height, fromStationCode, toStationCode } = parcel;

    // Check required fields
    if (!fromStationCode || !toStationCode) {
      throw new Error('Both source and destination stations are required');
    }

    if (fromStationCode === toStationCode) {
      throw new Error('Source and destination stations cannot be the same');
    }

    // Validate weight
    if (weight < this.MIN_WEIGHT) {
      throw new Error(`Minimum weight is ${this.MIN_WEIGHT} kg`);
    }

    if (weight > this.MAX_WEIGHT) {
      throw new Error(`Maximum weight allowed is ${this.MAX_WEIGHT} kg`);
    }

    // Validate dimensions
    if (length < this.MIN_DIMENSION || breadth < this.MIN_DIMENSION || height < this.MIN_DIMENSION) {
      throw new Error(`All dimensions must be at least ${this.MIN_DIMENSION} cm`);
    }

    if (length > this.MAX_DIMENSION || breadth > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
      throw new Error(`Maximum dimension allowed is ${this.MAX_DIMENSION} cm`);
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format delivery time for display
   */
  static formatDeliveryTime(hours: number): string {
    if (hours < 24) {
      return `${hours} hours`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours === 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  }

  /**
   * Get pricing summary for display
   */
  static getPricingSummary(): string {
    return `Base: ₹${this.BASE_FEE} + Weight: ₹${this.WEIGHT_RATE}/kg + Size: ₹${this.DIMENSION_RATE}/cm + Distance: ₹${this.DISTANCE_RATE}/km`;
  }

  /**
   * Check if parcel can be calculated (has all required fields)
   */
  static canCalculate(parcel: Partial<ParcelDetails>): boolean {
    return !!(
      parcel.weight && 
      parcel.length && 
      parcel.breadth && 
      parcel.height && 
      parcel.fromStationCode && 
      parcel.toStationCode &&
      parcel.fromStationCode !== parcel.toStationCode
    );
  }
}

// Export for backwards compatibility and ease of use
export const calculateParcelFee = CentralizedFeeCalculator.calculateFee;
export const calculateQuickFee = CentralizedFeeCalculator.calculateQuickFee;
export const formatCurrency = CentralizedFeeCalculator.formatCurrency;
export const formatDeliveryTime = CentralizedFeeCalculator.formatDeliveryTime;
export const canCalculateFee = CentralizedFeeCalculator.canCalculate;

export default CentralizedFeeCalculator;