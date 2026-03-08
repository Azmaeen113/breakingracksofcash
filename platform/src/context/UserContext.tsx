import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { UserData, SeasonData } from '@/types';
import { getUser, createUser, updateUser, checkAndResetEnergy, getActiveSeason, isUsernameTaken } from '@/services/firestore';
import { getUserLeague } from '@/config/leagues';
import { getVipMultiplier, getTapDamage } from '@/config/vipPlans';
import type { League } from '@/types';
import { generateRandomName } from '@/config/names';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';

interface UserContextValue {
  user: UserData | null;
  userId: string;
  loading: boolean;
  league: League;
  vipMultiplier: number;
  tapDamage: number;
  season: SeasonData | null;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}

// Generate or retrieve persistent user ID for this browser
function getOrCreateUserId(): string {
  let id = localStorage.getItem('br4c_userId');
  if (!id) {
    id = 'web_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('br4c_userId', id);
  }
  return id;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('br4c_onboarded') === '1');
  const [authReady, setAuthReady] = useState(false);
  const userId = useRef(getOrCreateUserId()).current;

  // Sign in anonymously for Firestore permissions
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setAuthReady(true);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed:', err);
          // Still allow the app to load even if auth fails
          setAuthReady(true);
        });
      }
    });
    return unsub;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      let userData = await getUser(userId);
      if (!userData) {
        // Generate a unique random name (retry up to 5 times on collision)
        let randomName = generateRandomName();
        for (let i = 0; i < 5; i++) {
          const taken = await isUsernameTaken(randomName);
          if (!taken) break;
          randomName = generateRandomName();
        }
        await createUser(userId, {
          odl_id: userId,
          odl_first_name: randomName,
          odl_username: randomName,
        });
        userData = await getUser(userId);
      }
      if (userData) {
        // Check VIP expiry
        if (userData.vipTier > 0 && userData.vipExpiresAt) {
          if (userData.vipExpiresAt.toMillis() < Date.now()) {
            await updateUser(userId, { vipTier: 0, vipExpiresAt: null });
            userData.vipTier = 0;
            userData.vipExpiresAt = null;
          }
        }
        // Check energy reset
        const energy = await checkAndResetEnergy(userId, userData);
        userData.gameEnergy = energy;
      }
      setUser(userData);
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Only load user data after Firebase Auth is ready
  useEffect(() => {
    if (!authReady) return;
    refreshUser();
    getActiveSeason().then(setSeason).catch(() => setSeason(null));
  }, [authReady, refreshUser]);

  const handleSetOnboarded = (v: boolean) => {
    setOnboarded(v);
    if (v) localStorage.setItem('br4c_onboarded', '1');
  };

  const league = getUserLeague(user?.seasonCash ?? 0);
  const vipMultiplier = getVipMultiplier(user?.vipTier ?? 0);
  const tapDamage = getTapDamage(user?.vipTier ?? 0);

  return (
    <UserContext.Provider value={{ user, userId, loading, league, vipMultiplier, tapDamage, season, refreshUser, setUser, onboarded, setOnboarded: handleSetOnboarded }}>
      {children}
    </UserContext.Provider>
  );
}
