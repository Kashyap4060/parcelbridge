/**
 * Station search utilities - full Supabase implementation
 * This service provides station search functionality using Supabase
 */

import { supabase } from './supabase';
import { searchStations as stationServiceSearch, getStationDistance as stationServiceDistance } from './stationService';

export interface Station {
  name: string;
  code: string;
  lat?: number;
  lng?: number;
  state?: string;
  zone?: string;
}

/**
 * Search stations by name or code using Supabase
 */
export async function searchStations(searchTerm: string): Promise<Station[]> {
  // Delegate to the main stationService implementation
  return await stationServiceSearch(searchTerm);
}

/**
 * Get distance between two stations
 */
export async function getStationDistance(from: string, to: string): Promise<number> {
  // Delegate to the main stationService implementation
  const distance = await stationServiceDistance(from, to);
  return distance || 0;
}

/**
 * Get popular/frequently searched stations
 */
export async function getPopularStations(): Promise<Station[]> {
  try {
    // Try to get popular stations from analytics or usage data
    const { data: popularData, error } = await supabase
      .from('station_search_analytics')
      .select(`
        station_code,
        search_count,
        stations!inner(name, code, lat, lng, state, zone)
      `)
      .order('search_count', { ascending: false })
      .limit(20);

    if (!error && popularData && popularData.length > 0) {
      return popularData.map((item: any) => ({
        name: item.stations.name,
        code: item.stations.code,
        lat: item.stations.lat,
        lng: item.stations.lng,
        state: item.stations.state,
        zone: item.stations.zone
      }));
    }

    // Fallback to predefined popular stations
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('stations')
      .select('name, code, lat, lng, state, zone')
      .in('code', [
        'NDLS', // New Delhi
        'BCT',  // Mumbai Central
        'MAS',  // Chennai Central
        'HWH',  // Howrah Junction
        'SBC',  // Bangalore City
        'JP',   // Jaipur
        'ADI',  // Ahmedabad
        'LKO',  // Lucknow
        'PNBE', // Patna
        'BBS',  // Bhubaneswar
        'HYB',  // Hyderabad
        'TVC',  // Thiruvananthapuram
        'GHY',  // Guwahati
        'JAT',  // Jammu Tawi
        'INDB'  // Indore
      ]);

    if (fallbackError) {
      console.error('Error fetching popular stations:', fallbackError);
      return getHardcodedPopularStations();
    }

    return fallbackData || getHardcodedPopularStations();

  } catch (error) {
    console.error('Error fetching popular stations:', error);
    return getHardcodedPopularStations();
  }
}

/**
 * Get hardcoded popular stations as final fallback
 */
function getHardcodedPopularStations(): Station[] {
  return [
    { name: 'New Delhi', code: 'NDLS', lat: 28.6431, lng: 77.2197 },
    { name: 'Mumbai Central', code: 'BCT', lat: 18.9688, lng: 72.8205 },
    { name: 'Chennai Central', code: 'MAS', lat: 13.0843, lng: 80.2705 },
    { name: 'Howrah Jn', code: 'HWH', lat: 22.5851, lng: 88.3411 },
    { name: 'Bangalore City', code: 'SBC', lat: 12.9172, lng: 77.5804 },
    { name: 'Jaipur', code: 'JP', lat: 26.9188, lng: 75.7871 },
    { name: 'Ahmedabad Jn', code: 'ADI', lat: 23.0216, lng: 72.6447 },
    { name: 'Lucknow NR', code: 'LKO', lat: 26.8393, lng: 80.9231 },
    { name: 'Patna Jn', code: 'PNBE', lat: 25.6093, lng: 85.1376 },
    { name: 'Bhubaneswar', code: 'BBS', lat: 20.2648, lng: 85.8315 }
  ];
}

/**
 * Record station search for analytics
 */
export async function recordStationSearch(stationCode: string): Promise<void> {
  try {
    await supabase.rpc('increment_station_search_count', {
      p_station_code: stationCode.toUpperCase()
    });
  } catch (error) {
    console.error('Error recording station search:', error);
    // Don't throw error as this is non-critical
  }
}

/**
 * Get station suggestions based on partial input
 */
export async function getStationSuggestions(partialInput: string, limit: number = 10): Promise<Station[]> {
  try {
    if (!partialInput || partialInput.length < 2) {
      return await getPopularStations();
    }

    const { data, error } = await supabase
      .from('stations')
      .select('name, code, lat, lng, state, zone')
      .or(`name.ilike.%${partialInput}%,code.ilike.%${partialInput}%`)
      .order('name')
      .limit(limit);

    if (error) {
      console.error('Error fetching station suggestions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching station suggestions:', error);
    return [];
  }
}

/**
 * Get station details by code
 */
export async function getStationByCode(code: string): Promise<Station | null> {
  try {
    const { data, error } = await supabase
      .from('stations')
      .select('name, code, lat, lng, state, zone')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching station by code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching station by code:', error);
    return null;
  }
}
