import { z } from 'zod';

// Validation schemas
export const AadhaarNumberSchema = z.string()
  .regex(/^\d{12}$/, 'Aadhaar number must be 12 digits')
  .refine((val) => val.length === 12, 'Aadhaar number must be exactly 12 digits');

export const OTPSchema = z.string()
  .regex(/^\d{6}$/, 'OTP must be 6 digits')
  .refine((val) => val.length === 6, 'OTP must be exactly 6 digits');

interface GenerateOTPResponse {
  otp_sent: boolean;
  if_number: boolean;
  valid_aadhaar: boolean;
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
  dob: string; // yyyy-mm-dd format
  zip: string;
  full_name: string;
  gender: string;
  address: AadhaarAddress;
  client_id: string;
  profile_image?: string; // Base64 encoded
  zip_data?: string; // URL
  raw_xml?: string; // URL
  share_code?: string;
  care_of?: string;
}

export interface AadhaarVerificationResult {
  success: boolean;
  data?: AadhaarData;
  error?: string;
  requestId?: number;
}

export interface OTPGenerationResult {
  success: boolean;
  otpSent: boolean;
  validAadhaar: boolean;
  requestId?: number;
  error?: string;
}

class AadhaarVerificationService {
  /**
   * Generate OTP for Aadhaar verification
   * @param aadhaarNumber 12-digit Aadhaar number
   * @returns Promise with OTP generation result
   */
  async generateOTP(aadhaarNumber: string): Promise<OTPGenerationResult> {
    try {
      // Validate Aadhaar number
      const validatedNumber = AadhaarNumberSchema.parse(aadhaarNumber);

      const response = await fetch('/api/aadhaar/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaarNumber: validatedNumber
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate OTP');
      }

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          otpSent: data.otpSent,
          validAadhaar: data.validAadhaar,
          requestId: data.requestId
        };
      } else {
        return {
          success: false,
          otpSent: false,
          validAadhaar: data.validAadhaar || false,
          error: data.error || 'Failed to generate OTP'
        };
      }
    } catch (error) {
      console.error('Generate OTP Error:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          otpSent: false,
          validAadhaar: false,
          error: 'Invalid Aadhaar number format. Must be 12 digits.'
        };
      }

      return {
        success: false,
        otpSent: false,
        validAadhaar: false,
        error: error instanceof Error ? error.message : 'Failed to generate OTP'
      };
    }
  }

  /**
   * Submit OTP and get Aadhaar verification data
   * @param requestId Request ID from generate OTP response
   * @param otp 6-digit OTP received on registered mobile
   * @returns Promise with verification result
   */
  async submitOTP(requestId: number, otp: string): Promise<AadhaarVerificationResult> {
    try {
      // Validate OTP
      const validatedOTP = OTPSchema.parse(otp);

      const response = await fetch('/api/aadhaar/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          otp: validatedOTP
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      const data = await response.json();

      if (data.success && data.verified) {
        return {
          success: true,
          data: data.aadhaarData,
          requestId: requestId
        };
      } else {
        return {
          success: false,
          error: data.error || 'OTP verification failed'
        };
      }
    } catch (error) {
      console.error('Submit OTP Error:', error);
      
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Invalid OTP format. Must be 6 digits.'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  }

  /**
   * Complete Aadhaar verification process (generate OTP + submit OTP)
   * This is a helper method for UI components
   */
  async verifyAadhaar(
    aadhaarNumber: string,
    onOTPGenerated: (requestId: number) => Promise<string>
  ): Promise<AadhaarVerificationResult> {
    try {
      // Step 1: Generate OTP
      const otpResult = await this.generateOTP(aadhaarNumber);
      
      if (!otpResult.success || !otpResult.requestId) {
        return {
          success: false,
          error: otpResult.error || 'Failed to generate OTP'
        };
      }

      if (!otpResult.otpSent) {
        return {
          success: false,
          error: 'OTP was not sent. Please check the Aadhaar number.'
        };
      }

      // Step 2: Get OTP from user (via callback)
      const otp = await onOTPGenerated(otpResult.requestId);

      // Step 3: Submit OTP
      const verificationResult = await this.submitOTP(otpResult.requestId, otp);
      
      return verificationResult;
    } catch (error) {
      console.error('Complete verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification process failed'
      };
    }
  }

  /**
   * Format address from Aadhaar data
   */
  formatAddress(address: AadhaarAddress, zip?: string): string {
    const parts = [
      address.house,
      address.street,
      address.loc,
      address.vtc,
      address.po,
      address.subdist,
      address.dist,
      address.state,
      zip
    ].filter(part => part && part.trim() !== '');

    return parts.join(', ');
  }

  /**
   * Validate if person's details match (for carrier verification)
   */
  validatePersonDetails(
    aadhaarData: AadhaarData,
    expectedName?: string,
    expectedDOB?: Date
  ): { isValid: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (expectedName) {
      const normalizedAadhaar = aadhaarData.full_name.toLowerCase().trim();
      const normalizedExpected = expectedName.toLowerCase().trim();
      
      if (!normalizedAadhaar.includes(normalizedExpected) && 
          !normalizedExpected.includes(normalizedAadhaar)) {
        reasons.push('Name does not match Aadhaar records');
      }
    }

    if (expectedDOB) {
      const aadhaarDOB = new Date(aadhaarData.dob);
      if (aadhaarDOB.getTime() !== expectedDOB.getTime()) {
        reasons.push('Date of birth does not match');
      }
    }

    return {
      isValid: reasons.length === 0,
      reasons
    };
  }
}

// Create singleton instance
export const aadhaarVerificationService = new AadhaarVerificationService();




