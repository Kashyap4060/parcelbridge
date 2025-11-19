/**
 * Razorpay Types
 * TypeScript interfaces for Razorpay API responses and request payloads
 */

// Customer Types
export interface RazorpayCustomer {
  id: string;
  entity: 'customer';
  name: string;
  email: string;
  contact: string;
  gstin?: string;
  notes?: Record<string, string>;
  created_at: number;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  contact: string;
  fail_existing?: string;
  gstin?: string;
  notes?: Record<string, string>;
}

// Order Types
export interface RazorpayOrder {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id?: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
}

// Payment Types
export interface RazorpayPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: 'card' | 'netbanking' | 'wallet' | 'upi' | 'emi' | 'paylater';
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  card?: PaymentCard;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes?: Record<string, string>;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
}

export interface PaymentCard {
  id: string;
  entity: 'card';
  name: string;
  last4: string;
  network: string;
  type: 'credit' | 'debit';
  issuer: string;
  international: boolean;
  emi: boolean;
  sub_type?: string;
}

export interface CapturePaymentRequest {
  amount: number;
  currency: string;
}

// Webhook Types
export interface WebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
  created_at: number;
}

// Refund Types
export interface RazorpayRefund {
  id: string;
  entity: 'refund';
  amount: number;
  currency: string;
  payment_id: string;
  notes?: Record<string, string>;
  receipt?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
  batch_id?: string;
  status: 'pending' | 'processed' | 'failed';
  speed_processed: 'normal' | 'optimum';
  speed_requested: 'normal' | 'optimum';
}

export interface CreateRefundRequest {
  amount?: number;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
}

// Error Types
export interface RazorpayError {
  error: {
    code: string;
    description: string;
    field?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      payment_id?: string;
      order_id?: string;
    };
  };
}

// Collection Types
export interface RazorpayCollection<T> {
  entity: 'collection';
  count: number;
  items: T[];
}

// Fee Calculation Types
export interface FeeBreakdown {
  baseFee: number;
  distanceFee: number;
  distance: number;
  weightTier: string;
  totalAmount: number;
  currency: string;
}

// Payment Intent Types for Parcel Bridge
export interface ParcelPaymentIntent {
  parcelRequestId: string;
  senderId: string;
  amount: number;
  currency: string;
  description: string;
  feeBreakdown: FeeBreakdown;
  customerInfo: {
    name: string;
    email: string;
    contact: string;
  };
  metadata: {
    pickupStation: string;
    dropStation: string;
    weight: number;
    preferredDate?: string;
  };
}

export interface PaymentVerificationData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}