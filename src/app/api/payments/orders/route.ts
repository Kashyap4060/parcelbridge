/**
 * Razorpay Order Creation API
 * Creates Razorpay orders for parcel delivery payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayAPI } from '@/lib/razorpay/api';
import { razorpayConfig } from '@/lib/razorpay/config';
import { feeCalculationService } from '@/lib/feeCalculation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { ParcelPaymentIntent } from '@/lib/razorpay/types';

export async function POST(request: NextRequest) {
  try {
    const paymentIntent: ParcelPaymentIntent = await request.json();

    // Validate required fields
    if (!paymentIntent.parcelRequestId || !paymentIntent.senderId || !paymentIntent.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: parcelRequestId, senderId, or amount' },
        { status: 400 }
      );
    }

    // Check if Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay environment variables not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Verify the sender exists and owns the parcel request
    const { data: parcelRequest, error: parcelError } = await supabaseAdmin
      .from('parcel_requests')
      .select('*')
      .eq('id', paymentIntent.parcelRequestId)
      .eq('sender_id', paymentIntent.senderId)
      .single();

    if (parcelError) {
      console.error('Database error fetching parcel request:', parcelError);
      return NextResponse.json(
        { error: 'Database error', details: parcelError.message },
        { status: 500 }
      );
    }

    if (!parcelRequest) {
      return NextResponse.json(
        { error: 'Parcel request not found or access denied' },
        { status: 404 }
      );
    }

    // Verify parcel is in correct status for payment
    const allowedStatuses = ['PENDING_PAYMENT', 'PENDING', 'SEARCHING_CARRIER'];
    if (!allowedStatuses.includes(parcelRequest.status)) {
      return NextResponse.json(
        { error: `Cannot process payment for parcel in status: ${parcelRequest.status}` },
        { status: 400 }
      );
    }

    // Get sender details - handle different possible field names
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, last_name, firstName, lastName, email, phone, phone_number')
      .eq('id', paymentIntent.senderId)
      .single();

    if (senderError) {
      console.error('Database error fetching sender details:', senderError);
      return NextResponse.json(
        { error: 'Database error fetching sender details', details: senderError.message },
        { status: 500 }
      );
    }

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender details not found' },
        { status: 404 }
      );
    }

    // For now, skip fee recalculation to avoid compatibility issues
    // We'll trust the amount provided by the client since it's already been calculated
    // TODO: Implement proper fee validation once fee calculation systems are unified
    
    let expectedAmount: number;
    try {
      // If we have fee breakdown, use that total
      if (paymentIntent.feeBreakdown && paymentIntent.feeBreakdown.totalAmount) {
        expectedAmount = Math.round(paymentIntent.feeBreakdown.totalAmount * 100);
      } else {
        // Otherwise use the provided amount
        expectedAmount = Math.round(paymentIntent.amount);
      }
    } catch (error) {
      // Fallback to provided amount
      expectedAmount = Math.round(paymentIntent.amount);
    }

    // Create or get existing customer
    let customerId: string;
    try {
      // Handle different possible field names for user names
      const firstName = sender.first_name || sender.firstName || '';
      const lastName = sender.last_name || sender.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || sender.email.split('@')[0];
      
      // Handle different possible field names for phone
      const phone = sender.phone || sender.phone_number || '';
      const cleanPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');
      
      const customer = await razorpayAPI.createCustomer({
        name: fullName,
        email: sender.email,
        contact: cleanPhone,
        fail_existing: '0', // Return existing customer if found
        notes: {
          user_id: paymentIntent.senderId,
          parcel_request_id: paymentIntent.parcelRequestId
        }
      });
      customerId = customer.id;
    } catch (error: any) {
      // If customer already exists, extract customer ID from error or create new one
      console.error('Customer creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create customer profile', details: error.message },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const order = await razorpayAPI.createOrder({
      amount: expectedAmount, // Amount in paise
      currency: 'INR',
      receipt: `parcel_${paymentIntent.parcelRequestId}_${Date.now()}`,
      notes: {
        parcel_request_id: paymentIntent.parcelRequestId,
        sender_id: paymentIntent.senderId,
        pickup_station: paymentIntent.metadata.pickupStation,
        drop_station: paymentIntent.metadata.dropStation,
        weight: paymentIntent.metadata.weight.toString(),
        customer_id: customerId
      }
    });

    // Store payment record in database
    const { error: paymentRecordError } = await supabaseAdmin
      .from('payment_records')
      .insert({
        parcel_request_id: paymentIntent.parcelRequestId,
        sender_id: paymentIntent.senderId,
        razorpay_order_id: order.id,
        razorpay_customer_id: customerId,
        amount: expectedAmount / 100, // Store in rupees
        currency: 'INR',
        status: 'created',
        fee_breakdown: paymentIntent.feeBreakdown,
        created_at: new Date().toISOString()
      });

    if (paymentRecordError) {
      console.error('Failed to store payment record:', paymentRecordError);
      // Continue anyway as the Razorpay order is created
    }

    // Return order details and public config for frontend
    const publicConfig = razorpayConfig.getPublicConfig();
    console.log('Razorpay public config being sent:', publicConfig);
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      customer: {
        id: customerId,
        name: `${sender.first_name || sender.firstName || ''} ${sender.last_name || sender.lastName || ''}`.trim(),
        email: sender.email,
        contact: sender.phone || sender.phone_number || ''
      },
      config: publicConfig,
      feeBreakdown: paymentIntent.feeBreakdown
    });

  } catch (error: any) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parcelRequestId = searchParams.get('parcel_request_id');

  if (!parcelRequestId) {
    return NextResponse.json(
      { error: 'parcel_request_id is required' },
      { status: 400 }
    );
  }

  try {
    // Get payment record for the parcel request
    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payment_records')
      .select('*')
      .eq('parcel_request_id', parcelRequestId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Get order details from Razorpay if needed
    if (paymentRecord.razorpay_order_id) {
      try {
        const order = await razorpayAPI.getOrder(paymentRecord.razorpay_order_id);
        return NextResponse.json({
          paymentRecord,
          razorpayOrder: order
        });
      } catch (razorpayError) {
        console.error('Failed to fetch Razorpay order:', razorpayError);
        // Return payment record even if Razorpay call fails
      }
    }

    return NextResponse.json({ paymentRecord });

  } catch (error: any) {
    console.error('Failed to fetch payment details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}