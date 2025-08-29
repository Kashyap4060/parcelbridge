'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getJourneysByCarrier, deleteJourneyById } from '@/lib/journeys';
import { Button } from '@/components/ui/Button';
import { PlusIcon, TruckIcon, MapPinIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Journey {
  id: string;
  pnr: string;
  fromStation: string;
  toStation: string;
  trainName: string;
  trainNumber: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  availableCapacity: number;
  pricePerKg: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  acceptedParcels: number; // Count of accepted parcels
}

export default function CarrierJourneys() {
  const { user, isAuthenticated } = useHybridAuth();
  const { isLoading, isAuthorized } = useRequireRole('carrier');
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !isAuthorized) return;
    loadJourneys();
  }, [isLoading, isAuthorized, user]);

  const loadJourneys = async () => {
    try {
      setLoading(true);
      const data = await getJourneysByCarrier(user!.id);
      const mapped: Journey[] = data.map((j) => ({
        id: j.id,
        pnr: j.pnr,
        fromStation: j.source_station,
        toStation: j.destination_station,
        trainName: j.train_name || '',
        trainNumber: j.train_number,
        departureDate: j.journey_date,
        departureTime: j.departure_time || '',
        arrivalDate: j.arrival_date || '',
        arrivalTime: j.arrival_time || '',
        availableCapacity: 0,
        pricePerKg: 0,
        status: j.is_active ? 'ACTIVE' : 'CANCELLED',
        acceptedParcels: 0
      }));

      setJourneys(mapped);
    } catch (error) {
      console.error('Error loading journeys:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewJourney = () => {
    router.push('/dashboard/carrier/add-journey');
  };

  const deleteJourney = async (journeyId: string, acceptedParcels: number) => {
    if (acceptedParcels > 0) {
      alert('Cannot delete journey with accepted parcels. Please complete or cancel existing parcels first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this journey? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteJourneyById(journeyId, user!.id);

      setJourneys(prev => prev.filter(j => j.id !== journeyId));
    } catch (error) {
      console.error('Error deleting journey:', error);
      alert('Failed to delete journey. Please try again.');
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Journeys</h1>
          <Button onClick={addNewJourney} className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Journey
          </Button>
        </div>

        {loading ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow">
            <p className="text-gray-600">Loading journeys...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center">
            <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys yet</h3>
            <p className="text-gray-600 mb-6">
              Add your train journey using PNR to start carrying parcels and earning money.
            </p>
            <Button onClick={addNewJourney} className="flex items-center gap-2 mx-auto">
              <PlusIcon className="h-5 w-5" />
              Add Your First Journey
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {journeys.map((journey) => (
              <div key={journey.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {journey.trainName} ({journey.trainNumber})
                    </h3>
                    <p className="text-sm text-gray-600">PNR: {journey.pnr}</p>
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

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{journey.fromStation}</p>
                      <p className="text-sm text-gray-600">
                        {journey.departureDate} at {journey.departureTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{journey.toStation}</p>
                      <p className="text-sm text-gray-600">
                        {journey.arrivalDate} at {journey.arrivalTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Capacity: {journey.availableCapacity} kg</span>
                    <span>Rate: ₹{journey.pricePerKg}/kg</span>
                    <span>Accepted: {journey.acceptedParcels} parcels</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Requests
                    </Button>
                    <Button size="sm">
                      Manage
                    </Button>
                    {journey.acceptedParcels === 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteJourney(journey.id, journey.acceptedParcels)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
