'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getPNRData, validatePNRFormat, extractTimeInfo } from '@/lib/pnrService';
import { createJourney, checkPNRExists } from '@/lib/journeyService';
import { cn } from '@/lib/utils';

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
            <h1 className="text-3xl font-bold text-foreground">Add New Journey</h1>
            <p className="text-muted-foreground">Register your train journey to start accepting parcels</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PNR Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5" />
                Train Booking Information
              </CardTitle>
              <CardDescription>
                Enter your IRCTC PNR number to automatically fetch train details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="pnr">PNR Number</Label>
                  <Input
                    id="pnr"
                    name="pnr"
                    type="text"
                    required
                    value={formData.pnr}
                    onChange={handleInputChange}
                    className={cn(
                      pnrError && "border-destructive focus-visible:ring-destructive"
                    )}
                    placeholder="10-digit PNR number"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your IRCTC PNR number to automatically fetch train details
                  </p>
                  {pnrError && (
                    <p className="text-sm text-destructive">{pnrError}</p>
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
            </CardContent>
          </Card>

          {/* Train Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Train Details
                {isPnrFetched && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-normal">
                    <CheckCircleIcon className="h-4 w-4" />
                    Fetched from PNR
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainNumber">Train Number</Label>
                  <Input
                    id="trainNumber"
                    name="trainNumber"
                    type="text"
                    required
                    value={formData.trainNumber}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., 12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainName">Train Name</Label>
                  <Input
                    id="trainName"
                    name="trainName"
                    type="text"
                    required
                    value={formData.trainName}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., Rajdhani Express"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Route Information
                {isPnrFetched && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-normal">
                    <CheckCircleIcon className="h-4 w-4" />
                    Fetched from PNR
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromStation">From Station</Label>
                  <Input
                    id="fromStation"
                    name="fromStation"
                    type="text"
                    required
                    value={formData.fromStation}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., New Delhi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toStation">To Station</Label>
                  <Input
                    id="toStation"
                    name="toStation"
                    type="text"
                    required
                    value={formData.toStation}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., Mumbai Central"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Schedule
                {isPnrFetched && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-normal">
                    <CheckCircleIcon className="h-4 w-4" />
                    Fetched from PNR
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date</Label>
                  <Input
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    required
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    required
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                  />
                  {isPnrFetched && formData.departureTime12 && (
                    <p className="text-xs text-muted-foreground">{formData.departureTime12} (12-hour)</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Arrival Date</Label>
                  <Input
                    id="arrivalDate"
                    name="arrivalDate"
                    type="date"
                    required
                    value={formData.arrivalDate}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <Input
                    id="arrivalTime"
                    name="arrivalTime"
                    type="time"
                    required
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                  />
                  {isPnrFetched && formData.arrivalTime12 && (
                    <p className="text-xs text-muted-foreground">{formData.arrivalTime12} (12-hour)</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seat Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Seat Information
                {isPnrFetched && (
                  <span className="flex items-center gap-1 text-sm text-green-600 font-normal">
                    <CheckCircleIcon className="h-4 w-4" />
                    Fetched from PNR
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coachType">Coach Type</Label>
                  <Select 
                    name="coachType" 
                    value={formData.coachType} 
                    onValueChange={(value) => setFormData(prev => ({...prev, coachType: value}))}
                    disabled={isPnrFetched}
                  >
                    <SelectTrigger className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}>
                      <SelectValue placeholder="Select coach type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sleeper">Sleeper (SL)</SelectItem>
                      <SelectItem value="ac3">AC 3 Tier (3A)</SelectItem>
                      <SelectItem value="ac2">AC 2 Tier (2A)</SelectItem>
                      <SelectItem value="ac1">AC 1 Tier (1A)</SelectItem>
                      <SelectItem value="cc">Chair Car (CC)</SelectItem>
                      <SelectItem value="2s">Second Sitting (2S)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coachNumber">Coach Number</Label>
                  <Input
                    id="coachNumber"
                    name="coachNumber"
                    type="text"
                    value={formData.coachNumber}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., S4, B1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatNumber">Seat Number</Label>
                  <Input
                    id="seatNumber"
                    name="seatNumber"
                    type="text"
                    required
                    value={formData.seatNumber}
                    onChange={handleInputChange}
                    disabled={isPnrFetched}
                    className={cn(
                      isPnrFetched && "bg-muted cursor-not-allowed"
                    )}
                    placeholder="e.g., 35, 25"
                  />
                </div>
              </div>
              {isPnrFetched && (
                <p className="mt-4 text-sm text-blue-600">
                  Seat information has been automatically filled from your PNR details.
                </p>
              )}
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
                  {loading ? 'Creating Journey...' : 'Create Journey'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}



