/**
 * Payment Verification API
 * Verifies Razorpay payment signatures and updates parcel status
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayAPI } from '@/lib/razorpay/api';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { PaymentVerificationData } from '@/lib/razorpay/types';

export async function POST(request: NextRequest) {
  try {
    const verificationData: PaymentVerificationData = await request.json();

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = verificationData;

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isSignatureValid = await razorpayAPI.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const payment = await razorpayAPI.getPayment(razorpay_payment_id);
    const order = await razorpayAPI.getOrder(razorpay_order_id);

    // Find the payment record in our database
    const { data: paymentRecord, error: paymentRecordError } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentRecordError || !paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Update payment record with payment details
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payment_records')
      .update({
        razorpay_payment_id: razorpay_payment_id,
        status: payment.status,
        payment_method: payment.method,
        payment_details: {
          payment,
          order,
          verified_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.id);

    if (updatePaymentError) {
      console.error('Failed to update payment record:', updatePaymentError);
    }

    // Update parcel request status based on payment status
    let newParcelStatus = 'PENDING_PAYMENT';
    let paymentStatus = 'PENDING';

    if (payment.status === 'captured') {
      newParcelStatus = 'SEARCHING_CARRIER';
      paymentStatus = 'SUCCESSFUL';
    } else if (payment.status === 'authorized') {
      // For authorized payments, we might need to capture them
      try {
        const capturedPayment = await razorpayAPI.capturePayment(razorpay_payment_id, {
          amount: payment.amount,
          currency: payment.currency
        });
        
        if (capturedPayment.status === 'captured') {
          newParcelStatus = 'SEARCHING_CARRIER';
          paymentStatus = 'SUCCESSFUL';
        }
      } catch (captureError) {
        console.error('Failed to capture payment:', captureError);
        paymentStatus = 'PROCESSING';
      }
    } else if (payment.status === 'failed') {
      paymentStatus = 'FAILED';
    }

    // Update parcel request
    const { error: updateParcelError } = await supabaseAdmin
      .from('parcel_requests')
      .update({
        status: newParcelStatus,
        payment_status: paymentStatus,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        payment_completed_at: paymentStatus === 'SUCCESSFUL' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentRecord.parcel_request_id);

    if (updateParcelError) {
      console.error('Failed to update parcel request:', updateParcelError);
      return NextResponse.json(
        { error: 'Payment verified but failed to update parcel status' },
        { status: 500 }
      );
    }

    // If payment is successful, we can start the carrier matching process
    if (paymentStatus === 'SUCCESSFUL') {
      // TODO: Trigger carrier matching process
      // This could be done via a queue/background job
      console.log(`Payment successful for parcel ${paymentRecord.parcel_request_id} - ready for carrier matching`);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method
      },
      parcel: {
        id: paymentRecord.parcel_request_id,
        status: newParcelStatus,
        payment_status: paymentStatus
      }
    });

  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  if (!paymentId && !orderId) {
    return NextResponse.json(
      { error: 'Either payment_id or order_id is required' },
      { status: 400 }
    );
  }

  try {
    if (paymentId) {
      const payment = await razorpayAPI.getPayment(paymentId);
      return NextResponse.json({ payment });
    }

    if (orderId) {
      const order = await razorpayAPI.getOrder(orderId);
      const payments = await razorpayAPI.getOrderPayments(orderId);
      return NextResponse.json({ order, payments });
    }

  } catch (error: any) {
    console.error('Failed to fetch payment/order details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}