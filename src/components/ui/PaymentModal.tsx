'use client';

import { useState } from 'react';
import { XMarkIcon, CreditCardIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useHybridAuth } from '../../hooks/useHybridAuth';
import { toast } from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purpose: 'wallet_topup' | 'escrow_payment';
  onSuccess: () => void;
  parcelId?: string;
  carrierId?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  purpose,
  onSuccess,
  parcelId,
  carrierId
}: PaymentModalProps) {
  const { user } = useHybridAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please login to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order via Supabase API route
      const response = await fetch('/api/supabase/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          purpose,
          userEmail: user.email || '',
          userName: user.fullName || user.firstName || user.email || '',
          ...(parcelId && { parcelId }),
          ...(carrierId && { carrierId })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await response.json();

      // Configure Razorpay checkout options
      const options = {
        key: orderData.key, // Now comes from the API response
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Parcel Bridge',
        description: purpose === 'wallet_topup' 
          ? `Add ₹${amount} to wallet` 
          : `Payment for parcel delivery`,
        order_id: orderData.id,
        prefill: {
          name: user.fullName || user.firstName || user.email || '',
          email: user.email || '',
          contact: user.phoneNumber || ''
        },
        theme: {
          color: '#2563EB'
        },
        handler: async (response: any) => {
          try {
            // Verify payment signature via Supabase API
            const verifyResponse = await fetch('/api/supabase/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.isValid) {
              toast.success(
                purpose === 'wallet_topup'
                  ? 'Wallet topped up successfully!'
                  : 'Payment completed successfully!'
              );
              onSuccess();
              onClose();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            onClose();
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = purpose === 'wallet_topup' 
    ? 'Add Money to Wallet' 
    : 'Complete Payment';

  const description = purpose === 'wallet_topup'
    ? `You are about to add ₹${amount} to your wallet balance. This amount will be available for future parcel deliveries.`
    : `You are about to pay ₹${amount} for parcel delivery. This amount will be held in escrow until delivery is completed.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
              {purpose === 'wallet_topup' ? (
                <WalletIcon className="w-6 h-6 text-blue-600" />
              ) : (
                <CreditCardIcon className="w-6 h-6 text-blue-600" />
              )}
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ₹{amount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {description}
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">₹{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium">₹0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes</span>
                <span className="font-medium">Inclusive</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total Amount</span>
                <span>₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayment}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                `Pay ₹${amount}`
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1L5 6l5 5 10-10-1.5-1.5L10 8 6.5 4.5 10 1z" clipRule="evenodd" />
              </svg>
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
