/**
 * Station service
 */

import { supabase } from './supabase';

export interface Station {
  id?: string;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  zone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StationDistance {
  from_station_code: string;
  to_station_code: string;
  distance_km: number;
}

/**
 * Search stations by name or code
 */
export async function searchStations(searchTerm: string): Promise<Station[]> {
  try {
    const { data, error } = await supabase
      .from('railway_stations')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      .limit(20);

    if (error) {
      console.error('Error searching stations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching stations:', error);
    return [];
  }
}

/**
 * Get station by code
 */
export async function getStationByCode(code: string): Promise<Station | null> {
  try {
    const { data, error } = await supabase
      .from('railway_stations')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) {
      console.error('Error getting station by code:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting station by code:', error);
    return null;
  }
}

/**
 * Get distance between two stations
 * Priority: Database → Coordinates → Hardcoded → Default
 */
export async function getStationDistance(fromCode: string, toCode: string): Promise<number | null> {
  try {
    const from = fromCode.toUpperCase();
    const to = toCode.toUpperCase();
    
    console.log(`🔍 Distance lookup: ${from} → ${to}`);
    
    // **Phase 1: Try Database Lookup**
    // Try direct lookup first (from → to)
    let { data, error } = await supabase
      .from('station_distances')
      .select('distance_km, from_station_code, to_station_code')
      .eq('from_station_code', from)
      .eq('to_station_code', to)
      .maybeSingle();

    // If not found, try reverse direction (to → from)
    if (!data && !error) {
      const result = await supabase
        .from('station_distances')
        .select('distance_km, from_station_code, to_station_code')
        .eq('from_station_code', to)
        .eq('to_station_code', from)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Database query error for station distance:', error);
      console.log('🔄 Falling back to approximate distance calculation');
      return await calculateApproximateDistance(from, to);
    }

    if (data?.distance_km) {
      console.log(`✅ Found database distance: ${data.distance_km} km (${data.from_station_code} → ${data.to_station_code})`);
      return data.distance_km;
    } else {
      console.log(`⚠️ No distance found in database for ${from} → ${to}`);
      console.log('🔄 Falling back to approximate distance calculation');
      return await calculateApproximateDistance(from, to);
    }
  } catch (error) {
    console.error('❌ Exception in getStationDistance:', error);
    return await calculateApproximateDistance(fromCode, toCode);
  }
}

/**
 * Calculate approximate distance using station coordinates if available
 */
async function calculateApproximateDistance(fromCode: string, toCode: string): Promise<number> {
  try {
    console.log(`🌍 Calculating approximate distance for ${fromCode} → ${toCode}`);
    
    const { data: stations, error } = await supabase
      .from('stations')
      .select('station_code, latitude, longitude')
      .in('station_code', [fromCode.toUpperCase(), toCode.toUpperCase()]);

    if (error || !stations || stations.length !== 2) {
      console.log(`📊 Using hardcoded distance for ${fromCode} → ${toCode}`);
      
      // Return default distance for major routes if no data available
      const defaultDistances: Record<string, number> = {
        'NDLS-BCT': 1384, 'BCT-NDLS': 1384,
        'NDLS-MAA': 1759, 'MAA-NDLS': 1759,
        'BCT-MAA': 1279, 'MAA-BCT': 1279,
        'NDLS-PUNE': 1238, 'PUNE-NDLS': 1238,
        'LTT-NCB': 2280, 'NCB-LTT': 2280  // Fixed: Updated to correct distance
      };
      
      const key = `${fromCode.toUpperCase()}-${toCode.toUpperCase()}`;
      const distance = defaultDistances[key] || 500; // Default 500km if no match
      console.log(`📏 Using ${distance} km for ${fromCode} → ${toCode}`);
      return distance;
    }

    const [station1, station2] = stations;
    if (!station1.latitude || !station1.longitude || !station2.latitude || !station2.longitude) {
      console.log(`⚠️ Missing coordinates for stations, using default 500km`);
      return 500; // Default distance
    }

    // Calculate Haversine distance
    const distance = haversineDistance(
      station1.latitude, station1.longitude,
      station2.latitude, station2.longitude
    );

    // Add 20% to account for railway route vs straight line distance
    const adjustedDistance = Math.round(distance * 1.2);
    console.log(`🗺️ Calculated distance: ${Math.round(distance)} km (straight line) → ${adjustedDistance} km (railway route)`);
    return adjustedDistance;
  } catch (error) {
    console.error('❌ Error calculating approximate distance:', error);
    return 500; // Default distance
  }
}

/**
 * Calculate Haversine distance between two points
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Add stations (admin function)
 */
export async function addStations(stations: Station[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('railway_stations')
      .insert(stations);

    if (error) {
      console.error('Error adding stations:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding stations:', error);
    return false;
  }
}

/**
 * Get all stations
 */
export async function getAllStations(): Promise<Station[]> {
  try {
    const { data, error } = await supabase
      .from('railway_stations')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all stations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting all stations:', error);
    return [];
  }
}

/**
 * Add station distances (admin function)
 */
export async function addStationDistances(distances: StationDistance[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('station_distances')
      .insert(distances);

    if (error) {
      console.error('Error adding station distances:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding station distances:', error);
    return false;
  }
}




