/**
 * TypeScript types for Journey Verification System
 */

export interface JourneyVerificationResult {
  pnr_number: string;
  train_number: string;
  departure_date: string;
  is_valid: boolean;
  verification_confidence: number;
  pnr_status?: PNRStatus;
  train_info?: any;
  live_status?: any;
  validation_details?: JourneyValidation;
  error_message?: string;
  verified_at: string;
  expires_at: string;
}

export interface PNRStatus {
  pnr_number: string;
  train_number: string;
  status: 'confirmed' | 'waiting' | 'cancelled' | 'charting';
  passenger_details: PassengerDetail[];
  journey_details: {
    from_station: string;
    to_station: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    class: string;
    quota: string;
  };
  chart_status: boolean;
  booking_status: string;
}

export interface PassengerDetail {
  passenger_number: number;
  name: string;
  age: number;
  gender: string;
  status: string;
  berth_number?: string;
  coach?: string;
}

export interface TrainSchedule {
  train_number: string;
  train_name: string;
  from_station: string;
  to_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  distance: number;
  route: RouteStation[];
  days_of_operation: string[];
}

export interface RouteStation {
  station_code: string;
  station_name: string;
  arrival_time?: string;
  departure_time?: string;
  halt_time?: number;
  distance: number;
  day: number;
}

export interface JourneyValidation {
  is_valid: boolean;
  confidence_score: number;
  validation_checks: {
    pnr_valid: boolean;
    train_exists: boolean;
    train_running: boolean;
    schedule_matches: boolean;
    route_matches: boolean;
  };
  issues: string[];
  last_validated: string;
}

export interface RealTimeJourneyData {
  journey_id: string;
  train_number: string;
  pnr_number: string;
  from_station: string;
  to_station: string;
  departure_date: string;
  current_status: any;
  train_info: any;
  progress_percentage: number;
  estimated_arrival: string;
  delay_minutes: number;
  next_station: string;
  distance_covered: number;
  distance_remaining: number;
  last_updated: string;
}

export interface JourneyProgress {
  percentage: number;
  distance_covered: number;
  distance_remaining: number;
  estimated_arrival: string;
  stations_passed: number;
  stations_remaining: number;
  current_station: string;
  next_station: string;
}

export interface CarrierJourney {
  id: string;
  carrier_id: string;
  pnr_number: string;
  train_number: string;
  from_station_code: string;
  to_station_code: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  journey_status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyVerificationCache {
  id: string;
  pnr_number: string;
  train_number: string;
  departure_date: string;
  verification_data: JourneyVerificationResult;
  expires_at: string;
  created_at: string;
}