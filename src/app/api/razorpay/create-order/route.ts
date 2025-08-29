import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, purpose, userId, userEmail, userName, parcelId, carrierId } = body;

    // Validate required fields
    if (!amount || !purpose || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, purpose, userId' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount < 100 || amount > 50000) {
      return NextResponse.json(
        { error: 'Amount must be between ₹100 and ₹50,000' },
        { status: 400 }
      );
    }

    let orderData;

    // Create order based on purpose
    if (purpose === 'wallet_topup') {
      orderData = await razorpayService.createWalletTopUpOrder({
        userId,
        amount,
        purpose: 'wallet_topup',
        description: 'Wallet top-up'
      });
    } else if (purpose === 'escrow_payment') {
      if (!parcelId || !carrierId) {
        return NextResponse.json(
          { error: 'Missing required fields for escrow payment: parcelId, carrierId' },
          { status: 400 }
        );
      }

      orderData = await razorpayService.createEscrowOrder({
        parcelId,
        senderId: userId,
        carrierId,
        amount,
        purpose: 'escrow_payment',
        description: `Payment for parcel #${parcelId}`
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid purpose. Must be wallet_topup or escrow_payment' },
        { status: 400 }
      );
    }

    // Add additional metadata to the response
    const response = {
      ...orderData,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend needs this for checkout
      userEmail,
      userName
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
