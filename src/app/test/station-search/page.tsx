'use client';

import { useState } from 'react';
import { StationSearchDropdown } from '@/components/ui/StationSearchDropdown';
import { Station } from '@/lib/stationService';

export default function StationTestPage() {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedFromStation, setSelectedFromStation] = useState<Station | null>(null);
  const [selectedToStation, setSelectedToStation] = useState<Station | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Station Search Test
          </h1>
          
          <div className="space-y-6">
            {/* From Station */}
            <StationSearchDropdown
              label="From Station"
              placeholder="Search source station..."
              value={fromStation}
              onChange={setFromStation}
              onStationSelect={setSelectedFromStation}
              required
            />

            {/* To Station */}
            <StationSearchDropdown
              label="To Station"
              placeholder="Search destination station..."
              value={toStation}
              onChange={setToStation}
              onStationSelect={setSelectedToStation}
              required
            />

            {/* Selected Station Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Selected Stations:</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>From:</strong> {selectedFromStation ? (
                    <span className="ml-2">
                      {selectedFromStation.name} ({selectedFromStation.code})
                    </span>
                  ) : (
                    <span className="ml-2 text-gray-500">None selected</span>
                  )}
                </div>
                
                <div>
                  <strong>To:</strong> {selectedToStation ? (
                    <span className="ml-2">
                      {selectedToStation.name} ({selectedToStation.code})
                    </span>
                  ) : (
                    <span className="ml-2 text-gray-500">None selected</span>
                  )}
                </div>
              </div>

              {/* Raw Input Values */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Raw Input Values:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>From Input: "{fromStation}"</div>
                  <div>To Input: "{toStation}"</div>
                </div>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Test Instructions:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Try searching for common stations like "Mumbai", "Delhi", "Chennai"</li>
                <li>• Test station codes like "NDLS", "BCT", "MAS", "SBC"</li>
                <li>• Check if popular stations appear when you focus without typing</li>
                <li>• Verify keyboard navigation with arrow keys and Enter</li>
                <li>• Test partial matches and auto-complete</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
