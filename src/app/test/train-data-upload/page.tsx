'use client';

import { useState } from 'react';
import { TrainDataUpload } from '@/components/ui/TrainDataUpload';

export default function TrainDataUploadPage() {
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const handleUploadComplete = (success: boolean, message: string) => {
    setUploadResult(success ? `✅ ${message}` : `❌ ${message}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Train Data Management
          </h1>
          <p className="text-lg text-gray-600">
            Upload train schedule data to enable station search and distance calculations
          </p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">CSV File Format Requirements</h2>
          <div className="text-blue-700 space-y-2">
            <p>Your <code className="bg-blue-100 px-2 py-1 rounded">train_data.csv</code> file should contain these columns:</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>train_number</strong> - Train number</li>
                <li><strong>train_name</strong> - Train name</li>
                <li><strong>station_code</strong> - Station code</li>
                <li><strong>station_name</strong> - Station name</li>
              </ul>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>arrival_time</strong> - Arrival time (optional)</li>
                <li><strong>departure_time</strong> - Departure time (optional)</li>
                <li><strong>distance_km</strong> - Distance from source</li>
                <li><strong>sequence_number</strong> - Stop sequence</li>
              </ul>
            </div>
          </div>
        </div>

        <TrainDataUpload onUploadComplete={handleUploadComplete} />

        {uploadResult && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Upload Result:</h3>
            <p className="text-sm">{uploadResult}</p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What this enables:</h2>
          <div className="space-y-3 text-gray-700">
            <p>• <strong>Station Search:</strong> Users can search for stations by name or code</p>
            <p>• <strong>Distance Calculations:</strong> Calculate distances between stations for parcel pricing</p>
            <p>• <strong>Route Validation:</strong> Validate train routes and stations for accurate bookings</p>
            <p>• <strong>Enhanced User Experience:</strong> Auto-complete station names and codes</p>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Ready to Upload</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Your CSV file contains <strong>186,126 train schedule records</strong></p>
            <p>• Upload will be processed in batches for optimal performance</p>
            <p>• Data will be stored in Supabase PostgreSQL database</p>
            <p>• Upload typically takes 2-5 minutes depending on connection speed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
