/**
 * Payment Dialog Component
 * Handles Razorpay payment flow for parcel delivery fees
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CurrencyRupeeIcon, CreditCardIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { formatFee } from '@/lib/feeCalculation';
import type { FeeBreakdown } from '@/lib/feeCalculation';
import type { ParcelPaymentIntent } from '@/lib/razorpay/types';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parcelRequestId: string;
  senderId: string;
  feeBreakdown: FeeBreakdown;
  parcelDetails: {
    pickupStation: string;
    dropStation: string;
    weight: number;
    description: string;
    preferredDate?: string;
  };
  senderInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: any) => void;
}

type PaymentStatus = 'initial' | 'loading' | 'processing' | 'success' | 'error';

export default function PaymentDialog({
  isOpen,
  onClose,
  parcelRequestId,
  senderId,
  feeBreakdown,
  parcelDetails,
  senderInfo,
  onPaymentSuccess,
  onPaymentError
}: PaymentDialogProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('initial');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const router = useRouter();

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    if (!window.Razorpay) {
      loadRazorpay();
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  const handlePayNow = async () => {
    if (!razorpayLoaded) {
      setErrorMessage('Payment system is loading. Please try again.');
      return;
    }

    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      // Create payment intent
      const paymentIntent: ParcelPaymentIntent = {
        parcelRequestId,
        senderId,
        amount: feeBreakdown.totalAmount,
        currency: feeBreakdown.currency,
        description: `Parcel delivery from ${parcelDetails.pickupStation} to ${parcelDetails.dropStation}`,
        feeBreakdown,
        customerInfo: {
          name: senderInfo.name,
          email: senderInfo.email,
          contact: senderInfo.phone
        },
        metadata: parcelDetails
      };

      // Create Razorpay order
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentIntent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const orderData = await response.json();
      
      setPaymentStatus('processing');

      // Initialize Razorpay payment
      const options = {
        key: orderData.config.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Parcel-Bridge',
        description: paymentIntent.description,
        order_id: orderData.order.id,
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.contact
        },
        prefill: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          contact: orderData.customer.contact
        },
        theme: {
          color: '#2563EB' // Primary blue color
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('initial');
          }
        },
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verificationResult = await verifyResponse.json();
            setPaymentStatus('success');
            
            if (onPaymentSuccess) {
              onPaymentSuccess(verificationResult);
            }

            // Redirect to success page after a short delay
            setTimeout(() => {
              router.push(`/dashboard/sender/requests/${parcelRequestId}?payment=success`);
            }, 2000);

          } catch (error: any) {
            console.error('Payment verification failed:', error);
            setPaymentStatus('error');
            setErrorMessage(error.message || 'Payment verification failed');
            
            if (onPaymentError) {
              onPaymentError(error);
            }
          }
        },
        notes: orderData.order.notes
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Failed to initiate payment');
      
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const handleSkipPayment = () => {
    // Close dialog and let user know they can pay later
    onClose();
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Creating payment order...</p>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <CreditCardIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <p className="text-gray-600">Complete payment in the Razorpay window</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Your parcel request is now being processed.</p>
            <p className="text-sm text-gray-500">Redirecting to your requests...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-8">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setPaymentStatus('initial')} variant="outline">
                Try Again
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Parcel Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Parcel Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{parcelDetails.pickupStation} → {parcelDetails.dropStation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{parcelDetails.weight} kg</span>
                </div>
                {parcelDetails.preferredDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Preferred Date:</span>
                    <span className="font-medium">{parcelDetails.preferredDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fee Breakdown</h3>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance ({feeBreakdown.distance} km):</span>
                    <span className="font-medium">{formatFee(feeBreakdown.distanceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight Tier:</span>
                    <span className="font-medium">{feeBreakdown.weightTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Fee:</span>
                    <span className="font-medium">{formatFee(feeBreakdown.baseFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatFee(feeBreakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-medium">{formatFee(feeBreakdown.gst)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-blue-900">Total Amount:</span>
                    <span className="text-blue-900">{formatFee(feeBreakdown.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">
                  Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handlePayNow}
                disabled={!razorpayLoaded}
                className="flex-1 bg-primary hover:bg-primary-dark"
              >
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Pay {formatFee(feeBreakdown.totalAmount)}
              </Button>
              <Button
                onClick={handleSkipPayment}
                variant="outline"
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>

            {!razorpayLoaded && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-800">
                    Loading payment system...
                  </span>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TruckIcon className="h-6 w-6 mr-2 text-primary" />
            Pay Delivery Fee
          </DialogTitle>
          {paymentStatus === 'initial' && (
            <DialogDescription>
              Complete payment to confirm your parcel delivery request
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {renderPaymentStatus()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}