/**
 * Automated Package Status Update System
 * Phase 2: Intelligent status progression based on train progress and carrier actions
 */

import { RealTimeTrackingService } from './realTimeTrackingService';
import { EnhancedJourneyVerificationService } from './enhancedJourneyVerificationService';
import { supabase } from './supabase';
import type { 
  PackageStatus, 
  PackageTrackingData,
  StatusUpdateRule,
  StatusTransition,
  AutomatedStatusUpdate 
} from '../types/tracking';

export class PackageStatusUpdateService {
  private trackingService: RealTimeTrackingService;
  private journeyService: EnhancedJourneyVerificationService;
  private statusRules: StatusUpdateRule[];

  constructor() {
    this.trackingService = new RealTimeTrackingService();
    this.journeyService = new EnhancedJourneyVerificationService();
    this.statusRules = this.initializeStatusRules();
  }

  /**
   * Initialize status update rules and conditions
   */
  private initializeStatusRules(): StatusUpdateRule[] {
    return [
      {
        id: 'train_departure',
        fromStatus: 'accepted',
        toStatus: 'waiting_for_departure',
        condition: 'train_not_started',
        priority: 1,
        description: 'Update to waiting when train hasn\'t departed yet'
      },
      {
        id: 'pickup_available',
        fromStatus: 'waiting_for_departure',
        toStatus: 'pickup_available',
        condition: 'carrier_at_pickup_station',
        priority: 2,
        description: 'Carrier has reached pickup station'
      },
      {
        id: 'package_picked_up',
        fromStatus: 'pickup_available',
        toStatus: 'picked_up',
        condition: 'manual_confirmation_required',
        priority: 3,
        description: 'Package picked up by carrier (manual confirmation)'
      },
      {
        id: 'in_transit',
        fromStatus: 'picked_up',
        toStatus: 'in_transit',
        condition: 'train_departed_pickup',
        priority: 4,
        description: 'Train has departed from pickup station'
      },
      {
        id: 'approaching_destination',
        fromStatus: 'in_transit',
        toStatus: 'approaching_destination',
        condition: 'near_destination_station',
        priority: 5,
        description: 'Train approaching destination (within 2 stations)'
      },
      {
        id: 'arrived_at_destination',
        fromStatus: 'approaching_destination',
        toStatus: 'arrived_at_destination',
        condition: 'train_at_destination',
        priority: 6,
        description: 'Train has arrived at destination station'
      },
      {
        id: 'out_for_delivery',
        fromStatus: 'arrived_at_destination',
        toStatus: 'out_for_delivery',
        condition: 'carrier_location_moving',
        priority: 7,
        description: 'Carrier is moving towards delivery location'
      },
      {
        id: 'delivered',
        fromStatus: 'out_for_delivery',
        toStatus: 'delivered',
        condition: 'manual_confirmation_required',
        priority: 8,
        description: 'Package delivered (manual confirmation with OTP)'
      }
    ];
  }

