'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  DocumentArrowUpIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { uploadTrainData, parseTrainDataCSV, getTrainDataStats, clearTrainData, uploadTrainDataFromCSV } from '@/lib/trainDataUpload';
import { supabase } from '@/lib/supabase';

// Define TrainScheduleRow interface locally
interface TrainScheduleRow {
  trainNumber: string;
  trainName: string;
  [key: string]: any;
}

interface TrainDataUploadProps {
  onUploadComplete?: (success: boolean, message: string) => void;
}

export function TrainDataUpload({ onUploadComplete }: TrainDataUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [stats, setStats] = useState<{
    totalTrains: number;
    totalStations: number;
    totalRoutes: number;
    lastUpdated: string | null;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const currentStats = await getTrainDataStats();
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading train data stats:', error);
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

  const handleUpload = async () => {
    if (!file) {
      setUploadMessage('Please select a file first');
      setUploadStatus('error');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('processing');
    setUploadMessage('Reading and parsing CSV file...');

    try {
      const result = await uploadTrainDataFromCSV(file);
      
      if (result.successfulUploads > 0) {
        setUploadStatus('success');
        setUploadMessage(`Successfully uploaded ${result.successfulUploads}/${result.totalRecords} records`);
        await loadStats(); // Refresh stats
        onUploadComplete?.(true, `Uploaded ${result.successfulUploads} records`);
      } else {
        setUploadStatus('error');
        const errorMsg = result.errors.length > 0 ? result.errors[0] : 'No records uploaded';
        setUploadMessage(errorMsg);
        onUploadComplete?.(false, errorMsg);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onUploadComplete?.(false, 'Upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete ALL train data? This action cannot be undone.')) {
      return;
    }

    setIsProcessing(true);
    setUploadMessage('Clearing train data...');

    try {
      const result = await clearTrainData();
      if (result) {
        setUploadMessage('Train data cleared successfully');
        setUploadStatus('success');
        await loadStats();
      } else {
        setUploadMessage('Failed to clear train data');
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadMessage(`Error clearing data: ${error}`);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <CloudArrowUpIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Train Schedule Data Upload
        </h2>
        <p className="text-gray-600">
          Upload the train_data.csv file to populate train schedules in Firestore
        </p>
      </div>

      {/* Current Stats */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Database Status</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRoutes.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalTrains.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Unique Trains</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalStations.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Unique Stations</div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select train_data.csv file
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <DocumentArrowUpIcon className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> train_data.csv
              </p>
              <p className="text-xs text-gray-500">CSV files only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
            />
          </label>
        </div>
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <Button
          onClick={handleUpload}
          disabled={!file || isProcessing}
          className="w-full"
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          {isProcessing ? 'Uploading...' : 'Upload Train Data to Supabase'}
        </Button>
      </div>

      {/* Clear Data Button */}
      {stats && stats.totalRoutes > 0 && (
        <div className="mb-6">
          <Button
            onClick={handleClearData}
            disabled={isProcessing}
            variant="outline"
            className="w-full text-red-600 border-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Clear All Train Data
          </Button>
        </div>
      )}

      {/* Status Message */}
      {uploadMessage && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          uploadStatus === 'success' ? 'bg-green-50 text-green-800' :
          uploadStatus === 'error' ? 'bg-red-50 text-red-800' :
          'bg-blue-50 text-blue-800'
        }`}>
          {getStatusIcon()}
          <span className="text-sm">{uploadMessage}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Make sure the CSV file has the correct headers: train_no, train_name, sequence, station_code, station_name, arrival_time, departure_time, distance_from_source, source_station_code, source_station_name, destination_station_code, destination_station_name</li>
          <li>The file will be uploaded in batches of 500 records for optimal performance</li>
          <li>Large files may take several minutes to upload completely</li>
          <li>Once uploaded, the data will be available for PNR form auto-filling</li>
        </ol>
      </div>
    </div>
  );
}
