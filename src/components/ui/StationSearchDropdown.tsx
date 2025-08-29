'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchStations, Station } from '@/lib/stationService';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  MapPinIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface StationSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  onStationSelect?: (station: Station) => void;
}

export function StationSearchDropdown({
  value,
  onChange,
  placeholder = 'Search stations...',
  label,
  required = false,
  error,
  className = '',
  disabled = false,
  onStationSelect
}: StationSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [stations, setStations] = useState<Station[]>([]);
  const [popularStations, setPopularStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load popular stations on mount
  useEffect(() => {
    const loadPopularStations = async () => {
      try {
        // Get first 10 stations as popular stations
        const popular = await searchStations('');
        setPopularStations(popular.slice(0, 10));
      } catch (error) {
        console.error('Error loading popular stations:', error);
      }
    };
    
    loadPopularStations();
  }, []);

  // Search stations when search term changes
  const searchDebounced = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setStations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchStations(term);
        setStations(results);
      } catch (error) {
        console.error('Error searching stations:', error);
        setStations([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchDebounced(searchTerm);
    } else {
      setStations([]);
    }
  }, [searchTerm, searchDebounced]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle station selection
  const handleStationSelect = (station: Station) => {
    const displayValue = `${station.name} (${station.code})`;
    setSearchTerm(displayValue);
    onChange(displayValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    onStationSelect?.(station);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const displayedStations = searchTerm.length >= 2 ? stations : popularStations;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displayedStations.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && displayedStations[selectedIndex]) {
          handleStationSelect(displayedStations[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear input
  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const displayedStations = searchTerm.length >= 2 ? stations : popularStations;
  const showDropdown = isOpen && (displayedStations.length > 0 || isLoading);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-10 pr-10 py-2 border rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
          />
          
          {/* Search icon */}
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          
          {/* Clear button */}
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
                <span className="ml-2 text-sm">Searching...</span>
              </div>
            )}

            {/* No results */}
            {!isLoading && displayedStations.length === 0 && searchTerm.length >= 2 && (
              <div className="p-3 text-center text-gray-500">
                <span className="text-sm">No stations found</span>
              </div>
            )}

            {/* Popular stations header */}
            {!isLoading && searchTerm.length < 2 && popularStations.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <FireIcon className="h-4 w-4 mr-2 text-orange-500" />
                  Popular Stations
                </div>
              </div>
            )}

            {/* Search results header */}
            {!isLoading && searchTerm.length >= 2 && stations.length > 0 && (
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Search Results ({stations.length})
                </div>
              </div>
            )}

            {/* Station list */}
            {!isLoading && displayedStations.map((station, index) => (
              <button
                key={station.code}
                type="button"
                onClick={() => handleStationSelect(station)}
                className={`
                  w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3
                  ${index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : ''}
                `}
              >
                <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {station.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Code: {station.code}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
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
