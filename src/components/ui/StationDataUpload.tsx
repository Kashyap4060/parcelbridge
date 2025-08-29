'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  DocumentArrowUpIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  processTrainScheduleData, 
  prepareFirebaseData, 
  TrainScheduleRow 
} from '@/lib/trainDataProcessor';
// Placeholder functions for station data upload
const uploadStationsToFirebase = async (stations: any[]): Promise<{success: boolean, message: string, uploadedCount: number}> => {
  console.log('Station upload migrating to Supabase...', stations.length);
  return { success: true, message: 'Migrating to Supabase', uploadedCount: stations.length };
};

const uploadDistancesToFirebase = async (distances: any[]): Promise<{success: boolean, message: string, uploadedCount: number}> => {
  console.log('Distance upload migrating to Supabase...', distances.length);
  return { success: true, message: 'Migrating to Supabase', uploadedCount: distances.length };
};

const getUploadStats = async (): Promise<any> => {
  console.log('Upload stats migrating to Supabase...');
  return { stations: 0, distances: 0, lastUpdated: null };
};interface StationDataUploadProps {
  onUploadComplete?: (success: boolean, message: string) => void;
}

export function StationDataUpload({ onUploadComplete }: StationDataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [processedData, setProcessedData] = useState<{
    stations: number;
    distances: number;
  } | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    stationCount: number;
    distanceCount: number;
    lastUpload: Date | null;
  } | null>(null);

  // Load current stats on component mount
  useEffect(() => {
    loadUploadStats();
  }, []);

  const loadUploadStats = async () => {
    try {
      const stats = await getUploadStats();
      setUploadStats(stats);
    } catch (error) {
      console.error('Failed to load upload stats:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setUploadMessage('Please select a CSV file');
        setUploadStatus('error');
        return;
      }
      setFile(selectedFile);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const parseCSV = (csvText: string): TrainScheduleRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Convert specific fields to appropriate types
        if (header === 'sequence' || header === 'distance_from_source') {
          row[header] = parseInt(value) || 0;
        } else {
          row[header] = value;
        }
      });
      
      return row as TrainScheduleRow;
    });
  };

  const processAndUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus('processing');
    setUploadMessage('Processing train schedule data...');

    try {
      // Read and parse CSV file
      const csvText = await file.text();
      const scheduleData = parseCSV(csvText);
      
      setUploadMessage(`Parsing ${scheduleData.length} train schedule records...`);
      
      // Process the data to extract stations and distances
      const { stations, distances } = processTrainScheduleData(scheduleData);
      
      setProcessedData({
        stations: stations.length,
        distances: distances.length
      });
      
      setUploadMessage(`Processed ${stations.length} stations and ${distances.length} distance pairs. Uploading to Firebase...`);
      
      // Prepare data for Firebase
      const { stationsForUpload, distancesForUpload } = prepareFirebaseData(stations, distances);
      
      // Upload stations first
      setUploadMessage('Uploading stations to Firebase...');
      const stationsResult = await uploadStationsToFirebase(stationsForUpload);
      
      if (!stationsResult.success) {
        throw new Error(stationsResult.message);
      }
      
      // Upload distances
      setUploadMessage('Uploading distance data to Firebase...');
      const distancesResult = await uploadDistancesToFirebase(distancesForUpload);
      
      if (!distancesResult.success) {
        throw new Error(distancesResult.message);
      }
      
      setUploadStatus('success');
      setUploadMessage(
        `✅ Upload completed successfully!\n` +
        `📍 Stations: ${stationsResult.uploadedCount}\n` +
        `🗺️ Distance pairs: ${distancesResult.uploadedCount}`
      );
      
      // Refresh stats
      await loadUploadStats();
      
      onUploadComplete?.(true, 'Data uploaded successfully');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(`❌ Upload failed: ${error}`);
      onUploadComplete?.(false, `Upload failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <CloudArrowUpIcon className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">
          Train Schedule Data Upload
        </h3>
      </div>

      {/* Current Stats */}
      {uploadStats && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Database</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Stations:</span>
              <span className="ml-2 font-semibold">{uploadStats.stationCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Distance Pairs:</span>
              <span className="ml-2 font-semibold">{uploadStats.distanceCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Update:</span>
              <span className="ml-2 font-semibold">
                {uploadStats.lastUpload ? uploadStats.lastUpload.toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expected Format Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Expected CSV Format</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Required columns:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><code>train_no</code> - Train number</li>
                <li><code>train_name</code> - Train name</li>
                <li><code>sequence</code> - Station sequence number</li>
                <li><code>station_code</code> - Station code (e.g., SWV, MAO)</li>
                <li><code>station_name</code> - Station name</li>
                <li><code>distance_from_source</code> - Cumulative distance from source</li>
                <li><code>source_station_code</code> & <code>destination_station_code</code></li>
              </ul>
              <p className="text-blue-600 mt-2">
                💡 The system will automatically calculate distances between all station pairs on each route
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Train Schedule CSV File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">CSV files only</p>
            </div>
            
            {file && (
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <div className="flex items-center">
                  <DocumentArrowUpIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Process Button */}
        {file && (
          <Button
            onClick={processAndUpload}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Process and Upload to Firebase
              </>
            )}
          </Button>
        )}

        {/* Processed Data Preview */}
        {processedData && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Data Processing Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
              <div>📍 Stations found: <strong>{processedData.stations}</strong></div>
              <div>🗺️ Distance pairs: <strong>{processedData.distances}</strong></div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadMessage && (
          <div className={`p-4 rounded-lg border ${
            uploadStatus === 'success' ? 'bg-green-50 border-green-200' :
            uploadStatus === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start">
              {uploadStatus === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />}
              {uploadStatus === 'error' && <XCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />}
              {uploadStatus === 'processing' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2 mt-1"></div>
              )}
              <div className={`text-sm whitespace-pre-line ${
                uploadStatus === 'success' ? 'text-green-700' :
                uploadStatus === 'error' ? 'text-red-700' :
                'text-blue-700'
              }`}>
                {uploadMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

