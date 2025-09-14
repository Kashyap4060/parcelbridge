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
const OTPSchema = z.string()
  .regex(/^\d{6}$/, 'OTP must be 6 digits')
  .refine((val) => val.length === 6, 'OTP must be exactly 6 digits');

interface QuickeKYCResponse<T = any> {
  data: T;
  status_code: number;
  message: string | null;
  status: 'success' | 'error';
  request_id: number;
}

export interface AadhaarAddress {
  dist: string;
  house: string;
  country: string;
  subdist: string;
  vtc: string;
  po: string;
  state: string;
  street: string;
  loc: string;
}

export interface AadhaarData {
  aadhaar_number: string;
  dob: string;
  zip: string;
  full_name: string;
  gender: string;
  phone_verified: boolean;
  email_verified: boolean;
  father_name: string;
  address: AadhaarAddress;
  raw_xml: string;
  zip_data: string;
  has_image: boolean;
  mobile_number: string;
  email_hash: string;
  raw_aadhaar_number: string;
  reference_id: string;
  status: string;
  uniqueness_id: string;
}

interface VerifyOTPResponse {
  aadhaar_data: AadhaarData;
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
    const { requestId, otp } = await request.json();

    // Validate input
    if (!requestId || !otp) {
      return NextResponse.json(
        { error: 'Request ID and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    const validatedOTP = OTPSchema.parse(otp);

    // Make request to QuickeKYC API
    const response = await makeQuickeKYCRequest<VerifyOTPResponse>('/aadhaar-v2/submit-otp', {
      request_id: requestId,
      otp: validatedOTP
    });

    if (response.status === 'success') {
      const aadhaarData = response.data.aadhaar_data;
      
      return NextResponse.json({
        success: true,
        verified: true,
        aadhaarData: {
          aadhaarNumber: aadhaarData.aadhaar_number,
          fullName: aadhaarData.full_name,
          dob: aadhaarData.dob,
          gender: aadhaarData.gender,
          address: aadhaarData.address,
          phoneVerified: aadhaarData.phone_verified,
          emailVerified: aadhaarData.email_verified,
          fatherName: aadhaarData.father_name,
          pincode: aadhaarData.zip,
          hasImage: aadhaarData.has_image
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        error: response.message || 'OTP verification failed'
      });
    }

  } catch (error) {
    console.error('Verify OTP API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}




