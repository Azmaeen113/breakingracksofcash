import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { getSeasonLeaderboard, getAllTimeLeaderboard } from '@/services/firestore';
import { getUserLeague } from '@/config/leagues';
import { SEASON_PRIZES } from '@/config/constants';
import type { LeaderboardEntry } from '@/types';
import { FaTrophy, FaMedal, FaCrown, FaFire } from 'react-icons/fa';

const RANK_ICONS = [FaCrown, FaMedal, FaMedal];
const RANK_COLORS = ['text-cyber-gold', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const { user, userId, season } = useUser();
  const [tab, setTab] = useState<'season' | 'alltime'>('season');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = tab === 'season' && season
          ? await getSeasonLeaderboard(season.id, 50)
          : await getAllTimeLeaderboard(50);
        setEntries(data);
      } catch {
        setEntries([]);
      }
      setLoading(false);
    };
    load();
  }, [tab, season]);

  const getUserRank = () => {
    const idx = entries.findIndex(e => e.userId === userId);
    return idx >= 0 ? idx + 1 : null;
  };

  const getPrize = (rank: number): number => {
    const tier = SEASON_PRIZES.find(p => rank >= p.rankStart && rank <= p.rankEnd);
    return tier?.prize || 0;
  };

  const myRank = getUserRank();

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
        {season && tab === 'season' && (
          <p className="text-[10px] text-gray-500 mt-1">{season.name}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['season', 'alltime'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-orbitron text-xs transition-all ${
              tab === t
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                : 'bg-cyber-dark/50 text-gray-500 border border-gray-700/30'
            }`}
          >
            {t === 'season' ? 'Season' : 'All Time'}
          </button>
        ))}
      </div>

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
              <p className="text-[10px] text-gray-500 flex items-center gap-1"><img src={getUserLeague(user.cashBalance).image} alt="" className="w-3 h-3 inline object-contain" /> {getUserLeague(user.cashBalance).name}</p>
            </div>
            <div className="text-right">
              <p className="font-orbitron text-sm text-cyber-gold">
                {(tab === 'season' ? user.seasonCash : user.cashBalance).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">CASH</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prize pool (season tab) */}
      {tab === 'season' && (
        <div className="glass-card p-4">
          <h3 className="font-orbitron text-[10px] text-gray-500 tracking-widest mb-3">PRIZE POOL (TOKENS)</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            {SEASON_PRIZES.slice(0, 5).map((tier, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[10px] text-gray-500">#{tier.rankStart}</p>
                <p className="font-orbitron text-xs text-cyber-gold">{tier.prize}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
            const league = getUserLeague(entry.cash);
            const RankIcon = rank <= 3 ? RANK_ICONS[rank - 1] : null;
            const prize = tab === 'season' ? getPrize(rank) : 0;

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
                      {entry.username || entry.userId.slice(-8)}
                    </p>
                  </div>
                  {entry.gamesPlayed > 0 && (
                    <p className="text-[10px] text-gray-600">{entry.gamesPlayed} games</p>
                  )}
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="font-orbitron text-xs text-white">{entry.cash.toLocaleString()}</p>
                  {prize > 0 && (
                    <p className="text-[10px] text-cyber-gold flex items-center justify-end gap-1">
                      <FaFire className="text-[8px]" /> {prize} TKN
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
