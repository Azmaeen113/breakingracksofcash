import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import TapTarget from '@/components/TapTarget';
import DailyRewardModal from '@/components/DailyRewardModal';
import LeagueSlider from '@/components/LeagueSlider';
import { FaPlay, FaGift, FaBolt, FaCoins, FaGem } from 'react-icons/fa';

export default function HomePage() {
  const { user, league, vipMultiplier } = useUser();
  const navigate = useNavigate();
  const [showDaily, setShowDaily] = useState(false);

  if (!user) return null;

  const canClaimDaily = !user.lastDailyReward ||
    new Date().toDateString() !== user.lastDailyReward.toDate().toDateString();

  return (
    <div className="flex flex-col items-center gap-5 pb-28 px-4">
      {/* Banner */}
      <img src="/images/banner.png" alt="Breaking Racks 4 Cash" className="w-full rounded-2xl object-contain" />

      {/* Currency Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full glass-card p-5"
      >
        <div className="text-center space-y-1">
          <p className="text-[10px] font-orbitron text-gray-500 tracking-widest">YOUR BALANCE</p>
          <div className="flex items-center justify-center gap-2">
            <FaCoins className="text-cyber-gold text-2xl" />
            <span className="font-orbitron text-3xl font-bold text-white">
              {user.cashBalance.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-gray-500">CASH</p>
        </div>

        {/* Token balance */}
        <div className="mt-3 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <FaGem className="text-cyber-cyan text-xs" />
            <span className="text-gray-400">{user.tokenBalance.toFixed(2)} Tokens</span>
          </div>
          {user.vipTier > 0 && (
            <div className="flex items-center gap-1 text-cyber-gold text-xs">
              <span>VIP x{vipMultiplier}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Energy + Play */}
      <div className="w-full flex gap-3">
        {/* Energy card */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 glass-card p-4 text-center"
        >
          <FaBolt className="text-cyber-cyan text-xl mx-auto mb-1" />
          <p className="font-orbitron text-2xl text-white">{user.gameEnergy}</p>
          <p className="text-[10px] text-gray-500">ENERGY</p>
        </motion.div>

        {/* Play button */}
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/game')}
          disabled={user.gameEnergy <= 0}
          className="flex-1 rounded-2xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white flex flex-col items-center justify-center gap-2 disabled:opacity-30 fire-border min-h-[100px]"
        >
          <FaPlay className="text-2xl" />
          <span>PLAY</span>
        </motion.button>
      </div>

      {/* Daily Reward CTA */}
      {canClaimDaily && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowDaily(true)}
          className="w-full glass-card p-4 flex items-center gap-4 border border-cyber-gold/30"
        >
          <div className="w-12 h-12 rounded-xl bg-cyber-gold/10 flex items-center justify-center">
            <FaGift className="text-cyber-gold text-xl" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-orbitron text-xs text-cyber-gold">Daily Reward Available!</p>
            <p className="text-[10px] text-gray-500">Day {(user.dailyRewardDay || 0) + 1} — Claim now</p>
          </div>
          <div className="w-3 h-3 bg-cyber-gold rounded-full animate-pulse" />
        </motion.button>
      )}

      {/* Tap-to-Earn Section */}
      <div className="w-full">
        <h3 className="font-orbitron text-xs text-gray-500 mb-3 text-center tracking-widest">TAP TO EARN</h3>
        <TapTarget />
      </div>

      {/* League Slider */}
      <div className="w-full">
        <h3 className="font-orbitron text-xs text-gray-500 mb-3 text-center tracking-widest">
          YOUR LEAGUE: <span className="text-white">{league.name.toUpperCase()}</span>
        </h3>
        <LeagueSlider />
      </div>

      {/* Modals */}
      <DailyRewardModal open={showDaily} onClose={() => setShowDaily(false)} />
    </div>
  );
}
