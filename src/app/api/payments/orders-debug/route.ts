/**
 * Debug Payment Orders API
 * Returns mock data to test the payment flow without external dependencies
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const paymentIntent = await request.json();

    console.log('Payment debug - received request:', paymentIntent);

    // Validate required fields
    if (!paymentIntent.parcelRequestId || !paymentIntent.senderId || !paymentIntent.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: parcelRequestId, senderId, or amount' },
        { status: 400 }
      );
    }

    // Return mock data for testing
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(paymentIntent.amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `parcel_${paymentIntent.parcelRequestId}_${Date.now()}`
    };

    const mockCustomer = {
      id: `cust_mock_${Date.now()}`,
      name: paymentIntent.customerInfo?.name || 'Test User',
      email: paymentIntent.customerInfo?.email || 'test@example.com',
      contact: paymentIntent.customerInfo?.contact || '9876543210'
    };

    return NextResponse.json({
      success: true,
      order: mockOrder,
      customer: mockCustomer,
      config: {
        keyId: 'rzp_test_mock_key_id', // Mock key for testing
      },
      feeBreakdown: paymentIntent.feeBreakdown,
      debug: true,
      message: 'This is a debug response - payment will not actually be processed'
    });

  } catch (error: any) {
    console.error('Debug payment API error:', error);
    return NextResponse.json(
      { 
        error: 'Debug API error',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}