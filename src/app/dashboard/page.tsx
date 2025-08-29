'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserProfileHeader from '@/components/UserProfileHeader';
import { TruckIcon, PaperAirplaneIcon, CogIcon, MapIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const { user } = useHybridAuth();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentRole(user.role || null);
    }
  }, [user]);

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Profile */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UserProfileHeader />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Role-based content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Sender Dashboard */}
            {currentRole === 'sender' && (
              <>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <PaperAirplaneIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Create Request
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Send a Parcel
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push('/dashboard/sender/create-request')}
                        className="w-full"
                      >
                        Create New Request
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TruckIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            My Requests
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            Track Parcels
                          </dd>
                        </dl>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={() => router.push('/dashboard/sender/requests')}
                        variant="outline"
                        className="w-full"
                      >
                        View All Requests
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Carrier Dashboard */}
            {currentRole === 'carrier' && (
              <>
                {/* Optional Aadhaar Verification Notice */}
                {!user.isAadhaarVerified && (
                  <div className="md:col-span-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-medium text-blue-900">
                            Aadhaar Verification Recommended
                          </h3>
                          <p className="mt-2 text-sm text-blue-800">
                            Complete your Aadhaar verification to access all carrier features and build trust with senders. 
                            While not mandatory, verified carriers receive priority in parcel assignments.
                          </p>
                          <div className="mt-3">
                            <Button
                              onClick={() => router.push('/auth/aadhaar-verification')}
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              Verify Aadhaar (Optional)
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Add Journey
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Register your train journey to start accepting parcels
                    </p>
                    <Button
                      onClick={() => router.push('/dashboard/carrier/journeys')}
                      className="w-full"
                    >
                      <TruckIcon className="h-4 w-4 mr-2" />
                      Manage Journeys
                    </Button>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Find Parcels
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Browse available delivery requests
                      {!user.isAadhaarVerified && (
                        <span className="block text-xs text-amber-600 mt-1">
                          (Aadhaar verification required to accept)
                        </span>
                      )}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/carrier/parcels')}
                    >
                      Browse Parcels
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Common Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Wallet
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage your wallet and transactions
                </p>
                <Button
                  onClick={() => router.push('/dashboard/wallet')}
                  variant="outline"
                  className="w-full"
                >
                  View Wallet
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute redirectTo="/auth/login">
      <DashboardContent />
    </ProtectedRoute>
  );
}
