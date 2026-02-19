import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { UserData, SeasonData } from '@/types';
import { getUser, createUser, updateUser, checkAndResetEnergy, getActiveSeason } from '@/services/firestore';
import { getUserLeague } from '@/config/leagues';
import { getVipMultiplier, getTapDamage } from '@/config/vipPlans';
import type { League } from '@/types';

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

// Generate or retrieve a persistent anonymous user ID
function getOrCreateUserId(): string {
  let id = localStorage.getItem('br4c_userId');
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('br4c_userId', id);
  }
  return id;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<SeasonData | null>(null);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('br4c_onboarded') === '1');
  const userId = useRef(getOrCreateUserId()).current;

  const refreshUser = useCallback(async () => {
    try {
      let userData = await getUser(userId);
      if (!userData) {
        await createUser(userId, {
          odl_id: userId,
          odl_first_name: 'Player',
          odl_username: 'player_' + userId.slice(-6),
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

  useEffect(() => {
    refreshUser();
    getActiveSeason().then(setSeason).catch(() => setSeason(null));
  }, [refreshUser]);

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
