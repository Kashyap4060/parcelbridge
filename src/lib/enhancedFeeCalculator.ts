/**
 * Enhanced Fee Calculator with Comprehensive Railway Integration
 * Integrates with the comprehensive railway data management system
 */

import { 
  EnhancedTrainService, 
  EnhancedRouteService, 
  EnhancedDistanceService,
  TrainSearchResult 
} from './enhancedRailwayService';

export interface EnhancedParcelDimensions {
  length: number; // in cm
  breadth: number; // in cm  
  height: number; // in cm
  weight: number; // in kg
}

export interface EnhancedFeeCalculationInput {
  fromStationCode: string;
  toStationCode: string;
  dimensions: EnhancedParcelDimensions;
  
  // Enhanced options
  preferredTrainType?: string; // Express, Passenger, Superfast
  deliveryUrgency?: 'standard' | 'express' | 'priority';
  scheduledPickupTime?: string; // HH:MM format
  deliveryDate?: Date;
  specialHandling?: string[]; // ['fragile', 'perishable', 'valuable']
}

export interface EnhancedFeeCalculationResult {
  // Basic fees
  baseFee: number;
  dimensionFee: number;
  weightFee: number;
  distanceFee: number;
  
  // Enhanced fees
  trainTypeFee: number;
  urgencyFee: number;
  handlingFee: number;
  timingFee: number; // Peak hour surcharge
  
  // Total and breakdown
  totalFee: number;
  estimatedDeliveryHours: number;
  
  // Enhanced delivery information
  recommendedTrains: TrainSearchResult[];
  deliveryOptions: DeliveryOption[];
  
  breakdown: Array<{
    description: string;
    amount: number;
    category: 'base' | 'premium' | 'service' | 'special';
  }>;
  
  // Risk and insurance
  insuranceOptions?: InsuranceOption[];
  riskAssessment?: RiskAssessment;
}

export interface DeliveryOption {
  type: 'standard' | 'express' | 'priority';
  trains: TrainSearchResult[];
  estimatedHours: number;
  additionalCost: number;
  description: string;
}

