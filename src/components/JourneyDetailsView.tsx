'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon, 
  CalendarIcon,
  XMarkIcon,
  UserIcon,
  TicketIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import ParcelTimeline from './ParcelTimeline';

interface JourneyDetailsProps {
  journeyId: string;
  parcelId?: string; // Optional - if coming from notification
  isModal?: boolean;
  onClose?: () => void;
}

interface JourneyDetails {
  id: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  journeyDate: string;
  departureTime?: string;
  arrivalTime?: string;
  coachType?: string;
  coachNumber?: string;
  seatNumber?: string;
  carrierName?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  route?: {
    station: string;
    arrivalTime?: string;
    departureTime?: string;
    distance?: number;
  }[];
}

export default function JourneyDetailsView({ 
  journeyId, 
  parcelId, 
  isModal = false, 
  onClose 
}: JourneyDetailsProps) {
  const [journey, setJourney] = useState<JourneyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadJourneyDetails();
  }, [journeyId]);

  const loadJourneyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/journeys/${journeyId}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockJourney: JourneyDetails = {
        id: journeyId,
        pnr: '1234567890',
        trainNumber: '12345',
        trainName: 'Rajdhani Express',
        sourceStation: 'New Delhi',
        destinationStation: 'Mumbai Central',
        journeyDate: '2025-01-15',
        departureTime: '16:55',
        arrivalTime: '08:35',
        coachType: 'AC 2 Tier',
        coachNumber: 'A1',
        seatNumber: '15',
        carrierName: 'John Doe',
        status: 'ACTIVE',
        route: [
          { station: 'New Delhi', departureTime: '16:55', distance: 0 },
          { station: 'Agra Cantonment', arrivalTime: '19:25', departureTime: '19:30', distance: 195 },
          { station: 'Jhansi Junction', arrivalTime: '21:48', departureTime: '21:53', distance: 403 },
          { station: 'Bhopal Junction', arrivalTime: '01:10', departureTime: '01:15', distance: 707 },
          { station: 'Nagpur Junction', arrivalTime: '05:15', departureTime: '05:25', distance: 1059 },
          { station: 'Mumbai Central', arrivalTime: '08:35', distance: 1384 }
        ]
      };

      setJourney(mockJourney);
    } catch (err) {
      console.error('Error loading journey details:', err);
      setError('Failed to load journey details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className={`${isModal ? 'p-6' : 'min-h-screen bg-gray-50 py-8'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journey details...</p>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className={`${isModal ? 'p-6' : 'min-h-screen bg-gray-50 py-8'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <XMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">{error || 'Journey not found'}</p>
          <Button onClick={handleClose} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journey Details</h1>
          {parcelId && (
            <p className="text-sm text-gray-600">Related to your parcel request</p>
          )}
        </div>
        {(isModal || !parcelId) && (
          <Button onClick={handleClose} variant="outline" size="sm">
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Journey Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {journey.trainName} ({journey.trainNumber})
              </h2>
              <p className="text-sm text-gray-600">PNR: {journey.pnr}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            journey.status === 'ACTIVE' 
              ? 'bg-green-100 text-green-800'
              : journey.status === 'COMPLETED'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {journey.status}
          </span>
        </div>

        {/* Route Summary */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <MapPinIcon className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">{journey.sourceStation}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>{formatDate(journey.journeyDate)}</span>
              </div>
              {journey.departureTime && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatTime(journey.departureTime)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 mx-4">
              <ArrowRightIcon className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <span className="font-medium text-gray-900">{journey.destinationStation}</span>
                <MapPinIcon className="h-4 w-4 text-red-600" />
              </div>
              {journey.arrivalTime && (
                <div className="flex items-center justify-end space-x-2 text-sm text-gray-600">
                  <span>{formatTime(journey.arrivalTime)}</span>
                  <ClockIcon className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carrier Info */}
        {journey.carrierName && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <UserIcon className="h-4 w-4" />
            <span>Carrier: {journey.carrierName}</span>
          </div>
        )}

        {/* Seat Information */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TicketIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-600">Class</p>
              <p className="font-medium">{journey.coachType || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TruckIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-600">Coach</p>
              <p className="font-medium">{journey.coachNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-600">Seat</p>
              <p className="font-medium">{journey.seatNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Details */}
      {journey.route && journey.route.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
          <div className="space-y-3">
            {journey.route.map((stop, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-green-500' : 
                    index === journey.route!.length - 1 ? 'bg-red-500' : 
                    'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{stop.station}</p>
                    {stop.distance !== undefined && (
                      <p className="text-xs text-gray-500">{stop.distance} km</p>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm">
                  {stop.arrivalTime && (
                    <p className="text-gray-600">Arr: {formatTime(stop.arrivalTime)}</p>
                  )}
                  {stop.departureTime && (
                    <p className="text-gray-600">Dep: {formatTime(stop.departureTime)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {parcelId && (
        <div className="space-y-6">
          {/* Parcel Timeline */}
          <ParcelTimeline parcelId={parcelId} />
          
          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Your parcel has been accepted by this carrier</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Track your parcel status in the dashboard</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Payment will be processed automatically on delivery</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-3">
              <Button 
                onClick={() => router.push('/dashboard/sender')} 
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.push(`/dashboard/sender/track/${parcelId}`)} 
                variant="outline"
                className="flex-1"
              >
                Track Parcel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-50 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {content}
      </div>
    </div>
  );
}
