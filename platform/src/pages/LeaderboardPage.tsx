import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { getWeeklyLeaderboard, getMonthlyLeaderboard } from '@/services/firestore';
import { getUserLeague } from '@/config/leagues';
import { WEEKLY_PRIZES, MONTHLY_PRIZES } from '@/config/constants';
import type { LeaderboardEntry, PrizeTier } from '@/types';
import { FaTrophy, FaMedal, FaCrown, FaFire, FaLock, FaStar } from 'react-icons/fa';

const RANK_ICONS = [FaCrown, FaMedal, FaMedal];
const RANK_COLORS = ['text-cyber-gold', 'text-gray-300', 'text-amber-600'];

function getNextSundayMidnight(): Date {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function formatTimeLeft(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Resetting...';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  return `${h}h ${m}m left`;
}

export default function LeaderboardPage() {
  const { user, userId, refreshUser } = useUser();
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  const prizes = tab === 'weekly' ? WEEKLY_PRIZES : MONTHLY_PRIZES;
  const isPremium = user?.isPremium || false;

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const target = tab === 'weekly' ? getNextSundayMidnight() : getNextMonthStart();
      setTimeLeft(formatTimeLeft(target));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [tab]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Refresh user data so local balance stays in sync with server
        await refreshUser();
        const data = tab === 'weekly'
          ? await getWeeklyLeaderboard(50)
          : await getMonthlyLeaderboard(50);
        setEntries(data);
      } catch {
        setEntries([]);
      }
      setLoading(false);
    };
    load();
  }, [tab]);

  const getUserRank = () => {
    const idx = entries.findIndex(e => e.userId === userId);
    return idx >= 0 ? idx + 1 : null;
  };

  const getPrize = (rank: number, prizeTiers: PrizeTier[]): number => {
    const tier = prizeTiers.find(p => rank >= p.rankStart && rank <= p.rankEnd);
    return tier?.prize || 0;
  };

  const myRank = getUserRank();

  // Monthly rewards: only premium players eligible
  // Weekly rewards: all players eligible
  const canWinRewards = tab === 'weekly' ? true : isPremium;

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="font-orbitron text-lg text-white flex items-center justify-center gap-2">
          <FaTrophy className="text-cyber-gold" />
          Leaderboard
        </h1>
        <p className="text-[10px] text-gray-500 mt-1">
          {tab === 'weekly' ? 'Resets every Sunday' : 'Resets every 1st of the month'} &bull; {timeLeft}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['weekly', 'monthly'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-orbitron text-xs transition-all ${
              tab === t
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                : 'bg-cyber-dark/50 text-gray-500 border border-gray-700/30'
            }`}
          >
            {t === 'weekly' ? '🏆 Weekly' : '👑 Monthly'}
          </button>
        ))}
      </div>

      {/* Monthly premium notice */}
      {tab === 'monthly' && !isPremium && (
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-3 border border-cyber-pink/30 flex items-center gap-3"
        >
          <FaLock className="text-cyber-pink flex-shrink-0" />
          <div>
            <p className="text-[11px] text-cyber-pink font-orbitron">Premium Only Rewards</p>
            <p className="text-[10px] text-gray-500">
              Purchase any item from the Shop to unlock monthly leaderboard rewards
            </p>
          </div>
        </motion.div>
      )}

      {tab === 'weekly' && (
        <div className="glass-card p-3 border border-green-500/20 flex items-center gap-3">
          <FaStar className="text-green-400 flex-shrink-0" />
          <p className="text-[10px] text-gray-400">
            All players are eligible for weekly rewards!
          </p>
        </div>
      )}

      {/* My rank card */}
      {myRank && user && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-4 border border-cyber-cyan/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyber-cyan/10 flex items-center justify-center font-orbitron text-sm text-cyber-cyan">
              #{myRank}
            </div>
            <div className="flex-1">
              <p className="font-orbitron text-xs text-white">You</p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <img src={getUserLeague(user.seasonCash).image} alt="" className="w-3 h-3 inline object-contain" />
                {getUserLeague(user.seasonCash).name}
                {isPremium && <span className="text-cyber-gold ml-1">★ Premium</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-sm text-cyber-gold">
                {(tab === 'weekly' ? (user.weeklyCash || 0) : (user.monthlyCash || 0)).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">CASH</p>
            </div>
          </div>
          {!canWinRewards && (
            <p className="text-[10px] text-cyber-pink mt-2 flex items-center gap-1">
              <FaLock className="text-[8px]" /> Upgrade to premium to win monthly rewards
            </p>
          )}
        </motion.div>
      )}

      {/* Prize pool */}
      <div className="glass-card p-4">
        <h3 className="font-orbitron text-[10px] text-gray-500 tracking-widest mb-3">
          {tab === 'weekly' ? 'WEEKLY' : 'MONTHLY'} PRIZE POOL (TOKENS)
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {prizes.slice(0, 5).map((tier, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] text-gray-500">
                {tier.rankStart === tier.rankEnd ? `#${tier.rankStart}` : `#${tier.rankStart}-${tier.rankEnd}`}
              </p>
              <p className="font-orbitron text-xs text-cyber-gold">{tier.prize}</p>
            </div>
          ))}
        </div>
        {tab === 'monthly' && (
          <p className="text-[9px] text-cyber-pink mt-2 text-center">
            * Monthly rewards are only for premium (paid) players
          </p>
        )}
      </div>

      {/* Leaderboard list */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin mx-auto" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">No data yet</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const rank = idx + 1;
            const isMe = entry.userId === userId;
            const league = getUserLeague(entry.seasonCash);
            const RankIcon = rank <= 3 ? RANK_ICONS[rank - 1] : null;
            const prize = getPrize(rank, prizes);
            // Monthly: only premium players get rewards
            const getsReward = tab === 'weekly' ? prize > 0 : (prize > 0 && entry.isPremium);

            return (
              <motion.div
                key={entry.userId}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className={`glass-card p-3 flex items-center gap-3 ${
                  isMe ? 'border border-cyber-cyan/30' : ''
                } ${rank <= 3 ? 'border-cyber-gold/20' : ''}`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {RankIcon ? (
                    <RankIcon className={`text-lg mx-auto ${RANK_COLORS[rank - 1]}`} />
                  ) : (
                    <span className="font-orbitron text-xs text-gray-500">{rank}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <img src={league.image} alt={league.name} className="w-4 h-4 object-contain" />
                    <p className={`font-orbitron text-xs truncate ${isMe ? 'text-cyber-cyan' : 'text-white'}`}>
                      {isMe ? (user?.odl_username || entry.username || entry.userId.slice(-8)) : (entry.username || entry.userId.slice(-8))}
                    </p>
                    {entry.isPremium && (
                      <span className="text-cyber-gold text-[8px]">★</span>
                    )}
                  </div>
                  {entry.gamesPlayed > 0 && (
                    <p className="text-[10px] text-gray-600">{entry.gamesPlayed} games</p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="font-orbitron text-xs text-white">{entry.cash.toLocaleString()}</p>
                  {getsReward ? (
                    <p className="text-[10px] text-cyber-gold flex items-center justify-end gap-1">
                      <FaFire className="text-[8px]" /> {prize} TKN
                    </p>
                  ) : (tab === 'monthly' && prize > 0 && !entry.isPremium) ? (
                    <p className="text-[10px] text-gray-600 flex items-center justify-end gap-1">
                      <FaLock className="text-[8px]" /> {prize} TKN
                    </p>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
