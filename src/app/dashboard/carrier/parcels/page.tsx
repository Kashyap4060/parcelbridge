'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getActiveJourneysByCarrier } from '@/lib/journeys';
import { getPendingParcelRequests } from '@/lib/parcelRequests';
const JourneyVerificationComponent = dynamic(
  () => import('../../../../components/JourneyVerificationComponent').then(m => m.JourneyVerificationComponent),
  { ssr: false, loading: () => <div className="p-6">Loading verification...</div> }
);
import { ParcelRequest, Journey } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { formatCurrency } from '../../../../lib/utils';
import {
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface ParcelWithVerification extends ParcelRequest {
  verificationStatus?: 'APPROVED' | 'ROUTE_MISMATCH' | 'REQUIREMENTS_PENDING' | 'PENDING';
  matchConfidence?: number;
}

export default function CarrierParcelsPage() {
  const { user } = useHybridAuth();
  const { isLoading: authLoading, isAuthorized } = useRequireRole('carrier');
  const router = useRouter();
  const [parcels, setParcels] = useState<ParcelWithVerification[]>([]);
  const [activeJourneys, setActiveJourneys] = useState<Journey[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<ParcelRequest | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Authentication guard
  useEffect(() => {}, []);

  // Load parcels and journeys with useCallback to prevent infinite re-renders
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const [parcelsData, journeysData] = await Promise.all([
        getPendingParcelRequests(),
        getActiveJourneysByCarrier(user.id)
      ]);

      const mappedParcels: ParcelRequest[] = parcelsData.map((p) => ({
        id: p.id,
        senderUid: p.sender_id,
        pickupStation: p.pickup_station,
        dropStation: p.drop_station,
        weight: Number(p.weight),
        dimensions: { length: Number(p.length ?? 0), width: Number(p.width ?? 0), height: Number(p.height ?? 0) },
        pickupTime: new Date(p.pickup_time),
        description: p.description || '',
        status: p.status,
        paymentHeld: Number(p.payment_held ?? 0),
        estimatedFare: Number(p.estimated_fare),
        feeBreakdown: p.fee_breakdown || null,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at)
      }));

      const mappedJourneys: Journey[] = journeysData.map((j) => ({
        id: j.id,
        carrierUid: j.carrier_id,
        pnr: j.pnr,
        trainNumber: j.train_number,
        trainName: j.train_name || '',
        sourceStation: j.source_station,
        sourceStationCode: j.source_station_code,
        destinationStation: j.destination_station,
        destinationStationCode: j.destination_station_code,
        stations: j.stations || [],
        journeyDate: new Date(j.journey_date),
        departureTime: j.departure_time || '',
        arrivalTime: j.arrival_time || '',
        isActive: j.is_active,
        createdAt: new Date(j.created_at)
      }));

      setParcels(mappedParcels);
      setActiveJourneys(mappedJourneys);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id, loadData]);

  const getVerificationStatus = (parcel: ParcelRequest, journey: Journey) => {
    // This would use the journey verification service
    // For now, returning mock status based on stations
    if (journey.sourceStation === parcel.pickupStation || 
        journey.destinationStation === parcel.dropStation ||
        journey.stations.some(station => 
          parcel.pickupStation.includes(station) || 
          parcel.dropStation.includes(station)
        )) {
      return { status: 'APPROVED', confidence: 85 };
    }
    return { status: 'ROUTE_MISMATCH', confidence: 20 };
  };

  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = parcel.pickupStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.dropStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         parcel.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'compatible') {
      return matchesSearch && activeJourneys.some(journey => {
        const status = getVerificationStatus(parcel, journey);
        return status.status === 'APPROVED';
      });
    }
    return matchesSearch;
  });

  const handleViewParcel = (parcel: ParcelRequest) => {
    if (activeJourneys.length === 0) {
      alert('Please add a journey first to view parcel compatibility.');
      router.push('/dashboard/carrier/journeys');
      return;
    }
    
    setSelectedParcel(parcel);
    setSelectedJourney(activeJourneys[0]); // Use first active journey
    setShowVerificationModal(true);
  };

  const handleAcceptParcel = async (parcel: ParcelRequest) => {
    try {
      // Here you would call the parcel acceptance API
      alert(`Parcel ${parcel.id} accepted successfully!`);
      setShowVerificationModal(false);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to accept parcel:', error);
      alert('Failed to accept parcel. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parcels...</p>
        </div>
      </div>
    );
  }

  if (authLoading || !isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Parcels</h1>
              <p className="text-gray-600 mt-1">Find delivery opportunities that match your journey</p>
            </div>
            <Button onClick={() => router.push('/dashboard/carrier')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Active Journeys Alert */}
        {activeJourneys.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                <p className="ml-3 text-yellow-800">
                  Add a journey to see compatible parcels.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/carrier/journeys')}
              >
                Add Journey
              </Button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by pickup/drop station or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Parcels</option>
                <option value="compatible">Compatible Routes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parcels Grid */}
        <div className="grid gap-4 sm:gap-6">
          {filteredParcels.map((parcel) => {
            const compatibleJourneys = activeJourneys.filter(journey => {
              const status = getVerificationStatus(parcel, journey);
              return status.status === 'APPROVED';
            });

            return (
              <div key={parcel.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">#{parcel.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        compatibleJourneys.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {compatibleJourneys.length > 0 ? 'Route Compatible' : 'No Route Match'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Route Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-600">Pickup:</span>
                            <span className="font-medium">{parcel.pickupStation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-gray-600">Drop:</span>
                            <span className="font-medium">{parcel.dropStation}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Pickup:</span>
                            <span className="font-medium">
                              {new Date(parcel.pickupTime).toLocaleDateString()} at{' '}
                              {new Date(parcel.pickupTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Parcel Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Weight:</span>
                            <span className="font-medium">{parcel.weight}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Dimensions:</span>
                            <span className="font-medium">
                              {parcel.dimensions.length} × {parcel.dimensions.width} × {parcel.dimensions.height} cm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Delivery Fee:</span>
                            <span className="font-bold text-green-600">{formatCurrency(parcel.estimatedFare)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-gray-700">{parcel.description}</p>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <Button
                      onClick={() => handleViewParcel(parcel)}
                      disabled={activeJourneys.length === 0}
                      className="whitespace-nowrap"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {compatibleJourneys.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => handleAcceptParcel(parcel)}
                        className="whitespace-nowrap"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Quick Accept
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredParcels.length === 0 && (
            <div className="text-center py-12">
              <TruckIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parcels found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search criteria' : 'Check back later for new delivery opportunities'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && selectedParcel && selectedJourney && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Parcel Verification - #{selectedParcel.id}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowVerificationModal(false)}
                >
                  <XCircleIcon className="h-5 w-5" />
                </Button>
              </div>

              <JourneyVerificationComponent
                journey={selectedJourney}
                parcel={selectedParcel}
                carrierUid={user.id}
                onVerificationComplete={(canAccept) => {
                  if (canAccept) {
                    console.log('Parcel can be accepted');
                  }
                }}
              />

              <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleAcceptParcel(selectedParcel)}
                  className="flex-1"
                >
                  Accept Parcel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
