'use client';

import { useState, useEffect, useRef } from 'react';
import { useStationSearch } from '@/hooks/useStationSearch';
import { Station } from '@/lib/stationService';
import { ChevronDownIcon, MapPinIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface StationSelectorProps {
  label: string;
  value: Station | null;
  onChange: (station: Station | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function StationSelector({
  label,
  value,
  onChange,
  placeholder = "Search for a station...",
  required = false,
  className = "",
  disabled = false
}: StationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? `${value.name} (${value.code})` : '');
  const { stations, popularStations, isLoading, searchStations, clearResults } = useStationSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input value when prop value changes
  useEffect(() => {
    if (value) {
      setInputValue(`${value.name} (${value.code})`);
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    if (newValue.length >= 2) {
      searchStations(newValue);
    } else {
      clearResults();
    }

    // If user clears the input, clear the selection
    if (newValue === '') {
      onChange(null);
    }
  };

  const handleStationSelect = (station: Station) => {
    setInputValue(`${station.name} (${station.code})`);
    onChange(station);
    setIsOpen(false);
    clearResults();
    
    // Optional: Validate the selected station
    console.log('Selected station:', {
      name: station.name,
      code: station.code,
      state: station.state,
      coordinates: { latitude: station.latitude, longitude: station.longitude }
    });
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (inputValue.length >= 2) {
      searchStations(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const displayedStations = stations.length > 0 ? stations : popularStations;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-2 pr-10 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
            ${value ? 'border-green-300 bg-green-50' : ''}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : value ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {displayedStations.length > 0 ? (
            <>
              {stations.length === 0 && popularStations.length > 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center gap-1">
                    <MagnifyingGlassIcon className="h-3 w-3" />
                    Popular Stations
                  </div>
                </div>
              )}
              
              {stations.length > 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                  <div className="flex items-center gap-1">
                    <MagnifyingGlassIcon className="h-3 w-3" />
                    Search Results ({stations.length})
                  </div>
                </div>
              )}

              {displayedStations.map((station) => (
                <button
                  key={station.code}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleStationSelect(station)}
                >
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {station.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="font-mono bg-gray-100 px-1 rounded text-xs">
                          {station.code}
                        </span>
                        {station.state && (
                          <span>{station.state}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-center text-gray-500">
              {inputValue.length >= 2 ? (
                <div>
                  <MagnifyingGlassIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>No stations found for "{inputValue}"</p>
                  <p className="text-xs mt-1">Try searching by station name or code</p>
                </div>
              ) : (
                <div>
                  <MapPinIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p>Type to search for stations</p>
                  <p className="text-xs mt-1">Search by station name or code</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



