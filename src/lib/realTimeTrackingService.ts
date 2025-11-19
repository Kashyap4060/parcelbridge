/**
 * Real-Time Tracking Service
 * Phase 2: Combines Railway MCP live status with carrier location for comprehensive package tracking
 */

import { RailwayMCPService } from './railwayMCPService';
import { supabase as supabaseClient } from '@/lib/supabase';
import type { 
  PackageTrackingData, 
  TrainStatus, 
  CarrierLocation, 
  TrackingEvent,
  PackageStatus,
  TrackingUpdate 
} from '@/types/tracking';

export class RealTimeTrackingService {
  private railwayMCP: RailwayMCPService;
  private supabase;
  private trackingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.railwayMCP = new RailwayMCPService();
    this.supabase = supabaseClient;
  }

  /**
   * Start real-time tracking for a package
   */
  async startPackageTracking(packageId: string): Promise<void> {
    console.log(`🚀 Starting real-time tracking for package: ${packageId}`);

    try {
      // Get package details with carrier journey info
      const packageData = await this.getPackageTrackingData(packageId);
      if (!packageData) {
        throw new Error('Package not found or incomplete data');
      }

      // Initialize tracking record
      await this.initializeTracking(packageData);

      // Start periodic status updates (every 2 minutes for active journeys)
      const interval = setInterval(async () => {
        await this.updatePackageTracking(packageId);
      }, 2 * 60 * 1000);

      this.trackingIntervals.set(packageId, interval);
      
      console.log(`✅ Real-time tracking started for package: ${packageId}`);
    } catch (error) {
      console.error(`❌ Failed to start tracking for ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Stop real-time tracking for a package
   */
  async stopPackageTracking(packageId: string): Promise<void> {
    const interval = this.trackingIntervals.get(packageId);
    if (interval) {
      clearInterval(interval);
      this.trackingIntervals.delete(packageId);
      console.log(`🛑 Stopped tracking for package: ${packageId}`);
    }

    // Mark tracking as completed
    await this.supabase
      .from('package_tracking')
      .update({ 
        tracking_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('package_id', packageId);
  }

  /**
   * Get comprehensive tracking data for a package
   */
  async getPackageTrackingData(packageId: string): Promise<PackageTrackingData | null> {
    const { data, error } = await this.supabase
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
      .eq('id', packageId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch package data:', error);
      return null;
    }

    return data as PackageTrackingData;
  }

  /**
   * Update package tracking with latest train status and carrier location
   */
  async updatePackageTracking(packageId: string): Promise<TrackingUpdate | null> {
    try {
      const packageData = await this.getPackageTrackingData(packageId);
      if (!packageData || !packageData.journey) {
        return null;
      }

      const { journey } = packageData;
      
      // Get live train status from Railway MCP
      const trainStatus = await this.getLiveTrainStatus(
        journey.train_number,
        new Date(journey.departure_date)
      );

      // Get carrier location (if available)
      const carrierLocation = await this.getCarrierLocation(packageData.carrier.id);

      // Determine current package status based on train progress
      const packageStatus = this.determinePackageStatus(
        packageData,
        trainStatus,
        carrierLocation
      );

      // Create tracking update
      const trackingUpdate: TrackingUpdate = {
        package_id: packageId,
        timestamp: new Date().toISOString(),
        train_status: trainStatus,
        carrier_location: carrierLocation,
        package_status: packageStatus,
        estimated_arrival: this.calculateEstimatedArrival(trainStatus, journey),
        delay_minutes: trainStatus?.delay_minutes || 0
      };

      // Save tracking update to database
      await this.saveTrackingUpdate(trackingUpdate);

      // Check if status changed and trigger notifications
      await this.checkStatusChanges(packageId, packageStatus);

      console.log(`📍 Updated tracking for package ${packageId}: ${packageStatus}`);
      return trackingUpdate;

    } catch (error) {
      console.error(`Failed to update tracking for ${packageId}:`, error);
      return null;
    }
  }

  /**
   * Get live train status using Railway MCP
   */
  private async getLiveTrainStatus(trainNumber: string, date: Date): Promise<TrainStatus | null> {
    try {
      const liveStatus = await this.railwayMCP.getLiveTrainStatus(trainNumber, date);
      
      if (!liveStatus) {
        return null;
      }

      return {
        train_number: trainNumber,
        current_station: liveStatus.current_station?.code || '',
        current_station_name: liveStatus.current_station?.name || '',
        next_station: liveStatus.next_station?.code || '',
        next_station_name: liveStatus.next_station?.name || '',
        delay_minutes: liveStatus.delay || 0,
        estimated_arrival: liveStatus.eta,
        train_started: liveStatus.train_started || false,
        train_terminated: liveStatus.train_terminated || false,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get live train status:', error);
      return null;
    }
  }

  /**
   * Get carrier's current location (if location sharing is enabled)
   */
  private async getCarrierLocation(carrierId: string): Promise<CarrierLocation | null> {
    try {
      const { data, error } = await this.supabase
        .from('carrier_locations')
        .select('*')
        .eq('carrier_id', carrierId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        carrier_id: carrierId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.updated_at,
        is_active: data.is_active
      };
    } catch (error) {
      console.error('Failed to get carrier location:', error);
      return null;
    }
  }

  /**
   * Determine package status based on train progress and carrier location
   */
  private determinePackageStatus(
    packageData: PackageTrackingData,
    trainStatus: TrainStatus | null,
    carrierLocation: CarrierLocation | null
  ): PackageStatus {
    const { journey, status: currentStatus } = packageData;

    // If package is already delivered, no change
    if (currentStatus === 'delivered') {
      return 'delivered';
    }

    // If train hasn't started yet
    if (trainStatus && !trainStatus.train_started) {
      return 'waiting_for_departure';
    }

    // If train has terminated at destination
    if (trainStatus && trainStatus.train_terminated) {
      return 'arrived_at_destination';
    }

    // If train is running and current station matches pickup location
    if (trainStatus && trainStatus.current_station === journey.from_station_code) {
      return 'pickup_available';
    }

    // If train is running and approaching destination (within 2 stations)
    if (trainStatus && this.isApproachingDestination(trainStatus, journey.to_station_code)) {
      return 'approaching_destination';
    }

    // If train is in transit
    if (trainStatus && trainStatus.train_started && !trainStatus.train_terminated) {
      return 'in_transit';
    }

    // Default to current status
    return currentStatus as PackageStatus;
  }

  /**
   * Check if train is approaching destination (within 2 stations)
   */
  private isApproachingDestination(trainStatus: TrainStatus, destinationCode: string): boolean {
    // This would require station sequence data from Railway MCP
    // For now, we'll use a simple check based on next station
    return trainStatus.next_station === destinationCode;
  }

  /**
   * Calculate estimated arrival time based on train status
   */
  private calculateEstimatedArrival(trainStatus: TrainStatus | null, journey: any): string | null {
    if (!trainStatus || !journey.arrival_time) {
      return journey.arrival_time || null;
    }

    // Add delay to scheduled arrival time
    const scheduledArrival = new Date(`${journey.departure_date}T${journey.arrival_time}`);
    const estimatedArrival = new Date(scheduledArrival.getTime() + (trainStatus.delay_minutes * 60 * 1000));
    
    return estimatedArrival.toISOString();
  }

  /**
   * Initialize tracking record in database
   */
  private async initializeTracking(packageData: PackageTrackingData): Promise<void> {
    const { error } = await this.supabase
      .from('package_tracking')
      .upsert({
        package_id: packageData.id,
        train_number: packageData.journey?.train_number,
        from_station: packageData.journey?.from_station_code,
        to_station: packageData.journey?.to_station_code,
        tracking_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to initialize tracking: ${error.message}`);
    }
  }

  /**
   * Save tracking update to database
   */
  private async saveTrackingUpdate(update: TrackingUpdate): Promise<void> {
    const { error } = await this.supabase
      .from('tracking_events')
      .insert({
        package_id: update.package_id,
        event_type: 'status_update',
        train_status: update.train_status,
        carrier_location: update.carrier_location,
        package_status: update.package_status,
        estimated_arrival: update.estimated_arrival,
        delay_minutes: update.delay_minutes,
        created_at: update.timestamp
      });

    if (error) {
      console.error('Failed to save tracking update:', error);
    }

    // Also update the main package tracking record
    await this.supabase
      .from('package_tracking')
      .update({
        last_train_status: update.train_status,
        last_carrier_location: update.carrier_location,
        current_package_status: update.package_status,
        estimated_arrival: update.estimated_arrival,
        delay_minutes: update.delay_minutes,
        updated_at: update.timestamp
      })
      .eq('package_id', update.package_id);
  }

  /**
   * Check for status changes and trigger notifications
   */
  private async checkStatusChanges(packageId: string, newStatus: PackageStatus): Promise<void> {
    // Get previous status
    const { data: prevTracking } = await this.supabase
      .from('package_tracking')
      .select('current_package_status')
      .eq('package_id', packageId)
      .single();

    const previousStatus = prevTracking?.current_package_status;

    // If status changed, trigger notification
    if (previousStatus && previousStatus !== newStatus) {
      await this.triggerStatusChangeNotification(packageId, previousStatus, newStatus);
    }
  }

  /**
   * Trigger notification for status change
   */
  private async triggerStatusChangeNotification(
    packageId: string, 
    oldStatus: PackageStatus, 
    newStatus: PackageStatus
  ): Promise<void> {
    // This would integrate with your notification system
    console.log(`📢 Status change for package ${packageId}: ${oldStatus} → ${newStatus}`);
    
    // TODO: Implement push notification logic
    // await notificationService.sendStatusUpdate(packageId, oldStatus, newStatus);
  }

  /**
   * Get tracking history for a package
   */
  async getTrackingHistory(packageId: string): Promise<TrackingEvent[]> {
    const { data, error } = await this.supabase
      .from('tracking_events')
      .select('*')
      .eq('package_id', packageId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch tracking history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get current tracking status for a package
   */
  async getCurrentTrackingStatus(packageId: string): Promise<TrackingUpdate | null> {
    const { data, error } = await this.supabase
      .from('package_tracking')
      .select('*')
      .eq('package_id', packageId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      package_id: packageId,
      timestamp: data.updated_at,
      train_status: data.last_train_status,
      carrier_location: data.last_carrier_location,
      package_status: data.current_package_status,
      estimated_arrival: data.estimated_arrival,
      delay_minutes: data.delay_minutes || 0
    };
  }

  /**
   * Cleanup - stop all active tracking
   */
  destroy(): void {
    this.trackingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.trackingIntervals.clear();
    console.log('🧹 Real-time tracking service cleaned up');
  }
}

export default RealTimeTrackingService;