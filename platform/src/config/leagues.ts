import type { League } from '@/types';

export const LEAGUES: League[] = [
  { id: 'wood',        name: 'Wood',        minCash: 0,          maxCash: 4999,       energyPerDay: 2, color: '#8B6914', gradient: 'from-amber-900 to-yellow-800',     icon: '🪵', image: '/images/leagues/wood.png' },
  { id: 'bronze',      name: 'Bronze',      minCash: 5000,       maxCash: 49999,      energyPerDay: 2, color: '#CD7F32', gradient: 'from-orange-700 to-amber-600',     icon: '🥉', image: '/images/leagues/bronze.png' },
  { id: 'silver',      name: 'Silver',      minCash: 50000,      maxCash: 249999,     energyPerDay: 2, color: '#C0C0C0', gradient: 'from-gray-400 to-gray-300',        icon: '🥈', image: '/images/leagues/silver.png' },
  { id: 'gold',        name: 'Gold',        minCash: 250000,     maxCash: 499999,     energyPerDay: 3, color: '#FFD700', gradient: 'from-yellow-500 to-amber-400',     icon: '🥇', image: '/images/leagues/gold.png' },
  { id: 'platinum',    name: 'Platinum',    minCash: 500000,     maxCash: 999999,     energyPerDay: 3, color: '#E5E4E2', gradient: 'from-gray-200 to-white',           icon: '💎', image: '/images/leagues/platinum.png' },
  { id: 'diamond',     name: 'Diamond',     minCash: 1000000,    maxCash: 4999999,    energyPerDay: 4, color: '#B9F2FF', gradient: 'from-cyan-300 to-blue-200',        icon: '💠', image: '/images/leagues/diamond.png' },
  { id: 'master',      name: 'Master',      minCash: 5000000,    maxCash: 9999999,    energyPerDay: 4, color: '#B026FF', gradient: 'from-purple-500 to-violet-400',    icon: '👑', image: '/images/leagues/master.png' },
  { id: 'grandmaster', name: 'Grandmaster', minCash: 10000000,   maxCash: 24999999,   energyPerDay: 5, color: '#FF6B35', gradient: 'from-orange-500 to-red-500',       icon: '⚔️', image: '/images/leagues/grandmaster.png' },
  { id: 'legendary',   name: 'Legendary',   minCash: 25000000,   maxCash: 49999999,   energyPerDay: 5, color: '#FFD700', gradient: 'from-yellow-400 to-orange-400',    icon: '🌟', image: '/images/leagues/legendary.png' },
  { id: 'mythic',      name: 'Mythic',      minCash: 50000000,   maxCash: 99999999,   energyPerDay: 6, color: '#FF1493', gradient: 'from-pink-500 to-purple-500',      icon: '🔮', image: '/images/leagues/mythic.png' },
  { id: 'elite',       name: 'Elite',       minCash: 100000000,  maxCash: Infinity,   energyPerDay: 6, color: '#FF1744', gradient: 'from-red-500 to-orange-500',       icon: '🔥', image: '/images/leagues/elite.png' },
];

export function getUserLeague(seasonCash: number): League {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (seasonCash >= LEAGUES[i].minCash) return LEAGUES[i];
  }
  return LEAGUES[0];
}

export function getLeagueProgress(seasonCash: number): number {
  const league = getUserLeague(seasonCash);
  if (league.maxCash === Infinity) return 100;
  const range = league.maxCash - league.minCash;
  return Math.min(100, ((seasonCash - league.minCash) / range) * 100);
}
