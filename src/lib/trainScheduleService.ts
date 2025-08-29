/**
 * Train schedule service - full Supabase implementation
 */

import { supabase } from './supabase';

export interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  stations: Array<{
    stationCode: string;
    stationName: string;
    arrivalTime?: string;
    departureTime?: string;
    distance: number;
  }>;
}

export interface TrainRoute {
  id: string;
  train_number: string;
  train_name: string;
  station_code: string;
  station_name: string;
  arrival_time?: string;
  departure_time?: string;
  distance_km: number;
  sequence_number: number;
}

/**
 * Get train schedule by train number
 */
export async function getTrainSchedule(trainNumber: string): Promise<TrainSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('train_routes')
      .select('*')
      .eq('train_number', trainNumber)
      .order('sequence_number');

    if (error) {
      console.error('Error fetching train schedule:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const firstStation = data[0];
    return {
      trainNumber: firstStation.train_number,
      trainName: firstStation.train_name,
      stations: data.map(station => ({
        stationCode: station.station_code,
        stationName: station.station_name,
        arrivalTime: station.arrival_time,
        departureTime: station.departure_time,
        distance: station.distance_km
      }))
    };
  } catch (error) {
    console.error('Error fetching train schedule:', error);
    return null;
  }
}

/**
 * Search trains between two stations
 */
export async function searchTrainsBetweenStations(from: string, to: string): Promise<TrainSchedule[]> {
  try {
    // Find trains that stop at both stations
    const { data: fromStations, error: fromError } = await supabase
      .from('train_routes')
      .select('train_number')
      .eq('station_code', from.toUpperCase());

    if (fromError || !fromStations) {
      console.error('Error fetching from stations:', fromError);
      return [];
    }

    const { data: toStations, error: toError } = await supabase
      .from('train_routes')
      .select('train_number')
      .eq('station_code', to.toUpperCase());

    if (toError || !toStations) {
      console.error('Error fetching to stations:', toError);
      return [];
    }

    // Find common train numbers
    const fromTrains = new Set(fromStations.map(s => s.train_number));
    const toTrains = new Set(toStations.map(s => s.train_number));
    const commonTrains = Array.from(fromTrains).filter(train => toTrains.has(train));

    if (commonTrains.length === 0) {
      return [];
    }

    // Get full schedules for common trains
    const schedules: TrainSchedule[] = [];
    for (const trainNumber of commonTrains.slice(0, 10)) { // Limit to 10 trains
      const schedule = await getTrainSchedule(trainNumber);
      if (schedule) {
        // Validate that the from station comes before to station
        const fromIndex = schedule.stations.findIndex(s => s.stationCode === from.toUpperCase());
        const toIndex = schedule.stations.findIndex(s => s.stationCode === to.toUpperCase());
        
        if (fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex) {
          schedules.push(schedule);
        }
      }
    }

    return schedules;
  } catch (error) {
    console.error('Error searching trains between stations:', error);
    return [];
  }
}

/**
 * Get journey schedule details for a specific journey
 */
export async function getJourneyScheduleDetails(journeyId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('journey_schedules')
      .select(`
        *,
        train_routes:train_number (
          train_name,
          station_code,
          station_name,
          arrival_time,
          departure_time,
          distance_km,
          sequence_number
        )
      `)
      .eq('id', journeyId)
      .single();

    if (error) {
      console.error('Error fetching journey schedule details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching journey schedule details:', error);
    return null;
  }
}

/**
 * Get station names from station codes
 */
export async function getStationNamesFromCodes(codes: string[]): Promise<{[key: string]: string}> {
  try {
    if (codes.length === 0) return {};

    const { data, error } = await supabase
      .from('stations')
      .select('code, name')
      .in('code', codes.map(code => code.toUpperCase()));

    if (error) {
      console.error('Error fetching station names:', error);
      return {};
    }

    const stationMap: {[key: string]: string} = {};
    data?.forEach(station => {
      stationMap[station.code] = station.name;
    });

    return stationMap;
  } catch (error) {
    console.error('Error fetching station names:', error);
    return {};
  }
}

/**
 * Add train schedule data (admin function)
 */
export async function addTrainSchedule(schedule: TrainSchedule): Promise<boolean> {
  try {
    const routeData = schedule.stations.map((station, index) => ({
      train_number: schedule.trainNumber,
      train_name: schedule.trainName,
      station_code: station.stationCode,
      station_name: station.stationName,
      arrival_time: station.arrivalTime,
      departure_time: station.departureTime,
      distance_km: station.distance,
      sequence_number: index + 1
    }));

    const { error } = await supabase
      .from('train_routes')
      .insert(routeData);

    if (error) {
      console.error('Error adding train schedule:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding train schedule:', error);
    return false;
  }
}
