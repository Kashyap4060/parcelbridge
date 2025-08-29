import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required fields for payment verification' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    return NextResponse.json({ 
      isValid,
      message: isValid ? 'Payment verified successfully' : 'Payment verification failed'
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
