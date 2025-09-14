import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  UserIcon,
  ArchiveBoxIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

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

interface ParcelRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ParcelRequest | null;
}

export function ParcelRequestDialog({
  open,
  onOpenChange,
  request,
}: ParcelRequestDialogProps) {
  if (!request) return null;

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArchiveBoxIcon className="h-5 w-5" />
            Parcel Request Details
          </DialogTitle>
          <DialogDescription>
            Request ID: {request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {request.fromCity} → {request.toCity}
              </h3>
              <p className="text-sm text-gray-600">
                Created on {formatDate(request.createdAt)}
              </p>
            </div>
            <Badge variant={getStatusVariant(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Package Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Weight</label>
                  <p className="text-gray-900">{request.weight} kg</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Dimensions</label>
                  <p className="text-gray-900">{request.dimensions}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1">{request.description}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-600">
                  ₹{request.offerAmount}
                </span>
                <span className="text-sm text-gray-600">offered</span>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pickup & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MapPinIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Pickup Address</label>
                  <p className="text-gray-900 mt-1">{request.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <MapPinIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                  <p className="text-gray-900 mt-1">{request.deliveryAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrier Information */}
          {request.carrierName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Carrier Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Carrier Name</label>
                  <p className="text-gray-900">{request.carrierName}</p>
                </div>
                {request.trackingId && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tracking ID</label>
                    <p className="text-gray-900 font-mono">{request.trackingId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {request.status === 'PENDING' && (
              <Button variant="outline" size="sm">
                Edit Request
              </Button>
            )}
            <Button size="sm">
              {request.status === 'DELIVERED' ? 'Rate Carrier' : 'Track Package'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
