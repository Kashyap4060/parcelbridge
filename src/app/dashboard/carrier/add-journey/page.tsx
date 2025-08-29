'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
import { getPNRData, validatePNRFormat } from '@/lib/pnrService';

export default function AddJourney() {
  const { user, isAuthenticated } = useHybridAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pnrError, setPnrError] = useState('');
  const [formData, setFormData] = useState({
    pnr: '',
    trainNumber: '',
    trainName: '',
    fromStation: '',
    toStation: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    coachType: 'sleeper',
    seatNumber: '',
    availableCapacity: '5',
    pricePerKg: '',
    specialInstructions: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear PNR error when user starts typing
    if (name === 'pnr') {
      setPnrError('');
      // Real-time PNR format validation
      if (value.length === 10) {
        const validation = validatePNRFormat(value);
        if (!validation.isValid) {
          setPnrError(validation.error || 'Invalid PNR format');
        }
      }
    }
  };

  const checkPNRExists = async (pnr: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual Supabase API call to check if PNR exists
      // For now, simulate checking against existing PNRs
      const existingPNRs = ['PNR123456789', 'PNR987654321']; // Mock existing PNRs
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return existingPNRs.includes(pnr);
    } catch (error) {
      console.error('Error checking PNR:', error);
      return false;
    }
  };

  const handlePNRLookup = async () => {
    if (!formData.pnr) return;
    
    // Validate PNR format first
    const validation = validatePNRFormat(formData.pnr);
    if (!validation.isValid) {
      setPnrError(validation.error || 'Invalid PNR format');
      return;
    }
    
    setLoading(true);
    setPnrError('');
    
    try {
      // First check if PNR already exists
      const pnrExists = await checkPNRExists(formData.pnr);
      if (pnrExists) {
        setPnrError('This PNR is already registered by another carrier. Please use a different PNR.');
        setLoading(false);
        return;
      }
      
      // Fetch real PNR data using the PNR API service
      console.log('Looking up PNR:', formData.pnr);
      const pnrData = await getPNRData(formData.pnr, true); // Allow mock in development
      
      if (!pnrData.isValid) {
        setPnrError(pnrData.error || 'Failed to fetch PNR details. Please check the PNR number.');
        setLoading(false);
        return;
      }
      
      // Format dates for form inputs
      const departureDate = pnrData.journeyDate.toISOString().split('T')[0];
      const arrivalDate = pnrData.arrivalDate ? pnrData.arrivalDate.toISOString().split('T')[0] : departureDate;
      
      // Auto-populate form with real PNR data
      setFormData(prev => ({
        ...prev,
        trainNumber: pnrData.trainNumber,
        trainName: pnrData.trainName,
        fromStation: pnrData.sourceStation,
        toStation: pnrData.destinationStation,
        departureDate,
        departureTime: '16:30', // Default time as API might not provide exact times
        arrivalDate,
        arrivalTime: '08:35', // Default time as API might not provide exact times
        coachType: pnrData.class.toLowerCase().includes('ac') ? 'ac3' : 'sleeper',
        seatNumber: pnrData.seatNumber || ''
      }));
      
    } catch (error) {
      console.error('Error looking up PNR:', error);
      setPnrError(error instanceof Error ? error.message : 'Failed to lookup PNR. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPnrError('');

    try {
      // Final check if PNR already exists before submitting
      const pnrExists = await checkPNRExists(formData.pnr);
      if (pnrExists) {
        setPnrError('This PNR is already registered. Please use a different PNR.');
        setLoading(false);
        return;
      }
      
      // TODO: Replace with actual Supabase API call
      console.log('Creating journey:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to journeys page
      router.push('/dashboard/carrier/journeys');
    } catch (error) {
      console.error('Error creating journey:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'carrier') {
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Journey</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PNR Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Train Booking Information</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PNR Number
                  </label>
                  <input
                    type="text"
                    name="pnr"
                    required
                    value={formData.pnr}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      pnrError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="10-digit PNR number"
                    maxLength={10}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your IRCTC PNR number to automatically fetch train details
                  </p>
                  {pnrError && (
                    <p className="mt-1 text-sm text-red-600">{pnrError}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={handlePNRLookup}
                    disabled={loading || !formData.pnr || formData.pnr.length !== 10}
                    className="px-6"
                  >
                    {loading ? 'Fetching...' : 'Fetch Details'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Train Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Train Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Number
                  </label>
                  <input
                    type="text"
                    name="trainNumber"
                    required
                    value={formData.trainNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Train Name
                  </label>
                  <input
                    type="text"
                    name="trainName"
                    required
                    value={formData.trainName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Rajdhani Express"
                  />
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Station
                  </label>
                  <input
                    type="text"
                    name="fromStation"
                    required
                    value={formData.fromStation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., New Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Station
                  </label>
                  <input
                    type="text"
                    name="toStation"
                    required
                    value={formData.toStation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai Central"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    required
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    required
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    name="arrivalDate"
                    required
                    value={formData.arrivalDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    name="arrivalTime"
                    required
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Seat Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seat Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coach Type
                  </label>
                  <select
                    name="coachType"
                    value={formData.coachType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sleeper">Sleeper (SL)</option>
                    <option value="ac3">AC 3 Tier (3A)</option>
                    <option value="ac2">AC 2 Tier (2A)</option>
                    <option value="ac1">AC 1 Tier (1A)</option>
                    <option value="cc">Chair Car (CC)</option>
                    <option value="2s">Second Sitting (2S)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seat Number
                  </label>
                  <input
                    type="text"
                    name="seatNumber"
                    required
                    value={formData.seatNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., B1-25"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Settings</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Capacity (kg)
                  </label>
                  <input
                    type="number"
                    name="availableCapacity"
                    required
                    min="1"
                    max="20"
                    value={formData.availableCapacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per KG (₹)
                  </label>
                  <input
                    type="number"
                    name="pricePerKg"
                    required
                    min="10"
                    value={formData.pricePerKg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions for parcel delivery..."
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
                {loading ? 'Creating Journey...' : 'Create Journey'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
