'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHybridAuth } from '../../../hooks/useHybridAuth';
import { useCarrierVerification } from '../../../hooks/useCarrierVerification';
import { Button } from '../../../components/ui/Button';
import { CollateralStatus } from '../../../components/ui/CollateralStatus';
import PaymentModal from '../../../components/ui/PaymentModal';
import { ArrowLeftIcon, PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from 'react-hot-toast';

interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'LOCK' | 'UNLOCK';
  amount: number;
  description: string;
  createdAt: Date;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export default function WalletPage() {
  const { user, isAuthenticated } = useHybridAuth();
  const { 
    getCollateralStatus, 
    isLoadingWallet, 
    walletBalance, 
    lockedAmount,
    minimumCollateral 
  } = useCarrierVerification();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Get collateral status for carriers
  const collateralStatus = user?.role === 'carrier' ? getCollateralStatus() : null;

  // Authentication guard - redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    // Mock wallet data - in real app, fetch from Firestore
    setBalance(user?.role === 'carrier' ? walletBalance : 1250.50);
    
    const mockTransactions: WalletTransaction[] = [
      {
        id: '1',
        type: 'CREDIT',
        amount: 500,
        description: 'Wallet top-up via UPI',
        createdAt: new Date('2025-01-20T10:30:00'),
        status: 'SUCCESS',
      },
      {
        id: '2',
        type: 'LOCK',
        amount: 300,
        description: 'Collateral locked for delivery #REQ123',
        createdAt: new Date('2025-01-19T15:45:00'),
        status: 'SUCCESS',
      },
      {
        id: '3',
        type: 'CREDIT',
        amount: 150,
        description: 'Delivery payment for #REQ456',
        createdAt: new Date('2025-01-18T09:20:00'),
        status: 'SUCCESS',
      },
      {
        id: '4',
        type: 'DEBIT',
        amount: 75,
        description: 'Payment for parcel delivery #REQ789',
        createdAt: new Date('2025-01-17T14:10:00'),
        status: 'SUCCESS',
      },
    ];
    
    setTransactions(mockTransactions);
    setIsLoading(false);
  }, [user, walletBalance]);

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount < 100) {
      toast.error('Minimum top-up amount is ₹100');
      return;
    }
    if (amount > 50000) {
      toast.error('Maximum top-up amount is ₹50,000');
      return;
    }

    setPaymentAmount(amount);
    setShowTopUp(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh wallet balance after successful payment
    const amount = paymentAmount;
    setBalance(prevBalance => prevBalance + amount);
    
    // Add transaction record
    const newTransaction: WalletTransaction = {
      id: Date.now().toString(),
      type: 'CREDIT',
      amount,
      description: `Wallet top-up via Razorpay`,
      createdAt: new Date(),
      status: 'SUCCESS'
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    toast.success(`₹${amount} added to wallet successfully!`);
    setTopUpAmount('');
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                My Wallet
              </h1>
            </div>
            <Button onClick={() => setShowTopUp(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Money
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
              </div>
              <CreditCardIcon className="h-8 w-8 text-primary-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Locked Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(lockedAmount)}</p>
              </div>
              <div className="p-2 bg-warning-100 rounded-full">
                <CreditCardIcon className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Collateral for active deliveries</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(balance + lockedAmount)}</p>
              </div>
              <div className="p-2 bg-success-100 rounded-full">
                <CreditCardIcon className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Available + Locked</p>
          </div>
        </div>

        {/* Collateral Status (for carriers only) */}
        {user?.role === 'carrier' && collateralStatus && (
          <CollateralStatus
            totalBalance={collateralStatus.totalBalance}
            lockedAmount={collateralStatus.lockedAmount}
            availableBalance={collateralStatus.availableBalance}
            minimumRequired={collateralStatus.minimumRequired}
            canAcceptMore={collateralStatus.canAcceptMore}
            shortfall={collateralStatus.shortfall}
            className="mb-8"
          />
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowTopUp(true)}
              className="flex flex-col items-center p-4 h-auto"
            >
              <PlusIcon className="h-6 w-6 mb-2" />
              <span>Add Money</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => alert('Withdrawal feature coming soon!')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <CreditCardIcon className="h-6 w-6 mb-2" />
              <span>Withdraw</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/wallet/transactions')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <CreditCardIcon className="h-6 w-6 mb-2" />
              <span>All Transactions</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => alert('Statement download coming soon!')}
              className="flex flex-col items-center p-4 h-auto"
            >
              <CreditCardIcon className="h-6 w-6 mb-2" />
              <span>Statement</span>
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'CREDIT' ? 'bg-success-100' :
                    transaction.type === 'DEBIT' ? 'bg-danger-100' :
                    'bg-warning-100'
                  }`}>
                    <CreditCardIcon className={`h-5 w-5 ${
                      transaction.type === 'CREDIT' ? 'text-success-600' :
                      transaction.type === 'DEBIT' ? 'text-danger-600' :
                      'text-warning-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'CREDIT' ? 'text-success-600' :
                    transaction.type === 'DEBIT' ? 'text-danger-600' :
                    'text-warning-600'
                  }`}>
                    {transaction.type === 'CREDIT' ? '+' : transaction.type === 'DEBIT' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Money to Wallet
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Enter amount"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick amounts:</p>
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500, 1000, 2000, 5000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTopUp(false);
                  setTopUpAmount('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleTopUp}>
                Add Money
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentAmount}
        purpose="wallet_topup"
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
