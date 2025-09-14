import { useState, useEffect, useCallback } from 'react';
import { searchStations, Station } from '@/lib/stationService';

// Sample stations for testing when database is empty
const SAMPLE_STATIONS: Station[] = [
  { code: 'NDLS', name: 'NEW DELHI', state: 'Delhi', zone: 'NR', latitude: 28.6428, longitude: 77.2197 },
  { code: 'CSMT', name: 'MUMBAI CST', state: 'Maharashtra', zone: 'CR', latitude: 18.9398, longitude: 72.8355 },
  { code: 'SBC', name: 'BANGALORE CITY', state: 'Karnataka', zone: 'SWR', latitude: 12.9716, longitude: 77.5946 },
  { code: 'MAS', name: 'CHENNAI CENTRAL', state: 'Tamil Nadu', zone: 'SR', latitude: 13.0827, longitude: 80.2707 },
  { code: 'HWH', name: 'HOWRAH JN', state: 'West Bengal', zone: 'ER', latitude: 22.5726, longitude: 88.3639 },
  { code: 'PUNE', name: 'PUNE JN', state: 'Maharashtra', zone: 'CR', latitude: 18.5204, longitude: 73.8567 },
  { code: 'JP', name: 'JAIPUR', state: 'Rajasthan', zone: 'NWR', latitude: 26.9124, longitude: 75.7873 },
  { code: 'KOAA', name: 'KOLKATA', state: 'West Bengal', zone: 'ER', latitude: 22.5726, longitude: 88.3639 }
];

interface UseStationSearchResult {
  stations: Station[];
  popularStations: Station[];
  isLoading: boolean;
  searchStations: (term: string) => void;
  clearResults: () => void;
}

export function useStationSearch(maxResults: number = 10): UseStationSearchResult {
  const [stations, setStations] = useState<Station[]>([]);
  const [popularStations, setPopularStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load popular stations on mount
  useEffect(() => {
    const loadPopularStations = async () => {
      try {
        // Get stations from database
        const dbStations = await searchStations('');
        setPopularStations(dbStations.slice(0, maxResults));
      } catch (error) {
        console.error('Error loading popular stations:', error);
      }
    };
    
    loadPopularStations();
  }, [maxResults]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setStations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchStations(searchTerm);
        setStations(results);
      } catch (error) {
        console.error('Error searching stations:', error);
        setStations([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [maxResults]
  );

  const handleSearch = useCallback((term: string) => {
    if (term.length >= 2) {
      debouncedSearch(term);
    } else {
      setStations([]);
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  const clearResults = useCallback(() => {
    setStations([]);
    setIsLoading(false);
  }, []);

  return {
    stations,
    popularStations,
    isLoading,
    searchStations: handleSearch,
    clearResults
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}




