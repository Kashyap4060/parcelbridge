/**
 * Station service - Supabase implementation
 */

import { supabase } from './supabase';

export interface Station {
  name: string;
  code: string;
  lat: number;
  lng: number;
  state?: string;
  zone?: string;
}

export interface StationDistance {
  from_station: string;
  to_station: string;
  distance_km: number;
}

/**
 * Search stations by name or code
 */
export async function searchStations(searchTerm: string): Promise<Station[]> {
  try {
    const { data, error } = await supabase
      .from('stations')
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
      .from('stations')
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
 */
export async function getStationDistance(fromCode: string, toCode: string): Promise<number | null> {
  try {
    // Try both directions
    const { data, error } = await supabase
      .from('station_distances')
      .select('distance_km')
      .or(
        `and(from_station.eq.${fromCode.toUpperCase()},to_station.eq.${toCode.toUpperCase()}),and(from_station.eq.${toCode.toUpperCase()},to_station.eq.${fromCode.toUpperCase()})`
      )
      .single();

    if (error) {
      console.error('Error getting station distance:', error);
      return null;
    }

    return data?.distance_km || null;
  } catch (error) {
    console.error('Error getting station distance:', error);
    return null;
  }
}

/**
 * Add stations (admin function)
 */
export async function addStations(stations: Station[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('stations')
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
      .from('stations')
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
