import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function calculateEstimatedFare(weight: number, distance: number): number {
  const baseFare = 50;
  const weightFactor = 10;
  const distanceFactor = 0.5;
  
  return baseFare + (weight * weightFactor) + (distance * distanceFactor);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'text-warning-600 bg-warning-50';
    case 'ACCEPTED':
      return 'text-primary-600 bg-primary-50';
    case 'IN_TRANSIT':
      return 'text-indigo-600 bg-indigo-50';
    case 'DELIVERED':
      return 'text-success-600 bg-success-50';
    case 'CANCELLED':
    case 'FAILED_BY_CARRIER':
      return 'text-danger-600 bg-danger-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
