export type UserRole = 'sender' | 'carrier';

export interface User {
  uid: string;
  email: string;
  phone: string;
  displayName: string;
  photoURL?: string; // Profile picture URL
  aadhaar?: string;
  role: UserRole | null; // Single role instead of multiple boolean flags
  hasSelectedRole: boolean; // Track if user has selected their role
  isPhoneVerified: boolean;
  isAadhaarVerified: boolean;
  rating?: number;
  totalDeliveries?: number;
  walletBalance?: number; // Wallet balance
  referralCode?: string; // User's referral code
  userTier?: 'bronze' | 'silver' | 'gold' | 'platinum'; // User tier/rank
  languagePreference?: string; // Language preference
  theme?: 'light' | 'dark' | 'system'; // Theme preference
  notificationSettings?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface AadhaarVerification {
  id: string;
  uid: string;
  aadhaarNumber: string;
  fullName: string;
  frontImageUrl: string;
  backImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  verificationMethod: 'manual' | 'ocr' | 'digilocker';
}

export type ParcelStatus = 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED_BY_CARRIER';

export interface ParcelRequest {
  id: string;
  senderUid: string;
  carrierUid?: string;
  pickupStation: string;
  dropStation: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  pickupTime: Date;
  description: string;
  status: ParcelStatus;
  paymentHeld: number;
  estimatedFare: number;
  feeBreakdown: {
    baseFee: number;
    distanceFee: number;
    totalFee: number;
    distance: number;
    weightTier: string;
  };
  otpCode?: string;
  otpVerifiedAt?: Date;
  acceptedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Journey {
  id: string;
  carrierUid: string;
  pnr: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  sourceStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  stations: string[];
  journeyDate: Date;
  arrivalDate?: Date;
  departureTime?: string;
  arrivalTime?: string;
  coachNumber?: string;
  seatNumber?: string;
  class?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Wallet {
  uid: string;
  balance: number;
  lockedAmount: number;
  transactions: WalletTransaction[];
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'LOCK' | 'UNLOCK';
  amount: number;
  description: string;
  relatedRequestId?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderUid: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Rating {
  id: string;
  requestId: string;
  raterUid: string;
  ratedUid: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}
