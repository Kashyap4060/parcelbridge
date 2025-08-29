import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getSupabaseErrorMessage, handleErrorWithContext } from './errorHandling';
import { supabase } from './supabase';

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number | string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface WalletTopUpData {
  userId: string;
  amount: number;
  purpose: 'wallet_topup';
  description?: string;
}

export interface EscrowPaymentData {
  parcelId: string;
  senderId: string;
  carrierId: string;
  amount: number;
  purpose: 'escrow_payment';
  description?: string;
}

export type PaymentPurpose = 'wallet_topup' | 'escrow_payment';

export class RazorpayService {
  /**
   * Generic order creation method
   */
  async createOrder(amount: number, notes: any): Promise<any> {
    try {
      const options = {
        amount: amount * 100, // Convert to paisa
        currency: 'INR',
        receipt: `order_${notes.userId || 'user'}_${Date.now()}`,
        notes
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<any> {
    try {
      return await razorpay.orders.fetch(orderId);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

  /**
   * Create a Razorpay order for wallet top-up
   */
  async createWalletTopUpOrder(data: WalletTopUpData): Promise<any> {
    try {
      const options = {
        amount: data.amount * 100, // Convert to paisa
        currency: 'INR',
        receipt: `wallet_${data.userId}_${Date.now()}`,
        notes: {
          purpose: data.purpose,
          userId: data.userId,
          description: data.description || 'Wallet top-up'
        }
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error: any) {
      console.error('Error creating wallet top-up order:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

  /**
   * Create a Razorpay order for escrow payment
   */
  async createEscrowOrder(data: EscrowPaymentData): Promise<any> {
    try {
      const options = {
        amount: data.amount * 100, // Convert to paisa
        currency: 'INR',
        receipt: `escrow_${data.parcelId}_${Date.now()}`,
        notes: {
          purpose: data.purpose,
          parcelId: data.parcelId,
          senderId: data.senderId,
          carrierId: data.carrierId,
          description: data.description || 'Parcel delivery payment'
        }
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error: any) {
      console.error('Error creating escrow order:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(verification: PaymentVerification): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification;
      
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process refund
   */
  async processRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = {
        speed: 'normal'
      };
      
      if (amount) {
        refundData.amount = amount * 100; // Convert to paisa
      }

      const refund = await razorpay.payments.refund(paymentId, refundData);
      return refund;
    } catch (error: any) {
      console.error('Error processing refund:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

  /**
   * Fetch payment details
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      throw new Error(getSupabaseErrorMessage(error));
    }
  }

}

// Export singleton instance
export const razorpayService = new RazorpayService();

/**
 * Handle Razorpay webhook events
 */
export async function handleRazorpayWebhook(
  body: any,
  signature: string
): Promise<{ status: string; message?: string }> {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return { status: 'error', message: 'Invalid signature' };
      }
    }

    const { event, payload } = body;

    // Process different webhook events
    // Audit: store raw webhook event
    try {
      await supabase.from('webhook_events').insert({
        provider: 'razorpay',
        event_type: event,
        payload: body,
        received_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Webhook audit insert failed (ensure table exists):', e);
    }

    switch (event) {
      case 'payment.captured': {
        const payment = payload?.payment?.entity;
        console.log('Payment captured:', payment?.id);
        if (payment?.order_id) {
          // Update wallet_transactions row(s) linked to this order
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'SUCCESS',
              payment_id: payment.id,
              order_id: payment.order_id
            })
            .eq('order_id', payment.order_id);
        }
        break;
      }

      case 'payment.failed': {
        const payment = payload?.payment?.entity;
        console.log('Payment failed:', payment?.id);
        if (payment?.order_id) {
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'FAILED',
              payment_id: payment.id,
              order_id: payment.order_id
            })
            .eq('order_id', payment.order_id);
        }
        break;
      }

      case 'order.paid': {
        const order = payload?.order?.entity;
        console.log('Order paid:', order?.id);
        if (order?.id) {
          await supabase
            .from('wallet_transactions')
            .update({
              status: 'SUCCESS',
              order_id: order.id
            })
            .eq('order_id', order.id);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return { status: 'error', message: 'Processing failed' };
  }
}
