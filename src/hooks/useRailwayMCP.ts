/**
 * Railway MCP Integration Hook
 * Provides easy access to Railway MCP data in React components
 */

import { useState, useCallback } from 'react';

interface UseRailwayMCPResult {
  isLoading: boolean;
  error: string | null;
  searchTrains: (from: string, to: string, date?: Date) => Promise<any>;
  getTrainInfo: (trainNumber: string) => Promise<any>;
  getLiveStatus: (trainNumber: string, date?: Date) => Promise<any>;
  getStationCode: (stationName: string) => Promise<any>;
  getDistance: (from: string, to: string) => Promise<number | null>;
  clearError: () => void;
}

export function useRailwayMCP(): UseRailwayMCPResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = useCallback(async (action: string, params: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/railway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`Railway MCP ${action} error:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchTrains = useCallback(async (from: string, to: string, date?: Date) => {
    return await makeAPICall('search-trains', {
      from,
      to,
      date: date?.toISOString()
    });
  }, [makeAPICall]);

  const getTrainInfo = useCallback(async (trainNumber: string) => {
    return await makeAPICall('train-info', { trainNumber });
  }, [makeAPICall]);

  const getLiveStatus = useCallback(async (trainNumber: string, date?: Date) => {
    return await makeAPICall('live-status', {
      trainNumber,
      date: date?.toISOString()
    });
  }, [makeAPICall]);

  const getStationCode = useCallback(async (stationName: string) => {
    return await makeAPICall('station-code', { name: stationName });
  }, [makeAPICall]);

  const getDistance = useCallback(async (from: string, to: string): Promise<number | null> => {
    try {
      const result = await makeAPICall('distance', { from, to });
      return result.distance;
    } catch (err) {
      console.error('Distance calculation failed:', err);
      return null;
    }
  }, [makeAPICall]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    searchTrains,
    getTrainInfo,
    getLiveStatus,
    getStationCode,
    getDistance,
    clearError
  };
}

/**
 * Specialized hook for distance calculation with enhanced features
 */
export function useDistanceCalculation() {
  const [distanceCache, setDistanceCache] = useState<Map<string, number>>(new Map());
  const { getDistance, isLoading, error } = useRailwayMCP();

  const calculateDistance = useCallback(async (from: string, to: string): Promise<number | null> => {
    const cacheKey = `${from.toUpperCase()}-${to.toUpperCase()}`;
    const reverseCacheKey = `${to.toUpperCase()}-${from.toUpperCase()}`;
    
    // Check cache first
    if (distanceCache.has(cacheKey)) {
      console.log(`💾 Using cached distance for ${cacheKey}`);
      return distanceCache.get(cacheKey) || null;
    }
    
    if (distanceCache.has(reverseCacheKey)) {
      console.log(`💾 Using cached distance for ${reverseCacheKey}`);
      return distanceCache.get(reverseCacheKey) || null;
    }

    try {
      const distance = await getDistance(from, to);
      
      if (distance) {
        // Cache both directions
        setDistanceCache(prev => new Map(prev)
          .set(cacheKey, distance)
          .set(reverseCacheKey, distance)
        );
      }
      
      return distance;
    } catch (err) {
      console.error('Distance calculation error:', err);
      return null;
    }
  }, [getDistance, distanceCache]);

  const clearCache = useCallback(() => {
    setDistanceCache(new Map());
  }, []);

  return {
    calculateDistance,
    clearCache,
    isLoading,
    error,
    cacheSize: distanceCache.size
  };
}

export default useRailwayMCP;