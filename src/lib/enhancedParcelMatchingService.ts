import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/notificationService';

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

class EnhancedParcelMatchingService {
  /**
   * Process payment success and trigger automatic matching
   */
  async processPaymentSuccess(parcelId: string, paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    amount: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Processing payment success for parcel ${parcelId}`);
      
      // Update parcel with payment information and status
      const { error: updateError } = await supabase
        .from('parcel_requests')
        .update({
          payment_status: 'SUCCESSFUL',
          status: 'SEARCHING_CARRIER',
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          payment_completed_at: new Date().toISOString()
        })
        .eq('id', parcelId);

      if (updateError) {
        console.error('Error updating parcel payment status:', updateError);
        return { success: false, error: 'Failed to update payment status' };
      }

      // Immediately trigger automatic matching
      const matchingResult = await this.performAutomaticMatching(parcelId);
      
      return { success: true };
    } catch (error) {
      console.error('Error processing payment success:', error);
      return { success: false, error: 'Failed to process payment' };
    }
  }

  /**
   * Perform automatic matching for a parcel after payment success
   */
  async performAutomaticMatching(parcelId: string): Promise<MatchingResult> {
    try {
      console.log(`Starting automatic matching for parcel ${parcelId}`);

      // Get parcel details
      const { data: parcel, error: parcelError } = await supabase
        .from('parcel_requests')
        .select('*')
        .eq('id', parcelId)
        .single();

      if (parcelError || !parcel) {
        throw new Error('Parcel not found');
      }

      // Get matching attempt number
      const { data: attempts } = await supabase
        .from('parcel_matching_attempts')
        .select('attempt_number')
        .eq('parcel_id', parcelId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = (attempts?.[0]?.attempt_number || 0) + 1;

      // Find available carriers
      const { data: availableJourneys, error: journeyError } = await supabase
        .from('train_journeys')
        .select(`
          *,
          carrier:user_profiles!train_journeys_carrier_id_fkey (
            id,
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq('is_active', true)
        .eq('status', 'AVAILABLE')
        .gte('journey_date', new Date().toISOString().split('T')[0]); // Today or future

      if (journeyError) {
        throw new Error('Failed to fetch available journeys');
      }

      console.log(`Found ${availableJourneys?.length || 0} available journeys`);

      let bestMatch: Journey | null = null;
      let bestScore = 0;
      let matchingReasons: string[] = [];
      let totalCarriersSearched = 0;
      let matchesFound = 0;

      // Matching logic
      for (const journey of availableJourneys || []) {
        totalCarriersSearched++;
        const matchScore = this.calculateMatchScore(parcel, journey);
        
        if (matchScore.confidence > 0) {
          matchesFound++;
          
          if (matchScore.confidence > bestScore) {
            bestScore = matchScore.confidence;
            bestMatch = journey;
            matchingReasons = matchScore.reasons;
          }
        }
      }

      // Record matching attempt
      await this.recordMatchingAttempt({
        parcel_id: parcelId,
        attempt_number: attemptNumber,
        carriers_searched: totalCarriersSearched,
        matches_found: matchesFound,
        best_match_score: bestScore,
        result: bestMatch ? 'MATCHED' : 'NO_MATCHES',
        matched_carrier_id: bestMatch?.carrier_id,
        matched_journey_id: bestMatch?.id
      });

      // If match found with sufficient confidence, assign automatically
      if (bestMatch && bestScore >= 80) {
        const assignResult = await this.assignCarrierToParcel(parcelId, bestMatch);
        
        if (assignResult.success) {
          console.log(`Automatically matched parcel ${parcelId} to carrier ${bestMatch.carrier_id}`);
          
          // Send notification to carrier
          await notificationService.notifyCarrierOfMatch(bestMatch.carrier_id, parcelId);
          
          return {
            matched: true,
            confidence: bestScore,
            reasons: matchingReasons,
            journey: bestMatch
          };
        }
      }

      // Update parcel status to indicate we're still searching
      await supabase
        .from('parcel_requests')
        .update({
          last_matching_attempt: new Date().toISOString(),
          matching_attempted_at: parcel.matching_attempted_at || new Date().toISOString()
        })
        .eq('id', parcelId);

      return {
        matched: false,
        confidence: bestScore,
        reasons: matchesFound > 0 ? ['Matches found but confidence too low for auto-assignment'] : ['No suitable carriers found']
      };

    } catch (error) {
      console.error('Error in automatic matching:', error);
      
      // Record failed attempt
      const { data: attempts } = await supabase
        .from('parcel_matching_attempts')
        .select('attempt_number')
        .eq('parcel_id', parcelId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = (attempts?.[0]?.attempt_number || 0) + 1;

      await this.recordMatchingAttempt({
        parcel_id: parcelId,
        attempt_number: attemptNumber,
        carriers_searched: 0,
        matches_found: 0,
        result: 'ERROR'
      });

      return {
        matched: false,
        confidence: 0,
        reasons: ['Error occurred during matching process']
      };
    }
  }

  /**
   * Calculate match score between parcel and journey
   */
  private calculateMatchScore(parcel: any, journey: any): { confidence: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Exact station match (highest priority)
    if (parcel.pickup_station_code === journey.source_station_code &&
        parcel.drop_station_code === journey.destination_station_code) {
      score += 50;
      reasons.push('Perfect station match');
    }
    // Partial station match
    else if (parcel.pickup_station_code === journey.source_station_code) {
      score += 20;
      reasons.push('Source station matches');
    }
    else if (parcel.drop_station_code === journey.destination_station_code) {
      score += 15;
      reasons.push('Destination station matches');
    }

    // Date preference match
    if (parcel.preferred_date && journey.journey_date) {
      const parcelDate = new Date(parcel.preferred_date);
      const journeyDate = new Date(journey.journey_date);
      const daysDiff = Math.abs((journeyDate.getTime() - parcelDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        score += 20;
        reasons.push('Exact date match');
      } else if (daysDiff <= 2) {
        score += 10;
        reasons.push('Date within 2 days');
      } else if (daysDiff <= 7) {
        score += 5;
        reasons.push('Date within a week');
      }
    }

    // Coach type preference match
    if (parcel.coach_type && journey.coach_type) {
      if (parcel.coach_type === journey.coach_type) {
        score += 15;
        reasons.push('Coach type matches');
      }
    }

    // Carrier verification bonus
    if (journey.pnr_verified) {
      score += 10;
      reasons.push('Verified carrier');
    }

    // Recent journey activity
    const journeyAge = Date.now() - new Date(journey.created_at).getTime();
    const hoursOld = journeyAge / (1000 * 60 * 60);
    if (hoursOld < 24) {
      score += 5;
      reasons.push('Recently added journey');
    }

    return { confidence: Math.min(score, 100), reasons };
  }

  /**
   * Assign carrier to parcel
   */
  private async assignCarrierToParcel(parcelId: string, journey: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Update parcel with matched carrier
      const { error: parcelError } = await supabase
        .from('parcel_requests')
        .update({
          status: 'MATCHED',
          matched_carrier_id: journey.carrier_id,
          matched_journey_id: journey.id,
          carrier_id: journey.carrier_id // For backwards compatibility
        })
        .eq('id', parcelId);

      if (parcelError) {
        throw parcelError;
      }

      // Update journey status
      const { error: journeyError } = await supabase
        .from('train_journeys')
        .update({
          status: 'PARCEL_ASSIGNED'
        })
        .eq('id', journey.id);

      if (journeyError) {
        console.error('Warning: Failed to update journey status:', journeyError);
        // Don't fail the entire operation for this
      }

      return { success: true };
    } catch (error) {
      console.error('Error assigning carrier to parcel:', error);
      return { success: false, error: 'Failed to assign carrier' };
    }
  }

  /**
   * Record matching attempt for analytics
   */
  private async recordMatchingAttempt(attempt: Omit<MatchingAttempt, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('parcel_matching_attempts')
        .insert(attempt);

      if (error) {
        console.error('Error recording matching attempt:', error);
      }
    } catch (error) {
      console.error('Error recording matching attempt:', error);
    }
  }

