'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/Button';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, updateUserRole } = useSimpleAuth();
  const [selectedRole, setSelectedRole] = useState<'sender' | 'carrier' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update the user's role in the database
      const result = await updateUserRole(selectedRole);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      // Redirect to dashboard after successful role update
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Choose your role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select how you want to use Parcel-Bridge
          </p>
        </div>

        <div className="space-y-4">
          {/* Sender Option */}
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
                className="mt-1 mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Sender</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Send parcels to others via train passengers. Perfect for businesses and individuals who need to send packages across India.
                </p>
                <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                  <li>Post parcel delivery requests</li>
                  <li>Track your packages in real-time</li>
                  <li>Pay securely through our platform</li>
                  <li>Rate and review carriers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Carrier Option */}
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
                className="mt-1 mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Carrier</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Earn money by carrying parcels during your train journeys. Help others while making your travel more profitable.
                </p>
                <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                  <li>Add your train journey details</li>
                  <li>Accept parcel delivery requests</li>
                  <li>Earn money for each delivery</li>
                  <li>Build your carrier reputation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <Button
            type="button"
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          You can switch between roles anytime from your dashboard settings.
        </p>
      </div>
    </div>
  );
}



