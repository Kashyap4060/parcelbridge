// PNR API Integration for Indian Railways
// Using RapidAPI's IRCTC PNR Status API
import { getStationNamesFromCodes } from './trainScheduleService';

export interface PNRPassengerDetails {
  passengerNo: string;
  bookingStatus: string;
  currentStatus: string;
  coachNo: string;
}

export interface PNRJourneyDetails {
  trainNumber: string;
  trainName: string;
  boardingDate: string;
  from: string;
  to: string;
  reservedUpto: string;
  boardingPoint: string;
  class: string;
}

export interface PNROtherDetails {
  currency: string;
  totalFare: string;
  chartingStatus: string;
  remarksIfAny: string;
  trainStatus: string;
}

export interface PNRStatusResponse {
  success: boolean;
  data: {
    pnrNumber: string;
    journeyDetails: PNRJourneyDetails;
    passengerDetails: PNRPassengerDetails[];
    otherDetails: PNROtherDetails;
  };
  time: string;
}

export interface ProcessedPNRData {
  pnrNumber: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  sourceStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  boardingPoint: string;
  journeyDate: Date;
  arrivalDate?: Date;
  class: string;
  totalFare: number;
  passengerCount: number;
  chartingStatus: string;
  coachNumber?: string;
  seatNumber?: string;
  isValid: boolean;
  error?: string;
}

// RapidAPI configuration
const RAPIDAPI_CONFIG = {
  baseURL: 'https://irctc-indian-railway-pnr-status.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Host': 'irctc-indian-railway-pnr-status.p.rapidapi.com',
    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '27f1a26ea9mshbfae6d2228d1b3bp11e89bjsn639fe2867039'
  }
};

/**
 * Fetch PNR status from Indian Railway API
 */
export async function fetchPNRStatus(pnrNumber: string): Promise<PNRStatusResponse> {
  const cleanPNR = pnrNumber.replace(/\s/g, '').toUpperCase();
  
  console.log('Fetching PNR status for:', cleanPNR);
  console.log('API URL:', `${RAPIDAPI_CONFIG.baseURL}/getPNRStatus/${cleanPNR}`);
  
  if (cleanPNR.length !== 10) {
    throw new Error('PNR number must be exactly 10 digits');
  }

  try {
    const response = await fetch(
      `${RAPIDAPI_CONFIG.baseURL}/getPNRStatus/${cleanPNR}`,
      {
        method: 'GET',
        headers: RAPIDAPI_CONFIG.headers,
      }
    );

    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PNR not found. Please check the PNR number.');
      } else if (response.status === 400) {
        throw new Error('Invalid PNR format. Please enter a valid 10-digit PNR.');
      } else if (response.status === 403) {
        throw new Error('API access denied. API key may be invalid or quota exceeded.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
    }

    const data: PNRStatusResponse = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      throw new Error('PNR status could not be retrieved from railway system');
    }

    return data;
  } catch (error) {
    console.error('PNR API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Unable to connect to railway system');
  }
}

/**
 * Process raw PNR data into a structured format for our application
 */
