/**
 * Railway MCP Integration Service
 * Provides accurate Indian Railway data for distance calculation and train information
 */

import { supabase } from '@/lib/supabase';

interface TrainSearchResult {
  trainNumber: string;
  trainName: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: number;
  classes: string[];
  days: string;
}

interface TrainInfo {
  number: string;
  name: string;
  type: string;
  route: string;
  runs: string;
  classes: string[];
  zone: string;
  pantry: boolean;
  bookingDays: number;
  schedule: TrainStation[];
}

interface TrainStation {
  code: string;
  name: string;
  distance: number;
  arrival: string;
  departure: string;
  platform: string;
  halt: string;
}

interface LiveTrainStatus {
  trainNumber: string;
  date: string;
  stations: LiveStationStatus[];
}

interface LiveStationStatus {
  stationCode: string;
  stationName: string;
  distance: number;
  platform: string;
  scheduledArrival: string;
  actualArrival: string;
  scheduledDeparture: string;
  actualDeparture: string;
  delay: number;
}

interface StationCodeResult {
  name: string;
  code: string;
  matches?: Array<{ name: string; code: string }>;
}

export class RailwayMCPService {
  private static readonly BASE_URL = 'https://railway-mcp.amithv.xyz';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Search for trains between two stations
   */
  static async searchTrains(
    fromCode: string, 
    toCode: string, 
    date: Date = new Date()
  ): Promise<TrainSearchResult[]> {
    try {
      console.log(`🔍 Railway MCP: Searching trains ${fromCode} → ${toCode}`);
      
      // Check cache first
      const cacheKey = `trains_${fromCode}_${toCode}_${date.toDateString()}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        console.log(`💾 Railway MCP: Using cached train data`);
        return cached;
      }
      
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      // Note: This is a conceptual implementation
      // The actual Railway MCP integration would need the specific API endpoints
      const response = await fetch(`${this.BASE_URL}/search-trains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromCode,
          to: toCode,
          date: dateStr
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Railway MCP API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Railway MCP: Found ${data.trains?.length || 0} trains`);
      
      const results = this.parseTrainSearchResults(data);
      await this.setCachedData(cacheKey, results);
      
      return results;
    } catch (error: any) {
      console.error('❌ Railway MCP search error:', error);
      
      // Cache empty result to avoid repeated failed API calls
      const cacheKey = `trains_${fromCode}_${toCode}_${date.toDateString()}`;
      await this.setCachedData(cacheKey, []);
      
      // Re-throw for caller to handle gracefully
      throw error;
    }
  }

  /**
   * Get detailed train information
   */
  static async getTrainInfo(trainNumber: string): Promise<TrainInfo | null> {
    try {
      console.log(`🚂 Railway MCP: Getting train info for ${trainNumber}`);
      
      // Check cache first
      const cacheKey = `train_info_${trainNumber}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached) return cached;
      
      const response = await fetch(`${this.BASE_URL}/train-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainNumber })
      });

      if (!response.ok) {
        throw new Error(`Railway MCP API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Railway MCP: Train info retrieved for ${trainNumber}`);
      
      const result = this.parseTrainInfo(data);
      if (result) {
        await this.setCachedData(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Railway MCP train info error:', error);
      return null;
    }
  }

  /**
   * Get live train status
   */
  static async getLiveTrainStatus(
    trainNumber: string, 
    date: Date = new Date()
  ): Promise<LiveTrainStatus | null> {
    try {
      console.log(`📍 Railway MCP: Getting live status for ${trainNumber}`);
      
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await fetch(`${this.BASE_URL}/live-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainNumber,
          date: dateStr
        })
      });

      if (!response.ok) {
        throw new Error(`Railway MCP API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Railway MCP: Live status retrieved for ${trainNumber}`);
      
      return this.parseLiveStatus(data);
    } catch (error) {
      console.error('❌ Railway MCP live status error:', error);
      return null;
    }
  }

  /**
   * Get station code by name
   */
  static async getStationCode(stationName: string): Promise<StationCodeResult | null> {
    try {
      console.log(`🏠 Railway MCP: Getting station code for "${stationName}"`);
      
      // Check cache first
      const cacheKey = `station_code_${stationName.toLowerCase()}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached) return cached;
      
      const response = await fetch(`${this.BASE_URL}/station-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: stationName })
      });

      if (!response.ok) {
        throw new Error(`Railway MCP API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Railway MCP: Station code retrieved for "${stationName}"`);
      
      const result = this.parseStationCode(data);
      if (result) {
        await this.setCachedData(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Railway MCP station code error:', error);
      return null;
    }
  }

  /**
   * Get accurate distance between stations using train route data
   */
  static async getAccurateDistance(fromCode: string, toCode: string): Promise<number | null> {
    try {
      console.log(`📏 Railway MCP: Calculating accurate distance ${fromCode} → ${toCode}`);
      
      // Check cache first
      const cacheKey = `distance_${fromCode}_${toCode}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached && typeof cached === 'number') {
        console.log(`💾 Railway MCP: Using cached distance ${cached} km`);
        return cached;
      }
      
      // First try to find trains between these stations
      const trains = await this.searchTrains(fromCode, toCode);
      
      if (trains.length > 0) {
        // Use the shortest distance from available trains
        const distances = trains.map(train => train.distance).filter(d => d > 0);
        if (distances.length > 0) {
          const shortestDistance = Math.min(...distances);
          console.log(`✅ Railway MCP: Found accurate distance ${shortestDistance} km`);
          
          // Cache the result
          await this.setCachedData(cacheKey, shortestDistance);
          return shortestDistance;
        }
      }

      // If no direct trains, try to get detailed train info for major trains
      // and calculate distance from route data
      console.log(`⚠️ Railway MCP: No direct trains found for ${fromCode} → ${toCode}`);
      
      // Cache null result to avoid repeated failed API calls
      await this.setCachedData(cacheKey, null);
      return null;
      
    } catch (error) {
      console.error('❌ Railway MCP distance calculation error:', error);
      
      // Cache null result to avoid repeated failed API calls for same route
      const cacheKey = `distance_${fromCode}_${toCode}`;
      await this.setCachedData(cacheKey, null);
      return null;
    }
  }

  /**
   * Cache management for Railway MCP data
   */
  private static async getCachedData(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('railway_cache')
        .select('data, created_at')
        .eq('cache_key', key)
        .single();

      if (error) {
        // If table doesn't exist or RLS issues, silently fail and continue with API call
        if (error.code === 'PGRST116' || error.message.includes('406')) {
          console.log(`⚠️ Railway cache table not accessible, proceeding without cache`);
        }
        return null;
      }

      if (data && data.created_at) {
        const cacheAge = Date.now() - new Date(data.created_at).getTime();
        if (cacheAge < this.CACHE_DURATION) {
          console.log(`💾 Railway MCP: Using cached data for ${key}`);
          return data.data;
        } else {
          console.log(`⏰ Railway MCP: Cache expired for ${key}`);
        }
      }
    } catch (error) {
      // Cache miss or table access issues are expected, continue with API call
      console.log(`💾 Railway MCP: Cache miss for ${key}`);
    }
    return null;
  }

  private static async setCachedData(key: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('railway_cache')
        .upsert({
          cache_key: key,
          data: data,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`⚠️ Railway MCP: Cache storage failed for ${key}:`, error.message);
      } else {
        console.log(`💾 Railway MCP: Cached data for ${key}`);
      }
    } catch (error) {
      // Non-critical error, continue without caching
      console.log(`⚠️ Railway MCP: Cache storage error for ${key}`);
    }
  }

  /**
   * Parse train search results from Railway MCP response
   */
  private static parseTrainSearchResults(data: any): TrainSearchResult[] {
    if (!data.trains || !Array.isArray(data.trains)) {
      return [];
    }

    return data.trains.map((train: any) => ({
      trainNumber: train.number || '',
      trainName: train.name || '',
      departure: train.departure || '',
      arrival: train.arrival || '',
      duration: train.duration || '',
      distance: parseInt(train.distance) || 0,
      classes: train.classes || [],
      days: train.days || ''
    }));
  }

  /**
   * Parse train info from Railway MCP response
   */
  private static parseTrainInfo(data: any): TrainInfo | null {
    if (!data.train) {
      return null;
    }

    const train = data.train;
    return {
      number: train.number || '',
      name: train.name || '',
      type: train.type || '',
      route: train.route || '',
      runs: train.runs || '',
      classes: train.classes || [],
      zone: train.zone || '',
      pantry: train.pantry || false,
      bookingDays: train.bookingDays || 120,
      schedule: train.schedule || []
    };
  }

  /**
   * Parse live status from Railway MCP response
   */
  private static parseLiveStatus(data: any): LiveTrainStatus | null {
    if (!data.status) {
      return null;
    }

    return {
      trainNumber: data.status.trainNumber || '',
      date: data.status.date || '',
      stations: data.status.stations || []
    };
  }

  /**
   * Parse station code from Railway MCP response
   */
  private static parseStationCode(data: any): StationCodeResult | null {
    if (!data.result) {
      return null;
    }

    return {
      name: data.result.name || '',
      code: data.result.code || '',
      matches: data.result.matches || []
    };
  }
}

export default RailwayMCPService;