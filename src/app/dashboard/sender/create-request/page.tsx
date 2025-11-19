'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useFeeCalculation, createFeeCalculationInput } from '@/hooks/useFeeCalculation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StationSelector } from '@/components/ui/StationSelector';
import { FeeBreakdown, FeeBreakdownSkeleton, FeeBreakdownError } from '@/components/ui/FeeBreakdown';
import { Station } from '@/lib/stationService';
import { createParcelRequest, deleteParcelRequest, updateParcelRequestPayment } from '@/lib/parcelRequests';
import { toast } from '@/hooks/use-toast';
import { ArrowLeftIcon, InformationCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { processParcelPayment, convertToPaise } from '@/lib/razorpayUtils';

function CreateRequestContent() {
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [paymentDialog, setPaymentDialog] = useState<{ 
    open: boolean; 
    requestId: string | null; 
    fee: number; 
    breakdown: any;
    requestData: any; // Store request data before creating
  }>({ 
    open: false, 
    requestId: null, 
    fee: 0,
    breakdown: null,
    requestData: null
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromStation: null as Station | null,
    toStation: null as Station | null,
    receiverName: '',
    receiverPhone: '',
    weight: '',
    length: '',
    breadth: '',
    height: '',
    parcelType: '',
    customParcelType: '',
    description: '',
    preferredDate: '',
    coachType: ''
  });

  // Fee calculation hook
  const feeCalculation = useFeeCalculation();

  // Pre-fill form data from URL parameters (from fee calculator)
  useEffect(() => {
    const fillFromParams = () => {
      try {
        // Get station data
        const fromStationParam = searchParams.get('fromStation');
        const toStationParam = searchParams.get('toStation');
        
        if (fromStationParam) {
          const fromStation = JSON.parse(fromStationParam);
          setFormData(prev => ({ ...prev, fromStation }));
        }
        
        if (toStationParam) {
          const toStation = JSON.parse(toStationParam);
          setFormData(prev => ({ ...prev, toStation }));
        }
        
        // Get dimension data
        const length = searchParams.get('length');
        const breadth = searchParams.get('breadth');
        const height = searchParams.get('height');
        const weight = searchParams.get('weight');
        
        if (length) setFormData(prev => ({ ...prev, length }));
        if (breadth) setFormData(prev => ({ ...prev, breadth }));
        if (height) setFormData(prev => ({ ...prev, height }));
        if (weight) setFormData(prev => ({ ...prev, weight }));
        
        // Show success message if data was pre-filled
        if (fromStationParam || toStationParam || length || breadth || height || weight) {
          toast({
            title: "Form Pre-filled",
            description: "Data from your fee calculation has been loaded into the form.",
            variant: "default",
          });
        }
        
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
        toast({
          title: "Pre-fill Error",
          description: "Some data couldn't be loaded from your previous calculation.",
          variant: "destructive",
        });
      }
    };

    fillFromParams();
  }, [searchParams]);

  // Effect to calculate fee when form data changes
  useEffect(() => {
    const calculateFeePreview = async () => {
      const feeInput = createFeeCalculationInput({
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        breadth: parseFloat(formData.breadth) || 0,
        height: parseFloat(formData.height) || 0,
        pickupStation: { station_code: formData.fromStation?.code },
        destinationStation: { station_code: formData.toStation?.code }
      });

      if (feeInput && feeCalculation.canCalculate(feeInput)) {
        try {
          await feeCalculation.calculateFee(feeInput);
        } catch (error) {
          // Error is handled by the hook
          console.log('Fee calculation failed:', error);
        }
      } else {
        // Only clear if we have incomplete data and no current calculation
        if (!feeCalculation.isCalculating && feeCalculation.result) {
          feeCalculation.clearCalculation();
        }
      }
    };

    // Increased debounce time and only trigger on meaningful changes
    const timeoutId = setTimeout(calculateFeePreview, 1500);
    return () => clearTimeout(timeoutId);
  }, [
    formData.fromStation?.code,
    formData.toStation?.code,
    formData.weight,
    formData.length,
    formData.breadth,
    formData.height
    // Removed feeCalculation dependency to prevent re-triggering
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStationChange = (field: 'fromStation' | 'toStation') => (station: Station | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: station
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission using ref (more reliable than state)
    if (loading || isSubmittingRef.current) {
      console.log('Form submission already in progress, ignoring...');
      return;
    }
    
    isSubmittingRef.current = true;
    console.log('Form submitted!');
    console.log('Current form data:', formData);
    setLoading(true);

    try {
      // Validate that both stations are selected
      if (!formData.fromStation || !formData.toStation) {
        toast({
          title: "Validation Error",
          description: "Please select both from and to stations",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate that from and to stations are different
      if (formData.fromStation.code === formData.toStation.code) {
        toast({
          title: "Validation Error", 
          description: "From and To stations must be different",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.receiverName.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter receiver name", 
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.receiverPhone.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter receiver phone number",
          variant: "destructive", 
        });
        setLoading(false);
        return;
      }

      if (!formData.weight.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter parcel weight",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.length.trim() || !formData.breadth.trim() || !formData.height.trim()) {
        toast({
          title: "Validation Error",
          description: "Please enter all parcel dimensions (length, breadth, height)",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!formData.parcelType) {
        toast({
          title: "Validation Error", 
          description: "Please select parcel type",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate parcel type
      if (formData.parcelType === 'other' && !formData.customParcelType.trim()) {
        toast({
          title: "Validation Error",
          description: "Please describe what you are sending",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate preferred date
      if (!formData.preferredDate) {
        toast({
          title: "Validation Error",
          description: "Please select a preferred send date",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate that preferred date is not in the past
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      if (selectedDate < today) {
        toast({
          title: "Validation Error",
          description: "Preferred send date cannot be in the past",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate coach type
      if (!formData.coachType) {
        toast({
          title: "Validation Error",
          description: "Please select a preferred coach type",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('All validations passed, preparing request...');
      console.log('User ID:', user!.id);

      // Prepare the parcel request data (don't create yet)
      const requestData = {
        senderId: user!.id,
        fromStationCode: formData.fromStation.code,
        fromStationName: formData.fromStation.name,
        toStationCode: formData.toStation.code,
        toStationName: formData.toStation.name,
        receiverName: formData.receiverName,
        receiverPhone: formData.receiverPhone,
        weight: parseFloat(formData.weight),
        length: parseFloat(formData.length),
        breadth: parseFloat(formData.breadth),
        height: parseFloat(formData.height),
        parcelType: formData.parcelType === 'other' ? formData.customParcelType : formData.parcelType,
        description: formData.description,
        preferredDate: formData.preferredDate,
        coachType: formData.coachType
      };
      
      console.log('Request data prepared:', requestData);
      
      // Show payment dialog with the request data (but don't create request yet)
      setPaymentDialog({
        open: true,
        requestId: null, // No request created yet
        fee: feeCalculation.result?.totalFee || 0,
        breakdown: feeCalculation.result || null,
        requestData: requestData // Store the data for later creation
      });
    } catch (error: any) {
      console.error('Error creating request:', error);
      
      let errorMessage = 'Failed to create parcel request. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePayNow = async () => {
    setPaymentLoading(true);
    try {
      // First create the request if it doesn't exist yet
      let requestId = paymentDialog.requestId;
      
      if (!requestId && paymentDialog.requestData) {
        console.log('Creating parcel request before payment...');
        const createdRequest = await createParcelRequest(paymentDialog.requestData);
        requestId = createdRequest.id;
        
        // Update dialog with created request ID
        setPaymentDialog(prev => ({
          ...prev,
          requestId: createdRequest.id,
          requestData: null // Clear since request is now created
        }));
        
        console.log('Request created successfully:', createdRequest);
      }
      
      // Process payment for the request using Razorpay
      console.log('Processing payment for request:', requestId);
      
      await processParcelPayment({
        amount: Math.round(paymentDialog.fee * 100), // Convert rupees to paise for Razorpay
        userId: user?.id || '',
        userEmail: user?.email || '',
        userName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User',
        parcelId: requestId || undefined,
        onSuccess: async (response) => {
          console.log('Payment successful:', response);
          
          // Call the new payment processing endpoint to trigger matching
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
                  amount: paymentDialog.fee
                }
              })
            });

            if (!processResponse.ok) {
              throw new Error('Failed to process payment on server');
            }

            toast({
              title: "Payment Successful!",
              description: `Your payment has been processed and we're now searching for carriers. Payment ID: ${response.razorpay_payment_id}`,
            });
          } catch (error) {
            console.error('Error processing payment on server:', error);
            toast({
              title: "Payment Successful, Processing Pending",
              description: `Payment was successful but there was an issue processing it. Please contact support. Payment ID: ${response.razorpay_payment_id}`,
              variant: "destructive",
            });
          }
          
          // Close dialog and redirect to requests
          setPaymentDialog({ open: false, requestId: null, fee: 0, breakdown: null, requestData: null });
          router.push('/dashboard/sender/requests');
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
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentCancel = async () => {
    // This is for the "Skip for Now" button - creates the request but skips payment
    try {
      // First create the request if it doesn't exist yet
      let requestId = paymentDialog.requestId;
      
      if (!requestId && paymentDialog.requestData) {
        console.log('Creating parcel request for skip payment...');
        const createdRequest = await createParcelRequest(paymentDialog.requestData);
        requestId = createdRequest.id;
        console.log('Request created successfully:', createdRequest);
      }
      
      if (requestId) {
        toast({
          title: "Request Created!",
          description: "Your parcel request has been created. You can pay later from the requests page.",
        });
        setPaymentDialog({ open: false, requestId: null, fee: 0, breakdown: null, requestData: null });
        router.push('/dashboard/sender/requests');
      } else {
        // Fallback case - just close dialog
        setPaymentDialog({ open: false, requestId: null, fee: 0, breakdown: null, requestData: null });
      }
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create parcel request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    // Prevent multiple clicks during deletion
    if (deleteLoading) return;
    
    // This is for the X button
    if (paymentDialog.requestId) {
      // Request was already created (rare case), ask user to confirm cancellation
      const shouldCancel = window.confirm(
        "Are you sure you want to cancel this parcel request? This will delete the request permanently."
      );
      
      if (shouldCancel) {
        performDelete();
      }
      // If user clicks "No" in confirm dialog, do nothing (keep dialog open)
    } else {
      // No request created yet, just close dialog and return to form
      setPaymentDialog({ open: false, requestId: null, fee: 0, breakdown: null, requestData: null });
    }
  };

  const performDelete = async () => {
    if (!paymentDialog.requestId) return;
    
    try {
      setDeleteLoading(true);
      
      // Delete the request from database
      const result = await deleteParcelRequest(paymentDialog.requestId, user?.id || '');
      
      if (result.success) {
        toast({
          title: "Request Cancelled",
          description: "Your parcel request has been cancelled and deleted.",
          variant: "destructive",
        });
        
        setPaymentDialog({ open: false, requestId: null, fee: 0, breakdown: null, requestData: null });
        // Stay on current page so user can create a new request
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel request. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Parcel Request</h1>
            <p className="text-muted-foreground">Post a new parcel for delivery</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Route Information
              </CardTitle>
              <CardDescription>
                Select your departure and destination stations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Please select valid railway stations from the dropdown. Only registered Indian Railway stations can be used for parcel delivery matching with carrier journeys.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <StationSelector
                  label="From Station"
                  value={formData.fromStation}
                  onChange={handleStationChange('fromStation')}
                  placeholder="Search for departure station..."
                  required
                />
                <StationSelector
                  label="To Station"
                  value={formData.toStation}
                  onChange={handleStationChange('toStation')}
                  placeholder="Search for destination station..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Preferences Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Preferences</CardTitle>
              <CardDescription>
                When would you like to send your parcel and preferred coach type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Preferred Send Date</Label>
                  <Input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Select the date when you want to send your parcel
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coachType">Preferred Coach Type</Label>
                  <Select 
                    name="coachType" 
                    value={formData.coachType} 
                    onValueChange={(value) => setFormData(prev => ({...prev, coachType: value}))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coach type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {/* Luxury / High-end Classes */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-600 border-b">
                        Luxury / High-end Classes
                      </div>
                      <SelectItem value="1A">1A - First AC / AC First Class</SelectItem>
                      <SelectItem value="2A">2A - AC Two Tier</SelectItem>
                      <SelectItem value="3A">3A - AC Three Tier</SelectItem>
                      <SelectItem value="3E">3E - AC Three Tier Economy</SelectItem>
                      <SelectItem value="EC">EC - Executive Chair Car</SelectItem>
                      <SelectItem value="CC">CC - AC Chair Car</SelectItem>
                      
                      {/* Middle & Budget Classes */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-600 border-b border-t mt-2">
                        Middle & Budget Classes
                      </div>
                      <SelectItem value="SL">SL - Sleeper Class</SelectItem>
                      <SelectItem value="2S">2S - Second Sitting</SelectItem>
                      <SelectItem value="GN">GN - General / Unreserved Coach</SelectItem>
                      
                      {/* Special AC Coaches */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-gray-600 border-b border-t mt-2">
                        Special AC Coaches
                      </div>
                      <SelectItem value="Anubhuti">Anubhuti Class</SelectItem>
                      <SelectItem value="Vistadome">Vistadome / EV - Executive Vistadome</SelectItem>
                      <SelectItem value="DDCC">Double Decker AC Chair Car</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Choose the train coach type you prefer for your parcel delivery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receiver Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Receiver Information</CardTitle>
              <CardDescription>
                Details of the person who will receive the parcel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiverName">Receiver Name</Label>
                  <Input
                    id="receiverName"
                    name="receiverName"
                    type="text"
                    required
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiverPhone">Receiver Phone</Label>
                  <Input
                    id="receiverPhone"
                    name="receiverPhone"
                    type="tel"
                    required
                    value={formData.receiverPhone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parcel Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Parcel Information</CardTitle>
              <CardDescription>
                Weight, dimensions, and type of your parcel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weight and Parcel Type */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    required
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcelType">Parcel Type</Label>
                  <Select 
                    name="parcelType" 
                    value={formData.parcelType} 
                    onValueChange={(value) => setFormData(prev => ({...prev, parcelType: value}))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parcel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="clothes">Clothes</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="medicines">Medicines</SelectItem>
                      <SelectItem value="gifts">Gifts</SelectItem>
                      <SelectItem value="food-items">Food Items</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Parcel Type */}
              {formData.parcelType === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customParcelType">Describe what you're sending</Label>
                  <Input
                    id="customParcelType"
                    name="customParcelType"
                    type="text"
                    required
                    value={formData.customParcelType}
                    onChange={handleInputChange}
                    placeholder="Please describe the items you're sending"
                  />
                </div>
              )}

              {/* Dimensions */}
              <div>
                <Label className="text-base">Dimensions (in centimeters)</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.length}
                      onChange={handleInputChange}
                      placeholder="cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breadth">Breadth</Label>
                    <Input
                      id="breadth"
                      name="breadth"
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.breadth}
                      onChange={handleInputChange}
                      placeholder="cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.height}
                      onChange={handleInputChange}
                      placeholder="cm"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Additional Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional details about the parcel"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fee Estimation */}
          {(feeCalculation.result || feeCalculation.isCalculating || feeCalculation.error) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5 text-green-600" />
                  Fee Estimation
                </CardTitle>
                <CardDescription>
                  Real-time calculation based on your parcel details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feeCalculation.isCalculating && (
                  <FeeBreakdownSkeleton />
                )}
                {feeCalculation.error && !feeCalculation.isCalculating && (
                  <FeeBreakdownError 
                    error={feeCalculation.error}
                    onRetry={() => {
                      const feeInput = createFeeCalculationInput({
                        weight: parseFloat(formData.weight) || 0,
                        length: parseFloat(formData.length) || 0,
                        breadth: parseFloat(formData.breadth) || 0,
                        height: parseFloat(formData.height) || 0,
                        pickupStation: { station_code: formData.fromStation?.code },
                        destinationStation: { station_code: formData.toStation?.code }
                      });
                      if (feeInput) {
                        feeCalculation.calculateFee(feeInput);
                      }
                    }}
                  />
                )}
                {feeCalculation.result && !feeCalculation.isCalculating && (
                  <FeeBreakdown 
                    result={feeCalculation.result}
                    fromStation={formData.fromStation?.name}
                    toStation={formData.toStation?.name}
                    weight={parseFloat(formData.weight) || undefined}
                    showHeader={false}
                    variant="detailed"
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/sender/requests')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => {
                    if (loading || isSubmittingRef.current) {
                      e.preventDefault();
                      return false;
                    }
                  }}
                  className="flex-1"
                >
                  {loading ? 'Creating Request...' : 'Create Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Payment Dialog */}
        <Dialog open={paymentDialog.open} onOpenChange={(open) => {
          if (!open && !deleteLoading) {
            // User clicked X or pressed Escape - handle as request cancellation
            // Only allow closing if not currently deleting
            handleDialogClose();
          }
        }}>
          <DialogContent>
            {/* Loading overlay for delete operation */}
            {deleteLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
                <div className="flex flex-col items-center space-y-2">
                  <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">Cancelling request...</span>
                </div>
              </div>
            )}
            
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CreditCardIcon className="h-6 w-6 text-green-600" />
                <span>Complete Your Payment</span>
              </DialogTitle>
              <DialogDescription>
                Review your parcel details and complete the payment to create your request and make it visible to carriers, or skip payment for now.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Fee breakdown */}
              {paymentDialog.breakdown && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Fee Breakdown</h4>
                  <div className="space-y-2">
                    {paymentDialog.breakdown.baseFare && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Base handling fee</span>
                        <span>₹{paymentDialog.breakdown.baseFare}</span>
                      </div>
                    )}
                    {paymentDialog.breakdown.weightFare && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Weight charges</span>
                        <span>₹{paymentDialog.breakdown.weightFare}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total Fee</span>
                        <span className="text-lg font-bold text-green-600">₹{paymentDialog.fee}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This amount will be held securely and released to the carrier upon successful delivery.
                  </p>
                </div>
              )}
              
              {/* Simple fee display fallback */}
              {!paymentDialog.breakdown && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Delivery Fee:</span>
                    <span className="text-lg font-bold text-green-600">₹{paymentDialog.fee}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This amount will be held securely and released to the carrier upon successful delivery.
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Your request becomes visible to carriers</li>
                  <li>• Carrier accepts and provides journey details</li>
                  <li>• Secure handover with OTP verification</li>
                  <li>• Payment released after delivery confirmation</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handlePaymentCancel}
                disabled={paymentLoading || deleteLoading}
              >
                Skip for Now
              </Button>
              <Button 
                onClick={handlePayNow}
                disabled={paymentLoading || deleteLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {paymentLoading ? 'Processing...' : `Pay ₹${paymentDialog.fee}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function CreateRequest() {
  return (
    <ProtectedRoute requireRole="sender">
      <CreateRequestContent />
    </ProtectedRoute>
  );
}




