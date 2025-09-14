'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParcelRequestDialog } from "@/components/ui/parcel-request-dialog";
import { PlusIcon, ArchiveBoxIcon, MapPinIcon, ClockIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
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
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ParcelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ParcelRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'sender') {
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

  // Helper functions for table
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ACCEPTED': return 'outline';
      case 'IN_TRANSIT': return 'outline';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openDetailDialog = (request: ParcelRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
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
          <Card>
            <CardHeader>
              <CardTitle>Parcel Requests</CardTitle>
              <CardDescription>
                Track and manage your parcel delivery requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Package Details</TableHead>
                      <TableHead>Addresses</TableHead>
                      <TableHead>Offer Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Carrier Info</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            {request.fromCity} → {request.toCity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.weight} kg
                            </div>
                            <div className="text-sm text-gray-600">
                              {request.dimensions}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {request.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>
                              <div className="text-sm font-medium text-gray-900">Pickup:</div>
                              <div className="text-sm text-gray-600">{request.pickupAddress}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Delivery:</div>
                              <div className="text-sm text-gray-600">{request.deliveryAddress}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">₹{request.offerAmount}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(request.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {request.carrierName ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {request.carrierName}
                              </div>
                              {request.trackingId && (
                                <div className="text-sm font-mono text-blue-600">
                                  {request.trackingId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            {request.status === 'PENDING' && (
                              <Button variant="outline" size="sm">
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                            <Button size="sm" onClick={() => openDetailDialog(request)}>
                              <EyeIcon className="h-4 w-4 mr-1" />
                              {request.status === 'DELIVERED' ? 'Rate' : 'Track'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parcel Request Detail Dialog */}
        <ParcelRequestDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          request={selectedRequest}
        />
      </div>
    </div>
  );
}




