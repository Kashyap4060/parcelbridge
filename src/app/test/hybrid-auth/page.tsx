'use client';

import { useState } from 'react';
import { useHybridAuth } from '@/hooks/useHybridAuth';

export default function HybridAuthTestPage() {
  const { 
    user, 
    isLoading, 
    error, 
    sendOTP, 
    verifyOTP, 
    updateRole, 
    signOut,
    isAuthenticated,
    isPhoneVerified,
    hasSelectedRole 
  } = useHybridAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleSendOTP = async () => {
    try {
      const result = await sendOTP(phoneNumber);
      setConfirmationResult(result);
      alert('OTP sent successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP(confirmationResult, otp);
      alert('Successfully logged in!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateRole = async (role: 'sender' | 'carrier') => {
    try {
      await updateRole(role);
      alert(`Role updated to ${role}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔥 Hybrid Auth Test: Firebase Auth + Supabase Database
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {/* Authentication Status */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Authenticated</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isPhoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                {isPhoneVerified ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Phone Verified</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${hasSelectedRole ? 'text-green-600' : 'text-red-600'}`}>
                {hasSelectedRole ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Role Selected</div>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login Form */
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Login with Phone OTP</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!confirmationResult ? (
                <button
                  onClick={handleSendOTP}
                  disabled={!phoneNumber}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Send OTP
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={!otp}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>

            {/* reCAPTCHA container */}
            <div id="recaptcha-container" className="mt-4"></div>
          </div>
        ) : (
          /* User Dashboard */
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="space-y-2">
                <p><strong>Firebase UID:</strong> {user?.firebaseUid}</p>
                <p><strong>Supabase ID:</strong> {user?.supabaseId || 'Not set'}</p>
                <p><strong>Phone:</strong> {user?.phoneNumber}</p>
                <p><strong>Role:</strong> {user?.role || 'Not selected'}</p>
                <p><strong>Name:</strong> {user?.fullName || user?.firstName || 'Not set'}</p>
                <p><strong>Email:</strong> {user?.email || 'Not set'}</p>
                <p><strong>Phone Verified:</strong> {user?.isPhoneVerified ? 'Yes' : 'No'}</p>
                <p><strong>Aadhaar Verified:</strong> {user?.isAadhaarVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Role Selection */}
            {!hasSelectedRole && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => handleUpdateRole('sender')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-semibold">Sender</div>
                  </button>
                  <button
                    onClick={() => handleUpdateRole('carrier')}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300"
                  >
                    <div className="text-2xl mb-2">🚂</div>
                    <div className="font-semibold">Carrier</div>
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <button
                onClick={signOut}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Architecture Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">🏗️ Hybrid Architecture</h2>
          <div className="text-blue-700 space-y-2">
            <p>✅ <strong>Firebase Authentication:</strong> Phone OTP, user sessions</p>
            <p>✅ <strong>Supabase Database:</strong> User profiles, parcels, all business data</p>
            <p>✅ <strong>Automatic Sync:</strong> Firebase users are automatically synced to Supabase</p>
            <p>✅ <strong>Best of Both:</strong> Firebase's auth reliability + Supabase's database power</p>
          </div>
        </div>
      </div>
    </div>
  );
}
