'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getJourneysByCarrier, deleteJourneyById } from '@/lib/journeys';
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { JourneyDetailsDialog } from "@/components/ui/journey-details-dialog";
import { PlusIcon, TruckIcon, MapPinIcon, CalendarIcon, TrashIcon, EyeIcon, CogIcon } from '@heroicons/react/24/outline';

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
  const { user, isAuthenticated } = useSimpleAuth();
  const { isLoading, isAuthorized } = useRequireRole('carrier');
  const router = useRouter();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    journeyId: string | null;
    journeyName: string;
    acceptedParcels: number;
  }>({
    open: false,
    journeyId: null,
    journeyName: '',
    acceptedParcels: 0,
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Helper functions
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'outline';
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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'TBD';
    return timeStr;
  };

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

  const openDeleteDialog = (journey: Journey) => {
    setDeleteDialog({
      open: true,
      journeyId: journey.id,
      journeyName: `${journey.trainName} (${journey.trainNumber})`,
      acceptedParcels: journey.acceptedParcels,
    });
  };

  const openDetailDialog = (journey: Journey) => {
    setSelectedJourney(journey);
    setDetailDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.journeyId) return;

    try {
      setDeleting(true);
      await deleteJourneyById(deleteDialog.journeyId, user!.id);
      setJourneys(prev => prev.filter(j => j.id !== deleteDialog.journeyId));
      setDeleteDialog({ open: false, journeyId: null, journeyName: '', acceptedParcels: 0 });
    } catch (error) {
      console.error('Error deleting journey:', error);
      // Keep dialog open to show error - could add error state here
    } finally {
      setDeleting(false);
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
          <Card>
            <CardHeader>
              <CardTitle>Journey Management</CardTitle>
              <CardDescription>
                Track and manage your train journeys for parcel delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Train Details</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead>Arrival</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Parcels</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journeys.map((journey) => (
                      <TableRow key={journey.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {journey.trainName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {journey.trainNumber} • PNR: {journey.pnr}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {journey.fromStation} → {journey.toStation}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(journey.departureDate)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(journey.departureTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {journey.arrivalDate ? formatDate(journey.arrivalDate) : 'TBD'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatTime(journey.arrivalTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{journey.availableCapacity} kg</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{journey.pricePerKg}/kg</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(journey.status)}>
                            {journey.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{journey.acceptedParcels}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => openDetailDialog(journey)}>
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Requests
                            </Button>
                            <Button size="sm" onClick={() => openDetailDialog(journey)}>
                              <CogIcon className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                            {journey.acceptedParcels === 0 && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteDialog(journey)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          title="Delete Journey"
          description={
            deleteDialog.acceptedParcels > 0
              ? `Cannot delete "${deleteDialog.journeyName}" because it has ${deleteDialog.acceptedParcels} accepted parcel(s). Please complete or cancel existing parcels first.`
              : `Are you sure you want to delete "${deleteDialog.journeyName}"? This action cannot be undone.`
          }
          confirmText={deleteDialog.acceptedParcels > 0 ? undefined : "Delete Journey"}
          variant="destructive"
          onConfirm={deleteDialog.acceptedParcels > 0 ? () => {} : handleDeleteConfirm}
          loading={deleting}
        />

        {/* Journey Details Dialog */}
        <JourneyDetailsDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          journey={selectedJourney}
        />
      </div>
    </div>
  );
}




