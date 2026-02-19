import {
  doc, getDoc, setDoc, updateDoc, increment, collection,
  query, orderBy, limit, getDocs, addDoc, where, Timestamp,
  serverTimestamp, arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserData, TransactionData, PaymentRequest, SeasonData, LeaderboardEntry } from '@/types';
import { getUserLeague } from '@/config/leagues';
import { getVipMultiplier } from '@/config/vipPlans';
import { REFERRAL_REWARD, TAP_CYCLE_BONUS, TAP_COOLDOWN_MS, COOLDOWN_RESET_REDUCTION_MS, MIN_WITHDRAWAL, WITHDRAWAL_COOLDOWN_DAYS, CASH_TO_TOKEN_RATE } from '@/config/constants';

// ─── User CRUD ──────────────────────────────────────

export async function getUser(userId: string): Promise<UserData | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? (snap.data() as UserData) : null;
}

export async function createUser(userId: string, data: Partial<UserData>): Promise<void> {
  const league = getUserLeague(0);
  const now = Timestamp.now();
  const defaults: UserData = {
    odl_id: userId,
    odl_first_name: '',
    odl_username: '',
    cashBalance: 500, // Welcome bonus
    tokenBalance: 0,
    seasonCash: 0,
    gamesPlayed: 0,
    gameEnergy: league.energyPerDay,
    highScore: 0,
    totalScore: 0,
    tapCount: 0,
    tapCycleProgress: 0,
    tapCooldownUntil: null,
    cooldownResets: 0,
    vipTier: 0,
    vipExpiresAt: null,
    dailyRewardDay: 0,
    lastDailyReward: null,
    completedTasks: [],
    referredBy: null,
    referralCount: 0,
    walletAddress: null,
    createdAt: now,
    updatedAt: now,
    lastEnergyReset: now,
    ...data,
  };
  await setDoc(doc(db, 'users', userId), defaults);
}

export async function updateUser(userId: string, data: Partial<UserData>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, 'users', userId), { ...data, updatedAt: serverTimestamp() } as any);
}

// ─── Energy System ──────────────────────────────────

export async function checkAndResetEnergy(userId: string, user: UserData): Promise<number> {
  const now = new Date();
  const lastReset = user.lastEnergyReset?.toDate();
  if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
    const league = getUserLeague(user.seasonCash);
    await updateUser(userId, {
      gameEnergy: league.energyPerDay,
      lastEnergyReset: Timestamp.now(),
    } as any);
    return league.energyPerDay;
  }
  return user.gameEnergy;
}

export async function spendEnergy(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;
  const energy = await checkAndResetEnergy(userId, user);
  if (energy <= 0) return false;
  await updateDoc(doc(db, 'users', userId), { gameEnergy: increment(-1) });
  return true;
}

// ─── Game Score ─────────────────────────────────────

export async function addGameScore(userId: string, rawScore: number): Promise<number> {
  const user = await getUser(userId);
  if (!user) return 0;
  const multiplier = getVipMultiplier(user.vipTier);
  const finalScore = Math.floor(rawScore * multiplier);
  await updateDoc(doc(db, 'users', userId), {
    cashBalance: increment(finalScore),
    seasonCash: increment(finalScore),
    totalScore: increment(finalScore),
    gamesPlayed: increment(1),
    highScore: Math.max(user.highScore || 0, finalScore),
  });
  await logTransaction(userId, 'credit', finalScore, `Game score: ${rawScore} x${multiplier} = ${finalScore}`);
  return finalScore;
}

// ─── Tap-to-Earn ────────────────────────────────────

export async function processTapBatch(userId: string, taps: number, tapDamage: number): Promise<void> {
  const user = await getUser(userId);
  if (!user) return;
  if (user.tapCooldownUntil && Date.now() < user.tapCooldownUntil) return;

  const newProgress = Math.min(user.tapCycleProgress + (taps * tapDamage), 1000);
  const cashEarned = taps;
  const updates: Record<string, any> = {
    tapCycleProgress: newProgress,
    tapCount: increment(taps),
    cashBalance: increment(cashEarned),
    seasonCash: increment(cashEarned),
  };

  if (newProgress >= 1000) {
    updates.tapCycleProgress = 0;
    updates.tapCooldownUntil = Date.now() + TAP_COOLDOWN_MS;
    updates.cashBalance = increment(cashEarned + TAP_CYCLE_BONUS);
    updates.seasonCash = increment(cashEarned + TAP_CYCLE_BONUS);
    updates.cooldownResets = increment(1);
  }

  await updateDoc(doc(db, 'users', userId), updates);
}

export async function useCooldownReset(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  if (!user || user.cooldownResets <= 0 || !user.tapCooldownUntil) return false;

  const newEndTime = user.tapCooldownUntil - COOLDOWN_RESET_REDUCTION_MS;
  await updateDoc(doc(db, 'users', userId), {
    cooldownResets: increment(-1),
    tapCooldownUntil: newEndTime <= Date.now() ? null : newEndTime,
    tapCycleProgress: newEndTime <= Date.now() ? 0 : user.tapCycleProgress,
  });
  return true;
}

// ─── Tasks ──────────────────────────────────────────

export async function completeTask(userId: string, taskId: string, reward: number): Promise<boolean> {
  const user = await getUser(userId);
  if (!user || user.completedTasks.includes(taskId)) return false;

  await updateDoc(doc(db, 'users', userId), {
    completedTasks: arrayUnion(taskId),
    cashBalance: increment(reward),
    seasonCash: increment(reward),
  });
  await logTransaction(userId, 'credit', reward, `Task completed: ${taskId}`);
  return true;
}

