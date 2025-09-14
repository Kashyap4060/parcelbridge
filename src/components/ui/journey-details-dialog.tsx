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
  TruckIcon,
  CalendarIcon,
  UserIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

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
  acceptedParcels: number;
}

interface JourneyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  journey: Journey | null;
}

export function JourneyDetailsDialog({
  open,
  onOpenChange,
  journey,
}: JourneyDetailsDialogProps) {
  if (!journey) return null;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'outline';
      case 'CANCELLED': return 'error';
      default: return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'TBD';
    return timeStr;
  };

  const capacityUsed = (journey.acceptedParcels * 5); // Assuming 5kg average per parcel
  const capacityPercentage = journey.availableCapacity > 0 ? 
    Math.min((capacityUsed / journey.availableCapacity) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5" />
            Journey Details
          </DialogTitle>
          <DialogDescription>
            PNR: {journey.pnr}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Train Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{journey.trainName}</CardTitle>
                  <CardDescription>Train #{journey.trainNumber}</CardDescription>
                </div>
                <Badge variant={getStatusVariant(journey.status)}>
                  {journey.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{journey.fromStation}</p>
                    <p className="text-sm text-gray-600">Departure</p>
                  </div>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <div className="h-px bg-gray-300 w-16 self-center"></div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-gray-900 text-right">{journey.toStation}</p>
                    <p className="text-sm text-gray-600 text-right">Arrival</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Departure</label>
                    <p className="text-gray-900">{formatDate(journey.departureDate)}</p>
                    <p className="text-sm text-gray-600">{formatTime(journey.departureTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Arrival</label>
                    <p className="text-gray-900">{formatDate(journey.arrivalDate)}</p>
                    <p className="text-sm text-gray-600">{formatTime(journey.arrivalTime)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity and Earnings */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Capacity Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available Capacity</span>
                  <span className="font-medium">{journey.availableCapacity} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accepted Parcels</span>
                  <span className="font-medium">{journey.acceptedParcels}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Usage</span>
                  <span className="font-medium">{capacityUsed} kg ({capacityPercentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${capacityPercentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CurrencyRupeeIcon className="h-4 w-4" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rate per kg</span>
                  <span className="font-medium">₹{journey.pricePerKg}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Earnings</span>
                  <span className="font-medium text-green-600">
                    ₹{(capacityUsed * journey.pricePerKg).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">Potential Max</span>
                  <span className="font-bold text-green-600">
                    ₹{(journey.availableCapacity * journey.pricePerKg).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              View Requests
            </Button>
            <Button size="sm">
              Manage Journey
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
