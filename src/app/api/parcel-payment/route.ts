import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { enhancedParcelMatchingService } from '@/lib/enhancedParcelMatchingService';

export async function POST(request: NextRequest) {
  try {
    const { parcelId, paymentData } = await request.json();

    if (!parcelId || !paymentData) {
      return NextResponse.json(
        { error: 'Missing parcelId or paymentData' },
        { status: 400 }
      );
    }

    // Validate payment data structure
    const { razorpay_payment_id, razorpay_order_id, amount } = paymentData;
    if (!razorpay_payment_id || !razorpay_order_id || !amount) {
      return NextResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
      );
    }

    console.log(`Processing payment success for parcel ${parcelId}`);

    // Use the enhanced matching service to process payment and trigger matching
    const result = await enhancedParcelMatchingService.processPaymentSuccess(
      parcelId,
      {
        razorpay_payment_id,
        razorpay_order_id,
        amount
      }
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully and automatic matching initiated'
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to process payment' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in payment processing endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}