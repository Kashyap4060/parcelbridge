/**
 * Train data upload service - full Supabase implementation
 */

import { supabase } from './supabase';
import { TrainSchedule, addTrainSchedule } from './trainScheduleService';

export interface TrainDataRecord {
  train_number: string;
  train_name: string;
  station_code: string;
  station_name: string;
  arrival_time?: string;
  departure_time?: string;
  distance_km: number;
  sequence_number: number;
}

export interface UploadStats {
  totalRecords: number;
  successfulUploads: number;
  failedUploads: number;
  errors: string[];
}

/**
 * Upload train data in batches to Supabase
 */
export async function uploadTrainData(data: TrainDataRecord[]): Promise<UploadStats> {
  const stats: UploadStats = {
    totalRecords: data.length,
    successfulUploads: 0,
    failedUploads: 0,
    errors: []
  };

  try {
    const batchSize = 100; // Process in batches of 100
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('train_routes')
        .insert(batch);

      if (error) {
        console.error(`Error uploading batch ${i}-${i + batchSize}:`, error);
        stats.failedUploads += batch.length;
        stats.errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`);
      } else {
        stats.successfulUploads += batch.length;
      }

      // Add small delay between batches to avoid rate limiting
      if (i + batchSize < data.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return stats;
  } catch (error) {
    console.error('Error uploading train data:', error);
    stats.errors.push(`General error: ${error}`);
    return stats;
  }
}

/**
 * Process and upload train schedule
 */
export async function processTrainSchedule(schedule: TrainSchedule): Promise<boolean> {
  try {
    return await addTrainSchedule(schedule);
  } catch (error) {
    console.error('Error processing train schedule:', error);
    return false;
  }
}

/**
 * Get train data statistics
 */
export async function getTrainDataStats(): Promise<{
  totalTrains: number;
  totalStations: number;
  totalRoutes: number;
  lastUpdated: string | null;
}> {
  try {
    const [trainsResult, stationsResult, routesResult] = await Promise.all([
      supabase
        .from('train_routes')
        .select('train_number', { count: 'exact', head: true })
        .limit(1),
      supabase
        .from('stations')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('train_routes')
        .select('*', { count: 'exact', head: true })
    ]);

    // Get last updated timestamp
    const { data: lastRecord } = await supabase
      .from('train_routes')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get unique train numbers count
    const { data: uniqueTrains } = await supabase
      .rpc('get_unique_train_count');

    if (!uniqueTrains) {
      // Fallback method - get distinct train numbers via JavaScript
      const { data: allTrains } = await supabase
        .from('train_routes')
        .select('train_number');
      
      const uniqueSet = new Set(allTrains?.map(t => t.train_number) || []);
      const uniqueTrainCount = uniqueSet.size;
      
      return {
        totalTrains: uniqueTrainCount,
        totalStations: stationsResult.count || 0,
        totalRoutes: routesResult.count || 0,
        lastUpdated: lastRecord?.created_at || null
      };
    }

    return {
      totalTrains: uniqueTrains || 0,
      totalStations: stationsResult.count || 0,
      totalRoutes: routesResult.count || 0,
      lastUpdated: lastRecord?.created_at || null
    };
  } catch (error) {
    console.error('Error fetching train data stats:', error);
    return {
      totalTrains: 0,
      totalStations: 0,
      totalRoutes: 0,
      lastUpdated: null
    };
  }
}

/**
 * Parse CSV file containing train data
 */
export async function parseTrainDataCSV(file: File): Promise<TrainDataRecord[]> {
  try {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const records: TrainDataRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      try {
        const record: TrainDataRecord = {
          train_number: values[headers.indexOf('train_number')] || '',
          train_name: values[headers.indexOf('train_name')] || '',
          station_code: values[headers.indexOf('station_code')] || '',
          station_name: values[headers.indexOf('station_name')] || '',
          arrival_time: values[headers.indexOf('arrival_time')] || undefined,
          departure_time: values[headers.indexOf('departure_time')] || undefined,
          distance_km: parseFloat(values[headers.indexOf('distance_km')]) || 0,
          sequence_number: parseInt(values[headers.indexOf('sequence_number')]) || i
        };
        
        if (record.train_number && record.station_code) {
          records.push(record);
        }
      } catch (error) {
        console.error(`Error parsing line ${i + 1}:`, error);
      }
    }
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    return [];
  }
}

/**
 * Upload train data from CSV to Supabase
 */
export async function uploadTrainDataFromCSV(file: File): Promise<UploadStats> {
  try {
    const records = await parseTrainDataCSV(file);
    return await uploadTrainData(records);
  } catch (error) {
    console.error('Error uploading train data from CSV:', error);
    return {
      totalRecords: 0,
      successfulUploads: 0,
      failedUploads: 0,
      errors: [`Error processing file: ${error}`]
    };
  }
}

/**
 * Clear all train data (admin function)
 */
export async function clearTrainData(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('train_routes')
      .delete()
      .neq('id', ''); // Delete all records

    if (error) {
      console.error('Error clearing train data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing train data:', error);
    return false;
  }
}

/**
 * Validate train data before upload
 */
export function validateTrainData(records: TrainDataRecord[]): {
  valid: TrainDataRecord[];
  invalid: { record: any; errors: string[] }[];
} {
  const valid: TrainDataRecord[] = [];
  const invalid: { record: any; errors: string[] }[] = [];

  records.forEach(record => {
    const errors: string[] = [];

    if (!record.train_number) errors.push('Missing train number');
    if (!record.train_name) errors.push('Missing train name');
    if (!record.station_code) errors.push('Missing station code');
    if (!record.station_name) errors.push('Missing station name');
    if (record.distance_km < 0) errors.push('Invalid distance');
    if (record.sequence_number < 1) errors.push('Invalid sequence number');

    if (errors.length > 0) {
      invalid.push({ record, errors });
    } else {
      valid.push(record);
    }
  });

  return { valid, invalid };
}
