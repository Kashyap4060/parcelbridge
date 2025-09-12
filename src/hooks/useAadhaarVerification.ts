import { useState, useCallback } from 'react';
import { 
  aadhaarVerificationService, 
  AadhaarVerificationResult, 
  OTPGenerationResult,
  AadhaarData 
} from '@/lib/aadhaarVerificationService';

interface UseAadhaarVerificationState {
  isLoading: boolean;
  step: 'idle' | 'generating-otp' | 'waiting-for-otp' | 'verifying-otp' | 'completed' | 'error';
  requestId: number | null;
  aadhaarData: AadhaarData | null;
  error: string | null;
  otpSent: boolean;
}

interface UseAadhaarVerificationReturn extends UseAadhaarVerificationState {
  generateOTP: (aadhaarNumber: string) => Promise<void>;
  submitOTP: (otp: string) => Promise<void>;
  reset: () => void;
  retry: () => void;
}

export function useAadhaarVerification(): UseAadhaarVerificationReturn {
  const [state, setState] = useState<UseAadhaarVerificationState>({
    isLoading: false,
    step: 'idle',
    requestId: null,
    aadhaarData: null,
    error: null,
    otpSent: false,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      step: 'idle',
      requestId: null,
      aadhaarData: null,
      error: null,
      otpSent: false,
    });
  }, []);

  const generateOTP = useCallback(async (aadhaarNumber: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      step: 'generating-otp',
      error: null,
    }));

    try {
      const result: OTPGenerationResult = await aadhaarVerificationService.generateOTP(aadhaarNumber);

      if (result.success && result.otpSent && result.requestId) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'waiting-for-otp',
          requestId: result.requestId!,
          otpSent: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'error',
          error: result.error || 'Failed to generate OTP',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate OTP',
      }));
    }
  }, []);

  const submitOTP = useCallback(async (otp: string) => {
    if (!state.requestId) {
      setState(prev => ({
        ...prev,
        error: 'No request ID available. Please generate OTP first.',
        step: 'error',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      step: 'verifying-otp',
      error: null,
    }));

    try {
      const result: AadhaarVerificationResult = await aadhaarVerificationService.submitOTP(
        state.requestId,
        otp
      );

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'completed',
          aadhaarData: result.data!,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          step: 'error',
          error: result.error || 'OTP verification failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        step: 'error',
        error: error instanceof Error ? error.message : 'OTP verification failed',
      }));
    }
  }, [state.requestId]);

  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'idle',
      error: null,
      isLoading: false,
    }));
  }, []);

  return {
    ...state,
    generateOTP,
    submitOTP,
    reset,
    retry,
  };
}



