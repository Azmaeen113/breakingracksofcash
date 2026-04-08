import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import TapTarget from '@/components/TapTarget';

import LeagueSlider from '@/components/LeagueSlider';
import { FaPlay, FaBolt, FaCoins, FaGem, FaClock } from 'react-icons/fa';

export default function HomePage() {
  const { user, league, vipMultiplier } = useUser();
  const navigate = useNavigate();


  if (!user) return null;



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

      {/* Energy + Game Modes */}
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

        {/* Play vs Computer button */}
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => user.gameEnergy > 0 ? navigate('/game') : navigate('/shop')}
          className={`flex-1 rounded-2xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan to-cyber-purple text-white flex flex-col items-center justify-center gap-2 fire-border min-h-[100px] ${user.gameEnergy <= 0 ? 'opacity-60' : ''}`}
        >
          <FaPlay className="text-2xl" />
          <span>PLAY</span>
        </motion.button>
      </div>

      {/* Rack Attack Mode */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => user.gameEnergy > 0 ? navigate('/game?mode=rackattack') : navigate('/shop')}
        className={`w-full glass-card p-4 flex items-center gap-4 border border-cyber-pink/30 ${user.gameEnergy <= 0 ? 'opacity-60' : ''}`}
      >
        <div className="w-12 h-12 rounded-xl bg-cyber-pink/10 flex items-center justify-center">
          <FaClock className="text-cyber-pink text-xl" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-orbitron text-xs text-cyber-pink">RACK ATTACK</p>
          <p className="text-[10px] text-gray-500">90 seconds — Pot as many balls as you can!</p>
        </div>
        <FaPlay className="text-cyber-pink text-sm" />
      </motion.button>



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


    </div>
  );
}
