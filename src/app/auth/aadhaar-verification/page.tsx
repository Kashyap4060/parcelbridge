'use client';

import { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Button } from '@/components/ui/Button';
import { TruckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function AadhaarVerification() {
  const { user } = useHybridAuth();

  if (!user) {
    return <div>Please log in to access Aadhaar verification.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <TruckIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Aadhaar Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Service temporarily unavailable - migrating to Supabase
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-yellow-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Migration in Progress
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Aadhaar verification service is being migrated to Supabase.
              This feature will be available soon.
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="mt-6"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
