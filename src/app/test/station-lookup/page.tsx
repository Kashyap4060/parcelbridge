'use client';

import { useState } from 'react';
import { getStationNamesFromCodes } from '@/lib/trainScheduleService';
import { processNewPNRFormat } from '@/lib/pnrService';

export default function TestStationLookup() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testStationLookup = async () => {
    setLoading(true);
    try {
      console.log('Testing station lookup...');
      
      // Test with common station codes
      const stationCodes = ['NDLS', 'SV', 'LTT', 'MKA'];
      const stationNames = await getStationNamesFromCodes(stationCodes);
      
      console.log('Station names result:', stationNames);
      setResults(stationNames);
    } catch (error) {
      console.error('Error:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testPNRProcessing = async () => {
    setLoading(true);
    try {
      // Test PNR data similar to your format
      const testPNRData = {
        pnrNumber: "8635229132",
        dateOfJourney: "Jul 29, 2025 8:05:00 AM",
        trainNumber: "12336",
        trainName: "LTT BHAGALPUR EX",
        sourceStation: "LTT",
        destinationStation: "MKA",
        reservationUpto: "MKA",
        boardingPoint: "LTT",
        journeyClass: "3A",
        bookingCoachId: "B4",
        bookingBerthNo: 63,
        bookingBerthCode: "SL",
        arrivalDate: "Jul 30, 2025 2:08:00 PM"
      };

      const processedData = await processNewPNRFormat(testPNRData);
      console.log('Processed PNR data:', processedData);
      setResults(processedData);
    } catch (error) {
      console.error('Error:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Station Lookup & PNR Processing</h1>
      
      <div className="space-y-4">
        <button
          onClick={testStationLookup}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
        >
          {loading ? 'Testing...' : 'Test Station Lookup'}
        </button>

        <button
          onClick={testPNRProcessing}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test PNR Processing'}
        </button>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
