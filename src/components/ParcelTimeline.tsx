'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  MapPinIcon,
  ExclamationTriangleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid
} from '@heroicons/react/24/solid';
import { parcelStatusService, ParcelStatusTimeline } from '@/lib/parcelStatusService';
import { ParcelStatus } from '@/types';

interface ParcelTimelineProps {
  parcelId: string;
  className?: string;
}

interface TimelineStep {
  status: ParcelStatus;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  iconSolid: React.ComponentType<any>;
}

const timelineSteps: TimelineStep[] = [
  {
    status: 'PENDING',
    title: 'Request Created',
    description: 'Your parcel request has been posted',
    icon: ClockIcon,
    iconSolid: ClockIconSolid
  },
  {
    status: 'ACCEPTED',
    title: 'Carrier Found',
    description: 'A carrier has accepted your parcel',
    icon: CheckCircleIcon,
    iconSolid: CheckCircleIconSolid
  },
  {
    status: 'IN_TRANSIT',
    title: 'In Transit',
    description: 'Your parcel is being transported',
    icon: TruckIcon,
    iconSolid: TruckIconSolid
  },
  {
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Your parcel has been delivered',
    icon: MapPinIcon,
    iconSolid: CheckCircleIconSolid
  }
];

export default function ParcelTimeline({ parcelId, className = '' }: ParcelTimelineProps) {
  const [timeline, setTimeline] = useState<ParcelStatusTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTimeline();
  }, [parcelId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parcelStatusService.getParcelTimeline(parcelId);
      setTimeline(data);
    } catch (err) {
      console.error('Error loading timeline:', err);
      setError('Failed to load parcel timeline');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepStatus: ParcelStatus, currentStatus: ParcelStatus): 'completed' | 'current' | 'pending' | 'failed' => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'FAILED_BY_CARRIER') {
      // If cancelled or failed, show completed steps up to the failure point
      const statusOrder = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
      const currentIndex = statusOrder.indexOf(currentStatus === 'FAILED_BY_CARRIER' ? 'IN_TRANSIT' : 'PENDING');
      const stepIndex = statusOrder.indexOf(stepStatus);
      
      if (stepIndex <= currentIndex) {
        return stepIndex === currentIndex ? 'failed' : 'completed';
      }
      return 'pending';
    }

    const statusOrder = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-8 w-8 mx-auto mb-2" />
          <p>{error || 'Failed to load timeline'}</p>
        </div>
      </div>
    );
  }

  const isCancelled = timeline.currentStatus === 'CANCELLED' || timeline.currentStatus === 'FAILED_BY_CARRIER';

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Parcel Timeline</h3>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            timeline.currentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            timeline.currentStatus === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
            timeline.currentStatus === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' :
            timeline.currentStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {timeline.currentStatus.replace('_', ' ')}
          </span>
          {timeline.estimatedDelivery && !isCancelled && (
            <span className="text-sm text-gray-600">
              Est. delivery: {formatTimestamp(timeline.estimatedDelivery)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-6">
        {timelineSteps.map((step, index) => {
          const status = getStepStatus(step.status, timeline.currentStatus);
          const Icon = status === 'completed' ? step.iconSolid : step.icon;
          const historyEntry = timeline.statusHistory.find(h => h.status === step.status);

          return (
            <div key={step.status} className="flex items-start space-x-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'completed' ? 'bg-green-100' :
                status === 'current' ? 'bg-blue-100' :
                status === 'failed' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  status === 'completed' ? 'text-green-600' :
                  status === 'current' ? 'text-blue-600' :
                  status === 'failed' ? 'text-red-600' :
                  'text-gray-400'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${
                    status === 'completed' || status === 'current' ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {historyEntry && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(historyEntry.timestamp)}
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mt-1 ${
                  status === 'completed' || status === 'current' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {historyEntry ? historyEntry.message : step.description}
                </p>

                {/* Additional metadata */}
                {historyEntry?.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    {historyEntry.metadata.carrierName && (
                      <div>Carrier: {historyEntry.metadata.carrierName}</div>
                    )}
                    {historyEntry.metadata.location && (
                      <div>Location: {historyEntry.metadata.location}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < timelineSteps.length - 1 && (
                <div className={`absolute left-8 mt-8 w-0.5 h-6 ${
                  status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                }`} style={{ marginLeft: '-1px' }}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Expected Action */}
      {timeline.nextExpectedAction && !isCancelled && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Next Step</h4>
              <p className="text-sm text-blue-700">{timeline.nextExpectedAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation/Failure Notice */}
      {isCancelled && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900">
                {timeline.currentStatus === 'CANCELLED' ? 'Parcel Cancelled' : 'Delivery Failed'}
              </h4>
              <p className="text-sm text-red-700">
                {timeline.statusHistory.slice(-1)[0]?.message || 'This parcel request has been closed.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed History */}
      {timeline.statusHistory.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View Detailed History ({timeline.statusHistory.length} updates)
          </summary>
          <div className="mt-3 space-y-2">
            {timeline.statusHistory.slice().reverse().map(update => (
              <div key={update.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{update.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated by {update.updatedBy.toLowerCase()}
                  </p>
                </div>
                <span className="text-xs text-gray-500 ml-4">
                  {formatTimestamp(update.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