  /**
   * Get parcels searching for carriers (for admin dashboard)
   */
  async getParcelsSearchingForCarriers(): Promise<ParcelRequest[]> {
    try {
      const { data, error } = await supabase
        .from('parcel_requests')
        .select(`
          *,
          sender:user_profiles!parcel_requests_sender_id_fkey (
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .eq('status', 'SEARCHING_CARRIER')
        .eq('payment_status', 'SUCCESSFUL')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching parcels searching for carriers:', error);
      return [];
    }
  }

  /**
   * Manually trigger matching for specific parcel (admin function)
   */
  async retryMatching(parcelId: string): Promise<MatchingResult> {
    return this.performAutomaticMatching(parcelId);
  }

  /**
   * Get matching history for a parcel
   */
  async getMatchingHistory(parcelId: string): Promise<MatchingAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('parcel_matching_attempts')
        .select('*')
        .eq('parcel_id', parcelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching matching history:', error);
      return [];
    }
  }

  /**
   * Store carrier journey from PNR data
   */
  async storeCarrierJourney(carrierId: string, pnrData: {
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
  }): Promise<{ success: boolean; journeyId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('train_journeys')
        .insert({
          carrier_id: carrierId,
          ...pnrData,
          is_active: true,
          pnr_verified: true, // Assume verified if from PNR API
          pnr_verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error storing carrier journey:', error);
        return { success: false, error: 'Failed to store journey data' };
      }

      console.log(`Stored journey ${data.id} for carrier ${carrierId}`);
      
      // Trigger matching for parcels that might match this new journey
      await this.triggerMatchingForNewJourney(data.id);

      return { success: true, journeyId: data.id };
    } catch (error) {
      console.error('Error storing carrier journey:', error);
      return { success: false, error: 'Failed to store journey data' };
    }
  }

  /**
   * Trigger matching when a new journey is added
   */
  private async triggerMatchingForNewJourney(journeyId: string): Promise<void> {
    try {
      // Get parcels that are searching for carriers
      const { data: searchingParcels } = await supabase
        .from('parcel_requests')
        .select('id')
        .eq('status', 'SEARCHING_CARRIER')
        .eq('payment_status', 'SUCCESSFUL');

      // Re-attempt matching for these parcels
      for (const parcel of searchingParcels || []) {
        try {
          await this.performAutomaticMatching(parcel.id);
        } catch (error) {
          console.error(`Error re-matching parcel ${parcel.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error triggering matching for new journey:', error);
    }
  }
}

export const enhancedParcelMatchingService = new EnhancedParcelMatchingService();
export default enhancedParcelMatchingService;