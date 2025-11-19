/**
 * Example: Integrating Payment Components into Parcel Request Flow
 * This shows how to integrate the payment system into existing parcel creation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FeeDisplay, PaymentDialog } from '@/components/payments';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import type { FeeBreakdown } from '@/lib/feeCalculation';

interface ParcelFormData {
  pickupStation: string;
  dropStation: string;
  weight: number;
  description: string;
  preferredDate: string;
  declaredValue?: number;
  isUrgent: boolean;
  isFragile: boolean;
}

export default function CreateParcelRequestWithPayment() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  
  const [formData, setFormData] = useState<ParcelFormData>({
    pickupStation: '',
    dropStation: '',
    weight: 0,
    description: '',
    preferredDate: '',
    isUrgent: false,
    isFragile: false
  });
  
  const [calculatedFee, setCalculatedFee] = useState<FeeBreakdown | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [skipPayment, setSkipPayment] = useState(false);

  const handleInputChange = (field: keyof ParcelFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeeCalculated = (fee: FeeBreakdown) => {
    setCalculatedFee(fee);
  };

  const handlePayNow = () => {
    if (!calculatedFee) {
      alert('Please calculate the delivery fee first');
      return;
    }
    setShowPaymentDialog(true);
  };

  const handleSkipPayment = () => {
    setSkipPayment(true);
    createParcelRequest();
  };

  const createParcelRequest = async () => {
    if (!user) {
      alert('Please log in to create a parcel request');
      return;
    }

    setIsCreatingRequest(true);

    try {
      const requestData = {
        ...formData,
        senderId: user.id,
        feeBreakdown: calculatedFee,
        paymentStatus: skipPayment ? 'unpaid' : 'pending'
      };

      const response = await fetch('/api/parcel-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to create parcel request');
      }

      const result = await response.json();
      
      if (skipPayment) {
        // Redirect to dashboard if payment was skipped
        router.push(`/dashboard/sender/requests/${result.id}`);
      } else {
        // Payment dialog will handle redirection after successful payment
        console.log('Parcel request created, showing payment dialog');
      }

    } catch (error: any) {
      console.error('Failed to create parcel request:', error);
      alert(error.message || 'Failed to create parcel request');
    } finally {
      setIsCreatingRequest(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setShowPaymentDialog(false);
    
    // The payment dialog will handle redirection
    // Or you can add custom success handling here
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    alert('Payment failed. You can try again later from your dashboard.');
  };

  const isFormValid = formData.pickupStation && 
                     formData.dropStation && 
                     formData.weight > 0 && 
                     formData.description.trim();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Create Parcel Request
      </h1>

      {/* Parcel Details Form */}
      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pickupStation">Pickup Station</Label>
            <Input
              id="pickupStation"
              value={formData.pickupStation}
              onChange={(e) => handleInputChange('pickupStation', e.target.value)}
              placeholder="e.g., New Delhi"
            />
          </div>
          <div>
            <Label htmlFor="dropStation">Drop Station</Label>
            <Input
              id="dropStation"
              value={formData.dropStation}
              onChange={(e) => handleInputChange('dropStation', e.target.value)}
              placeholder="e.g., Mumbai Central"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              min="0.1"
              step="0.1"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              placeholder="2.5"
            />
          </div>
          <div>
            <Label htmlFor="preferredDate">Preferred Date</Label>
            <Input
              id="preferredDate"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Documents, Electronics, etc."
          />
        </div>

        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isUrgent}
              onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
              className="mr-2"
            />
            Urgent Delivery (+25%)
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFragile}
              onChange={(e) => handleInputChange('isFragile', e.target.checked)}
              className="mr-2"
            />
            Fragile Item (+₹30)
          </label>
        </div>
      </div>

      {/* Fee Display */}
      {isFormValid && (
        <FeeDisplay
          pickupStation={formData.pickupStation}
          dropStation={formData.dropStation}
          weight={formData.weight}
          onFeeCalculated={handleFeeCalculated}
          className="mb-6"
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {calculatedFee && (
          <Button
            onClick={handlePayNow}
            disabled={!isFormValid || isCreatingRequest}
            className="bg-primary hover:bg-primary-dark"
            size="lg"
          >
            Pay Now & Create Request
          </Button>
        )}
        
        <Button
          onClick={handleSkipPayment}
          disabled={!isFormValid || isCreatingRequest}
          variant="outline"
          size="lg"
        >
          {isCreatingRequest ? 'Creating...' : 'Skip Payment for Now'}
        </Button>
      </div>

      {/* Payment Dialog */}
      {showPaymentDialog && calculatedFee && user && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          parcelRequestId="" // Will be set after parcel creation
          senderId={user?.id || ''}
          feeBreakdown={calculatedFee}
          parcelDetails={{
            pickupStation: formData.pickupStation,
            dropStation: formData.dropStation,
            weight: formData.weight,
            description: formData.description,
            preferredDate: formData.preferredDate
          }}
          senderInfo={{
            name: `${user.firstName} ${user.lastName}` || 'Unknown',
            email: user.email || '',
            phone: user.phone || ''
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Payment Options</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Pay Now:</strong> Secure payment to confirm your request immediately</li>
          <li>• <strong>Skip Payment:</strong> Create request now, pay later when a carrier accepts</li>
          <li>• You can always pay later from your dashboard</li>
          <li>• Payments are processed securely through Razorpay</li>
        </ul>
      </div>
    </div>
  );
}

// Type for the parcel request API
interface CreateParcelRequestPayload extends ParcelFormData {
  senderId: string;
  feeBreakdown: FeeBreakdown | null;
  paymentStatus: 'unpaid' | 'pending' | 'paid';
}