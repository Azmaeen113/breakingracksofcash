import {
  collection, doc, getDoc, getDocs, updateDoc, deleteDoc,
  query, limit, setDoc, addDoc,
  Timestamp, writeBatch, getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

// ── Users ──────────────────────────────────────────────────────
export async function getAllUsers(maxCount = 200) {
  const q = query(collection(db, 'users'), limit(maxCount));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => (b.cashBalance || 0) - (a.cashBalance || 0));
  return results;
}

export async function searchUsers(searchTerm: string) {
  // Search by userId (document ID) or username
  const q = query(collection(db, 'users'), limit(50));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter((u: any) =>
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.odl_username && u.odl_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.odl_first_name && u.odl_first_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

export async function getUserById(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function adminUpdateUser(userId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function adminDeleteUser(userId: string) {
  await deleteDoc(doc(db, 'users', userId));
}

export async function getTotalUserCount() {
  const snap = await getCountFromServer(collection(db, 'users'));
  return snap.data().count;
}

// ── Payment Requests ──────────────────────────────────────────
export async function getAllPaymentRequests(status?: string) {
  // Fetch all payment requests and filter/sort client-side to avoid composite index requirements
  const q = query(collection(db, 'paymentRequests'), limit(500));
  const snap = await getDocs(q);
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  // Filter by status client-side
  if (status) {
    results = results.filter((r: any) => r.status === status);
  }
  // Sort by createdAt descending client-side
  results.sort((a: any, b: any) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results.slice(0, 100);
}

export async function updatePaymentRequest(requestId: string, status: string, adminNote?: string) {
  await updateDoc(doc(db, 'paymentRequests', requestId), {
    status,
    adminNote: adminNote || '',
    processedAt: Timestamp.now(),
  });
}

// ── Seasons ───────────────────────────────────────────────────
export async function getAllSeasons() {
  const q = query(collection(db, 'seasons'), limit(100));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => {
    const aTime = a.startDate?.toMillis?.() || 0;
    const bTime = b.startDate?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results;
}

export async function createSeason(data: { name: string; startDate: Date; endDate: Date }) {
  await addDoc(collection(db, 'seasons'), {
    name: data.name,
    startDate: Timestamp.fromDate(data.startDate),
    endDate: Timestamp.fromDate(data.endDate),
    status: 'active',
    createdAt: Timestamp.now(),
  });
}

export async function updateSeason(seasonId: string, data: Record<string, any>) {
  await updateDoc(doc(db, 'seasons', seasonId), data);
}

// ── Transactions ──────────────────────────────────────────────
export async function getAllTransactions(maxCount = 100) {
  const q = query(collection(db, 'transactions'), limit(maxCount));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results;
}

// ── VIP Management ────────────────────────────────────────────
export async function getActiveVipUsers() {
  // Fetch users and filter client-side to avoid composite index on vipTier
  const q = query(collection(db, 'users'), limit(500));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as any))
    .filter((u: any) => (u.vipTier || 0) > 0);
}

export async function adminSetVip(userId: string, tier: number, days: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await updateDoc(doc(db, 'users', userId), {
    vipTier: tier,
    vipExpiresAt: Timestamp.fromDate(expiresAt),
    isPremium: true,
    updatedAt: Timestamp.now(),
  });
}

export async function adminRemoveVip(userId: string) {
  await updateDoc(doc(db, 'users', userId), {
    vipTier: 0,
    vipExpiresAt: null,
    updatedAt: Timestamp.now(),
  });
}

// ── Subscription / Purchase History ───────────────────────────
export async function getAllVipPurchases(maxCount = 200) {
  const q = query(collection(db, 'vipPurchases'), limit(maxCount));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => {
    const aTime = a.purchasedAt?.toMillis?.() || 0;
    const bTime = b.purchasedAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results;
}

export async function getAllEnergyPurchases(maxCount = 200) {
  const q = query(collection(db, 'energyPurchases'), limit(maxCount));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => {
    const aTime = a.purchasedAt?.toMillis?.() || 0;
    const bTime = b.purchasedAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results;
}

export async function adminGrantEnergy(userId: string, amount: number) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('User not found');
  const current = snap.data().gameEnergy || 0;
  await updateDoc(userRef, {
    gameEnergy: current + amount,
    updatedAt: Timestamp.now(),
  });
}

// ── Admin Actions Log ─────────────────────────────────────────
export async function logAdminAction(action: string, details: string, adminId: string) {
  await addDoc(collection(db, 'adminActions'), {
    action,
    details,
    adminId,
    createdAt: Timestamp.now(),
  });
}

export async function getAdminActions(maxCount = 100) {
  const q = query(collection(db, 'adminActions'), limit(maxCount));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
  results.sort((a: any, b: any) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
  return results;
}

// ── Stats ─────────────────────────────────────────────────────
export async function getDashboardStats() {
  const userCount = await getTotalUserCount();
  const pendingPayments = await getAllPaymentRequests('pending');
  const vipUsers = await getActiveVipUsers();
  
  // Get total cash in circulation
  const usersSnap = await getDocs(query(collection(db, 'users'), limit(1000)));
  let totalCash = 0;
  let totalTokens = 0;
  let totalGamesPlayed = 0;
  usersSnap.docs.forEach(d => {
    const data = d.data();
    totalCash += data.cashBalance || 0;
    totalTokens += data.tokenBalance || 0;
    totalGamesPlayed += data.gamesPlayed || 0;
  });

  return {
    totalUsers: userCount,
    pendingPayments: pendingPayments.length,
    activeVips: vipUsers.length,
    totalCash,
    totalTokens,
    totalGamesPlayed,
  };
}

// ── Bulk Operations ───────────────────────────────────────────
export async function bulkResetSeasonCash() {
  const batch = writeBatch(db);
  const snap = await getDocs(query(collection(db, 'users'), limit(500)));
  snap.docs.forEach(d => {
    batch.update(d.ref, { seasonCash: 0 });
  });
  await batch.commit();
}

export async function bulkAddCash(amount: number) {
  const batch = writeBatch(db);
  const snap = await getDocs(query(collection(db, 'users'), limit(500)));
  snap.docs.forEach(d => {
    const current = d.data().cashBalance || 0;
    batch.update(d.ref, { cashBalance: current + amount });
  });
  await batch.commit();
}
