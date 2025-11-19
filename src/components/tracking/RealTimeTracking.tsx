/**
 * Real-Time Package Tracking Component
 * Phase 2: Interactive tracking interface with live updates and map integration
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPinIcon, RectangleStackIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useRailwayMCP } from '../../hooks/useRailwayMCP';
import type { 
  PackageTrackingSummary, 
  TrackingEvent, 
  LiveTrackingMap,
  PackageStatus 
} from '../../types/tracking';

interface RealTimeTrackingProps {
  packageId: string;
  trackingNumber: string;
  onStatusChange?: (status: PackageStatus) => void;
}

export default function RealTimeTracking({ 
  packageId, 
  trackingNumber, 
  onStatusChange 
}: RealTimeTrackingProps) {
  const [trackingSummary, setTrackingSummary] = useState<PackageTrackingSummary | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<TrackingEvent[]>([]);
  const [liveMap, setLiveMap] = useState<LiveTrackingMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getLiveStatus, getDistance } = useRailwayMCP();

  useEffect(() => {
    loadTrackingData();
    
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [packageId, autoRefresh]);

  const loadTrackingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load tracking summary
      const summary = await fetchTrackingSummary();
      setTrackingSummary(summary);

      // Load tracking history
      const history = await fetchTrackingHistory();
      setTrackingHistory(history);

      // Load live map data
      if (summary) {
        const mapData = await fetchLiveMapData(summary);
        setLiveMap(mapData);
      }

      // Trigger status change callback
      if (summary && onStatusChange) {
        onStatusChange(summary.current_status);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrackingSummary = async (): Promise<PackageTrackingSummary> => {
    const response = await fetch(`/api/tracking/summary/${packageId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tracking summary');
    }
    return await response.json();
  };

  const fetchTrackingHistory = async (): Promise<TrackingEvent[]> => {
    const response = await fetch(`/api/tracking/history/${packageId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tracking history');
    }
    return await response.json();
  };

  const fetchLiveMapData = async (summary: PackageTrackingSummary): Promise<LiveTrackingMap> => {
    const response = await fetch(`/api/tracking/map/${packageId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch live map data');
    }
    return await response.json();
  };

  const startAutoRefresh = () => {
    stopAutoRefresh();
    intervalRef.current = setInterval(() => {
      loadTrackingData();
    }, 30000); // Refresh every 30 seconds
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getStatusColor = (status: PackageStatus): string => {
    const colors = {
      pending: 'text-gray-500',
      accepted: 'text-blue-500',
      waiting_for_departure: 'text-yellow-500',
      pickup_available: 'text-green-500',
      picked_up: 'text-blue-600',
      in_transit: 'text-purple-500',
      approaching_destination: 'text-orange-500',
      arrived_at_destination: 'text-green-600',
      out_for_delivery: 'text-blue-700',
      delivered: 'text-green-700',
      cancelled: 'text-red-500',
      delayed: 'text-red-600'
    };
    return colors[status] || 'text-gray-500';
  };

  const getStatusIcon = (status: PackageStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'delayed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'in_transit':
        return <RectangleStackIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <MapPinIcon className="w-5 h-5" />;
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDelay = (delayMinutes: number): string => {
    if (delayMinutes <= 0) return 'On time';
    
    const hours = Math.floor(delayMinutes / 60);
    const minutes = delayMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m delayed`;
    }
    return `${minutes}m delayed`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Tracking</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTrackingData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!trackingSummary) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tracking Data</h3>
          <p className="text-gray-600">Tracking information not available for this package.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with tracking number and controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Package Tracking</h2>
            <p className="text-gray-600">#{trackingNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Auto-refresh</span>
            </label>
            <button
              onClick={loadTrackingData}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="border-l-4 border-blue-500 pl-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(trackingSummary.current_status)}
            <span className={`font-semibold ${getStatusColor(trackingSummary.current_status)}`}>
              {trackingSummary.current_status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            Last updated: {formatTime(trackingSummary.last_updated)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{trackingSummary.from_station}</span>
            <span>{trackingSummary.progress_percentage.toFixed(1)}% Complete</span>
            <span>{trackingSummary.to_station}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${trackingSummary.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Train Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RectangleStackIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Train {trackingSummary.train_number}</span>
            </div>
            {trackingSummary.current_location && (
              <p className="text-sm text-gray-600">
                Current: {trackingSummary.current_location.station_name}
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Arrival</span>
            </div>
            <p className="text-sm text-gray-600">
              {trackingSummary.estimated_arrival 
                ? formatTime(trackingSummary.estimated_arrival)
                : 'TBD'
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className={`w-5 h-5 ${trackingSummary.delay_minutes > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <span className="font-semibold text-gray-900">Status</span>
            </div>
            <p className={`text-sm ${trackingSummary.delay_minutes > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatDelay(trackingSummary.delay_minutes)}
            </p>
          </div>
        </div>
      </div>

      {/* Live Map Component (Placeholder) */}
      {liveMap && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Location</h3>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive map will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Showing route from {trackingSummary.from_station} to {trackingSummary.to_station}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h3>
        <div className="space-y-4">
          {trackingHistory.length > 0 ? (
            trackingHistory.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.package_status)}
                    <span className={`font-medium ${getStatusColor(event.package_status)}`}>
                      {event.package_status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(event.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No tracking events yet</p>
          )}
        </div>
      </div>

      {/* Additional Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
            Share Tracking
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm">
            Download Report
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
            Contact Carrier
          </button>
        </div>
      </div>
    </div>
  );
}