export function processPNRData(pnrResponse: any): ProcessedPNRData {
  try {
    const { data } = pnrResponse;
    
    // Debug log to see the actual API response structure
    console.log('PNR API Response:', JSON.stringify(data, null, 2));
    
    if (!data) {
      throw new Error('No data found in PNR response');
    }

    // The actual API response has data directly in 'data' object, not nested in journeyDetails
    // Check if this is the new API format (flat structure)
    if (data.trainNumber && data.trainName && data.sourceStation) {
      console.log('Processing new API format (flat structure)');
      
      // Parse the journey date
      let journeyDate: Date;
      const dateOfJourney = data.dateOfJourney;
      
      if (!dateOfJourney) {
        throw new Error('Journey date not found in PNR response');
      }

      console.log('Using journey date:', dateOfJourney);

      // Handle different date formats from API
      if (typeof dateOfJourney === 'string') {
        // Parse date (format: "Jul 29, 2025 8:05:00 AM")
        journeyDate = new Date(dateOfJourney);
      } else {
        journeyDate = new Date(dateOfJourney);
      }

      // Validate journey date
      if (isNaN(journeyDate.getTime())) {
        throw new Error('Invalid journey date format');
      }

      // Check if journey is in the past (with some tolerance for current day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (journeyDate < today) {
        throw new Error('Cannot add journey for past dates');
      }

      // Extract coach and seat information from passenger list
      let coachNumber: string | undefined;
      let seatNumber: string | undefined;
      
      if (data.passengerList && data.passengerList.length > 0) {
        const firstPassenger = data.passengerList[0];
        console.log('First passenger data:', JSON.stringify(firstPassenger, null, 2));
        
        // Try different possible field names for coach
        const coachValue = firstPassenger.currentCoachId || 
                          firstPassenger.coachId || 
                          firstPassenger.coach || 
                          firstPassenger.coachNumber ||
                          firstPassenger.coachNo;
                     
        // Try different possible field names for seat/berth
        const seatValue = firstPassenger.currentBerthNo || 
                         firstPassenger.berthNo || 
                         firstPassenger.seatNo || 
                         firstPassenger.seatNumber ||
                         firstPassenger.berth;
                    
        // Convert to string if they exist
        if (coachValue !== undefined) {
          coachNumber = typeof coachValue === 'number' ? coachValue.toString() : String(coachValue);
        }
        if (seatValue !== undefined) {
          seatNumber = typeof seatValue === 'number' ? seatValue.toString() : String(seatValue);
        }
        
        console.log('Extracted coach:', coachNumber, 'seat:', seatNumber);
      }

      // Calculate arrival date (same as journey date for now, can be enhanced with train schedule)
      const arrivalDate = new Date(journeyDate);

      return {
        pnrNumber: data.pnrNumber,
        trainNumber: data.trainNumber,
        trainName: data.trainName,
        sourceStation: data.sourceStation,
        sourceStationCode: data.sourceStation,
        destinationStation: data.destinationStation,
        destinationStationCode: data.destinationStation,
        boardingPoint: data.boardingPoint,
        journeyDate,
        arrivalDate,
        class: data.journeyClass,
        totalFare: parseInt(data.bookingFare) || 0,
        passengerCount: data.numberOfpassenger || data.passengerList?.length || 1,
        chartingStatus: data.chartStatus,
        coachNumber,
        seatNumber,
        isValid: true
      };
    }

    // Fallback to old API format (nested structure) if new format not detected
    const journey = data.journeyDetails;
    const other = data.otherDetails;

    // Check if required fields exist
    if (!journey) {
      throw new Error('Journey details not found in PNR response');
    }

    console.log('Journey details:', JSON.stringify(journey, null, 2));

    // Parse the boarding date with fallback checks
    let boardingDate = journey.boardingDate;
    
    if (!boardingDate) {
      console.log('boardingDate is undefined, checking alternatives...');
      // Try alternative property names that might exist in the API response
      const journeyAny = journey as any;
      boardingDate = journeyAny.dateOfJourney || journeyAny.journeyDate || journeyAny.travelDate;
      console.log('Alternative boarding date found:', boardingDate);
    }
    
    if (!boardingDate) {
      console.error('Available journey properties:', Object.keys(journey));
      throw new Error('Journey date not found in PNR response. Available properties: ' + Object.keys(journey).join(', '));
    }

    console.log('Using boarding date:', boardingDate);

    // Handle different date formats
    let journeyDate: Date;
    if (typeof boardingDate === 'string') {
      // Parse date (format: "24-6-2024" or "DD-M-YYYY" or "YYYY-MM-DD")
      if (boardingDate.includes('-')) {
        const dateParts = boardingDate.split('-');
        if (dateParts.length === 3) {
          // Check if it's YYYY-MM-DD or DD-M-YYYY format
          if (dateParts[0].length === 4) {
            // YYYY-MM-DD format
            journeyDate = new Date(
              parseInt(dateParts[0]), // year
              parseInt(dateParts[1]) - 1, // month (0-indexed)
              parseInt(dateParts[2]) // day
            );
          } else {
            // DD-M-YYYY format
            journeyDate = new Date(
              parseInt(dateParts[2]), // year
              parseInt(dateParts[1]) - 1, // month (0-indexed)
              parseInt(dateParts[0]) // day
            );
          }
        } else {
          throw new Error('Invalid date format in PNR response');
        }
      } else {
        // Try to parse as ISO date or other standard formats
        journeyDate = new Date(boardingDate);
      }
    } else {
      // Assume it's already a Date object or timestamp
      journeyDate = new Date(boardingDate);
    }

    // Validate journey date
    if (isNaN(journeyDate.getTime())) {
      throw new Error('Invalid journey date format');
    }

    // Check if journey is in the past (with some tolerance for current day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (journeyDate < today) {
      throw new Error('Cannot add journey for past dates');
    }

    // Extract coach and seat information from passenger details
    let coachNumber: string | undefined;
    let seatNumber: string | undefined;
    
    if (data.passengerDetails && data.passengerDetails.length > 0) {
      const firstPassenger = data.passengerDetails[0];
      console.log('First passenger details:', JSON.stringify(firstPassenger, null, 2));
      
      // Extract from booking status (format: "CNF/B2/54/UB/PT")
      if (firstPassenger.bookingStatus) {
        const statusParts = firstPassenger.bookingStatus.split('/');
        if (statusParts.length >= 3) {
          coachNumber = statusParts[1]; // B2
          seatNumber = statusParts[2];  // 54
        }
      }
      
      // Also try direct coach field
      if (!coachNumber && firstPassenger.coachNo) {
        coachNumber = firstPassenger.coachNo;
      }
      
      console.log('Extracted coach:', coachNumber, 'seat:', seatNumber);
    }

    // Calculate arrival date (same as journey date for now)
    const arrivalDate = new Date(journeyDate);

    return {
      pnrNumber: data.pnrNumber,
      trainNumber: journey.trainNumber,
      trainName: journey.trainName,
      sourceStation: journey.from,
      sourceStationCode: journey.from,
      destinationStation: journey.to,
      destinationStationCode: journey.to,
      boardingPoint: journey.boardingPoint,
      journeyDate,
      arrivalDate,
      class: journey.class,
      totalFare: parseInt(other.totalFare) || 0,
      passengerCount: data.passengerDetails.length,
      chartingStatus: other.chartingStatus,
      coachNumber,
      seatNumber,
      isValid: true
    };
  } catch (error) {
    return {
      pnrNumber: pnrResponse.data?.pnrNumber || '',
      trainNumber: '',
      trainName: '',
      sourceStation: '',
      sourceStationCode: '',
      destinationStation: '',
      destinationStationCode: '',
      boardingPoint: '',
      journeyDate: new Date(),
      arrivalDate: undefined,
      class: '',
      totalFare: 0,
      passengerCount: 0,
      chartingStatus: '',
      coachNumber: undefined,
      seatNumber: undefined,
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to process PNR data'
    };
  }
}

