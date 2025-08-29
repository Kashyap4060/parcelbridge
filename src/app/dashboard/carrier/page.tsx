'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { useCarrierVerification } from '../../../hooks/useCarrierVerification';
import { CarrierVerificationBanner } from '../../../components/ui/CarrierVerificationBanner';
import { CollateralStatus } from '../../../components/ui/CollateralStatus';
import { Button } from '../../../components/ui/Button';
import { formatCurrency } from '../../../lib/utils';
import {
  TruckIcon,
  MapIcon,
  WalletIcon,
  DocumentCheckIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function CarrierDashboard() {
  const { user } = useHybridAuth();
  const { isLoading, isAuthorized } = useRequireRole('carrier');
  const {
    getParcelAcceptanceStatus,
    getCollateralStatus,
    isLoadingWallet,
    canAcceptParcels,
    walletBalance,
    lockedAmount
  } = useCarrierVerification();
  const router = useRouter();

  // Authentication guard
  useEffect(() => {}, []);

  const acceptanceStatus = getParcelAcceptanceStatus();
  const collateralStatus = getCollateralStatus();

  // Mock data for active deliveries
  const activeDeliveries = [
    {
      id: 'REQ123',
      pickup: 'Mumbai Central',
      delivery: 'Pune Station',
      amount: 150,
      status: 'IN_TRANSIT'
    },
    {
      id: 'REQ456', 
      pickup: 'Delhi Junction',
      delivery: 'Agra Cantt',
      amount: 120,
      status: 'ACCEPTED'
    }
  ];

  const upcomingJourneys = [
    {
      id: '1',
      trainNumber: '12002',
      trainName: 'Shatabdi Express',
      route: 'New Delhi → Chandigarh',
      date: new Date('2025-01-25'),
      time: '07:20 AM'
    }
  ];

  if (authLoading || isLoadingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !isAuthorized || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <TruckIcon className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Carrier Dashboard
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {user.user_metadata?.display_name || user.email || 'Carrier'}</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard/carrier/journeys')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Journey
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Verification Status Banner */}
        <CarrierVerificationBanner 
          status={acceptanceStatus}
          isLoading={isLoadingWallet}
          className="mb-6"
        />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats & Collateral */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DocumentCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{activeDeliveries.length}</p>
                    <p className="text-sm text-gray-600">Active Deliveries</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <WalletIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(walletBalance)}</p>
                    <p className="text-sm text-gray-600">Wallet Balance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MapIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{upcomingJourneys.length}</p>
                    <p className="text-sm text-gray-600">Upcoming Journeys</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Collateral Status */}
            <CollateralStatus
              totalBalance={collateralStatus.totalBalance}
              lockedAmount={collateralStatus.lockedAmount}
              availableBalance={collateralStatus.availableBalance}
              minimumRequired={collateralStatus.minimumRequired}
              canAcceptMore={collateralStatus.canAcceptMore}
              shortfall={collateralStatus.shortfall}
            />

            {/* Active Deliveries */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Active Deliveries</h2>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/deliveries')}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">#{delivery.id}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {delivery.pickup} → {delivery.delivery}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full mt-2 ${
                          delivery.status === 'IN_TRANSIT' 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(delivery.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {activeDeliveries.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <TruckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active deliveries</p>
                    <p className="text-sm mt-2">Add a journey to start accepting parcels</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/carrier/journeys')}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Journey
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/wallet')}
                >
                  <WalletIcon className="h-4 w-4 mr-2" />
                  Manage Wallet
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/dashboard/deliveries')}
                >
                  <DocumentCheckIcon className="h-4 w-4 mr-2" />
                  View Deliveries
                </Button>
              </div>
            </div>

            {/* Upcoming Journeys */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Journeys</h3>
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/carrier/journeys')}>
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {upcomingJourneys.map((journey) => (
                  <div key={journey.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-medium text-sm text-gray-900">
                      {journey.trainNumber} - {journey.trainName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{journey.route}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {journey.date.toLocaleDateString()} at {journey.time}
                    </p>
                  </div>
                ))}
                {upcomingJourneys.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <MapIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No upcoming journeys</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => router.push('/dashboard/carrier/journeys')}
                    >
                      Add Journey
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
