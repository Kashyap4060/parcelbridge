'use client';

import { useRouter } from 'next/navigation';
import { useCarrierVerification } from '@/hooks/useCarrierVerification';
import { Button } from './Button';
import { DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ParcelAcceptanceGuardProps {
  onAccept: () => void;
  parcelId: string;
  children?: React.ReactNode;
}

export function ParcelAcceptanceGuard({ onAccept, parcelId, children }: ParcelAcceptanceGuardProps) {
  const { getParcelAcceptanceStatus } = useCarrierVerification();
  const router = useRouter();
  
  const status = getParcelAcceptanceStatus();

  const handleVerifyAadhaar = () => {
    router.push('/auth/aadhaar-verification');
  };

  if (status.canAccept) {
    return (
      <Button onClick={onAccept} className="w-full">
        Accept Parcel
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning Message */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">
              Aadhaar Verification Required
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              {status.message}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {status.action === 'verify-aadhaar' && (
          <Button 
            onClick={handleVerifyAadhaar}
            className="flex-1"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            {status.actionText || 'Verify Aadhaar'}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex-1"
        >
          Go Back
        </Button>
      </div>

      {children}
    </div>
  );
}

interface AcceptParcelButtonProps {
  onAccept: () => void;
  parcelId: string;
  disabled?: boolean;
  className?: string;
}

export function AcceptParcelButton({ onAccept, parcelId, disabled, className }: AcceptParcelButtonProps) {
  const { getParcelAcceptanceStatus } = useCarrierVerification();
  const router = useRouter();
  
  const status = getParcelAcceptanceStatus();

  if (!status.canAccept) {
    return (
      <Button
        onClick={() => {
          if (status.action === 'verify-aadhaar') {
            router.push('/auth/aadhaar-verification');
          }
        }}
        variant="outline"
        className={className}
        disabled={disabled}
      >
        <DocumentTextIcon className="h-4 w-4 mr-2" />
        Verify Aadhaar to Accept
      </Button>
    );
  }

  return (
    <Button 
      onClick={onAccept} 
      className={className}
      disabled={disabled}
    >
      Accept Parcel
    </Button>
  );
}
