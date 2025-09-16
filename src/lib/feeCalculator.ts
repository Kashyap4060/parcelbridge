/**
 * Parcel Fee Calculator Service
 * Calculates shipping fees based on distance, dimensions, and weight
 */

export interface ParcelDimensions {
  length: number; // in cm
  breadth: number; // in cm
  height: number; // in cm
  weight: number; // in kg
}

export interface FeeCalculationResult {
  baseFee: number;
  dimensionFee: number;
  weightFee: number;
  distanceFee: number;
  totalFee: number;
  estimatedDeliveryHours: number;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

export interface FeeCalculationInput {
  fromStationCode: string;
  toStationCode: string;
  dimensions: ParcelDimensions;
}

export class FeeCalculatorService {
  // Base pricing constants
  private static readonly BASE_FEE = 50; // Base handling fee in INR
  private static readonly DISTANCE_RATE_PER_KM = 2; // INR per km
  private static readonly WEIGHT_RATE_PER_KG = 10; // INR per kg
  private static readonly VOLUME_RATE_PER_CM3 = 0.001; // INR per cm³
  private static readonly AVERAGE_TRAIN_SPEED = 100; // km/h for delivery estimation
  
  // Weight and size thresholds
  private static readonly MIN_CHARGEABLE_WEIGHT = 1; // kg
  private static readonly MAX_DIMENSION = 100; // cm
  private static readonly MAX_WEIGHT = 50; // kg
  private static readonly MIN_FEE = 100; // Minimum fee in INR

  /**
   * Calculate the total fee for sending a parcel
   */
  static async calculateFee(input: FeeCalculationInput): Promise<FeeCalculationResult> {
    const { fromStationCode, toStationCode, dimensions } = input;

    // Validate input
    this.validateInput(input);

    // Get distance between stations (you'll need to import your station service)
    const distance = await this.getStationDistance(fromStationCode, toStationCode);
    if (!distance) {
      throw new Error('Unable to calculate distance between stations');
    }

    // Calculate individual fee components
    const baseFee = this.BASE_FEE;
    const distanceFee = this.calculateDistanceFee(distance);
    const weightFee = this.calculateWeightFee(dimensions.weight);
    const dimensionFee = this.calculateDimensionFee(dimensions);

    // Calculate total fee
    let totalFee = baseFee + distanceFee + weightFee + dimensionFee;
    
    // Apply minimum fee
    totalFee = Math.max(totalFee, this.MIN_FEE);

    // Round to nearest rupee
    totalFee = Math.round(totalFee);

    // Calculate estimated delivery time
    const estimatedDeliveryHours = this.calculateDeliveryTime(distance);

    // Create fee breakdown
    const breakdown = [
      { description: 'Base handling fee', amount: baseFee },
      { description: `Distance fee (${distance} km)`, amount: distanceFee },
      { description: `Weight fee (${dimensions.weight} kg)`, amount: weightFee },
      { description: 'Size and packaging fee', amount: dimensionFee }
    ];

    return {
      baseFee,
      dimensionFee,
      weightFee,
      distanceFee,
      totalFee,
      estimatedDeliveryHours,
      breakdown
    };
  }

  /**
   * Calculate distance-based fee
   */
  private static calculateDistanceFee(distanceKm: number): number {
    return Math.round(distanceKm * this.DISTANCE_RATE_PER_KM);
  }

  /**
   * Calculate weight-based fee
   */
  private static calculateWeightFee(weight: number): number {
    const chargeableWeight = Math.max(weight, this.MIN_CHARGEABLE_WEIGHT);
    return Math.round(chargeableWeight * this.WEIGHT_RATE_PER_KG);
  }

  /**
   * Calculate dimension-based fee (volumetric weight)
   */
  private static calculateDimensionFee(dimensions: ParcelDimensions): number {
    const { length, breadth, height } = dimensions;
    const volume = length * breadth * height; // cm³
    const volumetricFee = volume * this.VOLUME_RATE_PER_CM3;
    
    // Add extra fee for oversized parcels
    const maxDimension = Math.max(length, breadth, height);
    const oversizeFee = maxDimension > 50 ? 30 : 0;
    
    return Math.round(volumetricFee + oversizeFee);
  }

  /**
   * Calculate estimated delivery time
   */
  private static calculateDeliveryTime(distanceKm: number): number {
    // Base travel time + handling time at stations
    const travelTimeHours = distanceKm / this.AVERAGE_TRAIN_SPEED;
    const handlingTimeHours = 4; // Average handling time at stations
    
    return Math.round(travelTimeHours + handlingTimeHours);
  }

  /**
   * Validate calculation input
   */
  private static validateInput(input: FeeCalculationInput): void {
    const { fromStationCode, toStationCode, dimensions } = input;

    if (!fromStationCode || !toStationCode) {
      throw new Error('Both source and destination stations are required');
    }

    if (fromStationCode === toStationCode) {
      throw new Error('Source and destination stations cannot be the same');
    }

    const { length, breadth, height, weight } = dimensions;

    if (length <= 0 || breadth <= 0 || height <= 0) {
      throw new Error('All dimensions must be greater than 0');
    }

    if (weight <= 0) {
      throw new Error('Weight must be greater than 0');
    }

    if (length > this.MAX_DIMENSION || breadth > this.MAX_DIMENSION || height > this.MAX_DIMENSION) {
      throw new Error(`Maximum dimension allowed is ${this.MAX_DIMENSION} cm`);
    }

    if (weight > this.MAX_WEIGHT) {
      throw new Error(`Maximum weight allowed is ${this.MAX_WEIGHT} kg`);
    }
  }

  /**
   * Get distance between stations (integrate with station service)
   */
  private static async getStationDistance(fromCode: string, toCode: string): Promise<number | null> {
    try {
      // Import the actual station service
      const { getStationDistance } = await import('./stationService');
      return await getStationDistance(fromCode, toCode);
      
    } catch (error) {
      console.error('Error calculating station distance:', error);
      
      // Fallback to mock data for development/demo
      const mockDistances: Record<string, number> = {
        'NDLS-BCT': 1384, // New Delhi to Mumbai Central
        'BCT-NDLS': 1384,
        'NDLS-MAA': 1759, // New Delhi to Chennai
        'MAA-NDLS': 1759,
        'BCT-MAA': 1279, // Mumbai to Chennai
        'MAA-BCT': 1279,
        'NDLS-PUNE': 1238, // New Delhi to Pune
        'PUNE-NDLS': 1238,
      };
      
      const key1 = `${fromCode}-${toCode}`;
      const key2 = `${toCode}-${fromCode}`;
      
      return mockDistances[key1] || mockDistances[key2] || 500; // Default distance for demo
    }
  }

  /**
   * Format fee for display
   */
  static formatFee(amount: number): string {
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
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else {
        return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
      }
    }
  }
}

export default FeeCalculatorService;