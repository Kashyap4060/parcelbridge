// Station Distance Processing from Train Schedule Data

export interface TrainScheduleRow {
  train_no: string;
  train_name: string;
  sequence: number;
  station_code: string;
  station_name: string;
  arrival_time: string;
  departure_time: string;
  distance_from_source: number;
  source_station_code: string;
  source_station_name: string;
  destination_station_code: string;
  destination_station_name: string;
}

export interface ProcessedStationData {
  code: string;
  name: string;
  normalizedName: string; // for search
  state?: string;
  zone?: string;
}

export interface ProcessedDistanceData {
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  distanceKm: number;
  trainRoutes: string[]; // trains that connect these stations
  isDirectRoute: boolean;
}

/**
 * Process train schedule data to extract station distances
 */
export function processTrainScheduleData(
  scheduleData: TrainScheduleRow[]
): {
  stations: ProcessedStationData[];
  distances: ProcessedDistanceData[];
} {
  const stationsMap = new Map<string, ProcessedStationData>();
  const distancesMap = new Map<string, ProcessedDistanceData>();

  // Group data by train
  const trainGroups = new Map<string, TrainScheduleRow[]>();
  
  scheduleData.forEach(row => {
    const trainKey = `${row.train_no}-${row.train_name}`;
    if (!trainGroups.has(trainKey)) {
      trainGroups.set(trainKey, []);
    }
    trainGroups.get(trainKey)!.push(row);
  });

  // Process each train route
  trainGroups.forEach((trainStations, trainKey) => {
    // Sort stations by sequence
    trainStations.sort((a, b) => a.sequence - b.sequence);
    
    // Extract stations
    trainStations.forEach(station => {
      const normalizedName = normalizeStationName(station.station_name);
      stationsMap.set(station.station_code, {
        code: station.station_code,
        name: station.station_name,
        normalizedName
      });
    });

    // Calculate distances between all station pairs on this route
    for (let i = 0; i < trainStations.length; i++) {
      for (let j = i + 1; j < trainStations.length; j++) {
        const fromStation = trainStations[i];
        const toStation = trainStations[j];
        
        const distance = toStation.distance_from_source - fromStation.distance_from_source;
        
        if (distance > 0) {
          const distanceKey = `${fromStation.station_code}-${toStation.station_code}`;
          const reverseKey = `${toStation.station_code}-${fromStation.station_code}`;
          
          // Create bidirectional distance records
          [distanceKey, reverseKey].forEach((key, index) => {
            const isReverse = index === 1;
            const from = isReverse ? toStation : fromStation;
            const to = isReverse ? fromStation : toStation;
            
            if (!distancesMap.has(key)) {
              distancesMap.set(key, {
                fromStationCode: from.station_code,
                fromStationName: from.station_name,
                toStationCode: to.station_code,
                toStationName: to.station_name,
                distanceKm: distance,
                trainRoutes: [trainKey],
                isDirectRoute: true
              });
            } else {
              // Add this train route to existing distance record
              const existing = distancesMap.get(key)!;
              if (!existing.trainRoutes.includes(trainKey)) {
                existing.trainRoutes.push(trainKey);
              }
            }
          });
        }
      }
    }
  });

  return {
    stations: Array.from(stationsMap.values()),
    distances: Array.from(distancesMap.values())
  };
}

/**
 * Normalize station names for consistent matching
 */
export function normalizeStationName(stationName: string): string {
  return stationName
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/junction|jn/g, '')
    .replace(/central|city|terminus/g, '')
    .trim();
}

/**
 * Find distance between two stations using processed data
 */
export function findStationDistance(
  fromStation: string,
  toStation: string,
  distances: ProcessedDistanceData[]
): number | null {
  // Try exact code match first
  const directMatch = distances.find(d => 
    (d.fromStationCode === fromStation && d.toStationCode === toStation) ||
    (d.fromStationCode === toStation && d.toStationCode === fromStation)
  );
  
  if (directMatch) {
    return directMatch.distanceKm;
  }

  // Try normalized name match
  const fromNormalized = normalizeStationName(fromStation);
  const toNormalized = normalizeStationName(toStation);
  
  const nameMatch = distances.find(d => {
    const fromMatch = normalizeStationName(d.fromStationName) === fromNormalized ||
                     normalizeStationName(d.toStationName) === fromNormalized;
    const toMatch = normalizeStationName(d.fromStationName) === toNormalized ||
                   normalizeStationName(d.toStationName) === toNormalized;
    return fromMatch && toMatch;
  });

  return nameMatch ? nameMatch.distanceKm : null;
}

/**
 * Convert processed data to Firebase upload format
 */
export function prepareFirebaseData(
  stations: ProcessedStationData[],
  distances: ProcessedDistanceData[]
): {
  stationsForUpload: any[];
  distancesForUpload: any[];
} {
  const stationsForUpload = stations.map(station => ({
    id: station.code,
    code: station.code,
    name: station.name,
    normalizedName: station.normalizedName,
    searchTerms: [
      station.name.toLowerCase(),
      station.normalizedName,
      station.code.toLowerCase()
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const distancesForUpload = distances.map(distance => ({
    id: `${distance.fromStationCode}-${distance.toStationCode}`,
    fromStationCode: distance.fromStationCode,
    fromStationName: distance.fromStationName,
    toStationCode: distance.toStationCode,
    toStationName: distance.toStationName,
    distanceKm: distance.distanceKm,
    trainRoutes: distance.trainRoutes,
    isDirectRoute: distance.isDirectRoute,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return { stationsForUpload, distancesForUpload };
}
