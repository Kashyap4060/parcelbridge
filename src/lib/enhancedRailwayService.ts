/**
 * Enhanced Railway Services - Comprehensive Train Data Management
 * Part of the Railway Data Management System for Parcel-Bridge
 */

import { supabase } from './supabase';

// =============================================
// ENHANCED TYPE DEFINITIONS
// =============================================

export interface Train {
  id?: string;
  train_number: string;
  train_name: string;
  train_type: string;
  source_station_code: string;
  source_station_name: string;
  destination_station_code: string;
  destination_station_name: string;
  departure_time: string;
  arrival_time: string;
  journey_duration?: string;
  frequency?: string;
  operational_days?: number[];
  zone?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Route {
  id?: string;
  train_number: string;
  station_code: string;
  station_name: string;
  sequence_number: number;
  arrival_time?: string;
  departure_time?: string;
  halt_duration?: string;
  distance_from_source: number;
  platform_number?: string;
  is_technical_halt?: boolean;
}

export interface EnhancedStation {
  id?: string;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  zone?: string;
  station_type?: string;
  zone_code?: string;
  division?: string;
  elevation_meters?: number;
  platforms_count?: number;
  is_major_station?: boolean;
  facilities?: string[];
  created_at?: string;
}

export interface TrainSearchResult {
  train_number: string;
  train_name: string;
  departure_time: string;
  arrival_time: string;
  journey_duration: string;
  distance_km: number;
  train_type?: string;
  available_days?: number[];
}

export interface JourneyPlan {
  from_station: EnhancedStation;
  to_station: EnhancedStation;
  trains: TrainSearchResult[];
  total_distance: number;
  fastest_option: TrainSearchResult;
  cheapest_option: TrainSearchResult;
  recommended_option: TrainSearchResult;
}

export interface RealTimeStatus {
  train_number: string;
  current_station_code?: string;
  current_station_name?: string;
  current_status: string;
  delay_minutes: number;
  last_updated: string;
}

// =============================================
// ENHANCED TRAIN SERVICE
// =============================================

export class EnhancedTrainService {
  
  /**
   * Search trains between two stations with advanced filtering
   */
  static async searchTrains(params: {
    fromStation: string;
    toStation: string;
    departureDate?: Date;
    trainType?: string;
    timeRange?: { from: string; to: string };
    includeRealTime?: boolean;
  }): Promise<TrainSearchResult[]> {
    try {
      const { data, error } = await supabase.rpc('get_trains_between_stations', {
        p_from_station: params.fromStation.toUpperCase(),
        p_to_station: params.toStation.toUpperCase(),
        p_departure_date: params.departureDate || new Date()
      });

      if (error) {
        console.error('Error searching trains:', error);
        return [];
      }

      let results = data || [];

      // Apply additional filters
      if (params.trainType) {
        const { data: trainTypes } = await supabase
          .from('trains')
          .select('train_number, train_type')
          .eq('train_type', params.trainType);
        
        const filteredNumbers = trainTypes?.map(t => t.train_number) || [];
        results = results.filter((train: any) => 
          filteredNumbers.includes(train.train_number)
        );
      }

      if (params.timeRange) {
        results = results.filter((train: any) => {
          const depTime = train.departure_time;
          return depTime >= params.timeRange!.from && depTime <= params.timeRange!.to;
        });
      }

      return results;

    } catch (error) {
      console.error('Error in searchTrains:', error);
      return [];
    }
  }

  /**
   * Get detailed train information
   */
  static async getTrainDetails(trainNumber: string): Promise<Train | null> {
    try {
      const { data, error } = await supabase
        .from('trains')
        .select('*')
        .eq('train_number', trainNumber.toUpperCase())
        .single();

      if (error) {
        console.error('Error getting train details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTrainDetails:', error);
      return null;
    }
  }

  /**
   * Get complete route for a train
   */
  static async getTrainRoute(trainNumber: string): Promise<Route[]> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('train_number', trainNumber.toUpperCase())
        .order('sequence_number');

      if (error) {
        console.error('Error getting train route:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getTrainRoute:', error);
      return [];
    }
  }

