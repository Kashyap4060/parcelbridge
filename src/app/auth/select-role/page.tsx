'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Button } from '@/components/ui/Button';
import { TruckIcon, UserIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

export default function SelectRole() {
  const [selectedRole, setSelectedRole] = useState<'sender' | 'carrier' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { updateRole, user } = useHybridAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Redirect if user already has a role
  if (user?.role) {
    router.push('/dashboard');
    return null;
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateRole(selectedRole);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <TruckIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Choose your role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hello {user.firstName || user.fullName || 'there'}! Select how you want to use Parcel-Bridge
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Sender Role */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === 'sender' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedRole('sender')}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="role"
                  value="sender"
                  checked={selectedRole === 'sender'}
                  onChange={() => setSelectedRole('sender')}
                  className="mt-1 mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Sender</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Send parcels to others via train passengers
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Post parcel requests on the platform</li>
                    <li>• Connect with verified carriers</li>
                    <li>• Track your parcel in real-time</li>
                    <li>• Rate and review carriers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Carrier Role */}
            <div 
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedRole === 'carrier' 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => setSelectedRole('carrier')}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="role"
                  value="carrier"
                  checked={selectedRole === 'carrier'}
                  onChange={() => setSelectedRole('carrier')}
                  className="mt-1 mr-4"
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <UserIcon className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Carrier</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Carry parcels for others during your train journey
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Browse available parcel requests</li>
                    <li>• Earn money during your travel</li>
                    <li>• Build a trusted carrier profile</li>
                    <li>• Get ratings from satisfied senders</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="button"
                className="w-full"
                disabled={!selectedRole || loading}
                onClick={handleRoleSelection}
              >
                {loading ? 'Setting up your account...' : 'Continue to Dashboard'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Don't worry, you can change your role later in settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
