/**
 * Razorpay Webhook Handler
 * Processes webhook events from Razorpay for real-time payment updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayAPI } from '@/lib/razorpay/api';
import { createClient } from '@supabase/supabase-js';
import type { WebhookEvent } from '@/lib/razorpay/types';

// Initialize Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const webhookSignature = request.headers.get('x-razorpay-signature');
    
    if (!webhookSignature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature
    const isSignatureValid = await razorpayAPI.verifyWebhookSignature(
      body,
      webhookSignature
    );

    if (!isSignatureValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const webhookEvent: WebhookEvent = JSON.parse(body);
    
    console.log(`Received webhook event: ${webhookEvent.event}`);

    // Process different webhook events
    switch (webhookEvent.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(webhookEvent);
        break;
      
      case 'payment.captured':
        await handlePaymentCaptured(webhookEvent);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(webhookEvent);
        break;
      
      case 'order.paid':
        await handleOrderPaid(webhookEvent);
        break;
      
      case 'refund.created':
        await handleRefundCreated(webhookEvent);
        break;
      
      case 'refund.processed':
        await handleRefundProcessed(webhookEvent);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function handlePaymentAuthorized(event: WebhookEvent) {
  if (!event.payload.payment) return;
  
  const payment = event.payload.payment.entity;
  console.log(`Payment authorized: ${payment.id}`);

  // Update payment record
  await updatePaymentRecord(payment.order_id, {
    razorpay_payment_id: payment.id,
    status: 'authorized',
    payment_method: payment.method,
    payment_details: payment
  });

  // Update parcel request
  await updateParcelStatus(payment.order_id, 'PENDING_PAYMENT', 'PROCESSING');
}

async function handlePaymentCaptured(event: WebhookEvent) {
  if (!event.payload.payment) return;
  
  const payment = event.payload.payment.entity;
  console.log(`Payment captured: ${payment.id}`);

  // Update payment record
  await updatePaymentRecord(payment.order_id, {
    razorpay_payment_id: payment.id,
    status: 'captured',
    payment_method: payment.method,
    payment_details: payment
  });

  // Update parcel request to start carrier matching
  await updateParcelStatus(payment.order_id, 'SEARCHING_CARRIER', 'SUCCESSFUL');
  
  // TODO: Trigger carrier matching process
  console.log(`Payment captured for order ${payment.order_id} - triggering carrier matching`);
}

async function handlePaymentFailed(event: WebhookEvent) {
  if (!event.payload.payment) return;
  
  const payment = event.payload.payment.entity;
  console.log(`Payment failed: ${payment.id}`);

  // Update payment record
  await updatePaymentRecord(payment.order_id, {
    razorpay_payment_id: payment.id,
    status: 'failed',
    payment_method: payment.method,
    payment_details: payment
  });

  // Keep parcel in pending payment status
  await updateParcelStatus(payment.order_id, 'PENDING_PAYMENT', 'FAILED');
}

async function handleOrderPaid(event: WebhookEvent) {
  if (!event.payload.order) return;
  
  const order = event.payload.order.entity;
  console.log(`Order paid: ${order.id}`);

  // This event is triggered when an order is fully paid
  // We can use this as a backup to ensure parcel status is updated
  await updateParcelStatus(order.id, 'SEARCHING_CARRIER', 'SUCCESSFUL');
}

async function handleRefundCreated(event: WebhookEvent) {
  // Handle refund creation logic
  console.log('Refund created webhook received');
}

async function handleRefundProcessed(event: WebhookEvent) {
  // Handle refund processed logic
  console.log('Refund processed webhook received');
}

async function updatePaymentRecord(orderId: string, updates: any) {
  try {
    const { error } = await supabaseAdmin
      .from('payment_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId);

    if (error) {
      console.error('Failed to update payment record:', error);
    }
  } catch (error) {
    console.error('Error updating payment record:', error);
  }
}

async function updateParcelStatus(orderId: string, parcelStatus: string, paymentStatus: string) {
  try {
    // First find the parcel request using the order ID
    const { data: paymentRecord, error: findError } = await supabaseAdmin
      .from('payment_records')
      .select('parcel_request_id')
      .eq('razorpay_order_id', orderId)
      .single();

    if (findError || !paymentRecord) {
      console.error('Failed to find parcel request for order:', orderId);
      return;
    }

    // Update parcel request status
    const updateData: any = {
      status: parcelStatus,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentStatus === 'SUCCESSFUL') {
      updateData.payment_completed_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from('parcel_requests')
      .update(updateData)
      .eq('id', paymentRecord.parcel_request_id);

    if (error) {
      console.error('Failed to update parcel status:', error);
    } else {
      console.log(`Updated parcel ${paymentRecord.parcel_request_id} status to ${parcelStatus}`);
    }
  } catch (error) {
    console.error('Error updating parcel status:', error);
  }
}

// GET method to check webhook configuration
export async function GET() {
  return NextResponse.json({
    message: 'Razorpay webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}