'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StationSelector } from '@/components/ui/StationSelector';
import { Station } from '@/lib/stationService';
import { createParcelRequest } from '@/lib/parcelRequests';
import { toast } from '@/hooks/use-toast';
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

function CreateRequestContent() {
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
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
    description: ''
  });

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

      console.log('All validations passed, creating request...');
      console.log('User ID:', user!.id);

      // Create the parcel request in Supabase
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
        description: formData.description
      };
      
      console.log('Creating parcel request with data:', requestData);
      
      // Call the real API to create the request
      const createdRequest = await createParcelRequest(requestData);
      
      console.log('Request created successfully:', createdRequest);
      toast({
        title: "Success!",
        description: "Parcel request created successfully!",
      });
      
      // Redirect to requests page
      router.push('/dashboard/sender/requests');
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

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Request...' : 'Create Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
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




