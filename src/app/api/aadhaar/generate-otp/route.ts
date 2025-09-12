import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// API Configuration
const QUICKEKYC_API_BASE = 'https://api.quickekyc.com/api/v1';
const API_KEY = process.env.NODE_ENV === 'production' 
  ? process.env.QUICKEKYC_API_KEY_PRODUCTION
  : process.env.QUICKEKYC_API_KEY_SANDBOX;

if (!API_KEY) {
  throw new Error(`Missing QuickeKYC API key for ${process.env.NODE_ENV} environment`);
}

// Validation schemas
const AadhaarNumberSchema = z.string()
  .regex(/^\d{12}$/, 'Aadhaar number must be 12 digits')
  .refine((val) => val.length === 12, 'Aadhaar number must be exactly 12 digits');

interface QuickeKYCResponse<T = any> {
  data: T;
  status_code: number;
  message: string | null;
  status: 'success' | 'error';
  request_id: number;
}

interface GenerateOTPResponse {
  otp_sent: boolean;
  if_number: boolean;
  valid_aadhaar: boolean;
}

async function makeQuickeKYCRequest<T>(
  endpoint: string, 
  body: Record<string, any>
): Promise<QuickeKYCResponse<T>> {
  try {
    const response = await fetch(`${QUICKEKYC_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: API_KEY,
        ...body
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('QuickeKYC API Error:', error);
    throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { aadhaarNumber } = await request.json();

    // Validate input
    if (!aadhaarNumber) {
      return NextResponse.json(
        { error: 'Aadhaar number is required' },
        { status: 400 }
      );
    }

    // Validate Aadhaar number format
    const validatedNumber = AadhaarNumberSchema.parse(aadhaarNumber);

    // Make request to QuickeKYC API
    const response = await makeQuickeKYCRequest<GenerateOTPResponse>('/aadhaar-v2/generate-otp', {
      id_number: validatedNumber
    });

    if (response.status === 'success') {
      return NextResponse.json({
        success: true,
        otpSent: response.data.otp_sent,
        validAadhaar: response.data.valid_aadhaar,
        requestId: response.request_id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.message || 'Failed to generate OTP',
        validAadhaar: false
      });
    }

  } catch (error) {
    console.error('Generate OTP API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number format. Must be 12 digits.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate OTP. Please try again.' },
      { status: 500 }
    );
  }
}



