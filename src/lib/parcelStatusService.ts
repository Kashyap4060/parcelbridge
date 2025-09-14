import { supabase } from './supabase';
import { ParcelStatus } from '@/types';

export interface StatusUpdate {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  message: string;
  timestamp: Date;
  updatedBy: 'SENDER' | 'CARRIER' | 'SYSTEM';
  metadata?: {
    location?: string;
    carrierName?: string;
    reason?: string;
    otpCode?: string;
    [key: string]: any;
  };
}

export interface ParcelStatusTimeline {
  parcelId: string;
  currentStatus: ParcelStatus;
  statusHistory: StatusUpdate[];
  nextExpectedAction?: string;
  estimatedDelivery?: Date;
}

class ParcelStatusService {
  /**
   * Add a new status update to the parcel history
   */
  async addStatusUpdate(
    parcelId: string,
    status: ParcelStatus,
    message: string,
    updatedBy: 'SENDER' | 'CARRIER' | 'SYSTEM',
    metadata?: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert status update
      const { error: insertError } = await supabase
        .from('parcel_status_history')
        .insert({
          parcel_id: parcelId,
          status,
          message,
          updated_by: updatedBy,
          metadata: metadata || {},
          timestamp: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Update the main parcel request status
      const { error: updateError } = await supabase
        .from('parcel_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', parcelId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error adding status update:', error);
      return { success: false, error: 'Failed to update status' };
    }
  }

  /**
   * Get the complete timeline for a parcel
   */
  async getParcelTimeline(parcelId: string): Promise<ParcelStatusTimeline | null> {
    try {
      // Get current parcel info
      const { data: parcel, error: parcelError } = await supabase
        .from('parcel_requests')
        .select('status')
        .eq('id', parcelId)
        .single();

      if (parcelError) throw parcelError;

      // Get status history
      const { data: history, error: historyError } = await supabase
        .from('parcel_status_history')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('timestamp', { ascending: true });

      if (historyError) throw historyError;

      const statusHistory: StatusUpdate[] = history.map(h => ({
        id: h.id,
        parcelId: h.parcel_id,
        status: h.status,
        message: h.message,
        timestamp: new Date(h.timestamp),
        updatedBy: h.updated_by,
        metadata: h.metadata
      }));

      return {
        parcelId,
        currentStatus: parcel.status,
        statusHistory,
        nextExpectedAction: this.getNextExpectedAction(parcel.status),
        estimatedDelivery: this.estimateDeliveryTime(parcel.status, statusHistory)
      };
    } catch (error) {
      console.error('Error getting parcel timeline:', error);
      return null;
    }
  }

  /**
   * Handle parcel acceptance flow
   */
  async handleParcelAcceptance(
    parcelId: string,
    carrierId: string,
    journeyId: string,
    carrierName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Add status update for acceptance
      const result = await this.addStatusUpdate(
        parcelId,
        'ACCEPTED',
        `Your parcel has been accepted by ${carrierName}`,
        'SYSTEM',
        {
          carrierId,
          journeyId,
          carrierName,
          acceptedAt: new Date().toISOString()
        }
      );

      if (!result.success) return result;

      // Update parcel request with carrier info
      const { error: updateError } = await supabase
        .from('parcel_requests')
        .update({
          carrier_id: carrierId,
          accepted_at: new Date().toISOString()
        })
        .eq('id', parcelId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error handling parcel acceptance:', error);
      return { success: false, error: 'Failed to handle acceptance' };
    }
  }

  /**
   * Handle parcel pickup
   */
  async handleParcelPickup(
    parcelId: string,
    carrierId: string,
    location: string,
    otpCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.addStatusUpdate(
        parcelId,
        'IN_TRANSIT',
        `Parcel picked up from ${location}`,
        'CARRIER',
        {
          location,
          carrierId,
          otpCode,
          pickedUpAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error handling parcel pickup:', error);
      return { success: false, error: 'Failed to update pickup status' };
    }
  }

  /**
   * Handle parcel delivery
   */
  async handleParcelDelivery(
    parcelId: string,
    carrierId: string,
    location: string,
    otpCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.addStatusUpdate(
        parcelId,
        'DELIVERED',
        `Parcel delivered at ${location}`,
        'CARRIER',
        {
          location,
          carrierId,
          otpCode,
          deliveredAt: new Date().toISOString()
        }
      );

      if (!result.success) return result;

      // Update parcel request with delivery info
      const { error: updateError } = await supabase
        .from('parcel_requests')
        .update({
          delivered_at: new Date().toISOString(),
          otp_verified_at: new Date().toISOString()
        })
        .eq('id', parcelId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error handling parcel delivery:', error);
      return { success: false, error: 'Failed to update delivery status' };
    }
  }

  /**
   * Handle parcel cancellation
   */
  async handleParcelCancellation(
    parcelId: string,
    reason: string,
    cancelledBy: 'SENDER' | 'CARRIER' | 'SYSTEM'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const status: ParcelStatus = cancelledBy === 'CARRIER' ? 'FAILED_BY_CARRIER' : 'CANCELLED';
      const message = cancelledBy === 'SENDER' 
        ? `Parcel cancelled by sender: ${reason}`
        : cancelledBy === 'CARRIER'
        ? `Delivery failed: ${reason}`
        : `Parcel cancelled: ${reason}`;

      return await this.addStatusUpdate(
        parcelId,
        status,
        message,
        cancelledBy,
        {
          reason,
          cancelledAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error handling parcel cancellation:', error);
      return { success: false, error: 'Failed to cancel parcel' };
    }
  }

  /**
   * Get next expected action based on current status
   */
  private getNextExpectedAction(status: ParcelStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Waiting for carrier acceptance';
      case 'ACCEPTED':
        return 'Waiting for pickup by carrier';
      case 'IN_TRANSIT':
        return 'Parcel in transit - awaiting delivery';
      case 'DELIVERED':
        return 'Delivery completed';
      case 'CANCELLED':
      case 'FAILED_BY_CARRIER':
        return 'Parcel request closed';
      default:
        return 'Status unknown';
    }
  }

  /**
   * Estimate delivery time based on status and history
   */
  private estimateDeliveryTime(status: ParcelStatus, history: StatusUpdate[]): Date | undefined {
    if (status === 'DELIVERED' || status === 'CANCELLED' || status === 'FAILED_BY_CARRIER') {
      return undefined; // Already completed
    }

    const acceptedUpdate = history.find(h => h.status === 'ACCEPTED');
    if (!acceptedUpdate) return undefined;

    // Estimate based on acceptance time + typical delivery time (1-2 days)
    const estimatedDelivery = new Date(acceptedUpdate.timestamp);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
    
    return estimatedDelivery;
  }

  /**
   * Get status statistics for admin dashboard
   */
  async getStatusStatistics(): Promise<{
    pending: number;
    accepted: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
    failed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('parcel_requests')
        .select('status');

      if (error) throw error;

      const stats = {
        pending: 0,
        accepted: 0,
        inTransit: 0,
        delivered: 0,
        cancelled: 0,
        failed: 0
      };

      data.forEach(parcel => {
        switch (parcel.status) {
          case 'PENDING':
            stats.pending++;
            break;
          case 'ACCEPTED':
            stats.accepted++;
            break;
          case 'IN_TRANSIT':
            stats.inTransit++;
            break;
          case 'DELIVERED':
            stats.delivered++;
            break;
          case 'CANCELLED':
            stats.cancelled++;
            break;
          case 'FAILED_BY_CARRIER':
            stats.failed++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting status statistics:', error);
      return {
        pending: 0,
        accepted: 0,
        inTransit: 0,
        delivered: 0,
        cancelled: 0,
        failed: 0
      };
    }
  }
}

export const parcelStatusService = new ParcelStatusService();
