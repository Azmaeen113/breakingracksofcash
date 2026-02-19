import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { claimDailyReward } from '@/services/firestore';
import { DAILY_REWARDS } from '@/config/constants';
import { FaGift, FaCheck, FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DailyRewardModal({ open, onClose }: Props) {
  const { user, userId, refreshUser } = useUser();
  const [claiming, setClaiming] = useState(false);

  if (!open || !user) return null;

  const currentDay = user.dailyRewardDay || 0;
  const canClaim = !user.lastDailyReward || new Date().toDateString() !== user.lastDailyReward.toDate().toDateString();
  const nextDay = currentDay >= 7 ? 1 : currentDay + 1;

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    const reward = DAILY_REWARDS.find(r => r.day === nextDay);
    if (reward) {
      await claimDailyReward(userId, nextDay, reward.reward);
      await refreshUser();
    }
    setClaiming(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="glass-card p-6 w-full max-w-sm space-y-5"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-orbitron text-lg text-cyber-cyan">Daily Rewards</h2>
            <button onClick={onClose} className="text-gray-500"><FaTimes /></button>
          </div>

          {/* Days 1-6 grid */}
          <div className="grid grid-cols-3 gap-3">
            {DAILY_REWARDS.slice(0, 6).map((r) => {
              const isClaimed = r.day <= currentDay;
              const isNext = r.day === nextDay && canClaim;
              return (
                <div
                  key={r.day}
                  className={`relative rounded-xl p-3 text-center border transition-all ${
                    isNext ? 'border-cyber-cyan glow-cyan bg-cyber-cyan/5' :
                    isClaimed ? 'border-green-500/30 bg-green-500/5' :
                    'border-gray-700/30 bg-cyber-dark/50'
                  }`}
                >
                  <p className="text-[10px] text-gray-500 mb-1">Day {r.day}</p>
                  <p className="font-orbitron text-sm text-white">{r.reward}</p>
                  <p className="text-[10px] text-cyber-gold">CASH</p>
                  {isClaimed && (
                    <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                      <FaCheck className="text-green-400 text-lg" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Day 7 full-width */}
          {(() => {
            const r = DAILY_REWARDS[6];
            const isClaimed = 7 <= currentDay;
            const isNext = 7 === nextDay && canClaim;
            return (
              <div className={`rounded-xl p-4 text-center border ${
                isNext ? 'fire-border glow-pink bg-cyber-pink/5' :
                isClaimed ? 'border-green-500/30 bg-green-500/5' :
                'border-gray-700/30 bg-cyber-dark/50'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <FaGift className="text-cyber-gold text-xl" />
                  <span className="font-orbitron text-xs text-gray-400">Day 7 — MEGA REWARD</span>
                </div>
                <p className="font-orbitron text-2xl text-cyber-gold mt-2">{r.reward.toLocaleString()} CASH</p>
                {isClaimed && <FaCheck className="text-green-400 text-xl mx-auto mt-2" />}
              </div>
            );
          })()}

          {/* Claim button */}
          <button
            onClick={handleClaim}
            disabled={!canClaim || claiming}
            className="w-full py-3 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white disabled:opacity-30 active:scale-95 transition-transform"
          >
            {claiming ? 'Claiming...' : canClaim ? 'Claim Reward' : 'Already Claimed Today'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
