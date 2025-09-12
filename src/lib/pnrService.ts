import axios from "axios";
import {
  PNRResponse,
  PNRErrorResponse,
  RawAPIResponse,
  RawPNRData,
  TrainDetails,
  RouteInformation,
  Schedule,
  SeatInfo
} from "@/types/PNR";

/**
 * Formats time string to hh:mm AM/PM format
 * @param timeString - Raw time string from API
 * @returns Formatted time string or empty string if invalid
 */
function formatTime(timeString: string): string {
  if (!timeString) return "";
  
  try {
    // Handle various time formats
    let timeStr = timeString.trim();
    
    // If already in AM/PM format, return as is
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      return timeStr;
    }
    
    // If in 24-hour format (HH:MM or H:MM)
    if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
      const [hours, minutes] = timeStr.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${period}`;
    }
    
    // If in HHMM format
    if (timeStr.match(/^\d{4}$/)) {
      const hours = timeStr.substring(0, 2);
      const minutes = timeStr.substring(2, 4);
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${period}`;
    }
    
    return timeString; // Return original if can't parse
  } catch (error) {
    console.warn('Error formatting time:', timeString, error);
    return timeString;
  }
}

/**
 * Transforms raw PNR API response into structured format
 * Handles various API response formats and structures
 * @param rawData - Raw API response data
 * @returns Structured PNR response
 */
function transformPNRData(rawData: RawPNRData): PNRResponse {
  console.log('Transforming PNR data:', rawData);

  // Handle the specific API format we're getting
  const trainDetails: TrainDetails = {
    trainNumber: rawData.trainNumber || "",
    trainName: rawData.trainName || "",
  };

  const routeInfo: RouteInformation = {
    fromStation: rawData.sourceStation || rawData.boardingPoint || "",
    toStation: rawData.destinationStation || rawData.reservationUpto || "",
  };

  // Parse dates and times from the API format with IST timezone handling
  const parseDateTime = (dateStr: string | Date | any): { date: string; time: string } => {
    if (!dateStr) return { date: "", time: "" };
    
    try {
      // If dateStr is already a Date object or timestamp, handle it
      let date: Date;
      if (dateStr instanceof Date) {
        date = dateStr;
      } else if (typeof dateStr === 'string') {
        // Parse the date string - PNR API returns IST dates
        date = new Date(dateStr);
      } else {
        // Handle timestamp or other formats
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) {
        return { date: "", time: "" };
      }
      
      // Convert to IST if needed and format
      const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      
      return {
        date: istDate.toLocaleDateString("en-GB"), // DD-MM-YYYY format
        time: formatTime(istDate.toLocaleTimeString('en-US', { hour12: false }))
      };
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
      return { date: "", time: "" };
    }
  };

  const departure = parseDateTime(rawData.dateOfJourney || "");
  const arrival = parseDateTime(rawData.arrivalDate || "");

  const schedule: Schedule = {
    departureDate: departure.date,
    departureTime: departure.time,
    arrivalDate: arrival.date,
    arrivalTime: arrival.time,
  };

  // Handle passenger info - use passengerList from the actual API
  const passengerData = rawData.passengerList || rawData.passengerInfo || [];
  const seatInfo: SeatInfo[] = passengerData.map((passenger: any) => ({
    coachType: rawData.journeyClass || passenger.journeyClass || "",
    coachNumber: passenger.currentCoachId || passenger.bookingCoachId || "",
    seatNumber: (passenger.currentBerthNo || passenger.bookingBerthNo || "").toString(),
  }));

  return {
    "Train Details": trainDetails,
    "Route Information": routeInfo,
    "Schedule": schedule,
    "Seat Information": seatInfo,
  };
}

/**
 * Alternative transformer for different API response formats
 * Use this if your API response has a different structure
 * @param rawResponse - Complete raw API response
 * @returns Structured PNR response or error
 */
