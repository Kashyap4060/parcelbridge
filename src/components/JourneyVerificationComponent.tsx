'use client';

import React, { useState } from 'react';
import { Journey, ParcelRequest } from '@/types';
import { useJourneyVerification } from '@/hooks/useJourneyVerification';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  MapPinIcon,
  TruckIcon,
  DocumentCheckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface JourneyVerificationComponentProps {
  journey: Journey;
  parcel: ParcelRequest;
  carrierUid: string;
  onVerificationComplete?: (canAccept: boolean) => void;
}

export function JourneyVerificationComponent({
  journey,
  parcel,
  carrierUid,
  onVerificationComplete
}: JourneyVerificationComponentProps) {
  const {
    isVerifying,
    matchResult,
    verificationRequirements,
    error,
    canAcceptParcel,
    verificationStatus,
    refresh
  } = useJourneyVerification({ journey, parcel, carrierUid });

  React.useEffect(() => {
    if (onVerificationComplete && matchResult && verificationRequirements) {
      onVerificationComplete(canAcceptParcel);
    }
  }, [canAcceptParcel, matchResult, verificationRequirements, onVerificationComplete]);

  const getStatusIcon = () => {
    switch (verificationStatus.status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'ROUTE_MISMATCH':
        return <XCircleIcon className="h-6 w-6 text-red-600" />;
      case 'AADHAAR_REQUIRED':
      case 'REQUIREMENTS_PENDING':
        return <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus.color) {
      case 'green': return 'bg-green-50 border-green-200';
      case 'red': return 'bg-red-50 border-red-200';
      case 'orange': return 'bg-orange-50 border-orange-200';
      default: return 'bg-yellow-50 border-yellow-200';
    }
  };

  if (isVerifying) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Verifying journey compatibility...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <XCircleIcon className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-medium">Verification Error</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!matchResult || !verificationRequirements) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">No verification data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Verification Status */}
      <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-gray-900">{verificationStatus.message}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verification Score: {verificationRequirements.verificationScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Journey Match Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <TruckIcon className="h-5 w-5 text-blue-600" />
          <span>Route Compatibility</span>
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Match Type:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              matchResult.matchType === 'EXACT' ? 'bg-green-100 text-green-800' :
              matchResult.matchType === 'ROUTE_OVERLAP' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {matchResult.matchType.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence:</span>
            <span className="text-sm font-medium">{matchResult.confidence}%</span>
          </div>

          {/* Route Details */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Pickup</span>
                {matchResult.details.pickupStationMatch && (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{parcel.pickupStation}</p>
              {matchResult.details.estimatedPickupTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {matchResult.details.estimatedPickupTime}
                </p>
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPinIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Drop</span>
                {matchResult.details.dropStationMatch && (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{parcel.dropStation}</p>
              {matchResult.details.estimatedDropTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {matchResult.details.estimatedDropTime}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Requirements */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
          <DocumentCheckIcon className="h-5 w-5 text-orange-600" />
          <span>Verification Requirements</span>
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Aadhaar Verification</span>
            </div>
            {verificationRequirements.aadhaarVerified ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Valid Journey</span>
            </div>
            {verificationRequirements.journeyVerified ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Route Match</span>
            </div>
            {matchResult.isMatch ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>

        {verificationRequirements.requiredDocuments.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <h5 className="text-sm font-medium text-orange-800 mb-2">Required Actions:</h5>
            <ul className="text-sm text-orange-700 space-y-1">
              {verificationRequirements.requiredDocuments.map((doc, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Warnings and Errors */}
      {(matchResult.details.warningMessages.length > 0 || matchResult.details.errorMessages.length > 0) && (
        <div className="space-y-2">
          {matchResult.details.warningMessages.map((warning, index) => (
            <div key={`warning-${index}`} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">{warning}</span>
              </div>
            </div>
          ))}
          
          {matchResult.details.errorMessages.map((error, index) => (
            <div key={`error-${index}`} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
