/**
 * Payment Status Component
 * Shows the current status of a payment with appropriate icons and messages
 */

'use client';

import { CheckCircleIcon, XCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { CreditCardIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

export type PaymentStatus = 'pending' | 'processing' | 'captured' | 'failed' | 'refunded' | 'cancelled';

interface PaymentStatusProps {
  status: PaymentStatus;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  updatedAt?: string;
  failureReason?: string;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    title: 'Payment Pending',
    description: 'Waiting for payment to be completed'
  },
  processing: {
    icon: CreditCardIcon,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    title: 'Processing Payment',
    description: 'Your payment is being processed'
  },
  captured: {
    icon: CheckCircleIcon,
    color: 'text-green-600 bg-green-50 border-green-200',
    title: 'Payment Successful',
    description: 'Your payment has been successfully processed'
  },
  failed: {
    icon: XCircleIcon,
    color: 'text-red-600 bg-red-50 border-red-200',
    title: 'Payment Failed',
    description: 'Your payment could not be processed'
  },
  refunded: {
    icon: CurrencyRupeeIcon,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    title: 'Payment Refunded',
    description: 'Your payment has been refunded'
  },
  cancelled: {
    icon: ExclamationTriangleIcon,
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    title: 'Payment Cancelled',
    description: 'Payment was cancelled by user'
  }
};

export default function PaymentStatus({
  status,
  paymentId,
  orderId,
  amount,
  currency = 'INR',
  updatedAt,
  failureReason,
  className = ''
}: PaymentStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`rounded-lg border p-4 ${config.color} ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-6 w-6 mt-0.5 mr-3 ${config.color.split(' ')[0]}`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color.split(' ')[0]}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.color.split(' ')[0].replace('600', '700')}`}>
            {config.description}
          </p>
          
          {failureReason && status === 'failed' && (
            <p className="text-sm mt-2 text-red-700 font-medium">
              Reason: {failureReason}
            </p>
          )}

          <div className="mt-3 space-y-1 text-xs">
            {amount && (
              <div className="flex justify-between">
                <span className="opacity-75">Amount:</span>
                <span className="font-medium">{formatAmount(amount, currency)}</span>
              </div>
            )}
            {paymentId && (
              <div className="flex justify-between">
                <span className="opacity-75">Payment ID:</span>
                <span className="font-mono">{paymentId}</span>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between">
                <span className="opacity-75">Order ID:</span>
                <span className="font-mono">{orderId}</span>
              </div>
            )}
            {updatedAt && (
              <div className="flex justify-between">
                <span className="opacity-75">Updated:</span>
                <span>{formatDate(updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for use in lists or cards
interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.color.split(' ')[0]}`} />
      {config.title}
    </span>
  );
}

// Timeline version for showing payment flow
interface PaymentTimelineProps {
  events: Array<{
    id: string;
    status: PaymentStatus;
    timestamp: string;
    message?: string;
  }>;
  className?: string;
}

export function PaymentTimeline({ events, className = '' }: PaymentTimelineProps) {
  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {events.map((event, eventIdx) => {
          const config = statusConfig[event.status];
          const Icon = config.icon;
          const isLast = eventIdx === events.length - 1;

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${config.color}`}>
                      <Icon className={`h-5 w-5 ${config.color.split(' ')[0]}`} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className={`text-sm ${config.color.split(' ')[0]}`}>
                        {config.title}
                        {event.message && (
                          <span className="text-gray-500 ml-2">- {event.message}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}