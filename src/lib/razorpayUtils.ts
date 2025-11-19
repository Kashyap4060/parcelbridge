// Razorpay utility functions for client-side integration

interface RazorpayOptions {
  key: string;
  amount: number | string;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CreateOrderData {
  amount: number;
  purpose: 'wallet_topup' | 'escrow_payment';
  userId: string;
  userEmail?: string;
  userName?: string;
  parcelId?: string;
  carrierId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Create a Razorpay order on the server (Updated to use new payment API)
 */
export async function createRazorpayOrder(data: CreateOrderData) {
  try {
    // Validate minimum amount (₹1 = 100 paise)
    if (data.amount < 100) {
      throw new Error(`Amount too low: ₹${(data.amount / 100).toFixed(2)}. Minimum amount is ₹1.00`);
    }

    // Convert old data format to new payment API format
    const paymentData = {
      parcelRequestId: data.parcelId || '',
      senderId: data.userId,
      amount: data.amount, // Amount should already be in paise
      currency: 'INR',
      description: `Parcel delivery payment`,
      customerInfo: {
        name: data.userName || 'Unknown',
        email: data.userEmail || '',
        contact: '' // Phone will be fetched from user profile
      },
      feeBreakdown: {
        totalAmount: data.amount,
        currency: 'INR',
        baseFee: Math.round(data.amount * 0.3), // Estimate 30% as base fee
        distanceFee: Math.round(data.amount * 0.4), // Estimate 40% as distance fee
        subtotal: Math.round(data.amount / 1.18), // Remove GST to get subtotal
        gst: Math.round(data.amount * 0.18 / 1.18), // Calculate GST portion
        weightTier: 'Medium',
        distance: 500, // Default distance
        weight: 2.5 // Default weight
      }
    };

    const response = await fetch('/api/payments/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const result = await response.json();
    
    // Return in the expected format for compatibility
    return {
      id: result.order.id,
      key: result.config.keyId,
      amount: result.order.amount,
      currency: result.order.currency
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Verify payment signature on the server (Updated to use new payment API)
 */
export async function verifyPayment(paymentData: RazorpayResponse) {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to verify payment');
    }

    const result = await response.json();
    
    // Return in expected format for compatibility
    return {
      isValid: result.success || false,
      ...result
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Open Razorpay checkout modal
 */
export function openRazorpayCheckout(options: RazorpayOptions) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      reject(new Error('Razorpay not loaded'));
      return;
    }

    const razorpay = new window.Razorpay({
      ...options,
      handler: (response: RazorpayResponse) => {
        resolve(response);
        if (options.handler) {
          options.handler(response);
        }
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
          if (options.modal?.ondismiss) {
            options.modal.ondismiss();
          }
        },
      },
    });

    razorpay.open();
  });
}

/**
 * Complete payment flow for parcel fee
 */
export async function processParcelPayment({
  amount,
  userId,
  userEmail,
  userName,
  parcelId,
  onSuccess,
  onError,
}: {
  amount: number;
  userId: string;
  userEmail?: string;
  userName?: string;
  parcelId?: string;
  onSuccess: (response: RazorpayResponse) => void;
  onError: (error: Error) => void;
}) {
  try {
    // Step 1: Create order on server
    const orderData = await createRazorpayOrder({
      amount,
      purpose: 'escrow_payment',
      userId,
      userEmail,
      userName,
      parcelId,
    });

    // Step 2: Open Razorpay checkout
    const paymentResponse = await openRazorpayCheckout({
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Parcel Bridge',
      description: `Payment for parcel delivery #${parcelId}`,
      order_id: orderData.id,
      handler: (response: RazorpayResponse) => {
        // This will be handled by the promise resolution
      },
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#2563EB', // Primary blue color from the app
      },
    });

    // Step 3: Verify payment signature
    const verification = await verifyPayment(paymentResponse as RazorpayResponse);
    
    if (verification.isValid) {
      onSuccess(paymentResponse as RazorpayResponse);
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error) {
    onError(error as Error);
  }
}

/**
 * Format amount for display (convert paise to rupees)
 */
export function formatAmount(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

/**
 * Convert rupees to paise for Razorpay
 */
export function convertToPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}