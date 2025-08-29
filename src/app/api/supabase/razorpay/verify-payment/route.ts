import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { razorpayService } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    if (isValid) {
      // If payment is valid, we can optionally log it to Supabase
      // The webhook will handle the actual wallet update
      console.log('Payment verified for user:', session.user.id);
    }

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
