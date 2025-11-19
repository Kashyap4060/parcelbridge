/**
 * TypeScript types for Real-Time Tracking System
 */

export interface PackageTrackingData {
  id: string;
  tracking_number: string;
  sender_id: string;
  carrier_id: string;
  journey_id: string;
  pickup_station: string;
  delivery_station: string;
  status: string;
  created_at: string;
  carrier: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  journey: {
    id: string;
    pnr_number: string;
    train_number: string;
    from_station_code: string;
    to_station_code: string;
    departure_date: string;
    departure_time: string;
    arrival_time: string;
    journey_status: string;
  };
}

export interface TrainStatus {
  train_number: string;
  current_station: string;
  current_station_name: string;
  next_station: string;
  next_station_name: string;
  delay_minutes: number;
  estimated_arrival?: string;
  train_started: boolean;
  train_terminated: boolean;
  last_updated: string;
  station_sequence?: TrainStationSequence[];
}

export interface TrainStationSequence {
  station_code: string;
  station_name: string;
  arrival_time?: string;
  departure_time?: string;
  distance: number;
  day: number;
  halt_time?: number;
  passed: boolean;
}

export interface CarrierLocation {
  carrier_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  is_active: boolean;
  speed?: number;
  heading?: number;
}

export type PackageStatus = 
  | 'pending'
  | 'accepted'
  | 'waiting_for_departure'
  | 'pickup_available'
  | 'picked_up'
  | 'in_transit'
  | 'approaching_destination'
  | 'arrived_at_destination'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'delayed';

export interface TrackingEvent {
  id: string;
  package_id: string;
  event_type: TrackingEventType;
  train_status?: TrainStatus;
  carrier_location?: CarrierLocation;
  package_status: PackageStatus;
  estimated_arrival?: string;
  delay_minutes: number;
  description?: string;
  created_at: string;
}

export type TrackingEventType =
  | 'status_update'
  | 'location_update'
  | 'train_delay'
  | 'station_arrival'
  | 'station_departure'
  | 'pickup_completed'
  | 'delivery_completed'
  | 'carrier_location_shared'
  | 'manual_update';

export interface TrackingUpdate {
  package_id: string;
  timestamp: string;
  train_status: TrainStatus | null;
  carrier_location: CarrierLocation | null;
  package_status: PackageStatus;
  estimated_arrival: string | null;
  delay_minutes: number;
}

export interface PackageTrackingSummary {
  package_id: string;
  tracking_number: string;
  current_status: PackageStatus;
  train_number: string;
  from_station: string;
  to_station: string;
  current_location?: {
    station_code: string;
    station_name: string;
    latitude?: number;
    longitude?: number;
  };
  progress_percentage: number;
  estimated_arrival: string | null;
  delay_minutes: number;
  last_updated: string;
  tracking_active: boolean;
}

export interface LiveTrackingMap {
  train_position?: {
    latitude: number;
    longitude: number;
    heading?: number;
  };
  carrier_position?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  route_stations: RouteStation[];
  current_station_index: number;
  package_status: PackageStatus;
}

export interface RouteStation {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  arrival_time?: string;
  departure_time?: string;
  is_current: boolean;
  is_passed: boolean;
  is_pickup: boolean;
  is_delivery: boolean;
  distance_from_start: number;
}

export interface TrackingNotification {
  id: string;
  package_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'pickup_available'
  | 'package_picked_up'
  | 'train_delay'
  | 'approaching_destination'
  | 'package_delivered'
  | 'carrier_location_update'
  | 'status_change';

export interface TrackingSettings {
  real_time_updates: boolean;
  location_sharing: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  update_frequency: number; // minutes
}

export interface TrackingAnalytics {
  total_packages_tracked: number;
  average_tracking_accuracy: number;
  average_delay_minutes: number;
  delivery_success_rate: number;
  most_delayed_routes: {
    from_station: string;
    to_station: string;
    average_delay: number;
  }[];
  tracking_performance: {
    api_response_time: number;
    cache_hit_rate: number;
    update_frequency: number;
  };
}

// Database table interfaces
export interface PackageTrackingTable {
  id: string;
  package_id: string;
  train_number: string;
  from_station: string;
  to_station: string;
  tracking_active: boolean;
  last_train_status?: TrainStatus;
  last_carrier_location?: CarrierLocation;
  current_package_status: PackageStatus;
  estimated_arrival?: string;
  delay_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface TrackingEventsTable {
  id: string;
  package_id: string;
  event_type: TrackingEventType;
  train_status?: TrainStatus;
  carrier_location?: CarrierLocation;
  package_status: PackageStatus;
  estimated_arrival?: string;
  delay_minutes: number;
  description?: string;
  created_at: string;
}

export interface CarrierLocationsTable {
  id: string;
  carrier_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Additional types for automated status updates
export interface StatusUpdateRule {
  id: string;
  fromStatus: PackageStatus;
  toStatus: PackageStatus;
  condition: string;
  priority: number;
  description: string;
}

export interface StatusTransition {
  packageId: string;
  fromStatus: PackageStatus;
  toStatus: PackageStatus;
  ruleId: string;
  reason: string;
  timestamp: string;
  automated: boolean;
}

export interface AutomatedStatusUpdate {
  packageId: string;
  transition: StatusTransition;
  success: boolean;
  error?: string;
  timestamp: string;
}