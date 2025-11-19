'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { parcelMatchingService, ParcelMatch, CarrierParcelStatus } from '@/lib/parcelMatchingService';
import { Button } from '@/components/ui/button';
import { 
  TruckIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ParcelCardProps {
  match: ParcelMatch;
  onAccept: (parcelId: string, journeyId: string) => void;
  carrierStatus: CarrierParcelStatus;
  loading: boolean;
}

const ParcelCard = ({ match, onAccept, carrierStatus, loading }: ParcelCardProps) => {
  const { parcel, bestMatch } = match;
  
  const getMatchTypeColor = (matchType: string) => {
    switch (matchType.toLowerCase()) {
      case 'perfect':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'partial':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMatchIcon = (matchType: string) => {
    switch (matchType.toLowerCase()) {
      case 'perfect':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'good':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'partial':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <XCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Parcel #{parcel.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500">
            Posted {new Date(parcel.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {bestMatch && (
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(bestMatch.matchType)}`}>
            {getMatchIcon(bestMatch.matchType)}
            <span className="ml-1 capitalize">{bestMatch.matchType} Match ({bestMatch.confidence}%)</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{parcel.pickupStation}</span>
        </div>
        <div className="text-gray-400">→</div>
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{parcel.dropStation}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Weight</p>
          <p className="font-medium">{parcel.weight}kg</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Dimensions</p>
          <p className="font-medium">{parcel.dimensions?.length || 'N/A'}×{parcel.dimensions?.width || 'N/A'}×{parcel.dimensions?.height || 'N/A'}cm</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fee</p>
          <div className="flex items-center">
            <CurrencyRupeeIcon className="h-4 w-4" />
            <span className="font-semibold text-green-600">₹{parcel.estimatedFare}</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pickup Time</p>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">{parcel.pickupTime ? new Date(parcel.pickupTime).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {parcel.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-sm text-gray-700">{parcel.description}</p>
        </div>
      )}

      {bestMatch && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Why this matches:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {bestMatch.reasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {!carrierStatus.canAcceptNew && (
            <span className="text-amber-600">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              You already have an active parcel
            </span>
          )}
        </div>
        
        <Button
          onClick={() => bestMatch && onAccept(parcel.id, bestMatch.journey.id)}
          disabled={!bestMatch?.canAccept || !carrierStatus.canAcceptNew || loading}
          className="px-4 py-2"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Accepting...
            </div>
          ) : (
            <div className="flex items-center">
              <TruckIcon className="h-4 w-4 mr-2" />
              Accept Parcel
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default function BrowseParcelsPage() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<ParcelMatch[]>([]);
  const [carrierStatus, setCarrierStatus] = useState<CarrierParcelStatus>({ 
    hasActiveParcel: false, 
    canAcceptNew: false 
  });
  const [loading, setLoading] = useState(true);
  const [acceptingParcel, setAcceptingParcel] = useState<string | null>(null);
  const [filterConfidence, setFilterConfidence] = useState(0);

  const { isLoading: roleLoading } = useRequireRole('carrier');

  useEffect(() => {
    if (user && !roleLoading) {
      loadMatches();
      checkCarrierStatus();
    }
  }, [user, roleLoading]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      
      const matchingParcels = await parcelMatchingService.findMatchingParcels(user.id);
      setMatches(matchingParcels);
    } catch (error) {
      console.error('Error loading parcel matches:', error);
      toast.error('Failed to load parcels');
    } finally {
      setLoading(false);
    }
  };

  const checkCarrierStatus = async () => {
    try {
      if (!user?.id) return;
      
      const status = await parcelMatchingService.getCarrierParcelStatus(user.id);
      setCarrierStatus(status);
    } catch (error) {
      console.error('Error checking carrier status:', error);
    }
  };

  const handleAcceptParcel = async (parcelId: string, journeyId: string) => {
    try {
      setAcceptingParcel(parcelId);
      
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      await parcelMatchingService.acceptParcel(user.id, parcelId, journeyId);
      toast.success('Parcel accepted successfully!');
      
      await Promise.all([loadMatches(), checkCarrierStatus()]);
      
    } catch (error) {
      console.error('Error accepting parcel:', error);
      toast.error('Failed to accept parcel');
    } finally {
      setAcceptingParcel(null);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parcels...</p>
        </div>
      </div>
    );
  }

  const filteredMatches = matches.filter(match => 
    match.bestMatch && match.bestMatch.confidence >= filterConfidence
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Browse Parcels</h1>
            <p className="text-gray-600 mt-1">Find parcels that match your journey route</p>
          </div>
          <Button onClick={loadMatches} variant="outline" className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {carrierStatus.hasActiveParcel && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-3" />
              <div>
                <p className="text-amber-800 font-medium">You currently have an active parcel delivery</p>
                <p className="text-amber-700 text-sm">You can only accept one parcel at a time.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Match Quality</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Matches', value: 0 },
              { label: 'Partial+ (50%+)', value: 50 },
              { label: 'Good+ (70%+)', value: 70 },
              { label: 'Perfect (85%+)', value: 85 }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterConfidence(filter.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterConfidence === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching parcels found</h3>
          <p className="text-gray-500 mb-4">
            {matches.length === 0 
              ? "There are no parcels that match your journey routes."
              : "No parcels match your current filter criteria."
            }
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Make sure you have added your journey details</p>
            <p>• Check if your journey route covers popular stations</p>
            <p>• Try adjusting the match quality filter</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <ParcelCard
              key={match.parcel.id}
              match={match}
              onAccept={handleAcceptParcel}
              carrierStatus={carrierStatus}
              loading={acceptingParcel === match.parcel.id}
            />
          ))}
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredMatches.length} of {matches.length} matching parcels
        </div>
      )}
    </div>
  );
}
