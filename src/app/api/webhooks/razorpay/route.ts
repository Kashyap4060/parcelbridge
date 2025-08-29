/**
 * Razorpay webhook handler
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleRazorpayWebhook } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-razorpay-signature') || '';
    
    const result = await handleRazorpayWebhook(body, signature);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
