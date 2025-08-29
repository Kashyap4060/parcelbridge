'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Button } from '@/components/ui/Button';
import { PlusIcon, ArchiveBoxIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getSenderParcelRequests } from '@/lib/parcelRequests';

interface ParcelRequest {
  id: string;
  fromCity: string;
  toCity: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  dimensions: string;
  description: string;
  offerAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  carrierName?: string;
  trackingId?: string;
}

export default function SenderRequests() {
  const { user, isAuthenticated } = useHybridAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ParcelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'sender' && user?.user_metadata?.role !== 'sender') {
      router.push('/dashboard');
      return;
    }

    // Load parcel requests
    loadRequests();
  }, [isAuthenticated, user, router]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getSenderParcelRequests(user!.id);
      const mapped: ParcelRequest[] = data.map((p) => ({
        id: p.id,
        fromCity: p.pickup_station,
        toCity: p.drop_station,
        pickupAddress: p.pickup_station,
        deliveryAddress: p.drop_station,
        weight: Number(p.weight),
        dimensions: `${p.length ?? 0}x${p.width ?? 0}x${p.height ?? 0} cm`,
        description: p.description || '',
        offerAmount: Number(p.estimated_fare),
        status: p.status,
        createdAt: p.created_at,
        carrierName: undefined,
        trackingId: undefined,
      }));

      setRequests(mapped);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewRequest = () => {
    router.push('/dashboard/sender/create-request');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Parcel Requests</h1>
          <Button onClick={createNewRequest} className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Create Request
          </Button>
        </div>

        {loading ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center">
            <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parcel requests yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first parcel request to send items via train passengers.
            </p>
            <Button onClick={createNewRequest} className="flex items-center gap-2 mx-auto">
              <PlusIcon className="h-5 w-5" />
              Create Your First Request
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.fromCity} → {request.toCity}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.weight} kg • {request.dimensions}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Pickup</p>
                      <p className="text-sm text-gray-600">{request.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Delivery</p>
                      <p className="text-sm text-gray-600">{request.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Description:</p>
                  <p className="text-gray-900">{request.description}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-green-600">
                      Offer: ₹{request.offerAmount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                    <Button size="sm">
                      {request.status === 'DELIVERED' ? 'Rate Carrier' : 'Track'}
                    </Button>
                  </div>
                </div>

                {request.carrierName && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Carrier: <span className="font-medium text-gray-900">{request.carrierName}</span>
                      {request.trackingId && (
                        <span className="ml-4">
                          Tracking: <span className="font-mono text-blue-600">{request.trackingId}</span>
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
