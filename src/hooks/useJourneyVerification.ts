import { useState, useEffect } from 'react';
import { Journey, ParcelRequest } from '@/types';
import { journeyVerificationService, JourneyMatchResult, VerificationRequirement } from '@/lib/journeyVerificationService';

interface UseJourneyVerificationProps {
  journey: Journey | null;
  parcel: ParcelRequest | null;
  carrierUid?: string;
}

export function useJourneyVerification({ journey, parcel, carrierUid }: UseJourneyVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [matchResult, setMatchResult] = useState<JourneyMatchResult | null>(null);
  const [verificationRequirements, setVerificationRequirements] = useState<VerificationRequirement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyJourneyMatch = async () => {
    if (!journey || !parcel) {
      setError('Journey or parcel data is missing');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await journeyVerificationService.verifyJourneyParcelMatch(journey, parcel);
      setMatchResult(result);

      // Also check carrier verification requirements if carrierUid provided
      if (carrierUid) {
        const requirements = await journeyVerificationService.checkCarrierVerificationRequirements(
          carrierUid,
          parcel
        );
        setVerificationRequirements(requirements);
      }
    } catch (err) {
      console.error('Journey verification failed:', err);
      setError('Failed to verify journey compatibility');
    } finally {
      setIsVerifying(false);
    }
  };

  const canAcceptParcel = (): boolean => {
    if (!matchResult || !verificationRequirements) return false;
    
    return (
      matchResult.isMatch &&
      matchResult.confidence >= 60 &&
      verificationRequirements.aadhaarVerified &&
      verificationRequirements.journeyVerified
    );
  };

  const getVerificationStatus = () => {
    if (!matchResult || !verificationRequirements) {
      return {
        status: 'PENDING',
        message: 'Verification in progress...',
        color: 'yellow'
      };
    }

    if (canAcceptParcel()) {
      return {
        status: 'APPROVED',
        message: 'You can accept this parcel',
        color: 'green'
      };
    }

    if (!matchResult.isMatch) {
      return {
        status: 'ROUTE_MISMATCH',
        message: 'Your journey route does not match this parcel',
        color: 'red'
      };
    }

    if (!verificationRequirements.aadhaarVerified) {
      return {
        status: 'AADHAAR_REQUIRED',
        message: 'Aadhaar verification required',
        color: 'orange'
      };
    }

    return {
      status: 'REQUIREMENTS_PENDING',
      message: 'Additional verification required',
      color: 'orange'
    };
  };

  // Auto-verify when journey and parcel change
  useEffect(() => {
    if (journey && parcel) {
      verifyJourneyMatch();
    }
  }, [journey?.id, parcel?.id]);

  return {
    isVerifying,
    matchResult,
    verificationRequirements,
    error,
    canAcceptParcel: canAcceptParcel(),
    verificationStatus: getVerificationStatus(),
    verifyJourneyMatch,
    refresh: verifyJourneyMatch
  };
}
