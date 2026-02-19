import type { DailyReward, PrizeTier } from '@/types';

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: 100 },
  { day: 2, reward: 200 },
  { day: 3, reward: 300 },
  { day: 4, reward: 400 },
  { day: 5, reward: 500 },
  { day: 6, reward: 600 },
  { day: 7, reward: 10000 },
];

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

export const TAP_CYCLE_TOTAL = 1000;
export const TAP_CYCLE_BONUS = 1000;
export const TAP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24h
export const COOLDOWN_RESET_REDUCTION_MS = 12 * 60 * 60 * 1000; // 12h
export const REFERRAL_REWARD = 1000;
export const CASH_TO_TOKEN_RATE = 10; // 10 CASH = 1 token
export const MIN_WITHDRAWAL = 100;
export const WITHDRAWAL_COOLDOWN_DAYS = 3;
