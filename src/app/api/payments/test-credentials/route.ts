/**
 * Test Razorpay Credentials
 * Simple endpoint to verify if Razorpay keys are working
 */

import { NextRequest, NextResponse } from 'next/server';
import { razorpayAPI } from '@/lib/razorpay/api';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Razorpay credentials...');
    
    // Test basic API connectivity by fetching plans (lightweight call)
    const testCall = await fetch('https://api.razorpay.com/v1/plans?count=1', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!testCall.ok) {
      const errorText = await testCall.text();
      console.error('Razorpay API test failed:', testCall.status, errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Razorpay API authentication failed',
        status: testCall.status,
        details: errorText,
        keyId: process.env.RAZORPAY_KEY_ID,
        keyPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 12) + '...'
      });
    }

    const result = await testCall.json();
    console.log('Razorpay API test successful:', result);

    return NextResponse.json({
      success: true,
      message: 'Razorpay credentials are working',
      keyId: process.env.RAZORPAY_KEY_ID,
      keyPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 12) + '...',
      testResult: {
        status: testCall.status,
        planCount: result.count || 0
      }
    });

  } catch (error: any) {
    console.error('Razorpay credential test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test Razorpay credentials',
      details: error.message,
      keyId: process.env.RAZORPAY_KEY_ID || 'NOT_SET',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT_SET'
    });
  }
}