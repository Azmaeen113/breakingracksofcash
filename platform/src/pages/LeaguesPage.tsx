import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { LEAGUES, getUserLeague, getLeagueProgress } from '@/config/leagues';
import { FaBolt, FaLock, FaCheckCircle } from 'react-icons/fa';

export default function LeaguesPage() {
  const { user } = useUser();
  if (!user) return null;

  const currentLeague = getUserLeague(user.seasonCash);
  const currentIndex = LEAGUES.findIndex(l => l.id === currentLeague.id);
  const progress = getLeagueProgress(user.seasonCash);

  return (
    <div className="px-4 pb-28 space-y-5">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Header */}
      <div className="text-center">
        <h1 className="font-orbitron text-lg text-white">Leagues</h1>
        <p className="text-xs text-gray-500">Climb the ranks to earn more energy & rewards</p>
      </div>

      {/* Current league card */}
      <div className="glass-card p-5 border border-cyber-cyan/30">
        <div className="flex items-center gap-4">
          <img src={currentLeague.image} alt={currentLeague.name} className="w-16 h-16 object-contain drop-shadow-lg" />
          <div className="flex-1">
            <p className="font-orbitron text-sm" style={{ color: currentLeague.color }}>{currentLeague.name}</p>
            <p className="text-[10px] text-gray-500">{user.seasonCash.toLocaleString()} / {currentLeague.maxCash === Infinity ? '∞' : currentLeague.maxCash.toLocaleString()} CASH</p>
            <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-pink rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* All leagues */}
      <div className="space-y-3">
        {LEAGUES.map((league, idx) => {
          const isCurrent = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          const isLocked = idx > currentIndex;

          return (
            <motion.div
              key={league.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.04 }}
              className={`glass-card p-4 flex items-center gap-4 ${
                isCurrent ? 'border border-cyber-cyan/40 glow-cyan' :
                isCompleted ? 'border border-green-500/20' :
                'opacity-50'
              }`}
            >
              {/* League image */}
              <img src={league.image} alt={league.name} className="w-12 h-12 object-contain" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-orbitron text-xs" style={{ color: league.color }}>{league.name}</p>
                  {isCurrent && <span className="text-[8px] bg-cyber-cyan/20 text-cyber-cyan px-2 py-0.5 rounded-full">CURRENT</span>}
                  {isCompleted && <FaCheckCircle className="text-green-400 text-xs" />}
                  {isLocked && <FaLock className="text-gray-600 text-[10px]" />}
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {league.minCash.toLocaleString()} - {league.maxCash === Infinity ? '∞' : league.maxCash.toLocaleString()} CASH
                </p>
              </div>

              {/* Energy */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-cyber-cyan">
                  <FaBolt className="text-[10px]" />
                  <span className="font-orbitron text-xs">{league.energyPerDay}</span>
                </div>
                <p className="text-[8px] text-gray-600">per day</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
