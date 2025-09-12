'use client';

import { useState, useEffect } from 'react';
import { useJourneyVerification } from '@/hooks/useJourneyVerification';
import { AadhaarVerificationComponent } from './AadhaarVerificationComponent';
import { Button } from '@/components/ui/Button';
import { ParcelRequest, Journey } from '@/types';
import { AadhaarData } from '@/lib/aadhaarVerificationService';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface JourneyVerificationComponentProps {
  journey: Journey;
  parcel: ParcelRequest;
  carrierUid: string;
  onVerificationComplete: (canAccept: boolean) => void;
  className?: string;
}

interface VerificationState {
  aadhaarVerified: boolean;
  aadhaarData: AadhaarData | null;
  journeyCompatible: boolean;
  overallStatus: 'pending' | 'approved' | 'rejected';
}

export function JourneyVerificationComponent({
  journey,
  parcel,
  carrierUid,
  onVerificationComplete,
  className = '',
}: JourneyVerificationComponentProps) {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    aadhaarVerified: false,
    aadhaarData: null,
    journeyCompatible: false,
    overallStatus: 'pending',
  });

  const [showAadhaarVerification, setShowAadhaarVerification] = useState(false);

  const {
    matchResult,
    isVerifying,
    error: journeyError,
    canAcceptParcel,
    verificationStatus,
  } = useJourneyVerification({ journey, parcel, carrierUid });

  // Update journey compatibility when verification result changes
  useEffect(() => {
    if (matchResult) {
      const isCompatible = canAcceptParcel && matchResult.confidence >= 60;
      setVerificationState(prev => ({
        ...prev,
        journeyCompatible: isCompatible,
      }));
    }
  }, [matchResult, canAcceptParcel]);

  // Update overall status when both verifications are complete
  useEffect(() => {
    const { aadhaarVerified, journeyCompatible } = verificationState;
    
    let newStatus: 'pending' | 'approved' | 'rejected' = 'pending';
    
    if (aadhaarVerified && journeyCompatible) {
      newStatus = 'approved';
    } else if (aadhaarVerified || journeyCompatible) {
      // Partially verified
      newStatus = 'pending';
    } else {
      // Check if either verification has failed
      if (matchResult && !canAcceptParcel) {
        newStatus = 'rejected';
      }
    }

    setVerificationState(prev => ({
      ...prev,
      overallStatus: newStatus,
    }));

    // Notify parent component
    onVerificationComplete(newStatus === 'approved');
  }, [verificationState.aadhaarVerified, verificationState.journeyCompatible, matchResult, canAcceptParcel, onVerificationComplete]);

  const handleAadhaarVerificationComplete = (success: boolean, data?: AadhaarData) => {
    setVerificationState(prev => ({
      ...prev,
      aadhaarVerified: success,
      aadhaarData: data || null,
    }));
    
    if (success) {
      setShowAadhaarVerification(false);
    }
  };

  const getStatusIcon = (status: boolean | null, loading = false) => {
    if (loading) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
    }
    if (status === true) {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    }
    if (status === false) {
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    }
    return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return 'text-green-600';
    if (status === false) return 'text-red-600';
    return 'text-yellow-600';
  };

  const confidence = matchResult?.confidence || 0;
  const requirements: string[] = []; // No requirements from match result in current structure
  const warnings = matchResult?.details?.warningMessages || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Status Header */}
      <div className={`rounded-lg p-4 border-2 ${
        verificationState.overallStatus === 'approved'
          ? 'bg-green-50 border-green-200'
          : verificationState.overallStatus === 'rejected'
          ? 'bg-red-50 border-red-200'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(
              verificationState.overallStatus === 'approved' ? true : 
              verificationState.overallStatus === 'rejected' ? false : null,
              isVerifying
            )}
            <div>
              <h3 className={`font-semibold ${
                verificationState.overallStatus === 'approved'
                  ? 'text-green-800'
                  : verificationState.overallStatus === 'rejected'
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }`}>
                {verificationState.overallStatus === 'approved'
                  ? 'Ready to Accept Parcel'
                  : verificationState.overallStatus === 'rejected'
                  ? 'Cannot Accept Parcel'
                  : 'Verification In Progress'
                }
              </h3>
              <p className={`text-sm ${
                verificationState.overallStatus === 'approved'
                  ? 'text-green-700'
                  : verificationState.overallStatus === 'rejected'
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}>
                {verificationState.overallStatus === 'approved'
                  ? 'All requirements met. You can accept this parcel.'
                  : verificationState.overallStatus === 'rejected'
                  ? 'Some requirements are not met.'
                  : 'Complete all verifications to proceed.'
                }
              </p>
            </div>
          </div>
          {confidence > 0 && (
            <div className="text-right">
              <div className={`text-lg font-bold ${getStatusColor(verificationState.journeyCompatible)}`}>
                {confidence}%
              </div>
              <div className="text-xs text-gray-600">Match Confidence</div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Verification Requirements</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {/* Aadhaar Verification */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationState.aadhaarVerified)}
                <div>
                  <h5 className="font-medium text-gray-900">Aadhaar Verification</h5>
                  <p className="text-sm text-gray-600">
                    {verificationState.aadhaarVerified
                      ? `Verified as ${verificationState.aadhaarData?.full_name}`
                      : 'Government ID verification required'
                    }
                  </p>
                </div>
              </div>
              
              {!verificationState.aadhaarVerified && (
                <Button
                  size="sm"
                  onClick={() => setShowAadhaarVerification(true)}
                >
                  <IdentificationIcon className="h-4 w-4 mr-2" />
                  Verify Aadhaar
                </Button>
              )}
            </div>
          </div>

          {/* Journey Compatibility */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(verificationState.journeyCompatible, isVerifying)}
                <div>
                  <h5 className="font-medium text-gray-900">Route Compatibility</h5>
                  <p className="text-sm text-gray-600">
                    {matchResult
                      ? `${confidence}% route match - ${matchResult.matchType.replace('_', ' ').toLowerCase()}`
                      : 'Checking journey compatibility...'
                    }
                  </p>
                </div>
              </div>
              
              {confidence > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        confidence >= 70 ? 'bg-green-500' : confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(confidence, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{confidence}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Route Details */}
      {matchResult && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">Route Analysis</h4>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Parcel Route</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{parcel.pickupStation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{parcel.dropStation}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Your Journey</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{journey.sourceStation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TruckIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{journey.destinationStation}</span>
                  </div>
                </div>
              </div>
            </div>

            {matchResult.details && (matchResult.details.estimatedPickupTime || matchResult.details.estimatedDropTime) && (
              <div className="bg-blue-50 rounded-lg p-3">
                <h6 className="font-medium text-blue-900 mb-2">Estimated Timeline</h6>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {matchResult.details.estimatedPickupTime && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700">Pickup: {matchResult.details.estimatedPickupTime}</span>
                      </div>
                    </div>
                  )}
                  {matchResult.details.estimatedDropTime && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-700">Drop: {matchResult.details.estimatedDropTime}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <h6 className="font-medium text-yellow-900 mb-2">Important Notes</h6>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {requirements.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h6 className="font-medium text-gray-900 mb-2">Additional Requirements</h6>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aadhaar Verification Modal */}
      {showAadhaarVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Aadhaar Verification</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAadhaarVerification(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <AadhaarVerificationComponent
                carrierUid={carrierUid}
                onVerificationComplete={handleAadhaarVerificationComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {journeyError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">Journey verification error: {journeyError}</p>
          </div>
        </div>
      )}
    </div>
  );
}



