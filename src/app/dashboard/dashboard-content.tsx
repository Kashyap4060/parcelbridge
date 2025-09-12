'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TruckIcon, PaperAirplaneIcon, MapIcon, UserIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const { user, updateUserRole } = useSimpleAuth();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('Dashboard - User data:', {
        email: user.email,
        role: user.role,
        phone: user.phone,
        hasSelectedRole: user.role ? true : false
      });
      setCurrentRole(user.role || null);
    }
  }, [user]);

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your account.
        </p>
      </div>

      {/* Debug Info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              Debug Info (Dev Mode)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-700 dark:text-yellow-300">
            <div className="space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Current Role:</strong> {currentRole || 'None'}</p>
              <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
            </div>
            {!currentRole && (
              <div className="mt-4 space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => router.push('/auth/complete-profile')}
                >
                  Complete Profile
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/profile')}
                >
                  Manage Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Selection Prompt */}
      {!currentRole && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Welcome! Please Select Your Role
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              To access all features, please select whether you want to send parcels or carry them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={async () => {
                  setUpdatingRole(true);
                  try {
                    await updateUserRole('sender');
                    setCurrentRole('sender');
                  } catch (error) {
                    console.error('Error updating role:', error);
                  } finally {
                    setUpdatingRole(false);
                  }
                }}
                disabled={updatingRole}
                className="flex-1 h-16"
              >
                <div className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>{updatingRole ? 'Setting up...' : 'I want to Send Parcels'}</span>
                </div>
              </Button>
              <Button 
                onClick={async () => {
                  setUpdatingRole(true);
                  try {
                    await updateUserRole('carrier');
                    setCurrentRole('carrier');
                  } catch (error) {
                    console.error('Error updating role:', error);
                  } finally {
                    setUpdatingRole(false);
                  }
                }}
                disabled={updatingRole}
                variant="outline"
                className="flex-1 h-16"
              >
                <div className="flex items-center space-x-2">
                  <TruckIcon className="w-5 h-5" />
                  <span>{updatingRole ? 'Setting up...' : 'I want to Carry Parcels'}</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-based Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Sender Dashboard */}
        {currentRole === 'sender' && (
          <>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PaperAirplaneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Create Request</CardTitle>
                    <CardDescription>Send a Parcel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/dashboard/sender/create-request')}
                  className="w-full"
                >
                  Create New Request
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TruckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>My Requests</CardTitle>
                    <CardDescription>Track Parcels</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/dashboard/sender/requests')}
                  variant="outline"
                  className="w-full"
                >
                  View All Requests
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Carrier Dashboard */}
        {currentRole === 'carrier' && (
          <>
            {/* Aadhaar Verification Notice for Carriers */}
            <Card className="md:col-span-2 lg:col-span-3 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                      Aadhaar Verification Recommended
                    </CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-300">
                      Complete your Aadhaar verification to access all carrier features and build trust with senders. 
                      While not mandatory, verified carriers receive priority in parcel assignments.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/auth/aadhaar-verification')}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Verify Aadhaar (Optional)
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <MapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Add Journey</CardTitle>
                    <CardDescription>Register your train journey</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/dashboard/carrier/journeys')}
                  className="w-full"
                >
                  <TruckIcon className="w-4 h-4 mr-2" />
                  Manage Journeys
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <PaperAirplaneIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle>Find Parcels</CardTitle>
                    <CardDescription>Browse available delivery requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/carrier/parcels')}
                  className="w-full"
                >
                  Browse Parcels
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Common Cards for all users */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <CardTitle>Wallet</CardTitle>
                <CardDescription>Manage your wallet and transactions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard/wallet')}
              variant="outline"
              className="w-full"
            >
              View Wallet
            </Button>
          </CardContent>
        </Card>

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