export interface InsuranceOption {
  coverage: number;
  premium: number;
  description: string;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export class EnhancedFeeCalculatorService {
  // Enhanced pricing constants
  private static readonly PRICING_CONFIG = {
    // Base rates
    BASE_FEE: 50,
    DISTANCE_RATE_PER_KM: 2,
    WEIGHT_RATE_PER_KG: 10,
    VOLUME_RATE_PER_CM3: 0.001,
    
    // Train type multipliers
    TRAIN_TYPE_MULTIPLIERS: {
      'Passenger': 1.0,
      'Express': 1.2,
      'Superfast': 1.4,
      'Rajdhani': 1.6,
      'Shatabdi': 1.5,
      'Duronto': 1.3
    },
    
    // Urgency multipliers
    URGENCY_MULTIPLIERS: {
      'standard': 1.0,
      'express': 1.5,
      'priority': 2.0
    },
    
    // Special handling fees
    SPECIAL_HANDLING: {
      'fragile': 25,
      'perishable': 40,
      'valuable': 50,
      'liquid': 30,
      'documents': 15
    },
    
    // Time-based pricing
    PEAK_HOURS: [7, 8, 9, 17, 18, 19], // 7-9 AM, 5-7 PM
    PEAK_HOUR_MULTIPLIER: 1.2,
    
    // Insurance rates (per ₹1000 of declared value)
    INSURANCE_RATE: 2.5,
    
    // Speed estimates (km/h)
    TRAIN_SPEEDS: {
      'Passenger': 50,
      'Express': 80,
      'Superfast': 100,
      'Rajdhani': 120,
      'Shatabdi': 110,
      'Duronto': 105
    }
  };

  /**
   * Enhanced fee calculation with comprehensive railway integration
   */
  static async calculateEnhancedFee(input: EnhancedFeeCalculationInput): Promise<EnhancedFeeCalculationResult> {
    try {
      // 1. Get journey plan with multiple options
      const journeyPlan = await EnhancedRouteService.planJourney({
        fromStation: input.fromStationCode,
        toStation: input.toStationCode,
        departureDate: input.deliveryDate || new Date()
      });

      if (!journeyPlan) {
        throw new Error('No routes found between specified stations');
      }

      // 2. Get distance options
      const distanceInfo = await EnhancedDistanceService.calculateDistanceWithOptions(
        input.fromStationCode,
        input.toStationCode
      );

      const distance = distanceInfo?.shortest || journeyPlan.total_distance;

      // 3. Calculate base fees
      const baseFee = this.PRICING_CONFIG.BASE_FEE;
      const distanceFee = distance * this.PRICING_CONFIG.DISTANCE_RATE_PER_KM;
      const weightFee = input.dimensions.weight * this.PRICING_CONFIG.WEIGHT_RATE_PER_KG;
      
      const volume = input.dimensions.length * input.dimensions.breadth * input.dimensions.height;
      const dimensionFee = volume * this.PRICING_CONFIG.VOLUME_RATE_PER_CM3;

      // 4. Calculate enhanced fees
      const trainTypeFee = this.calculateTrainTypeFee(journeyPlan.trains, input.preferredTrainType);
      const urgencyFee = this.calculateUrgencyFee(baseFee + distanceFee, input.deliveryUrgency);
      const handlingFee = this.calculateHandlingFee(input.specialHandling);
      const timingFee = this.calculateTimingFee(baseFee, input.scheduledPickupTime);

      // 5. Calculate total
      const subtotal = baseFee + distanceFee + weightFee + dimensionFee + trainTypeFee + urgencyFee + handlingFee + timingFee;
      const totalFee = Math.round(subtotal * 100) / 100;

      // 6. Generate delivery options
      const deliveryOptions = this.generateDeliveryOptions(journeyPlan.trains, distance);

      // 7. Estimate delivery time
      const estimatedDeliveryHours = this.calculateDeliveryEstimate(
        journeyPlan.recommended_option,
        input.deliveryUrgency,
        distance
      );

      // 8. Create breakdown
      const breakdown = this.createFeeBreakdown({
        baseFee,
        distanceFee,
        weightFee,
        dimensionFee,
        trainTypeFee,
        urgencyFee,
        handlingFee,
        timingFee
      });

      // 9. Generate insurance options
      const insuranceOptions = this.generateInsuranceOptions(totalFee);

      // 10. Risk assessment
      const riskAssessment = this.assessRisk(input, distance);

      return {
        baseFee,
        dimensionFee,
        weightFee,
        distanceFee,
        trainTypeFee,
        urgencyFee,
        handlingFee,
        timingFee,
        totalFee,
        estimatedDeliveryHours,
        recommendedTrains: journeyPlan.trains.slice(0, 3), // Top 3 options
        deliveryOptions,
        breakdown,
        insuranceOptions,
        riskAssessment
      };

    } catch (error) {
      console.error('Error in enhanced fee calculation:', error);
      throw error;
    }
  }

  /**
   * Calculate train type fee based on available trains
   */
  private static calculateTrainTypeFee(trains: TrainSearchResult[], preferredType?: string): number {
    if (!preferredType || trains.length === 0) return 0;

    const multiplier = this.PRICING_CONFIG.TRAIN_TYPE_MULTIPLIERS[preferredType as keyof typeof this.PRICING_CONFIG.TRAIN_TYPE_MULTIPLIERS] || 1.0;
    const baseFee = this.PRICING_CONFIG.BASE_FEE;
    
    return (multiplier - 1.0) * baseFee;
  }

  /**
   * Calculate urgency fee
   */
  private static calculateUrgencyFee(baseAmount: number, urgency?: string): number {
    if (!urgency || urgency === 'standard') return 0;

    const multiplier = this.PRICING_CONFIG.URGENCY_MULTIPLIERS[urgency as keyof typeof this.PRICING_CONFIG.URGENCY_MULTIPLIERS] || 1.0;
    return (multiplier - 1.0) * baseAmount;
  }

  /**
   * Calculate special handling fees
   */
  private static calculateHandlingFee(specialHandling?: string[]): number {
    if (!specialHandling || specialHandling.length === 0) return 0;

    return specialHandling.reduce((total, handling) => {
      return total + (this.PRICING_CONFIG.SPECIAL_HANDLING[handling as keyof typeof this.PRICING_CONFIG.SPECIAL_HANDLING] || 0);
    }, 0);
  }

  /**
   * Calculate timing-based fee (peak hour surcharge)
   */
  private static calculateTimingFee(baseFee: number, pickupTime?: string): number {
    if (!pickupTime) return 0;

    const hour = parseInt(pickupTime.split(':')[0]);
    const isPeakHour = this.PRICING_CONFIG.PEAK_HOURS.includes(hour);

    if (isPeakHour) {
      return (this.PRICING_CONFIG.PEAK_HOUR_MULTIPLIER - 1.0) * baseFee;
    }

    return 0;
  }

  /**
   * Generate delivery options
   */
  private static generateDeliveryOptions(trains: TrainSearchResult[], distance: number): DeliveryOption[] {
    const options: DeliveryOption[] = [];

    // Standard delivery
    const standardTrains = trains.filter(t => !t.train_type?.includes('Express'));
    if (standardTrains.length > 0) {
      options.push({
        type: 'standard',
        trains: standardTrains.slice(0, 2),
        estimatedHours: this.calculateTravelTime(standardTrains[0], distance, 'standard'),
        additionalCost: 0,
        description: 'Regular delivery via passenger trains'
      });
    }

    // Express delivery
    const expressTrains = trains.filter(t => t.train_type?.includes('Express'));
    if (expressTrains.length > 0) {
      options.push({
        type: 'express',
        trains: expressTrains.slice(0, 2),
        estimatedHours: this.calculateTravelTime(expressTrains[0], distance, 'express'),
        additionalCost: 100,
        description: 'Faster delivery via express trains'
      });
    }

    // Priority delivery
    const priorityTrains = trains.filter(t => 
      t.train_type?.includes('Superfast') || 
      t.train_type?.includes('Rajdhani') ||
      t.train_type?.includes('Shatabdi')
    );
    if (priorityTrains.length > 0) {
      options.push({
        type: 'priority',
        trains: priorityTrains.slice(0, 2),
        estimatedHours: this.calculateTravelTime(priorityTrains[0], distance, 'priority'),
        additionalCost: 250,
        description: 'Fastest delivery via premium trains'
      });
    }

    return options;
  }

  /**
   * Calculate delivery estimate
   */
  private static calculateDeliveryEstimate(
    train: TrainSearchResult, 
    urgency?: string, 
    distance?: number
  ): number {
    const baseSpeed = this.PRICING_CONFIG.TRAIN_SPEEDS[train.train_type as keyof typeof this.PRICING_CONFIG.TRAIN_SPEEDS] || 80;
    const travelHours = distance ? (distance / baseSpeed) : 
      this.parseDurationToHours(train.journey_duration);

    // Add handling time based on urgency
    const handlingHours = urgency === 'priority' ? 2 : urgency === 'express' ? 4 : 6;

    return Math.ceil(travelHours + handlingHours);
  }

  /**
   * Calculate travel time for delivery options
   */
  private static calculateTravelTime(train: TrainSearchResult, distance: number, type: string): number {
    const speedMultipliers: Record<string, number> = {
      'standard': 0.8,
      'express': 1.0,
      'priority': 1.2
    };

    const baseSpeed = this.PRICING_CONFIG.TRAIN_SPEEDS[train.train_type as keyof typeof this.PRICING_CONFIG.TRAIN_SPEEDS] || 80;
    const adjustedSpeed = baseSpeed * (speedMultipliers[type] || 1.0);
    
    return Math.ceil(distance / adjustedSpeed) + (type === 'priority' ? 2 : type === 'express' ? 4 : 6);
  }

  /**
   * Create detailed fee breakdown
   */
  private static createFeeBreakdown(fees: {
    baseFee: number;
    distanceFee: number;
    weightFee: number;
    dimensionFee: number;
    trainTypeFee: number;
    urgencyFee: number;
    handlingFee: number;
    timingFee: number;
  }) {
    const breakdown = [];

    if (fees.baseFee > 0) {
      breakdown.push({
        description: 'Base handling fee',
        amount: fees.baseFee,
        category: 'base' as const
      });
    }

    if (fees.distanceFee > 0) {
      breakdown.push({
        description: 'Distance-based fee',
        amount: fees.distanceFee,
        category: 'base' as const
      });
    }

    if (fees.weightFee > 0) {
      breakdown.push({
        description: 'Weight-based fee',
        amount: fees.weightFee,
        category: 'base' as const
      });
    }

    if (fees.dimensionFee > 0) {
      breakdown.push({
        description: 'Volume-based fee',
        amount: fees.dimensionFee,
        category: 'base' as const
      });
    }

    if (fees.trainTypeFee > 0) {
      breakdown.push({
        description: 'Premium train service',
        amount: fees.trainTypeFee,
        category: 'premium' as const
      });
    }

    if (fees.urgencyFee > 0) {
      breakdown.push({
        description: 'Express delivery surcharge',
        amount: fees.urgencyFee,
        category: 'service' as const
      });
    }

    if (fees.handlingFee > 0) {
      breakdown.push({
        description: 'Special handling fee',
        amount: fees.handlingFee,
        category: 'special' as const
      });
    }

    if (fees.timingFee > 0) {
      breakdown.push({
        description: 'Peak hour surcharge',
        amount: fees.timingFee,
        category: 'service' as const
      });
    }

    return breakdown;
  }

  /**
   * Generate insurance options
   */
  private static generateInsuranceOptions(totalFee: number): InsuranceOption[] {
    const baseValue = totalFee * 10; // Assume parcel value is 10x shipping cost

    return [
      {
        coverage: baseValue,
        premium: (baseValue / 1000) * this.PRICING_CONFIG.INSURANCE_RATE,
        description: 'Basic coverage for loss or damage'
      },
      {
        coverage: baseValue * 2,
        premium: (baseValue * 2 / 1000) * this.PRICING_CONFIG.INSURANCE_RATE * 1.2,
        description: 'Enhanced coverage with expedited claims'
      },
      {
        coverage: baseValue * 5,
        premium: (baseValue * 5 / 1000) * this.PRICING_CONFIG.INSURANCE_RATE * 1.5,
        description: 'Premium coverage with full replacement value'
      }
    ];
  }

  /**
   * Assess delivery risk
   */
  private static assessRisk(input: EnhancedFeeCalculationInput, distance: number): RiskAssessment {
    const factors = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Distance risk
    if (distance > 1500) {
      factors.push('Long distance delivery');
      riskLevel = 'medium';
    }

    // Special handling risk
    if (input.specialHandling?.includes('fragile')) {
      factors.push('Fragile items require careful handling');
      riskLevel = 'medium';
    }

    if (input.specialHandling?.includes('perishable')) {
      factors.push('Perishable goods - time sensitive');
      riskLevel = 'high';
    }

    if (input.specialHandling?.includes('valuable')) {
      factors.push('High-value items - security risk');
      riskLevel = 'high';
    }

    // Weight and size risk
    if (input.dimensions.weight > 20) {
      factors.push('Heavy package - handling complexity');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    const volume = input.dimensions.length * input.dimensions.breadth * input.dimensions.height;
    if (volume > 100000) { // 100L
      factors.push('Large package - space constraints');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Generate recommendations
    const recommendations = [];
    if (riskLevel === 'high') {
      recommendations.push('Consider insurance coverage');
      recommendations.push('Use priority delivery for valuable items');
    }
    if (factors.some(f => f.includes('fragile'))) {
      recommendations.push('Request special fragile handling');
    }
    if (factors.some(f => f.includes('perishable'))) {
      recommendations.push('Use express delivery to minimize transit time');
    }

    return {
      riskLevel,
      factors: factors.length > 0 ? factors : ['Standard delivery conditions'],
      recommendations: recommendations.length > 0 ? recommendations : ['Standard handling recommended']
    };
  }

  /**
   * Parse duration string to hours
   */
  private static parseDurationToHours(duration: string): number {
    // Parse PostgreSQL interval format (e.g., "05:30:00")
    const parts = duration.split(':');
    if (parts.length >= 2) {
      return parseInt(parts[0]) + parseInt(parts[1]) / 60;
    }
    return 0;
  }

  /**
   * Validate input parameters
   */
  static validateInput(input: EnhancedFeeCalculationInput): string[] {
    const errors = [];

    if (!input.fromStationCode || input.fromStationCode.length === 0) {
      errors.push('From station is required');
    }

    if (!input.toStationCode || input.toStationCode.length === 0) {
      errors.push('To station is required');
    }

    if (input.fromStationCode === input.toStationCode) {
      errors.push('From and to stations must be different');
    }

    if (input.dimensions.length <= 0) {
      errors.push('Length must be greater than 0');
    }

    if (input.dimensions.breadth <= 0) {
      errors.push('Breadth must be greater than 0');
    }

    if (input.dimensions.height <= 0) {
      errors.push('Height must be greater than 0');
    }

    if (input.dimensions.weight <= 0) {
      errors.push('Weight must be greater than 0');
    }

    // Size and weight limits
    if (input.dimensions.weight > 50) {
      errors.push('Maximum weight is 50kg');
    }

    const volume = input.dimensions.length * input.dimensions.breadth * input.dimensions.height;
    if (volume > 1000000) { // 1 cubic meter
      errors.push('Maximum volume is 1 cubic meter');
    }

    return errors;
  }
}