  /**
   * Process automated status updates for all active packages
   */
  async processAllPackageUpdates(): Promise<void> {
    console.log('🔄 Processing automated status updates for all packages...');

    try {
      // Get all packages that are eligible for automated updates
      const activePackages = await this.getActivePackages();
      
      console.log(`📦 Found ${activePackages.length} active packages to process`);

      // Process each package
      for (const packageData of activePackages) {
        await this.processPackageStatusUpdate(packageData.id);
        
        // Add small delay to prevent API rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('✅ Completed processing all package updates');
    } catch (error) {
      console.error('❌ Error processing package updates:', error);
    }
  }

  /**
   * Process status update for a specific package
   */
  async processPackageStatusUpdate(packageId: string): Promise<AutomatedStatusUpdate | null> {
    try {
      // Get current package data
      const packageData = await this.trackingService.getPackageTrackingData(packageId);
      if (!packageData) {
        return null;
      }

      // Get current tracking status
      const currentTracking = await this.trackingService.getCurrentTrackingStatus(packageId);
      
      // Determine if status should be updated
      const statusTransition = await this.evaluateStatusTransition(packageData, currentTracking);
      
      if (!statusTransition) {
        return null;
      }

      // Apply status update
      const updateResult = await this.applyStatusUpdate(packageId, statusTransition);
      
      if (updateResult.success) {
        console.log(`📈 Updated package ${packageId}: ${statusTransition.fromStatus} → ${statusTransition.toStatus}`);
        
        // Log the automated update
        await this.logAutomatedUpdate(packageId, statusTransition, updateResult);
        
        // Trigger notifications if needed
        await this.triggerStatusChangeNotifications(packageId, statusTransition);
      }

      return updateResult;

    } catch (error) {
      console.error(`Failed to process status update for ${packageId}:`, error);
      return null;
    }
  }

  /**
   * Evaluate if a package status should be updated
   */
  private async evaluateStatusTransition(
    packageData: PackageTrackingData,
    currentTracking: any
  ): Promise<StatusTransition | null> {
    const currentStatus = packageData.status as PackageStatus;
    
    // Find applicable rules for current status
    const applicableRules = this.statusRules.filter(rule => 
      rule.fromStatus === currentStatus
    ).sort((a, b) => a.priority - b.priority);

    // Evaluate each rule
    for (const rule of applicableRules) {
      const conditionMet = await this.evaluateCondition(
        rule.condition,
        packageData,
        currentTracking
      );

      if (conditionMet) {
        return {
          packageId: packageData.id,
          fromStatus: rule.fromStatus,
          toStatus: rule.toStatus,
          ruleId: rule.id,
          reason: rule.description,
          timestamp: new Date().toISOString(),
          automated: true
        };
      }
    }

    return null;
  }

  /**
   * Evaluate specific conditions for status transitions
   */
  private async evaluateCondition(
    condition: string,
    packageData: PackageTrackingData,
    currentTracking: any
  ): Promise<boolean> {
    switch (condition) {
      case 'train_not_started':
        return await this.checkTrainNotStarted(packageData);
      
      case 'carrier_at_pickup_station':
        return await this.checkCarrierAtPickupStation(packageData);
      
      case 'train_departed_pickup':
        return await this.checkTrainDepartedPickup(packageData);
      
      case 'near_destination_station':
        return await this.checkNearDestination(packageData);
      
      case 'train_at_destination':
        return await this.checkTrainAtDestination(packageData);
      
      case 'carrier_location_moving':
        return await this.checkCarrierMoving(packageData);
      
      case 'manual_confirmation_required':
        // These require manual intervention, so return false for automation
        return false;
      
      default:
        console.warn(`Unknown condition: ${condition}`);
        return false;
    }
  }

  /**
   * Check if train has not started yet
   */
  private async checkTrainNotStarted(packageData: PackageTrackingData): Promise<boolean> {
    if (!packageData.journey) return false;

    const journeyData = await this.journeyService.getRealTimeJourneyData(packageData.journey.id);
    return journeyData?.current_status && !journeyData.current_status.train_started;
  }

  /**
   * Check if carrier is at pickup station
   */
  private async checkCarrierAtPickupStation(packageData: PackageTrackingData): Promise<boolean> {
    if (!packageData.journey) return false;

    const journeyData = await this.journeyService.getRealTimeJourneyData(packageData.journey.id);
    if (!journeyData?.current_status) return false;

    // Check if train is at pickup station or approaching
    const currentStation = journeyData.current_status.current_station;
    const pickupStation = packageData.pickup_station;

    return currentStation === pickupStation || journeyData.next_station === pickupStation;
  }

  /**
   * Check if train has departed from pickup station
   */
  private async checkTrainDepartedPickup(packageData: PackageTrackingData): Promise<boolean> {
    if (!packageData.journey) return false;

    const journeyData = await this.journeyService.getRealTimeJourneyData(packageData.journey.id);
    if (!journeyData?.current_status) return false;

    // Check if train has passed pickup station
    const currentStation = journeyData.current_status.current_station;
    const pickupStation = packageData.pickup_station;

    // This would require station sequence data to determine if train has passed pickup
    // For now, use a simple check
    return currentStation !== pickupStation && journeyData.current_status.train_started;
  }

  /**
   * Check if train is near destination (within 2 stations)
   */
  private async checkNearDestination(packageData: PackageTrackingData): Promise<boolean> {
    if (!packageData.journey) return false;

    const journeyData = await this.journeyService.getRealTimeJourneyData(packageData.journey.id);
    if (!journeyData?.current_status) return false;

    // Check if approaching destination
    const nextStation = journeyData.next_station;
    const destinationStation = packageData.delivery_station;

    return nextStation === destinationStation;
  }

  /**
   * Check if train has arrived at destination station
   */
  private async checkTrainAtDestination(packageData: PackageTrackingData): Promise<boolean> {
    if (!packageData.journey) return false;

    const journeyData = await this.journeyService.getRealTimeJourneyData(packageData.journey.id);
    if (!journeyData?.current_status) return false;

    const currentStation = journeyData.current_status.current_station;
    const destinationStation = packageData.delivery_station;

    return currentStation === destinationStation;
  }

  /**
   * Check if carrier is moving (indicating out for delivery)
   */
  private async checkCarrierMoving(packageData: PackageTrackingData): Promise<boolean> {
    // Get recent carrier location updates
    const { data: recentLocations } = await supabase
      .from('carrier_locations')
      .select('*')
      .eq('carrier_id', packageData.carrier.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentLocations || recentLocations.length < 2) {
      return false;
    }

    // Calculate if carrier has been moving
    const totalDistance = this.calculateMovementDistance(recentLocations);
    
    // If moved more than 100 meters in recent updates, consider as moving
    return totalDistance > 0.1; // 100 meters
  }

  /**
   * Apply status update to package
   */
  private async applyStatusUpdate(
    packageId: string,
    transition: StatusTransition
  ): Promise<AutomatedStatusUpdate> {
    try {
      // Update package status in database
      const { error: updateError } = await supabase
        .from('parcel_requests')
        .update({
          status: transition.toStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (updateError) {
        throw updateError;
      }

      // Update tracking record
      await supabase
        .from('package_tracking')
        .update({
          current_package_status: transition.toStatus,
          updated_at: transition.timestamp
        })
        .eq('package_id', packageId);

      // Create tracking event
      await supabase
        .from('tracking_events')
        .insert({
          package_id: packageId,
          event_type: 'status_update',
          package_status: transition.toStatus,
          description: `Automated: ${transition.reason}`,
          created_at: transition.timestamp
        });

      return {
        packageId,
        transition,
        success: true,
        timestamp: transition.timestamp
      };

    } catch (error) {
      console.error('Failed to apply status update:', error);
      
      return {
        packageId,
        transition,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: transition.timestamp
      };
    }
  }

  /**
   * Get all packages eligible for automated updates
   */
  private async getActivePackages(): Promise<PackageTrackingData[]> {
    const { data, error } = await supabase
      .from('parcel_requests')
      .select(`
        *,
        carrier:profiles!parcel_requests_carrier_id_fkey (
          id,
          first_name,
          last_name,
          phone
        ),
        journey:carrier_journeys!parcel_requests_journey_id_fkey (
          id,
          pnr_number,
          train_number,
          from_station_code,
          to_station_code,
          departure_date,
          departure_time,
          arrival_time,
          journey_status
        )
      `)
      .in('status', [
        'accepted',
        'waiting_for_departure',
        'pickup_available',
        'picked_up',
        'in_transit',
        'approaching_destination',
        'arrived_at_destination',
        'out_for_delivery'
      ])
      .not('journey_id', 'is', null);

    return (data || []) as PackageTrackingData[];
  }

  /**
   * Calculate movement distance from location points
   */
  private calculateMovementDistance(locations: any[]): number {
    if (locations.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      const distance = this.calculateHaversineDistance(
        locations[i-1].latitude,
        locations[i-1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in kilometers
  }

  /**
   * Log automated update for audit trail
   */
  private async logAutomatedUpdate(
    packageId: string,
    transition: StatusTransition,
    result: AutomatedStatusUpdate
  ): Promise<void> {
    try {
      await supabase
        .from('automated_status_logs')
        .insert({
          package_id: packageId,
          rule_id: transition.ruleId,
          from_status: transition.fromStatus,
          to_status: transition.toStatus,
          success: result.success,
          error_message: result.error,
          created_at: transition.timestamp
        });
    } catch (error) {
      console.error('Failed to log automated update:', error);
    }
  }

  /**
   * Trigger notifications for status changes
   */
  private async triggerStatusChangeNotifications(
    packageId: string,
    transition: StatusTransition
  ): Promise<void> {
    // TODO: Integrate with notification service
    console.log(`📢 Notification triggered for package ${packageId}: ${transition.toStatus}`);
  }

  /**
   * Manual status update (for pickup/delivery confirmations)
   */
  async manualStatusUpdate(
    packageId: string,
    newStatus: PackageStatus,
    userId: string,
    otpCode?: string
  ): Promise<boolean> {
    try {
      // Verify OTP if provided
      if (otpCode && !await this.verifyOTP(packageId, otpCode)) {
        console.error('Invalid OTP for manual status update');
        return false;
      }

      // Apply manual status update
      const transition: StatusTransition = {
        packageId,
        fromStatus: 'unknown' as PackageStatus, // Will be fetched
        toStatus: newStatus,
        ruleId: 'manual_update',
        reason: `Manual update by user ${userId}`,
        timestamp: new Date().toISOString(),
        automated: false
      };

      const result = await this.applyStatusUpdate(packageId, transition);
      return result.success;

    } catch (error) {
      console.error('Manual status update failed:', error);
      return false;
    }
  }

  /**
   * Verify OTP for secure status updates
   */
  private async verifyOTP(packageId: string, otpCode: string): Promise<boolean> {
    // TODO: Implement OTP verification logic
    return true; // Placeholder
  }
}

export default PackageStatusUpdateService;