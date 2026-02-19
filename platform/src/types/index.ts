import { Timestamp } from 'firebase/firestore';

// ─── User ───────────────────────────────────────────
export interface UserData {
  odl_id: string;
  odl_first_name: string;
  odl_username: string;
  cashBalance: number;
  tokenBalance: number;
  seasonCash: number;
  gamesPlayed: number;
  gameEnergy: number;
  highScore: number;
  totalScore: number;
  tapCount: number;
  tapCycleProgress: number;
  tapCooldownUntil: number | null;
  cooldownResets: number;
  vipTier: number; // 0=Free, 1=Bronze, 2=Silver, 3=Gold
  vipExpiresAt: Timestamp | null;
  dailyRewardDay: number;
  lastDailyReward: Timestamp | null;
  completedTasks: string[];
  referredBy: string | null;
  referralCount: number;
  walletAddress: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastEnergyReset: Timestamp | null;
}

// ─── Transaction ────────────────────────────────────
export interface TransactionData {
  id?: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: Timestamp;
}

// ─── Season ─────────────────────────────────────────
export interface SeasonData {
  id: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'ended' | 'upcoming';
  createdAt: Timestamp;
}

// ─── Payment Request ────────────────────────────────
export interface PaymentRequest {
  id?: string;
  userId: string;
  amount: number;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  processedAt: Timestamp | null;
  adminNote?: string;
}

// ─── VIP Purchase ───────────────────────────────────
export interface VipPurchase {
  id?: string;
  userId: string;
  tier: number;
  amountUSD?: number;
  purchasedAt: Timestamp;
  expiresAt: Timestamp;
  status: 'pending' | 'confirmed' | 'expired';
}

// ─── Admin Action ───────────────────────────────────
export interface AdminAction {
  id?: string;
  adminId: string;
  action: string;
  details: string;
  createdAt: Timestamp;
}

// ─── League ─────────────────────────────────────────
export interface League {
  id: string;
  name: string;
  minCash: number;
  maxCash: number;
  energyPerDay: number;
  color: string;
  gradient: string;
  icon: string;
  image: string;
}

// ─── Task ───────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'social' | 'referral';
  icon: string;
  link?: string;
  referralCount?: number;
}

// ─── VIP Plan ───────────────────────────────────────
export interface VipPlan {
  tier: number;
  name: string;
  priceUSD: number;
  durationDays: number;
  benefits: string[];
  cooldownItems: number;
  color: string;
  gradient: string;
}

// ─── Daily Reward ───────────────────────────────────
export interface DailyReward {
  day: number;
  reward: number;
}

// ─── Leaderboard Entry ──────────────────────────────
export interface LeaderboardEntry {
  userId: string;
  username: string;
  cash: number;
  gamesPlayed: number;
  vipTier: number;
  rank?: number;
}

// ─── Prize Tier ─────────────────────────────────────
export interface PrizeTier {
  rankStart: number;
  rankEnd: number;
  prize: number;
}