// ─── Daily Rewards ──────────────────────────────────

export async function claimDailyReward(userId: string, day: number, reward: number): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;

  const now = new Date();
  const last = user.lastDailyReward?.toDate();
  if (last && now.toDateString() === last.toDateString()) return false;

  let newDay = 1;
  if (last) {
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newDay = user.dailyRewardDay >= 7 ? 1 : user.dailyRewardDay + 1;
    }
  }

  await updateDoc(doc(db, 'users', userId), {
    dailyRewardDay: newDay,
    lastDailyReward: Timestamp.now(),
    cashBalance: increment(reward),
    seasonCash: increment(reward),
  });
  await logTransaction(userId, 'credit', reward, `Daily reward day ${newDay}`);
  return true;
}

// ─── Referrals ──────────────────────────────────────

export async function getInvitations(userId: string): Promise<UserData[]> {
  const q = query(collection(db, 'users'), where('referredBy', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserData);
}

export async function processReferralRewards(userId: string): Promise<number> {
  const invitations = await getInvitations(userId);
  const user = await getUser(userId);
  if (!user) return 0;

  const alreadyRewarded = user.referralCount || 0;
  const diff = invitations.length - alreadyRewarded;
  if (diff <= 0) return 0;

  const reward = diff * REFERRAL_REWARD;
  await updateDoc(doc(db, 'users', userId), {
    referralCount: invitations.length,
    cashBalance: increment(reward),
    seasonCash: increment(reward),
  });
  await logTransaction(userId, 'credit', reward, `Referral reward for ${diff} new friends`);
  return reward;
}

// ─── Leaderboard ────────────────────────────────────

export async function getSeasonLeaderboard(seasonId: string, count = 50): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'users'), orderBy('seasonCash', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const data = d.data();
    return {
      userId: d.id,
      username: data.odl_username || data.odl_first_name || d.id.slice(-8),
      cash: data.seasonCash || 0,
      gamesPlayed: data.gamesPlayed || 0,
      vipTier: data.vipTier || 0,
      rank: i + 1,
    };
  });
}

export async function getAllTimeLeaderboard(count = 50): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'users'), orderBy('cashBalance', 'desc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const data = d.data();
    return {
      userId: d.id,
      username: data.odl_username || data.odl_first_name || d.id.slice(-8),
      cash: data.cashBalance || 0,
      gamesPlayed: data.gamesPlayed || 0,
      vipTier: data.vipTier || 0,
      rank: i + 1,
    };
  });
}

// ─── Wallet / Payment Requests ──────────────────────

export async function createPaymentRequest(userId: string, amount: number, walletAddress: string): Promise<string | null> {
  const user = await getUser(userId);
  if (!user) throw new Error('User not found');
  if (amount < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal: ${MIN_WITHDRAWAL} tokens`);
  if ((user.tokenBalance || 0) < amount) throw new Error('Insufficient token balance');

  // Check cooldown
  const recentQ = query(
    collection(db, 'paymentRequests'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const recent = await getDocs(recentQ);
  if (!recent.empty) {
    const last = recent.docs[0].data();
    const daysSince = (Date.now() - last.createdAt.toMillis()) / (1000 * 60 * 60 * 24);
    if (daysSince < WITHDRAWAL_COOLDOWN_DAYS) {
      throw new Error(`Please wait ${WITHDRAWAL_COOLDOWN_DAYS} days between withdrawals`);
    }
  }

  await updateDoc(doc(db, 'users', userId), { tokenBalance: increment(-amount) });
  const ref = await addDoc(collection(db, 'paymentRequests'), {
    userId,
    amount,
    walletAddress,
    status: 'pending',
    createdAt: Timestamp.now(),
    processedAt: null,
    adminNote: '',
  });
  await logTransaction(userId, 'debit', amount, `Withdrawal request: ${amount} tokens`);
  return ref.id;
}

export async function getUserPaymentRequests(userId: string): Promise<PaymentRequest[]> {
  const q = query(collection(db, 'paymentRequests'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRequest));
}

// ─── VIP ────────────────────────────────────────────

export async function activateVip(userId: string, tier: number, durationDays: number): Promise<void> {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000));
  const cooldownItems = [0, 2, 5, 10][tier] || 0;
  await updateDoc(doc(db, 'users', userId), {
    vipTier: tier,
    vipExpiresAt: expiresAt,
    cooldownResets: increment(cooldownItems),
  });
  await addDoc(collection(db, 'vipPurchases'), {
    userId,
    tier,
    purchasedAt: Timestamp.now(),
    expiresAt,
    status: 'confirmed',
  });
  await logTransaction(userId, 'credit', 0, `VIP Tier ${tier} activated for ${durationDays} days`);
}

// ─── Seasons ────────────────────────────────────────

export async function getActiveSeason(): Promise<SeasonData | null> {
  const q = query(collection(db, 'seasons'), where('status', '==', 'active'), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as SeasonData);
}

// ─── Transactions ───────────────────────────────────

export async function logTransaction(
  userId: string,
  type: 'credit' | 'debit',
  amount: number,
  description: string
): Promise<void> {
  await addDoc(collection(db, 'transactions'), {
    userId,
    type,
    amount,
    description,
    createdAt: Timestamp.now(),
  });
}

export async function getUserTransactions(userId: string, count = 50): Promise<TransactionData[]> {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TransactionData));
}
