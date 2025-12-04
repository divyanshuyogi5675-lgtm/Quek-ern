
export interface Investment {
  id: string;
  productId: string;
  planName: string;
  investedAmount: number;
  dailyIncome: number;
  totalIncome: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'cancelled';
  lastCreditDate?: number; // Timestamp of last daily credit
}

export interface WithdrawalDetails {
  fullName: string;
  phoneNumber: string;
  method: 'upi' | 'bank';
  paymentAddress: string; // UPI ID or Bank Account No + IFSC
}

export interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'bonus' | 'daily_reward'; // Added 'daily_reward'
  amount: number;
  date: number;
  status: 'pending' | 'approved' | 'rejected';
  utr?: string; // Reference number for recharges
  userId?: string; // For Admin view
  userName?: string; // For Admin view
  withdrawalDetails?: WithdrawalDetails; // For Withdrawals
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  inviteCode?: string | null;
  address?: string | null; 
  lastDailyBonus?: number; 
  lastIncomeUpdate?: number; 
  balance: number;
  spin_balance: number;
  
  // New: Daily Reward Stacking System
  rewardDailyRate?: number; // Accumulated Daily Income from Spins
  rewardEndDate?: number;   // When the 11-day cycle ends
  lastRewardClaim?: number; // Timestamp of last claim
  
  totalEarning: number;
  todayEarning: number;
  investments?: Record<string, Investment>;
  transactions?: Record<string, Transaction>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  duration: number;
  totalRevenue: number;
  image: string; 
}

export interface SupportSettings {
  whatsapp: string;
  telegram: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  language: 'en' | 'hi'; 
  setLanguage: (lang: 'en' | 'hi') => void; 
  upiId: string; 
  websiteUrl: string; 
  supportSettings: SupportSettings; 
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, inviteCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  buyProduct: (product: Product) => Promise<void>;
  requestRecharge: (amount: number, utr: string) => Promise<void>;
  requestWithdraw: (amount: number, details: WithdrawalDetails) => Promise<void>;
  updateUpiId: (newUpiId: string) => Promise<void>; 
  updateSupportSettings: (settings: SupportSettings) => Promise<void>; 
  updateWebsiteUrl: (url: string) => Promise<void>; 
  
  // Feature Functions
  claimDailyBonus: () => Promise<boolean>; 
  updateUserAddress: (address: string) => Promise<void>;
  spinWheel: () => Promise<number>; // Returns the winning amount (Daily Rate increase)
  claimRewardIncome: () => Promise<string>; // New: Claim accumulated daily reward

  // New Admin Functions
  approveTransaction: (txId: string, userId: string, type: 'recharge' | 'withdraw', amount: number) => Promise<void>;
  rejectTransaction: (txId: string, userId: string, type: 'recharge' | 'withdraw') => Promise<void>;
  refreshAdminData: () => Promise<void>; 
  adminRechargeRequests: Transaction[];
  adminWithdrawRequests: Transaction[];
  adminUsers: User[]; 
}

export enum AuthView {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD'
}
