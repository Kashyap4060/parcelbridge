import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/notificationService';
import { parcelStatusService } from '@/lib/parcelStatusService';

export interface ParcelRequest {
  id: string;
  sender_id: string;
  pickup_station: string;
  pickup_station_code: string;
  drop_station: string;
  drop_station_code: string;
  weight: number;
  description: string;
  status: 'PENDING_PAYMENT' | 'SEARCHING_CARRIER' | 'MATCHED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  estimated_fare: number;
  matched_carrier_id?: string;
  matched_journey_id?: string;
  preferred_date?: string;
  coach_type?: string;
  created_at: string;
}

export interface Journey {
  id: string;
  carrier_id: string;
  pnr: string;
  train_number?: string;
  train_name?: string;
  source_station: string;
  source_station_code: string;
  destination_station: string;
  destination_station_code: string;
  journey_date: string;
  departure_time?: string;
  arrival_time?: string;
  stations?: any[];
  coach_type?: string;
  seat_number?: string;
  status: 'AVAILABLE' | 'PARCEL_ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  is_active: boolean;
  pnr_verified: boolean;
  created_at: string;
}

export interface MatchingResult {
  matched: boolean;
  confidence: number;
  reasons: string[];
  journey?: Journey;
}

export interface MatchingAttempt {
  id: string;
  parcel_id: string;
  attempt_number: number;
  carriers_searched: number;
  matches_found: number;
  best_match_score?: number;
  result: 'MATCHED' | 'NO_MATCHES' | 'ERROR';
  matched_carrier_id?: string;
  matched_journey_id?: string;
  created_at: string;
}