  /**
   * Get real-time status for a train
   */
  static async getRealTimeStatus(trainNumber: string, date?: Date): Promise<RealTimeStatus | null> {
    try {
      const queryDate = date || new Date();
      const { data, error } = await supabase
        .from('train_real_time')
        .select(`
          train_number,
          current_station_code,
          current_status,
          delay_minutes,
          last_updated,
          railway_stations:current_station_code (name)
        `)
        .eq('train_number', trainNumber.toUpperCase())
        .eq('journey_date', queryDate.toISOString().split('T')[0])
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error getting real-time status:', error);
        return null;
      }

      return {
        train_number: data.train_number,
        current_station_code: data.current_station_code,
        current_station_name: (data.railway_stations as any)?.name || 'Unknown',
        current_status: data.current_status,
        delay_minutes: data.delay_minutes,
        last_updated: data.last_updated
      };

    } catch (error) {
      console.error('Error in getRealTimeStatus:', error);
      return null;
    }
  }

  /**
   * Add a new train to the system
   */
  static async addTrain(train: Omit<Train, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trains')
        .insert(train);

      if (error) {
        console.error('Error adding train:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addTrain:', error);
      return false;
    }
  }

  /**
   * Bulk upload train data
   */
  static async bulkUploadTrains(trains: Omit<Train, 'id' | 'created_at'>[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const batchSize = 100;
    
    for (let i = 0; i < trains.length; i += batchSize) {
      const batch = trains.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('trains')
          .insert(batch);

        if (error) {
          result.failed += batch.length;
          result.errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
        } else {
          result.success += batch.length;
        }
      } catch (error) {
        result.failed += batch.length;
        result.errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error}`);
      }
    }

    return result;
  }
}

// =============================================
// ENHANCED ROUTE SERVICE
// =============================================

export class EnhancedRouteService {

  /**
   * Plan optimal journey between stations
   */
  static async planJourney(params: {
    fromStation: string;
    toStation: string;
    departureDate?: Date;
    preferences?: {
      fastest?: boolean;
      cheapest?: boolean;
      fewestTransfers?: boolean;
    };
  }): Promise<JourneyPlan | null> {
    try {
      // Get all available trains
      const trains = await EnhancedTrainService.searchTrains({
        fromStation: params.fromStation,
        toStation: params.toStation,
        departureDate: params.departureDate
      });

      if (trains.length === 0) {
        return null;
      }

      // Get station details
      const [fromStation, toStation] = await Promise.all([
        this.getStationDetails(params.fromStation),
        this.getStationDetails(params.toStation)
      ]);

      if (!fromStation || !toStation) {
        return null;
      }

      // Calculate total distance
      const totalDistance = trains[0]?.distance_km || 0;

      // Find fastest option
      const fastestOption = trains.reduce((fastest, current) => {
        const currentDuration = this.parseDuration(current.journey_duration);
        const fastestDuration = this.parseDuration(fastest.journey_duration);
        return currentDuration < fastestDuration ? current : fastest;
      });

      // For now, use fastest as cheapest and recommended
      // In future, integrate with fare calculation
      const cheapestOption = fastestOption;
      const recommendedOption = fastestOption;

      return {
        from_station: fromStation,
        to_station: toStation,
        trains: trains,
        total_distance: totalDistance,
        fastest_option: fastestOption,
        cheapest_option: cheapestOption,
        recommended_option: recommendedOption
      };

    } catch (error) {
      console.error('Error planning journey:', error);
      return null;
    }
  }

  /**
   * Get alternative routes
   */
  static async getAlternativeRoutes(params: {
    fromStation: string;
    toStation: string;
    maxStops?: number;
  }): Promise<JourneyPlan[]> {
    // This would implement multi-hop route finding
    // For now, return direct routes
    const directRoute = await this.planJourney(params);
    return directRoute ? [directRoute] : [];
  }

  /**
   * Add route information for a train
   */
  static async addTrainRoute(routes: Omit<Route, 'id'>[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('routes')
        .insert(routes);

      if (error) {
        console.error('Error adding train route:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addTrainRoute:', error);
      return false;
    }
  }

  /**
   * Get station details (enhanced)
   */
  private static async getStationDetails(stationCode: string): Promise<EnhancedStation | null> {
    try {
      const { data, error } = await supabase
        .from('railway_stations')
        .select('*')
        .eq('code', stationCode.toUpperCase())
        .single();

      if (error) {
        console.error('Error getting station details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStationDetails:', error);
      return null;
    }
  }

  /**
   * Parse duration string to minutes for comparison
   */
  private static parseDuration(duration: string): number {
    // Parse PostgreSQL interval format (e.g., "05:30:00")
    const parts = duration.split(':');
    if (parts.length >= 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  }
}

// =============================================
// ENHANCED DISTANCE SERVICE
// =============================================

export class EnhancedDistanceService {

  /**
   * Calculate distance with multiple route options
   */
  static async calculateDistanceWithOptions(
    fromCode: string, 
    toCode: string
  ): Promise<{
    shortest: number;
    fastest: number;
    recommended: number;
    routes: Array<{
      distance: number;
      via_trains: string[];
      journey_time: string;
    }>;
  } | null> {
    try {
      // Get all available routes
      const { data, error } = await supabase
        .from('station_distances')
        .select('distance_km, train_no, train_name')
        .or(
          `and(from_station_code.eq.${fromCode.toUpperCase()},to_station_code.eq.${toCode.toUpperCase()}),and(from_station_code.eq.${toCode.toUpperCase()},to_station_code.eq.${fromCode.toUpperCase()})`
        );

      if (error || !data || data.length === 0) {
        return null;
      }

      // Group by distance and find options
      const routes = data.map(route => ({
        distance: route.distance_km,
        via_trains: [route.train_no],
        journey_time: '0:00:00' // Would be calculated from actual schedules
      }));

      const distances = data.map(d => d.distance_km);
      const shortest = Math.min(...distances);
      const fastest = shortest; // For now, assuming shortest is fastest
      const recommended = shortest;

      return {
        shortest,
        fastest,
        recommended,
        routes
      };

    } catch (error) {
      console.error('Error calculating distance options:', error);
      return null;
    }
  }

  /**
   * Get distance matrix for multiple station pairs
   */
  static async getDistanceMatrix(
    stations: string[]
  ): Promise<{ [key: string]: { [key: string]: number } }> {
    const matrix: { [key: string]: { [key: string]: number } } = {};

    for (const from of stations) {
      matrix[from] = {};
      for (const to of stations) {
        if (from !== to) {
          const distance = await this.getSimpleDistance(from, to);
          matrix[from][to] = distance || 0;
        } else {
          matrix[from][to] = 0;
        }
      }
    }

    return matrix;
  }

  /**
   * Simple distance lookup (existing functionality)
   */
  private static async getSimpleDistance(fromCode: string, toCode: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('station_distances')
        .select('distance_km')
        .or(
          `and(from_station_code.eq.${fromCode.toUpperCase()},to_station_code.eq.${toCode.toUpperCase()}),and(from_station_code.eq.${toCode.toUpperCase()},to_station_code.eq.${fromCode.toUpperCase()})`
        )
        .single();

      if (error) {
        return null;
      }

      return data?.distance_km || null;
    } catch (error) {
      return null;
    }
  }
}

// =============================================
// ANALYTICS SERVICE
// =============================================

export class RailwayAnalyticsService {

  /**
   * Get popular routes
   */
  static async getPopularRoutes(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('popular_routes')
        .select('*')
        .order('search_count', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Error getting popular routes:', error);
      return [];
    }
  }

  /**
   * Record route search for analytics
   */
  static async recordRouteSearch(fromStation: string, toStation: string) {
    try {
      // Update or insert route analytics
      const { error } = await supabase.rpc('increment_route_search', {
        p_from_station: fromStation.toUpperCase(),
        p_to_station: toStation.toUpperCase()
      });

      if (error) {
        console.error('Error recording route search:', error);
      }
    } catch (error) {
      console.error('Error in recordRouteSearch:', error);
    }
  }

  /**
   * Get system statistics
   */
  static async getSystemStats() {
    try {
      const [trains, stations, routes, distances] = await Promise.all([
        supabase.from('trains').select('*', { count: 'exact', head: true }),
        supabase.from('railway_stations').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }),
        supabase.from('station_distances').select('*', { count: 'exact', head: true })
      ]);

      return {
        total_trains: trains.count || 0,
        total_stations: stations.count || 0,
        total_routes: routes.count || 0,
        total_distances: distances.count || 0
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        total_trains: 0,
        total_stations: 0,
        total_routes: 0,
        total_distances: 0
      };
    }
  }
}