import { supabase } from '@/lib/supabase';

export interface CreateJourneyData {
  pnr: string;
  trainNumber: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  coachType: string;
  coachNumber: string;
  seatNumber: string;
}

export interface JourneyResponse {
  success: boolean;
  journeyId?: string;
  error?: string;
}

/**
 * Create a new journey using the API route
 */
export async function createJourney(
  firebaseUid: string, 
  journeyData: CreateJourneyData
): Promise<JourneyResponse> {
  try {
    const response = await fetch('/api/journeys/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid,
        journeyData
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating journey:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    };
  }
}

/**
 * Check if a PNR already exists using the API route
 */
export async function checkPNRExists(pnr: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/journeys/check-pnr?pnr=${encodeURIComponent(pnr)}`);
    const result = await response.json();
    return result.exists || false;
  } catch (error) {
    console.error('Error checking PNR existence:', error);
    return false;
  }
}