export function transformRawPNRResponse(rawResponse: any): PNRResponse | PNRErrorResponse {
  try {
    // Handle case where response structure might be different
    let pnrData: any;
    
    if (rawResponse.data) {
      pnrData = rawResponse.data;
    } else if (rawResponse.result) {
      pnrData = rawResponse.result;
    } else if (rawResponse.pnrDetails) {
      pnrData = rawResponse.pnrDetails;
    } else {
      pnrData = rawResponse;
    }

    const trainDetails: TrainDetails = {
      trainNumber: pnrData.trainNumber || pnrData.train_number || pnrData.trainNo || "",
      trainName: pnrData.trainName || pnrData.train_name || pnrData.trainTitle || "",
    };

    const routeInfo: RouteInformation = {
      fromStation: pnrData.boardingInfo?.stationName || 
                   pnrData.fromStation || 
                   pnrData.sourceStation || 
                   pnrData.origin || "",
      toStation: pnrData.reservationUpto?.stationName || 
                 pnrData.toStation || 
                 pnrData.destinationStation || 
                 pnrData.destination || "",
    };

    const schedule: Schedule = {
      departureDate: pnrData.boardingInfo?.departureDate || 
                     pnrData.departureDate || 
                     pnrData.journeyDate || "",
      departureTime: formatTime(pnrData.boardingInfo?.departureTime || 
                               pnrData.departureTime || 
                               pnrData.depTime || ""),
      arrivalDate: pnrData.reservationUpto?.arrivalDate || 
                   pnrData.arrivalDate || 
                   pnrData.arrDate || "",
      arrivalTime: formatTime(pnrData.reservationUpto?.arrivalTime || 
                             pnrData.arrivalTime || 
                             pnrData.arrTime || ""),
    };

    // Handle passenger info with different possible structures
    let passengerData: any[] = [];
    if (pnrData.passengerInfo) {
      passengerData = Array.isArray(pnrData.passengerInfo) ? pnrData.passengerInfo : [pnrData.passengerInfo];
    } else if (pnrData.passengers) {
      passengerData = Array.isArray(pnrData.passengers) ? pnrData.passengers : [pnrData.passengers];
    } else if (pnrData.passengerList) {
      passengerData = Array.isArray(pnrData.passengerList) ? pnrData.passengerList : [pnrData.passengerList];
    }

    const seatInfo: SeatInfo[] = passengerData.map((passenger) => ({
      coachType: passenger.coachName || passenger.coach_type || passenger.class || "",
      coachNumber: passenger.coachNumber || passenger.coach_number || passenger.coachId || "",
      seatNumber: passenger.berthNumber || passenger.seat_number || passenger.seatNo || "",
    }));

    return {
      "Train Details": trainDetails,
      "Route Information": routeInfo,
      "Schedule": schedule,
      "Seat Information": seatInfo,
    };
  } catch (error) {
    return { error: `Error transforming PNR data: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

/**
 * Fetches PNR status from Indian Railways API and transforms response
 * @param pnrNumber - 10-digit PNR number
 * @param apiKey - RapidAPI key for authentication
 * @returns Structured PNR response or error object
 */
export async function getPNRStatus(
  pnrNumber: string, 
  apiKey: string
): Promise<PNRResponse | PNRErrorResponse> {
  // Correct API endpoint based on documentation
  const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnrNumber}`;

  const headers = {
    "X-RapidAPI-Host": "irctc-indian-railway-pnr-status.p.rapidapi.com",
    "X-RapidAPI-Key": apiKey,
  };

  try {
    console.log(`Calling PNR API: ${url}`);
    
    // Use GET method as per API documentation
    const response = await axios.get<RawAPIResponse>(url, { headers });

    if (response.status === 200) {
      const data = response.data;
      console.log('PNR API Response:', data);
      console.log('PNR Data Structure:', JSON.stringify(data, null, 2));

      // Handle different response formats
      if (data.success || data.status === true || data) {
        const pnrData = data.data || data.result || data;
        
        if (pnrData) {
          return transformPNRData(pnrData);
        } else {
          return { error: "No PNR data found in response" };
        }
      } else {
        return { error: (data as any).message || "Invalid PNR or no data found" };
      }
    } else {
      return { error: `API request failed with status code ${response.status}` };
    }
  } catch (err: any) {
    console.error('PNR API Error:', err);
    
    // Handle specific error cases
    if (err.response) {
      const status = err.response.status;
      const message = err.response.data?.message || err.response.statusText;
      
      if (status === 401) {
        return { error: "Invalid API key. Please check your RapidAPI key." };
      } else if (status === 403) {
        return { error: "API access forbidden. Please check your subscription." };
      } else if (status === 404) {
        return { error: "PNR not found or API endpoint not available." };
      } else if (status === 429) {
        return { error: "API rate limit exceeded. Please try again later." };
      } else {
        return { error: `API Error (${status}): ${message}` };
      }
    } else if (err.request) {
      return { error: "Network error. Please check your internet connection." };
    } else {
      return { error: err.message || "Unknown error occurred" };
    }
  }
}

/**
 * Validates PNR number format
 * @param pnrNumber - PNR number to validate
 * @returns Validation result
 */
export function validatePNRNumber(pnrNumber: string): { isValid: boolean; error?: string } {
  if (!pnrNumber) {
    return { isValid: false, error: "PNR number is required" };
  }

  const cleanPNR = pnrNumber.replace(/\s/g, '');
  
  if (cleanPNR.length !== 10) {
    return { isValid: false, error: "INVALID_PNR_FORMAT" };
  }

  if (!/^\d{10}$/.test(cleanPNR)) {
    return { isValid: false, error: "INVALID_PNR_FORMAT" };
  }

  return { isValid: true };
}

/**
 * Demo function showing how to use the PNR service
 */
export async function demoPNRUsage() {
  const apiKey = "your_rapidapi_key"; // Replace with your actual RapidAPI key
  const pnrNumber = "1234567890";     // Replace with actual PNR
  
  // Validate PNR first
  const validation = validatePNRNumber(pnrNumber);
  if (!validation.isValid) {
    console.error("Invalid PNR:", validation.error);
    return;
  }

  // Fetch PNR status
  const result = await getPNRStatus(pnrNumber, apiKey);
  
  if ('error' in result) {
    console.error("PNR Error:", result.error);
  } else {
    console.log("PNR Details:", JSON.stringify(result, null, 2));
  }
}

// Legacy compatibility exports for existing code
export const validatePNRFormat = validatePNRNumber;

/**
 * Legacy getPNRData function for compatibility - now uses real API data
 * @param pnrNumber - PNR number to fetch
 * @param allowMock - Ignored, always fetches real data
 * @returns Processed PNR data in legacy format from real API
 */
export async function getPNRData(pnrNumber: string, allowMock: boolean = false): Promise<any> {
  try {
    // Validate PNR format first
    const validation = validatePNRNumber(pnrNumber);
    if (!validation.isValid) {
      return {
        isValid: false,
        error: validation.error
      };
    }

    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    console.log('RAPIDAPI_KEY check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      firstChars: apiKey?.substring(0, 10) || 'undefined'
    });
    
    if (!apiKey) {
      return {
        isValid: false,
        error: "API_KEY_INVALID"
      };
    }

    // Fetch real PNR data using the API
    const result = await getPNRStatus(pnrNumber, apiKey);
    
    if ('error' in result) {
      return {
        isValid: false,
        error: result.error
      };
    }

    // Convert cleaned response to legacy format expected by Add Journey page
    const trainDetails = result["Train Details"];
    const routeInfo = result["Route Information"];
    const schedule = result["Schedule"];
    const seatInfo = result["Seat Information"][0] || {};

    // Get additional info from the raw API response
    const rawResult = await getPNRStatus(pnrNumber, apiKey);
  let bookingFare = 0;
  let chartStatus = "Unknown";
  let journeyClass = mapCoachTypeToJourneyClass(seatInfo.coachType || "");
  let dateOfJourneyRaw: string | undefined;
  let arrivalDateRaw: string | undefined;

    // Extract additional data if we have raw response
    if ('data' in rawResult === false) {
      // This means we got the transformed response, let's get raw data
      console.log('Getting additional data from raw API...');
      try {
        const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnrNumber}`;
        const headers = {
          "X-RapidAPI-Host": "irctc-indian-railway-pnr-status.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        };
        const rawResponse = await axios.get(url, { headers });
        if (rawResponse.data?.data) {
          const apiData = rawResponse.data.data;
          bookingFare = apiData.bookingFare || apiData.ticketFare || 0;
          chartStatus = apiData.chartStatus || "Unknown";
          journeyClass = mapCoachTypeToJourneyClass(apiData.journeyClass || seatInfo.coachType || "");
          // Capture raw date strings exactly as provided by API for precise parsing on UI
          if (typeof apiData.dateOfJourney === 'string') {
            dateOfJourneyRaw = apiData.dateOfJourney;
          }
          if (typeof apiData.arrivalDate === 'string') {
            arrivalDateRaw = apiData.arrivalDate;
          }
        }
      } catch (error) {
        console.warn('Could not fetch additional data:', error);
      }
    }

    // Helper function to safely parse dates
    const parseSafeDate = (dateStr: string, timeStr: string): Date => {
      if (!dateStr || !timeStr) {
        return new Date(); // Return current date if invalid
      }
      
      try {
        const dateTimeStr = `${dateStr} ${timeStr}`;
        const date = new Date(dateTimeStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn('Invalid date created:', dateTimeStr);
          return new Date(); // Return current date if invalid
        }
        
        return date;
      } catch (error) {
        console.warn('Error parsing date:', dateStr, timeStr, error);
        return new Date(); // Return current date if parsing fails
      }
    };

  // Parse dates safely
  const journeyDate = parseSafeDate(schedule.departureDate, schedule.departureTime);
  const arrivalDate = parseSafeDate(schedule.arrivalDate, schedule.arrivalTime);

    return {
      isValid: true,
      pnrNumber: pnrNumber,
      trainNumber: trainDetails.trainNumber,
      trainName: trainDetails.trainName,
      sourceStation: routeInfo.fromStation,
      destinationStation: routeInfo.toStation,
  journeyDate: journeyDate,
  arrivalDate: arrivalDate,
  // Provide raw strings from API if available for precise parsing on UI
  dateOfJourneyRaw,
  arrivalDateRaw,
      journeyClass: journeyClass,
      coachNumber: seatInfo.coachNumber || "",
      seatNumber: parseInt(seatInfo.seatNumber || "0") || 0,
      bookingFare: bookingFare,
      chartStatus: chartStatus
    };

  } catch (error) {
    console.error('Error fetching PNR data:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to fetch PNR data'
    };
  }
}

/**
 * Helper function to map coach types to journey classes
 */
function mapCoachTypeToJourneyClass(coachType: string): string {
  const mapping: { [key: string]: string } = {
    'sleeper': 'sleeper',
    'sl': 'sleeper',
    'ac3': 'ac3',
    '3a': 'ac3',
    'ac2': 'ac2',
    '2a': 'ac2',
    'ac1': 'ac1',
    '1a': 'ac1',
    'cc': 'cc',
    '2s': '2s'
  };
  
  return mapping[coachType.toLowerCase()] || 'sleeper';
}

/**
 * Legacy extractTimeInfo function for compatibility
 * @param pnrData - PNR data object
 * @returns Time information
 */
export function extractTimeInfo(pnrData: any): {
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
} {
  // Helper function to safely extract date string with IST handling
  const safeExtractDate = (dateObj: any): string => {
    if (!dateObj) return '';
    
    try {
      let date: Date;
      if (dateObj instanceof Date) {
        date = dateObj;
      } else if (typeof dateObj === 'string') {
        // Handle PNR API date formats like "Feb 9, 2025 11:30:05 AM"
        date = new Date(dateObj);
      } else {
        date = new Date(dateObj);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date object:', dateObj);
        return '';
      }
      
      // PNR API already provides IST dates, just format them
      return date.toLocaleDateString("en-GB"); // DD-MM-YYYY format
    } catch (error) {
      console.warn('Error parsing date:', dateObj, error);
      return '';
    }
  };

  // Helper function to safely extract time string with IST handling
  const safeExtractTime = (dateObj: any): string => {
    if (!dateObj) return '';
    
    try {
      let date: Date;
      if (dateObj instanceof Date) {
        date = dateObj;
      } else if (typeof dateObj === 'string') {
        // Handle PNR API date formats like "Feb 9, 2025 11:30:05 AM"
        date = new Date(dateObj);
      } else {
        date = new Date(dateObj);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date object:', dateObj);
        return '';
      }
      
      // PNR API already provides IST times, format as 12-hour
      return date.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.warn('Error parsing time:', dateObj, error);
      return '';
    }
  };

  // Extract values directly from PNR API response without custom calculation
  const departureDate = safeExtractDate(pnrData.dateOfJourney);
  const departureTime = safeExtractTime(pnrData.dateOfJourney);
  const arrivalDate = safeExtractDate(pnrData.arrivalDate);
  const arrivalTime = safeExtractTime(pnrData.arrivalDate);
  
  console.log('Extracted time info from PNR API:', {
    departureDate,
    departureTime,
    arrivalDate,
    arrivalTime
  });
  
  return {
    departureTime,
    arrivalTime,
    departureDate,
    arrivalDate
  };
}



