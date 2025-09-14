'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { AadhaarVerificationComponent } from '@/components/AadhaarVerificationComponent';
import { Button } from '@/components/ui/button';
import { TruckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AadhaarVerification() {
  const { user } = useSimpleAuth();
  const router = useRouter();
  const [verificationComplete, setVerificationComplete] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-gray-600">
            Please log in to access Aadhaar verification.
          </p>
          <Button 
            onClick={() => router.push('/auth/login')}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleVerificationComplete = (success: boolean, data?: any) => {
    if (success) {
      setVerificationComplete(true);
      // Optionally redirect back to dashboard after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  };

  if (verificationComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <TruckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Complete!
          </h2>
          <p className="text-gray-600 mb-6">
            Your Aadhaar has been successfully verified. You now have access to all carrier features.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Aadhaar Verification
                  </h1>
                  <p className="text-sm text-gray-500">
                    Verify your identity to unlock all carrier features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Complete Your Aadhaar Verification
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              This process helps build trust with senders and gives you priority in parcel assignments.
            </p>
          </div>
          
          <div className="p-6">
            <AadhaarVerificationComponent
              carrierUid={user.id}
              onVerificationComplete={handleVerificationComplete}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}