class ParcelMatchingService {
  /**
   * Find parcels that match a carrier's journeys
   */
  async findMatchingParcels(carrierId: string): Promise<ParcelMatch[]> {
    try {
      // 1. Get carrier's active journeys
      const { data: journeys, error: journeyError } = await supabase
        .from('train_journeys')
        .select('*')
        .eq('carrier_id', carrierId)
        .eq('is_active', true);

      if (journeyError) throw journeyError;
      if (!journeys || journeys.length === 0) {
        return [];
      }

      // 2. Get all pending parcel requests
      const { data: parcels, error: parcelError } = await supabase
        .from('parcel_requests')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

      if (parcelError) throw parcelError;
      if (!parcels || parcels.length === 0) {
        return [];
      }

      // 3. Map database objects to our types
      const mappedJourneys: Journey[] = journeys.map(j => ({
        id: j.id,
        carrierUid: j.carrier_id,
        pnr: j.pnr,
        trainNumber: j.train_number,
        trainName: j.train_name || '',
        sourceStation: j.source_station,
        sourceStationCode: j.source_station_code,
        destinationStation: j.destination_station,
        destinationStationCode: j.destination_station_code,
        stations: j.stations || [],
        journeyDate: new Date(j.journey_date),
        departureTime: j.departure_time || '',
        arrivalTime: j.arrival_time || '',
        isActive: j.is_active,
        createdAt: new Date(j.created_at)
      }));

      const mappedParcels: ParcelRequest[] = parcels.map(p => ({
        id: p.id,
        senderUid: p.sender_id,
        pickupStation: p.pickup_station,
        dropStation: p.drop_station,
        weight: Number(p.weight),
        dimensions: {
          length: Number(p.length ?? 0),
          width: Number(p.width ?? 0),
          height: Number(p.height ?? 0)
        },
        pickupTime: new Date(p.pickup_time),
        description: p.description || '',
        status: p.status,
        paymentHeld: Number(p.payment_held ?? 0),
        estimatedFare: Number(p.estimated_fare),
        feeBreakdown: p.fee_breakdown || null,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at)
      }));

      // 4. Simple station-to-station matching
      const parcelMatches: ParcelMatch[] = [];

      for (const parcel of mappedParcels) {
        const matchingJourneys: Journey[] = [];
        let bestMatch: ParcelMatch['bestMatch'] = null;
        let highestConfidence = 0;

        for (const journey of mappedJourneys) {
          try {
            const matchResult = this.simpleStationMatch(journey, parcel);
            
            if (matchResult.confidence > 0) { // Any match is worth showing
              matchingJourneys.push(journey);
              
              if (matchResult.confidence > highestConfidence) {
                highestConfidence = matchResult.confidence;
                bestMatch = {
                  journey,
                  confidence: matchResult.confidence,
                  matchType: matchResult.matchType as 'PERFECT' | 'GOOD' | 'PARTIAL' | 'NO_MATCH',
                  canAccept: matchResult.confidence >= 70, // Lower threshold for simple matching
                  reasons: matchResult.reasons
                };
              }
            }
          } catch (error) {
            console.error(`Error matching parcel ${parcel.id} with journey ${journey.id}:`, error);
          }
        }

        if (matchingJourneys.length > 0) {
          parcelMatches.push({
            parcel,
            matchingJourneys,
            bestMatch
          });
        }
      }

      // 5. Sort by confidence score (best matches first)
      return parcelMatches.sort((a, b) => {
        const aConfidence = a.bestMatch?.confidence || 0;
        const bConfidence = b.bestMatch?.confidence || 0;
        return bConfidence - aConfidence;
      });

    } catch (error) {
      console.error('Error finding matching parcels:', error);
      throw new Error('Failed to find matching parcels');
    }
  }

  // Simple station-to-station matching method
  private simpleStationMatch(journey: Journey, parcel: ParcelRequest): {
    confidence: number;
    matchType: string;
    reasons: string[];
  } {
    const pickup = parcel.pickupStation.toLowerCase().trim();
    const drop = parcel.dropStation.toLowerCase().trim();
    const source = journey.sourceStation.toLowerCase().trim();
    const destination = journey.destinationStation.toLowerCase().trim();

    // Perfect match - exact station names
    if (pickup === source && drop === destination) {
      return {
        confidence: 100,
        matchType: 'PERFECT',
        reasons: ['Exact station match for pickup and drop']
      };
    }

    // Good match - station names contain each other
    const pickupMatches = pickup.includes(source) || source.includes(pickup);
    const dropMatches = drop.includes(destination) || destination.includes(drop);

    if (pickupMatches && dropMatches) {
      return {
        confidence: 85,
        matchType: 'GOOD',
        reasons: ['Station names contain matching parts for both pickup and drop']
      };
    }

    // Partial match - only one station matches
    if (pickupMatches) {
      return {
        confidence: 60,
        matchType: 'PARTIAL',
        reasons: ['Pickup station matches journey source']
      };
    }

    if (dropMatches) {
      return {
        confidence: 50,
        matchType: 'PARTIAL',
        reasons: ['Drop station matches journey destination']
      };
    }

    // No match
    return {
      confidence: 0,
      matchType: 'NO_MATCH',
      reasons: ['No station matches found']
    };
  }

  /**
   * Check carrier's current parcel status
   */
  async getCarrierParcelStatus(carrierId: string): Promise<CarrierParcelStatus> {
    try {
      const { data: activeParcel, error } = await supabase
        .from('parcel_requests')
        .select('id, status')
        .eq('carrier_id', carrierId)
        .in('status', ['ACCEPTED', 'IN_TRANSIT'])
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        throw error;
      }

      const hasActiveParcel = !!activeParcel;
      
      return {
        hasActiveParcel,
        currentParcelId: activeParcel?.id,
        canAcceptNew: !hasActiveParcel
      };
    } catch (error) {
      console.error('Error getting carrier parcel status:', error);
      return {
        hasActiveParcel: false,
        canAcceptNew: false
      };
    }
  }

  /**
   * Accept a parcel request
   */
  async acceptParcel(carrierId: string, parcelId: string, journeyId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // 1. Check if carrier can accept new parcels
      const status = await this.getCarrierParcelStatus(carrierId);
      if (!status.canAcceptNew) {
        return {
          success: false,
          error: 'You already have an active parcel delivery. Complete it before accepting another.'
        };
      }

      // 2. Verify the parcel is still available
      const { data: parcel, error: parcelCheckError } = await supabase
        .from('parcel_requests')
        .select('*')
        .eq('id', parcelId)
        .eq('status', 'PENDING')
        .single();

      if (parcelCheckError || !parcel) {
        return {
          success: false,
          error: 'This parcel is no longer available.'
        };
      }

      // 3. Get carrier details for the status update
      const { data: carrier, error: carrierError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', carrierId)
        .single();

      if (carrierError) {
        throw carrierError;
      }

      const carrierName = `${carrier.first_name} ${carrier.last_name}`.trim();

      // 4. Handle parcel acceptance with status tracking
      const statusResult = await parcelStatusService.handleParcelAcceptance(
        parcelId,
        carrierId,
        journeyId,
        carrierName
      );

      if (!statusResult.success) {
        return {
          success: false,
          error: statusResult.error || 'Failed to accept parcel'
        };
      }

      // 5. Create notification for sender
      await this.createAcceptanceNotification(parcelId, carrierId, journeyId);

      return { success: true };

    } catch (error) {
      console.error('Error accepting parcel:', error);
      return {
        success: false,
        error: 'Failed to accept parcel. Please try again.'
      };
    }
  }

  /**
   * Create acceptance notification
   */
  private async createAcceptanceNotification(parcelId: string, carrierId: string, journeyId: string) {
    try {
      // Get parcel details to find sender
      const { data: parcel, error } = await supabase
        .from('parcel_requests')
        .select('sender_id')
        .eq('id', parcelId)
        .single();

      if (error || !parcel) {
        console.error('Error getting parcel for notification:', error);
        return;
      }

      await notificationService.notifyParcelAccepted(parcelId, parcel.sender_id, carrierId, journeyId);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Get parcel details with sender information
   */
  async getParcelWithSender(parcelId: string) {
    try {
      const { data, error } = await supabase
        .from('parcel_requests')
        .select(`
          *,
          sender:user_profiles!parcel_requests_sender_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', parcelId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting parcel with sender:', error);
      throw error;
    }
  }
}

export const parcelMatchingService = new ParcelMatchingService();
export default parcelMatchingService;
