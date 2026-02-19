import {
  collection, doc, getDoc, getDocs, updateDoc, deleteDoc,
  query, orderBy, limit, where, setDoc, addDoc,
  Timestamp, writeBatch, getCountFromServer
} from 'firebase/firestore';
import { db } from './firebase';

// ── Users ──────────────────────────────────────────────────────
export async function getAllUsers(maxCount = 200) {
  const q = query(collection(db, 'users'), orderBy('cashBalance', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  let q;
  if (status) {
    q = query(collection(db, 'paymentRequests'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(100));
  } else {
    q = query(collection(db, 'paymentRequests'), orderBy('createdAt', 'desc'), limit(100));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  const q = query(collection(db, 'seasons'), orderBy('startDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── VIP Management ────────────────────────────────────────────
export async function getActiveVipUsers() {
  const q = query(collection(db, 'users'), where('vipTier', '>', 0), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function adminSetVip(userId: string, tier: number, days: number) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await updateDoc(doc(db, 'users', userId), {
    vipTier: tier,
    vipExpiresAt: Timestamp.fromDate(expiresAt),
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
  const q = query(collection(db, 'adminActions'), orderBy('createdAt', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
