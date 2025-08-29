import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { razorpayService } from '@/lib/razorpay';

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface RazorpayWebhookEvent {
  event: string;
  account_id: string;
  contains: string[];
  created_at: number;
  payload: {
    payment?: {
      entity: any;
    };
    order?: {
      entity: any;
    };
    refund?: {
      entity: any;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Missing Razorpay signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: RazorpayWebhookEvent = JSON.parse(body);
    console.log('Razorpay webhook received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
        
      case 'payment.authorized':
        await handlePaymentAuthorized(event);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
        
      case 'refund.processed':
        await handleRefundProcessed(event);
        break;
        
      case 'order.paid':
        await handleOrderPaid(event);
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle payment captured (successful payment)
 */
async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  try {
    const payment = event.payload.payment?.entity;
    if (!payment) return;

    const { id: paymentId, order_id: orderId, amount } = payment;
    const amountInRupees = amount / 100;

    // Get order details to understand the purpose
    const orderDetails = await razorpayService.getOrderDetails(orderId);
    const purpose = orderDetails.notes?.purpose;

    if (purpose === 'wallet_topup') {
      await handleWalletTopUpSuccess(payment, orderDetails);
    } else if (purpose === 'escrow_payment') {
      await handleEscrowPaymentSuccess(payment, orderDetails);
    }

    // Log transaction in Supabase
    await logTransaction({
      payment_id: paymentId,
      order_id: orderId,
      type: 'CREDIT',
      amount: amountInRupees,
      status: 'SUCCESS',
      purpose,
      metadata: { notes: orderDetails.notes }
    });

    console.log('Payment captured successfully:', paymentId);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

/**
 * Handle wallet top-up success
 */
async function handleWalletTopUpSuccess(payment: any, order: any) {
  try {
    const userId = order.notes?.userId;
    const amount = payment.amount / 100;

    if (!userId) {
      console.error('Missing userId in order notes');
      return;
    }

    // Update user's wallet balance using Supabase function
    const { data, error } = await supabaseAdmin.rpc('update_wallet_balance', {
      user_uuid: userId,
      amount: amount,
      transaction_type: 'CREDIT',
      description: 'Wallet top-up via Razorpay'
    });

    if (error) {
      console.error('Error updating wallet balance:', error);
    } else {
      console.log(`Wallet updated for user ${userId}: ₹${amount} added`);
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
  }
}

/**
 * Handle escrow payment success
 */
async function handleEscrowPaymentSuccess(payment: any, order: any) {
  try {
    const { parcelId, senderId, carrierId } = order.notes || {};
    const amount = payment.amount / 100;

    if (!parcelId || !senderId) {
      console.error('Missing parcel/sender info in order notes');
      return;
    }

    // Update parcel request with payment info
    const { error } = await supabaseAdmin
      .from('parcel_requests')
      .update({
        payment_held: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', parcelId);

    if (error) {
      console.error('Error updating parcel request:', error);
    } else {
      console.log(`Escrow payment created for parcel ${parcelId}: ₹${amount}`);
    }
  } catch (error) {
    console.error('Error handling escrow payment:', error);
  }
}

/**
 * Handle payment authorization (for escrow)
 */
async function handlePaymentAuthorized(event: RazorpayWebhookEvent) {
  try {
    const payment = event.payload.payment?.entity;
    if (!payment) return;

    // Similar to captured but for authorized payments
    console.log('Payment authorized:', payment.id);
  } catch (error) {
    console.error('Error handling payment authorized:', error);
  }
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  try {
    const payment = event.payload.payment?.entity;
    if (!payment) return;

    const { id: paymentId, order_id: orderId, error_code, error_description } = payment;

    // Log failed transaction
    await logTransaction({
      payment_id: paymentId,
      order_id: orderId,
      type: 'DEBIT',
      amount: payment.amount / 100,
      status: 'FAILED',
      metadata: {
        error: {
          code: error_code,
          description: error_description
        }
      }
    });

    console.log('Payment failed:', paymentId, error_description);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle refund processing
 */
async function handleRefundProcessed(event: RazorpayWebhookEvent) {
  try {
    const refund = event.payload.refund?.entity;
    if (!refund) return;

    const { id: refundId, payment_id: paymentId, amount } = refund;
    const amountInRupees = amount / 100;

    // Log refund transaction
    await logTransaction({
      payment_id: paymentId,
      type: 'REFUND',
      amount: amountInRupees,
      status: 'SUCCESS',
      metadata: { refund_id: refundId }
    });

    console.log('Refund processed:', refundId, '₹' + amountInRupees);
  } catch (error) {
    console.error('Error handling refund:', error);
  }
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(event: RazorpayWebhookEvent) {
  try {
    const order = event.payload.order?.entity;
    if (!order) return;

    console.log('Order paid:', order.id);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}

/**
 * Log transaction to Supabase
 */
async function logTransaction(transactionData: any) {
  try {
    const { error } = await supabaseAdmin
      .from('wallet_transactions')
      .insert([{
        user_id: transactionData.user_id,
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description || `Razorpay ${transactionData.type}`,
        status: transactionData.status || 'SUCCESS',
        payment_id: transactionData.payment_id,
        order_id: transactionData.order_id,
        metadata: transactionData.metadata || {}
      }]);

    if (error) {
      console.error('Error logging transaction:', error);
    }
  } catch (error) {
    console.error('Error logging transaction:', error);
  }
}
