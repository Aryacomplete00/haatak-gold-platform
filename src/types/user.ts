import { User, Transaction } from './index';

// Extended User type with KYC information
export interface UserProfile extends User {
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  kycDetails?: KYCDetails;
  joinedDate: string;
  lastLoginDate: string;
  profileImage?: string;
}

export interface KYCDetails {
  documentType?: 'aadhaar' | 'pan' | 'passport' | 'driving_license';
  documentNumber?: string;
  documentImage?: string;
  selfieImage?: string;
  addressProof?: string;
  submittedDate?: string;
  verifiedDate?: string;
  rejectionReason?: string;
}

export interface PurchaseHistory {
  id: string;
  type: 'buy' | 'sell';
  goldGrams: number;
  pricePerGram: number;
  totalAmount: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
}
