// TypeScript interfaces for PNR API response structure

export interface TrainDetails {
  trainNumber: string;
  trainName: string;
}

export interface RouteInformation {
  fromStation: string;
  toStation: string;
}

export interface Schedule {
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
}

export interface SeatInfo {
  coachType: string;
  coachNumber: string;
  seatNumber: string;
}

export interface PNRResponse {
  "Train Details": TrainDetails;
  "Route Information": RouteInformation;
  "Schedule": Schedule;
  "Seat Information": SeatInfo[];
}

export interface PNRErrorResponse {
  error: string;
}

// Raw API response interfaces (for mapping)
export interface RawPassengerInfo {
  coachName?: string;
  coachNumber?: string;
  berthNumber?: string;
  [key: string]: any;
}

export interface RawBoardingInfo {
  stationName?: string;
  departureDate?: string;
  departureTime?: string;
  [key: string]: any;
}

export interface RawReservationInfo {
  stationName?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  [key: string]: any;
}

export interface RawPNRData {
  trainNumber?: string;
  trainName?: string;
  boardingInfo?: RawBoardingInfo;
  reservationUpto?: RawReservationInfo;
  passengerInfo?: RawPassengerInfo[];
  [key: string]: any;
}

export interface RawAPIResponse {
  status: boolean;
  data?: RawPNRData;
  [key: string]: any;
}



