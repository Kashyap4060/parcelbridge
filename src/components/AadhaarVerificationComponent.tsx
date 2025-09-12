'use client';

import { useState, useCallback } from 'react';
import { useAadhaarVerification } from '@/hooks/useAadhaarVerification';
import { Button } from '@/components/ui/Button';
import { aadhaarVerificationService, AadhaarData } from '@/lib/aadhaarVerificationService';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface AadhaarVerificationComponentProps {
  carrierUid: string;
  onVerificationComplete: (success: boolean, data?: AadhaarData) => void;
  onVerificationStart?: () => void;
  className?: string;
}

export function AadhaarVerificationComponent({
  carrierUid,
  onVerificationComplete,
  onVerificationStart,
  className = '',
}: AadhaarVerificationComponentProps) {
  const {
    isLoading,
    step,
    requestId,
    aadhaarData,
    error,
    otpSent,
    generateOTP,
    submitOTP,
    reset,
    retry,
  } = useAadhaarVerification();

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle OTP resend with cooldown
  const handleResendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(45); // 45 second cooldown as per API docs
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    await generateOTP(aadhaarNumber);
  }, [aadhaarNumber, generateOTP, resendCooldown]);

  const handleStartVerification = async () => {
    if (!aadhaarNumber.trim()) return;
    onVerificationStart?.();
    await generateOTP(aadhaarNumber.replace(/\s/g, ''));
  };

  const handleSubmitOTP = async () => {
    if (!otp.trim()) return;
    await submitOTP(otp.replace(/\s/g, ''));
  };

  const handleComplete = () => {
    if (aadhaarData) {
      onVerificationComplete(true, aadhaarData);
    } else {
      onVerificationComplete(false);
    }
  };

  const formatAadhaarInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
    return formatted.slice(0, 14); // Max 12 digits + 2 spaces
  };

  const formatOTPInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 6); // Max 6 digits
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <IdentificationIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aadhaar Verification</h3>
          <p className="text-sm text-gray-600">Verify your identity to accept parcels</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          {['idle', 'generating-otp'].includes(step) && (
            <>
              <div className={`w-3 h-3 rounded-full ${step === 'generating-otp' ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <span className="text-sm text-gray-600">Enter Aadhaar Number</span>
            </>
          )}
          {['waiting-for-otp', 'verifying-otp'].includes(step) && (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">OTP Sent</span>
              <div className={`w-3 h-3 rounded-full ${step === 'verifying-otp' ? 'bg-blue-600' : 'bg-gray-300'} ml-4`} />
              <span className="text-sm text-gray-600">Verify OTP</span>
            </>
          )}
          {step === 'completed' && (
            <>
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Verification Complete</span>
            </>
          )}
          {step === 'error' && (
            <>
              <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Verification Failed</span>
            </>
          )}
        </div>
      </div>

      {/* Step 1: Enter Aadhaar Number */}
      {['idle', 'generating-otp'].includes(step) && (
        <div className="space-y-4">
          <div>
            <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number
            </label>
            <input
              id="aadhaar"
              type="text"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(formatAadhaarInput(e.target.value))}
              placeholder="1234 5678 9012"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider"
              disabled={isLoading}
              maxLength={14}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your 12-digit Aadhaar number. OTP will be sent to your registered mobile.
            </p>
          </div>
          
          <Button
            onClick={handleStartVerification}
            disabled={isLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating OTP...
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                Generate OTP
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Enter OTP */}
      {['waiting-for-otp', 'verifying-otp'].includes(step) && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                OTP sent to your registered mobile number ending in ****{aadhaarNumber.slice(-4)}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(formatOTPInput(e.target.value))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg tracking-wider text-center"
              disabled={isLoading}
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isLoading}
              className="flex-1"
            >
              {resendCooldown > 0 ? (
                <>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
            
            <Button
              onClick={handleSubmitOTP}
              disabled={isLoading || otp.length !== 6}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Verification Complete */}
      {step === 'completed' && aadhaarData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800">Verification Successful</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{aadhaarData.full_name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">DOB:</span>
                  <span className="font-medium">
                    {new Date(aadhaarData.dob).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium capitalize">{aadhaarData.gender}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium text-sm leading-relaxed">
                      {aadhaarVerificationService.formatAddress(aadhaarData.address, aadhaarData.zip)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full">
            Complete Verification
          </Button>
        </div>
      )}

      {/* Error State */}
      {step === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={reset} className="flex-1">
              Start Over
            </Button>
            <Button onClick={retry} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



