/**
 * Example integration of Journey Verification in Carrier Dashboard
 * This shows how to use the verification system when a carrier tries to accept a parcel
 */

'use client';

import React, { useState } from 'react';
import { Journey, ParcelRequest } from '@/types';
import { JourneyVerificationComponent } from '@/components/JourneyVerificationComponent';
import { useJourneyVerification } from '@/hooks/useJourneyVerification';

interface ParcelAcceptanceModalProps {
  parcel: ParcelRequest;
  carrierJourney: Journey;
  carrierUid: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function ParcelAcceptanceModal({
  parcel,
  carrierJourney,
  carrierUid,
  onAccept,
  onCancel
}: ParcelAcceptanceModalProps) {
  const [canAcceptParcel, setCanAcceptParcel] = useState(false);
  const [showVerification, setShowVerification] = useState(true);
  
  const handleVerificationComplete = (canAccept: boolean) => {
    setCanAcceptParcel(canAccept);
  };

  const handleAcceptParcel = async () => {
    if (!canAcceptParcel) {
      alert('Please complete all verification requirements before accepting this parcel.');
      return;
    }

    try {
      // Here you would call your parcel acceptance API
      // await acceptParcelAPI(parcel.id, carrierUid);
      onAccept();
    } catch (error) {
      console.error('Failed to accept parcel:', error);
      alert('Failed to accept parcel. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Accept Parcel Delivery
          </h2>
          
          {/* Parcel Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Parcel Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">From:</span>
                <p className="font-medium">{parcel.pickupStation}</p>
              </div>
              <div>
                <span className="text-gray-600">To:</span>
                <p className="font-medium">{parcel.dropStation}</p>
              </div>
              <div>
                <span className="text-gray-600">Weight:</span>
                <p className="font-medium">{parcel.weight}kg</p>
              </div>
              <div>
                <span className="text-gray-600">Fare:</span>
                <p className="font-medium">₹{parcel.estimatedFare}</p>
              </div>
            </div>
          </div>

          {/* Journey Verification */}
          {showVerification && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Verification Required</h3>
              <JourneyVerificationComponent
                journey={carrierJourney}
                parcel={parcel}
                carrierUid={carrierUid}
                onVerificationComplete={handleVerificationComplete}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAcceptParcel}
              disabled={!canAcceptParcel}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                canAcceptParcel
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canAcceptParcel ? 'Accept Parcel' : 'Complete Verification'}
            </button>
          </div>
          
          {!canAcceptParcel && (
            <p className="text-sm text-orange-600 mt-2 text-center">
              Complete all verification requirements to accept this parcel
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Example usage in carrier dashboard
export function CarrierParcelCard({ parcel, carrierJourney, carrierUid }: {
  parcel: ParcelRequest;
  carrierJourney: Journey;
  carrierUid: string;
}) {
  const [showModal, setShowModal] = useState(false);
  
  // Use the verification hook to show quick status
  const { verificationStatus, canAcceptParcel } = useJourneyVerification({
    journey: carrierJourney,
    parcel: parcel,
    carrierUid
  });

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {parcel.pickupStation} → {parcel.dropStation}
            </h4>
            <p className="text-sm text-gray-600">{parcel.weight}kg • ₹{parcel.estimatedFare}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            verificationStatus.color === 'green' ? 'bg-green-100 text-green-800' :
            verificationStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            {verificationStatus.status.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{parcel.description}</p>
        
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Details & Accept
        </button>
      </div>

      {showModal && (
        <ParcelAcceptanceModal
          parcel={parcel}
          carrierJourney={carrierJourney}
          carrierUid={carrierUid}
          onAccept={() => {
            setShowModal(false);
            // Handle successful acceptance
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}
