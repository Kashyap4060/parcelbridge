'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, TruckIcon } from '@heroicons/react/24/outline';
import { getPNRData, validatePNRFormat, extractTimeInfo } from '@/lib/pnrService';
import { createJourney, checkPNRExists } from '@/lib/journeyService';

export default function AddJourney() {
  const { user, isAuthenticated } = useSimpleAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pnrError, setPnrError] = useState('');
  const [isPnrFetched, setIsPnrFetched] = useState(false);
  const [formData, setFormData] = useState({
    pnr: '',
    trainNumber: '',
    trainName: '',
    fromStation: '',
    toStation: '',
    departureDate: '',
    departureTime: '',
    departureTime12: '',
    arrivalDate: '',
    arrivalTime: '',
    arrivalTime12: '',
    coachType: 'sleeper',
    coachNumber: '',
    seatNumber: ''
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
      setIsPnrFetched(false); // Reset fetch status when PNR is changed
      // Real-time PNR format validation
      if (value.length === 10) {
        const validation = validatePNRFormat(value);
        if (!validation.isValid) {
          setPnrError(validation.error || 'Invalid PNR format');
        }
      }
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
      
      // Extract time information from the API response
      function splitDateTime(rawDate: string | Date | any) {
        if (!rawDate) {
          return { date: "", time: "", time12: "" }; // fallback
        }

        let date: Date;
        try {
          if (rawDate instanceof Date) {
            date = rawDate;
          } else if (typeof rawDate === 'string') {
            // Manual parse strings like "Nov 7, 2025 8:05:00 AM"
            const m = rawDate.trim().match(/^(\w{3})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
            if (m) {
              const [, monStr, dStr, yStr, hStr, minStr, secStr, ampm] = m;
              const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11} as const;
              const mon = months[monStr as keyof typeof months];
              const y = parseInt(yStr,10);
              const d = parseInt(dStr,10);
              let h = parseInt(hStr,10) % 12; // 12 AM -> 0, 12 PM -> 12
              if (ampm.toUpperCase() === 'PM') h += 12;
              const min = parseInt(minStr,10);
              const sec = secStr ? parseInt(secStr,10) : 0;
              // Construct in local time (API is IST; we are not shifting timezones)
              date = new Date(y, mon, d, h, min, sec);
            } else {
              // Fallback to native parser if regex fails
              date = new Date(rawDate);
            }
          } else {
            date = new Date(rawDate);
          }

          if (isNaN(date.getTime())) {
            console.warn('Invalid date:', rawDate);
            return { date: "", time: "", time12: "" }; // fallback
          }

          // For HTML input[type=date] and input[type=time], values must be:
          // - date: yyyy-MM-dd
          // - time: HH:mm (24h)
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const HH = String(date.getHours()).padStart(2, '0');
          const MM = String(date.getMinutes()).padStart(2, '0');
          const dateForInput = `${yyyy}-${mm}-${dd}`;
          const timeForInput = `${HH}:${MM}`;
          // Also provide a 12-hour display string with AM/PM for UI hints
          const hour12 = (Number(HH) % 12) || 12;
          const ampm = Number(HH) >= 12 ? 'PM' : 'AM';
          const time12 = `${String(hour12).padStart(2,'0')}:${MM} ${ampm}`;

          console.log('Parsed date/time for inputs:', { rawDate, dateForInput, timeForInput });

          return {
            date: dateForInput,
            time: timeForInput,
            time12,
          };
        } catch (error) {
          console.warn('Error parsing date/time:', rawDate, error);
          return { date: "", time: "", time12: "" };
        }
      }


      // Auto-populate form with real PNR data
      // getPNRData returns journeyDate/arrivalDate as Date objects
  const departure = splitDateTime(pnrData.dateOfJourneyRaw || pnrData.journeyDate || pnrData.dateOfJourney);
  const arrival = splitDateTime(pnrData.arrivalDateRaw || pnrData.arrivalDate);

      setFormData(prev => ({
        ...prev,
        trainNumber: pnrData.trainNumber,
        trainName: pnrData.trainName,
        fromStation: pnrData.sourceStation,
        toStation: pnrData.destinationStation,
        departureDate: departure.date || '',
        departureTime: departure.time || '',
        departureTime12: departure.time12 || '',
        arrivalDate: arrival.date || '',
        arrivalTime: arrival.time || '',
        arrivalTime12: arrival.time12 || '',
        coachType: pnrData.journeyClass,
        coachNumber: (pnrData.coachNumber ? String(pnrData.coachNumber) : (pnrData.passengerList?.[0]?.currentCoachId || pnrData.passengerList?.[0]?.bookingCoachId || '')),
        seatNumber: (pnrData.seatNumber ? String(pnrData.seatNumber) : (pnrData.passengerList?.[0]?.currentBerthNo?.toString() || pnrData.passengerList?.[0]?.bookingBerthNo?.toString() || ''))
      }));
 
      setIsPnrFetched(true);
      
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
      
      // Create journey using the service
      if (!user?.id) {
        setPnrError('User authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      const result = await createJourney(user.id, {
        pnr: formData.pnr,
        trainNumber: formData.trainNumber,
        trainName: formData.trainName,
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        departureDate: formData.departureDate,
        departureTime: formData.departureTime,
        arrivalDate: formData.arrivalDate,
        arrivalTime: formData.arrivalTime,
        coachType: formData.coachType,
        coachNumber: formData.coachNumber,
        seatNumber: formData.seatNumber
      });

      if (result.success) {
        // Redirect to journeys page on success
        router.push('/dashboard/carrier/journeys');
      } else {
        // Show error message
        setPnrError(result.error || 'Failed to create journey. Please try again.');
      }
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Train Details
                {isPnrFetched && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    ✓ Fetched from PNR
                  </span>
                )}
              </h2>
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., Rajdhani Express"
                  />
                </div>
              </div>
            </div>

            {/* Route Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Route Information
                {isPnrFetched && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    ✓ Fetched from PNR
                  </span>
                )}
              </h2>
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., Mumbai Central"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Schedule
                {isPnrFetched && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    ✓ Fetched from PNR
                  </span>
                )}
              </h2>
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {isPnrFetched && formData.departureTime12 && (
                    <p className="mt-1 text-xs text-gray-500">{formData.departureTime12} (12-hour)</p>
                  )}
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {isPnrFetched && formData.arrivalTime12 && (
                    <p className="mt-1 text-xs text-gray-500">{formData.arrivalTime12} (12-hour)</p>
                  )}
                </div>
              </div>
            </div>

            {/* Seat Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seat Information
                {isPnrFetched && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    ✓ Fetched from PNR
                  </span>
                )}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coach Type
                  </label>
                  <select
                    name="coachType"
                    value={formData.coachType}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
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
                    Coach Number
                  </label>
                  <input
                    type="text"
                    name="coachNumber"
                    value={formData.coachNumber}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., S4, B1"
                  />
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
                    disabled={isPnrFetched}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isPnrFetched ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., 35, 25"
                  />
                </div>
              </div>
              {isPnrFetched && (
                <p className="mt-2 text-sm text-blue-600">
                  Seat information has been automatically filled from your PNR details.
                </p>
              )}
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



