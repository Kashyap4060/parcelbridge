import { useState, useEffect, useCallback } from 'react';
import { searchStations, Station } from '@/lib/stationService';

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
        // Get first 10 stations as popular stations
        const popular = await searchStations('');
        setPopularStations(popular.slice(0, maxResults));
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
