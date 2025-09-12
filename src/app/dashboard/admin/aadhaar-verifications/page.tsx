'use client';

import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { Button } from '@/components/ui/Button';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface AadhaarVerificationRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: 'sender' | 'carrier';
  aadhaarNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationDate: string;
  createdAt: string;
}

export default function AadhaarVerificationsPage() {
  const { user, isAuthenticated } = useSimpleAuth();
  const { isLoading, isAuthorized } = useRequireRole('admin');
  const [verifications, setVerifications] = useState<AadhaarVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  useEffect(() => {
    if (isLoading || !isAuthorized) return;
    loadVerifications();
  }, [isLoading, isAuthorized]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call to fetch Aadhaar verifications
      // const data = await getAadhaarVerifications();
      
      // Mock data for now
      const mockData: AadhaarVerificationRecord[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userRole: 'carrier',
          aadhaarNumber: '1234 5678 9012',
          fullName: 'JOHN DOE',
          dateOfBirth: '1990-01-15',
          address: 'Mumbai, Maharashtra, India',
          status: 'pending',
          verificationDate: '',
          createdAt: new Date().toISOString(),
        },
      ];
      
      setVerifications(mockData);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'verified' | 'rejected') => {
    try {
      // TODO: Implement actual API call to update verification status
      // await updateAadhaarVerificationStatus(id, newStatus);
      
      setVerifications(prev =>
        prev.map(v =>
          v.id === id
            ? { ...v, status: newStatus, verificationDate: new Date().toISOString() }
            : v
        )
      );
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const filteredVerifications = verifications.filter(v => 
    filter === 'all' || v.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aadhaar Verifications</h1>
            <p className="text-gray-600 mt-2">Review and manage user identity verifications</p>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'pending', 'verified', 'rejected'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as any)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow">
            <p className="text-gray-600">Loading verifications...</p>
          </div>
        ) : filteredVerifications.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow text-center">
            <IdentificationIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter !== 'all' ? filter : ''} verifications found
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No Aadhaar verifications have been submitted yet.'
                : `No ${filter} verifications at this time.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVerifications.map((verification) => (
              <div key={verification.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IdentificationIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {verification.userName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {verification.userRole} • Submitted {new Date(verification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(verification.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.status)}`}>
                      {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                    
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <span className="text-sm font-medium">{verification.fullName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Date of Birth:</span>
                      <span className="text-sm font-medium">
                        {new Date(verification.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <IdentificationIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Aadhaar Number:</span>
                      <span className="text-sm font-medium font-mono">{verification.aadhaarNumber}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Address Information</h4>
                    
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-600">Address:</span>
                        <p className="text-sm font-medium leading-relaxed">{verification.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {verification.status === 'pending' && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(verification.id, 'rejected')}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(verification.id, 'verified')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Verify
                    </Button>
                  </div>
                )}

                {verification.status !== 'pending' && verification.verificationDate && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {verification.status === 'verified' ? 'Verified' : 'Rejected'} on{' '}
                      {new Date(verification.verificationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



