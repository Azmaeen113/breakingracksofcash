import type { DailyReward, PrizeTier } from '@/types';

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: 50 },
  { day: 2, reward: 100 },
  { day: 3, reward: 150 },
  { day: 4, reward: 200 },
  { day: 5, reward: 250 },
  { day: 6, reward: 350 },
  { day: 7, reward: 500 },
];

// TON receiver wallet for all payments
export const TON_RECEIVER_WALLET = 'UQCbRCf4OS6zeo3HtwVlq9Sg6ahV72Ux4WqlPpcYLpNlUcyl';

// EVM receiver wallet (BSC — receives USDT BEP-20)
export const EVM_RECEIVER_WALLET = '0x73F82ecf7345De5d4509be3b418818d00b2cBa1C';

// Base energy per day (free users)
export const BASE_ENERGY_PER_DAY = 3;

// BONUS energy by VIP tier [free, bronze, silver, gold]
// Added ON TOP of league energy (not absolute)
export const VIP_ENERGY_BONUS = [0, 5, 10, 20];

// Max energy cap per day (Gold VIP)
export const MAX_ENERGY_PER_DAY = 28;

export const SEASON_PRIZES: PrizeTier[] = [
  { rankStart: 1,  rankEnd: 1,  prize: 1000 },
  { rankStart: 2,  rankEnd: 2,  prize: 500 },
  { rankStart: 3,  rankEnd: 3,  prize: 250 },
  { rankStart: 4,  rankEnd: 4,  prize: 200 },
  { rankStart: 5,  rankEnd: 5,  prize: 150 },
  { rankStart: 6,  rankEnd: 6,  prize: 120 },
  { rankStart: 7,  rankEnd: 7,  prize: 110 },
  { rankStart: 8,  rankEnd: 8,  prize: 100 },
  { rankStart: 9,  rankEnd: 9,  prize: 90 },
  { rankStart: 10, rankEnd: 10, prize: 70 },
  { rankStart: 11, rankEnd: 20, prize: 60 },
  { rankStart: 21, rankEnd: 30, prize: 30 },
  { rankStart: 31, rankEnd: 40, prize: 15 },
  { rankStart: 41, rankEnd: 50, prize: 5 },
];

export const WEEKLY_PRIZES: PrizeTier[] = [
  { rankStart: 1,  rankEnd: 1,  prize: 500 },
  { rankStart: 2,  rankEnd: 2,  prize: 300 },
  { rankStart: 3,  rankEnd: 3,  prize: 150 },
  { rankStart: 4,  rankEnd: 5,  prize: 100 },
  { rankStart: 6,  rankEnd: 10, prize: 50 },
  { rankStart: 11, rankEnd: 20, prize: 25 },
  { rankStart: 21, rankEnd: 50, prize: 10 },
];

export const MONTHLY_PRIZES: PrizeTier[] = [
  { rankStart: 1,  rankEnd: 1,  prize: 2000 },
  { rankStart: 2,  rankEnd: 2,  prize: 1000 },
  { rankStart: 3,  rankEnd: 3,  prize: 500 },
  { rankStart: 4,  rankEnd: 5,  prize: 300 },
  { rankStart: 6,  rankEnd: 10, prize: 150 },
  { rankStart: 11, rankEnd: 20, prize: 75 },
  { rankStart: 21, rankEnd: 50, prize: 25 },
];

export const TAP_CYCLE_TOTAL = 2500;
export const TAP_CYCLE_BONUS = 1000;
export const TAP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
export const COOLDOWN_RESET_REDUCTION_MS = 12 * 60 * 60 * 1000; // 12h
export const REFERRAL_REWARD = 25000; // 250 tokens at 100:1 ≈ $0.01 per referral
export const CASH_TO_TOKEN_RATE = 100; // 100 CASH = 1 token
export const MIN_WITHDRAWAL = 100;
export const WITHDRAWAL_COOLDOWN_DAYS = 3;
