'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, ArchiveBoxIcon, ChevronDownIcon, ChevronRightIcon, CreditCardIcon, MapPinIcon, ClockIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSenderParcelRequests, deleteParcelRequest } from '@/lib/parcelRequests';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface ParcelRequest {
  id: string;
  pickup_station: string;
  drop_station: string;
  weight: number;
  dimensions?: string;
  description: string;
  estimated_fare: number;
  status: 'PENDING_PAYMENT' | 'SEARCHING_CARRIER' | 'MATCHED' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  payment_status?: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  created_at: string;
  carrierInfo?: {
    name: string;
    trainName: string;
    trainNumber: string;
    coachNumber: string;
    seatNumber: string;
    departureTime: string;
    arrivalTime: string;
  };
  trackingId?: string;
}

export default function SenderRequests() {
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ParcelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; requestId: string | null }>({ 
    open: false, 
    requestId: null 
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'sender') {
      router.push('/dashboard');
      return;
    }

    loadRequests();
  }, [isAuthenticated, user, router]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getSenderParcelRequests(user!.id);
      const mapped: ParcelRequest[] = data.map((p) => ({
        id: p.id,
        pickup_station: p.pickup_station,
        drop_station: p.drop_station,
        weight: Number(p.weight),
        dimensions: `${p.length ?? 0}x${p.width ?? 0}x${p.height ?? 0} cm`,
        description: p.description || '',
        estimated_fare: Number(p.estimated_fare),
        status: p.status as ParcelRequest['status'],
        payment_status: (p as any).payment_status as ParcelRequest['payment_status'],
        created_at: p.created_at,
        carrierInfo: !['PENDING_PAYMENT', 'SEARCHING_CARRIER'].includes(p.status) ? {
          name: 'Rahul Kumar',
          trainName: 'Rajdhani Express',
          trainNumber: '12951',
          coachNumber: 'A2',
          seatNumber: '15',
          departureTime: '16:30',
          arrivalTime: '08:15'
        } : undefined,
        trackingId: !['PENDING_PAYMENT', 'SEARCHING_CARRIER'].includes(p.status) ? `PB${p.id.slice(-6).toUpperCase()}` : undefined,
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

  const toggleCardExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedCards(newExpanded);
  };

  const handlePayment = async (requestId: string) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Import Razorpay utilities
      const { processParcelPayment, convertToPaise } = await import('@/lib/razorpayUtils');
      
      await processParcelPayment({
        amount: convertToPaise(request.estimated_fare),
        userId: user?.id || '',
        userEmail: user?.email || '',
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User',
        parcelId: requestId,
        onSuccess: async (response) => {
          console.log('Payment successful:', response);
          
          // Call the payment processing endpoint
          try {
            const processResponse = await fetch('/api/parcel-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                parcelId: requestId,
                paymentData: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  amount: request.estimated_fare
                }
              })
            });

            if (!processResponse.ok) {
              throw new Error('Failed to process payment on server');
            }

            toast({
              title: "Payment Successful!",
              description: `Payment processed successfully. We're now searching for carriers. Payment ID: ${response.razorpay_payment_id}`,
            });

            // Reload requests to get updated status
            await loadRequests();
          } catch (error) {
            console.error('Error processing payment on server:', error);
            toast({
              title: "Payment Successful, Processing Pending",
              description: `Payment was successful but there was an issue processing it. Please contact support. Payment ID: ${response.razorpay_payment_id}`,
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          console.error('Payment failed:', error);
          toast({
            title: "Payment Failed",
            description: error.message || "Failed to process payment. Please try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Payment process failed:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!user) return;
    
    setDeleting(true);
    try {
      console.log('Deleting request:', requestId, 'for user:', user.id);
      const result = await deleteParcelRequest(requestId, user.id);
      
      if (result.success) {
        // Remove the request from the UI
        setRequests(prev => prev.filter(req => req.id !== requestId));
        setDeleteDialog({ open: false, requestId: null });
        toast({
          title: "Success",
          description: "Parcel request deleted successfully.",
        });
      } else {
        console.error('Failed to delete request:', result.error);
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete the request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the request.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (requestId: string) => {
    setDeleteDialog({ open: true, requestId });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, requestId: null });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', label: 'Payment Required' };
      case 'SEARCHING_CARRIER':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800', label: 'Searching for Carrier' };
      case 'MATCHED':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', label: 'Carrier Matched' };
      case 'ACCEPTED':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', label: 'Accepted' };
      case 'IN_TRANSIT':
        return { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-300', label: 'In Transit' };
      case 'DELIVERED':
        return { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800', label: 'Delivered' };
      case 'CANCELLED':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', label: 'Cancelled' };
      default:
        return { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Loading requests...</p>
            </CardContent>
          </Card>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No parcel requests yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first parcel request to send items via train passengers.
              </p>
              <Button onClick={createNewRequest} className="flex items-center gap-2 mx-auto">
                <PlusIcon className="h-5 w-5" />
                Create Your First Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const isExpanded = expandedCards.has(request.id);
              const statusConfig = getStatusConfig(request.status);
              
              return (
                <div key={request.id}>
                  <Card className="overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors px-6 py-4"
                      onClick={() => toggleCardExpansion(request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            {isExpanded ? (
                              <ChevronDownIcon className="h-5 w-5 text-muted-foreground transition-transform" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-muted-foreground transition-transform" />
                            )}
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {request.pickup_station} → {request.drop_station}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-500 mt-1">
                                Parcel ID: PB{request.id.slice(-6).toUpperCase()}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge 
                            variant={statusConfig.variant}
                            className={`${statusConfig.className} font-medium px-3 py-1`}
                          >
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground hidden sm:block">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 px-6 pb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Parcel Details Section */}
                          <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                              <h4 className="font-semibold text-gray-900 text-base flex items-center">
                                <ArchiveBoxIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Parcel Details
                              </h4>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600 font-medium">Weight:</span>
                                <span className="text-sm font-semibold text-gray-900">{request.weight} kg</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600 font-medium">Dimensions:</span>
                                <span className="text-sm font-semibold text-gray-900">{request.dimensions}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600 font-medium">Fee Status:</span>
                                <div className="flex items-center space-x-2">
                                  {request.payment_status === 'PENDING' ? (
                                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                                      Payment Required
                                    </Badge>
                                  ) : request.payment_status === 'SUCCESSFUL' ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      Paid
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                      {request.payment_status || 'Unknown'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600 font-medium">Total Fee:</span>
                                <span className="text-sm font-bold text-green-600">₹{request.estimated_fare}</span>
                              </div>
                              {request.description && (
                                <div className="pt-2">
                                  <span className="text-sm text-gray-600 font-medium">Description:</span>
                                  <p className="text-sm mt-2 p-3 bg-gray-50 rounded-lg border">{request.description}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Carrier Information Section */}
                          <div className="space-y-6">
                            <div className="border-b border-gray-100 pb-4">
                              <h4 className="font-semibold text-gray-900 text-base flex items-center">
                                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Carrier Information
                              </h4>
                            </div>
                            {request.carrierInfo ? (
                              <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm font-semibold text-gray-900">{request.carrierInfo.name}</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <ArchiveBoxIcon className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-900">{request.carrierInfo.trainName} ({request.carrierInfo.trainNumber})</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-xs text-gray-600 block">Coach</span>
                                    <span className="text-sm font-semibold text-gray-900">{request.carrierInfo.coachNumber}</span>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-xs text-gray-600 block">Seat</span>
                                    <span className="text-sm font-semibold text-gray-900">{request.carrierInfo.seatNumber}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <ClockIcon className="h-5 w-5 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {request.carrierInfo.departureTime} - {request.carrierInfo.arrivalTime}
                                  </span>
                                </div>
                                {request.trackingId && (
                                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <MapPinIcon className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-mono font-semibold text-green-700">
                                      {request.trackingId}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                {request.status === 'SEARCHING_CARRIER' ? (
                                  <>
                                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                                    <p className="text-sm text-blue-600 font-medium">Searching for the best carrier...</p>
                                    <p className="text-xs text-gray-400 mt-1">We're finding carriers traveling on your route</p>
                                  </>
                                ) : (
                                  <>
                                    <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">No carrier assigned yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Waiting for a carrier to accept your request</p>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            Created on {formatDate(request.created_at)}
                          </div>
                          <div className="flex items-center space-x-3">
                            {(request.status === 'ACCEPTED' || request.status === 'IN_TRANSIT') && (
                              <Button 
                                variant="secondary"
                                className="flex items-center space-x-2 shadow-md"
                              >
                                <MapPinIcon className="h-4 w-4" />
                                <span>Track Package</span>
                              </Button>
                            )}

                            {request.status === 'PENDING_PAYMENT' && (
                              <>
                                <Button 
                                  onClick={() => handlePayment(request.id)}
                                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 shadow-md"
                                >
                                  <CreditCardIcon className="h-4 w-4" />
                                  <span>Pay Fee ₹{request.estimated_fare}</span>
                                </Button>
                                <Button 
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openDeleteDialog(request.id)}
                                  className="flex items-center space-x-2 shadow-md"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  <span>Delete</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Parcel Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this parcel request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.requestId && handleDeleteRequest(deleteDialog.requestId)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  );
}