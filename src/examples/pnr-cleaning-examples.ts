// Example usage of the PNR API cleaning system

import { 
  getPNRStatus, 
  validatePNRNumber, 
  transformRawPNRResponse 
} from '@/lib/pnrService';
import { PNRResponse } from '@/types/PNR';

/**
 * Example 1: Clean a raw PNR API response
 * This transforms any raw API response into the standardized format
 */
export async function cleanPNRResponse(rawApiResponse: any): Promise<PNRResponse | { error: string }> {
  console.log('Raw API Response:', rawApiResponse);
  
  const cleanedResponse = transformRawPNRResponse(rawApiResponse);
  
  if ('error' in cleanedResponse) {
    console.error('Error cleaning response:', cleanedResponse.error);
    return cleanedResponse;
  }
  
  console.log('Cleaned Response:', JSON.stringify(cleanedResponse, null, 2));
  return cleanedResponse;
}

/**
 * Example 2: Fetch and clean PNR data from API
 */
export async function fetchAndCleanPNR(pnrNumber: string, apiKey: string): Promise<PNRResponse | { error: string }> {
  // Step 1: Validate PNR format
  const validation = validatePNRNumber(pnrNumber);
  if (!validation.isValid) {
    return { error: validation.error || 'Invalid PNR format' };
  }
  
  // Step 2: Fetch from API
  console.log(`Fetching PNR: ${pnrNumber}`);
  const result = await getPNRStatus(pnrNumber, apiKey);
  
  // Step 3: Return cleaned result
  return result;
}

/**
 * Example raw API responses that can be cleaned
 */
export const exampleRawResponses = {
  // Standard format
  standard: {
    "status": true,
    "data": {
      "trainNumber": "11061",
      "trainName": "LTT JAYNAGAR EXP",
      "boardingInfo": {
        "stationName": "Lokmanya Tilak Terminus",
        "departureDate": "2025-02-09",
        "departureTime": "1130"
      },
      "reservationUpto": {
        "stationName": "Varanasi Junction",
        "arrivalDate": "2025-02-10",
        "arrivalTime": "0825"
      },
      "passengerInfo": [
        {
          "coachName": "Sleeper",
          "coachNumber": "S4",
          "berthNumber": "35"
        }
      ]
    }
  },

  // Alternative format 1
  alternative1: {
    "success": true,
    "result": {
      "train_number": "11061",
      "train_name": "LTT JAYNAGAR EXP",
      "fromStation": "LTT",
      "toStation": "BSB",
      "departureDate": "2025-02-09",
      "departureTime": "11:30 AM",
      "arrivalDate": "2025-02-10", 
      "arrivalTime": "08:25 AM",
      "passengers": [
        {
          "coach_type": "SL",
          "coach_number": "S4",
          "seat_number": "35"
        }
      ]
    }
  },

  // Alternative format 2
  alternative2: {
    "pnrDetails": {
      "trainNo": "11061",
      "trainTitle": "LTT JAYNAGAR EXPRESS",
      "origin": "Lokmanya Tilak Terminus",
      "destination": "Varanasi Junction",
      "journeyDate": "09-02-2025",
      "depTime": "11:30",
      "arrDate": "10-02-2025",
      "arrTime": "08:25",
      "passengerList": [
        {
          "class": "Sleeper",
          "coachId": "S4",
          "seatNo": "35"
        }
      ]
    }
  }
};

/**
 * Example usage function
 */
export async function demonstrateUsage() {
  console.log('=== PNR Cleaning System Demo ===\n');
  
  // Test with different response formats
  for (const [format, response] of Object.entries(exampleRawResponses)) {
    console.log(`Testing ${format} format:`);
    const cleaned = await cleanPNRResponse(response);
    console.log('Result:', cleaned);
    console.log('---\n');
  }
  
  // Test with real API (requires API key)
  const apiKey = process.env.RAPIDAPI_KEY;
  if (apiKey) {
    console.log('Testing with real API:');
    const result = await fetchAndCleanPNR('1234567890', apiKey);
    console.log('API Result:', result);
  }
}

/**
 * Utility to validate the cleaned response structure
 */
export function validateCleanedResponse(response: any): boolean {
  const requiredKeys = ['Train Details', 'Route Information', 'Schedule', 'Seat Information'];
  
  for (const key of requiredKeys) {
    if (!response[key]) {
      console.error(`Missing required key: ${key}`);
      return false;
    }
  }
  
  // Validate Train Details
  const trainDetails = response['Train Details'];
  if (!trainDetails.trainNumber || !trainDetails.trainName) {
    console.error('Invalid Train Details structure');
    return false;
  }
  
  // Validate Route Information
  const routeInfo = response['Route Information'];
  if (!routeInfo.fromStation || !routeInfo.toStation) {
    console.error('Invalid Route Information structure');
    return false;
  }
  
  // Validate Schedule
  const schedule = response['Schedule'];
  if (!schedule.departureDate || !schedule.departureTime || !schedule.arrivalDate || !schedule.arrivalTime) {
    console.error('Invalid Schedule structure');
    return false;
  }
  
  // Validate Seat Information
  const seatInfo = response['Seat Information'];
  if (!Array.isArray(seatInfo)) {
    console.error('Seat Information must be an array');
    return false;
  }
  
  console.log('✅ Response structure is valid');
  return true;
}

// Usage example
if (require.main === module) {
  demonstrateUsage().catch(console.error);
}



