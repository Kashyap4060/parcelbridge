'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/Button';
import { StationSelector } from '@/components/ui/StationSelector';
import { Station } from '@/lib/stationService';
import { createParcelRequest } from '@/lib/parcelRequests';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateRequest() {
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
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
        console.log('Validation failed: Missing stations');
        alert('Please select both from and to stations');
        setLoading(false);
        return;
      }

      // Validate that from and to stations are different
      if (formData.fromStation.code === formData.toStation.code) {
        console.log('Validation failed: Same stations');
        alert('From and To stations must be different');
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.receiverName.trim()) {
        console.log('Validation failed: Missing receiver name');
        alert('Please enter receiver name');
        setLoading(false);
        return;
      }

      if (!formData.receiverPhone.trim()) {
        console.log('Validation failed: Missing receiver phone');
        alert('Please enter receiver phone number');
        setLoading(false);
        return;
      }

      if (!formData.weight.trim()) {
        console.log('Validation failed: Missing weight');
        alert('Please enter parcel weight');
        setLoading(false);
        return;
      }

      if (!formData.length.trim() || !formData.breadth.trim() || !formData.height.trim()) {
        console.log('Validation failed: Missing dimensions');
        alert('Please enter all parcel dimensions (length, breadth, height)');
        setLoading(false);
        return;
      }

      if (!formData.parcelType) {
        console.log('Validation failed: Missing parcel type');
        alert('Please select parcel type');
        setLoading(false);
        return;
      }

      // Validate parcel type
      if (formData.parcelType === 'other' && !formData.customParcelType.trim()) {
        console.log('Validation failed: Missing custom parcel type');
        alert('Please describe what you are sending');
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
      alert('Parcel request created successfully!');
      
      // Redirect to requests page
      router.push('/dashboard/sender/requests');
    } catch (error: any) {
      console.error('Error creating request:', error);
      
      let errorMessage = 'Failed to create parcel request. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'sender') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create Parcel Request</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Please select valid railway stations from the dropdown. Only registered Indian Railway stations can be used for parcel delivery matching with carrier journeys.
                    </p>
                  </div>
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
            </div>

            {/* Receiver Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Receiver Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver Name
                  </label>
                  <input
                    type="text"
                    name="receiverName"
                    required
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receiver Phone
                  </label>
                  <input
                    type="tel"
                    name="receiverPhone"
                    required
                    value={formData.receiverPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            </div>

            {/* Parcel Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Parcel Information</h2>
              
              {/* Weight and Parcel Type */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    required
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parcel Type
                  </label>
                  <select
                    name="parcelType"
                    required
                    value={formData.parcelType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select parcel type</option>
                    <option value="documents">Documents</option>
                    <option value="clothes">Clothes</option>
                    <option value="grocery">Grocery</option>
                    <option value="electronics">Electronics</option>
                    <option value="books">Books</option>
                    <option value="medicines">Medicines</option>
                    <option value="gifts">Gifts</option>
                    <option value="food-items">Food Items</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Custom Parcel Type (only show if "Other" is selected) */}
              {formData.parcelType === 'other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Describe what you're sending
                  </label>
                  <input
                    type="text"
                    name="customParcelType"
                    required
                    value={formData.customParcelType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe the items you're sending"
                  />
                </div>
              )}

              {/* Dimensions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (in centimeters)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Length
                    </label>
                    <input
                      type="number"
                      name="length"
                      required
                      min="1"
                      max="100"
                      value={formData.length}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="cm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Breadth
                    </label>
                    <input
                      type="number"
                      name="breadth"
                      required
                      min="1"
                      max="100"
                      value={formData.breadth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="cm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      name="height"
                      required
                      min="1"
                      max="100"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="cm"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional details about the parcel"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
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
          </form>
        </div>
      </div>
    </div>
  );
}