/**
 * Validate PNR format before API call
 */
export function validatePNRFormat(pnr: string): { isValid: boolean; error?: string } {
  const cleanPNR = pnr.replace(/\s/g, '');
  
  if (!cleanPNR) {
    return { isValid: false, error: 'PNR number is required' };
  }
  
  if (cleanPNR.length !== 10) {
    return { isValid: false, error: 'PNR must be exactly 10 digits' };
  }
  
  if (!/^\d{10}$/.test(cleanPNR)) {
    return { isValid: false, error: 'PNR must contain only numbers' };
  }
  
  return { isValid: true };
}

/**
 * Get full station name from station code using Supabase station data
 */
export async function getStationNameFromCode(stationCode: string): Promise<string> {
  try {
    const { getStationByCode } = await import('./stationService');
    const station = await getStationByCode(stationCode);
    return station?.name || stationCode;
  } catch (error) {
    console.error('Error fetching station name:', error);
    return stationCode;
  }
}

/**
 * Process PNR data from the new API format you provided
 */
export async function processNewPNRFormat(data: any): Promise<ProcessedPNRData> {
  try {
    console.log('Processing new PNR format:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.pnrNumber || !data.trainNumber || !data.sourceStation || !data.destinationStation) {
      throw new Error('Missing required PNR fields');
    }

    // Parse journey date (with departure time)
    let journeyDate: Date;
    if (data.dateOfJourney) {
      journeyDate = new Date(data.dateOfJourney);
    } else {
      throw new Error('Journey date not found');
    }

    // Parse arrival date
    let arrivalDate: Date | undefined;
    if (data.arrivalDate) {
      arrivalDate = new Date(data.arrivalDate);
    }

    // Validate dates
    if (isNaN(journeyDate.getTime())) {
      throw new Error('Invalid journey date format');
    }
    if (arrivalDate && isNaN(arrivalDate.getTime())) {
      throw new Error('Invalid arrival date format');
    }

    // Get station names from train data CSV
    console.log('🚂 Fetching station names for:', data.sourceStation, 'and', data.destinationStation);
    const stationNames = await getStationNamesFromCodes([data.sourceStation, data.destinationStation]);
    console.log('🏷️ Retrieved station names:', stationNames);

    // Extract coach and seat information from various possible sources
    let coachNumber: string | undefined;
    let seatNumber: string | undefined;
    
    // Method 1: Direct fields (new API format)
    if (data.bookingCoachId) {
      coachNumber = data.bookingCoachId;
    }
    if (data.bookingBerthNo) {
      seatNumber = data.bookingBerthNo.toString();
    }
    
    // Method 2: From passenger details array (old API format)
    if (!coachNumber && !seatNumber && data.passengerDetails && data.passengerDetails.length > 0) {
      const firstPassenger = data.passengerDetails[0];
      console.log('Extracting from passengerDetails:', JSON.stringify(firstPassenger, null, 2));
      
      // Extract from booking status (format: "CNF/B2/54/UB/PT")
      if (firstPassenger.bookingStatus) {
        const statusParts = firstPassenger.bookingStatus.split('/');
        if (statusParts.length >= 3) {
          coachNumber = statusParts[1]; // B2
          seatNumber = statusParts[2];  // 54
        }
      }
      
      // Also try direct coach field
      if (!coachNumber && firstPassenger.coachNo) {
        coachNumber = firstPassenger.coachNo;
      }
    }
    
    // Method 3: From passenger list array (alternate API format)
    if (!coachNumber && !seatNumber && data.passengerList && data.passengerList.length > 0) {
      const firstPassenger = data.passengerList[0];
      console.log('Extracting from passengerList:', JSON.stringify(firstPassenger, null, 2));
      
      // Try different possible field names for coach
      const coachValue = firstPassenger.currentCoachId || 
                        firstPassenger.coachId || 
                        firstPassenger.coach || 
                        firstPassenger.coachNumber ||
                        firstPassenger.coachNo;
                   
      // Try different possible field names for seat/berth
      const seatValue = firstPassenger.currentBerthNo || 
                       firstPassenger.berthNo || 
                       firstPassenger.seatNo || 
                       firstPassenger.seatNumber ||
                       firstPassenger.berth;
      
      // Convert to string if they exist
      if (coachValue !== undefined) {
        coachNumber = typeof coachValue === 'number' ? coachValue.toString() : String(coachValue);
      }
      if (seatValue !== undefined) {
        seatNumber = typeof seatValue === 'number' ? seatValue.toString() : String(seatValue);
      }
    }
    
    console.log('Final extracted coach:', coachNumber, 'seat:', seatNumber);

    const processedData = {
      pnrNumber: data.pnrNumber,
      trainNumber: data.trainNumber,
      trainName: data.trainName,
      sourceStation: stationNames[data.sourceStation] || data.sourceStation,
      sourceStationCode: data.sourceStation,
      destinationStation: stationNames[data.destinationStation] || data.destinationStation,
      destinationStationCode: data.destinationStation,
      boardingPoint: data.boardingPoint || data.sourceStation,
      journeyDate,
      arrivalDate,
      class: data.journeyClass || '3A',
      totalFare: 0, // Not provided in new format
      passengerCount: data.passengerDetails?.length || data.passengerList?.length || 1,
      chartingStatus: 'Unknown',
      coachNumber,
      seatNumber,
      isValid: true
    };
    
    console.log('✅ Final processed PNR data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('Error processing new PNR format:', error);
    return {
      pnrNumber: data.pnrNumber || '',
      trainNumber: '',
      trainName: '',
      sourceStation: '',
      sourceStationCode: '',
      destinationStation: '',
      destinationStationCode: '',
      boardingPoint: '',
      journeyDate: new Date(),
      class: '',
      totalFare: 0,
      passengerCount: 0,
      chartingStatus: '',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Enhanced PNR processing with station name resolution
 */
export async function processPNRDataWithStationNames(pnrResponse: PNRStatusResponse): Promise<ProcessedPNRData> {
  const basicData = processPNRData(pnrResponse);
  
  if (!basicData.isValid) {
    return basicData;
  }

  try {
    // Resolve station names from codes
    const [sourceName, destinationName] = await Promise.all([
      getStationNameFromCode(basicData.sourceStationCode),
      getStationNameFromCode(basicData.destinationStationCode)
    ]);

    return {
      ...basicData,
      sourceStation: sourceName,
      destinationStation: destinationName
    };
  } catch (error) {
    console.error('Error resolving station names:', error);
    // Return basic data if station name resolution fails
    return basicData;
  }
}

/**
 * Check if PNR is still valid (not cancelled)
 * This can be called periodically to revalidate existing journeys
 */
export async function recheckPNRStatus(pnrNumber: string): Promise<{
  isValid: boolean;
  status: string;
  error?: string;
}> {
  try {
    const pnrData = await fetchPNRStatus(pnrNumber);
    const processed = processPNRData(pnrData);
    
    if (!processed.isValid) {
      return {
        isValid: false,
        status: 'INVALID',
        error: processed.error
      };
    }

    // Check passenger statuses
    const passengerStatuses = pnrData.data.passengerDetails.map(p => p.currentStatus);
    const hasCancelledPassengers = passengerStatuses.some(status => 
      status.includes('CAN') || status.includes('CANCEL')
    );

    if (hasCancelledPassengers) {
      return {
        isValid: false,
        status: 'CANCELLED',
        error: 'Some or all passengers have been cancelled'
      };
    }

    return {
      isValid: true,
      status: 'CONFIRMED'
    };
  } catch (error) {
    return {
      isValid: false,
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Failed to recheck PNR'
    };
  }
}

/**
 * Mock PNR data for development/testing when API is not available
 * Based on actual API response structure
 */
export function getMockPNRData(pnrNumber: string): any {
  // Mock data matching the structure you provided
  return {
    pnrNumber: pnrNumber,
    dateOfJourney: "Jul 29, 2025 8:05:00 AM", // includes departure time
    trainNumber: "12336",
    trainName: "LTT BHAGALPUR EX",
    sourceStation: "LTT",
    destinationStation: "MKA",
    reservationUpto: "MKA", // carrier's journey destination
    boardingPoint: "LTT",
    journeyClass: "3A",
    bookingCoachId: "B4",
    bookingBerthNo: 63,
    bookingBerthCode: "SL", // side lower
    arrivalDate: "Jul 30, 2025 2:08:00 PM" // arrival date and time
  };
}

/**
 * Development mode toggle - set to false for production
 */
const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';

/**
 * Main function to fetch and process PNR data
 * Uses mock data in development if API fails
 */
export async function getPNRData(pnrNumber: string, useMockInDev: boolean = true): Promise<ProcessedPNRData> {
  const validation = validatePNRFormat(pnrNumber);
  if (!validation.isValid) {
    return {
      pnrNumber,
      trainNumber: '',
      trainName: '',
      sourceStation: '',
      sourceStationCode: '',
      destinationStation: '',
      destinationStationCode: '',
      boardingPoint: '',
      journeyDate: new Date(),
      arrivalDate: undefined,
      class: '',
      totalFare: 0,
      passengerCount: 0,
      chartingStatus: '',
      coachNumber: undefined,
      seatNumber: undefined,
      isValid: false,
      error: validation.error
    };
  }



  try {
    // Try real API first
    console.log('Attempting real API call...');
    const pnrResponse = await fetchPNRStatus(pnrNumber);
    console.log('Real API successful, processing with new format...');
    
    // Check if the response data is in the new format (flat structure with trainNumber directly)
    const responseData = pnrResponse.data as any;
    if (responseData && responseData.trainNumber && responseData.sourceStation) {
      // Process as new format
      console.log('Using new format processing for real API response');
      return await processNewPNRFormat(responseData);
    } else {
      // Fallback to old format processing
      console.log('Using old format processing for real API response');
      return await processPNRDataWithStationNames(pnrResponse);
    }
  } catch (error) {
    console.error('PNR API Error:', error);
    
    // Use mock data in development mode if API fails
    if (DEVELOPMENT_MODE && useMockInDev) {
      console.warn('🔄 Real API failed, using mock PNR data for development');
      const mockResponse = getMockPNRData(pnrNumber);
      console.log('Mock response generated:', JSON.stringify(mockResponse, null, 2));
      return await processNewPNRFormat(mockResponse);
    }
    
    // Return error in production or when mock is disabled
    console.log('Returning error - production mode or mock disabled');
    return {
      pnrNumber,
      trainNumber: '',
      trainName: '',
      sourceStation: '',
      sourceStationCode: '',
      destinationStation: '',
      destinationStationCode: '',
      boardingPoint: '',
      journeyDate: new Date(),
      arrivalDate: undefined,
      class: '',
      totalFare: 0,
      passengerCount: 0,
      chartingStatus: '',
      coachNumber: undefined,
      seatNumber: undefined,
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to fetch PNR data'
    };
  }
}
