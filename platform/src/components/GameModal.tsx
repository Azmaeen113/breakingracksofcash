import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { spendEnergy, addGameScore } from '@/services/firestore';
import { FaFire, FaTrophy, FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GameModal({ open, onClose }: Props) {
  const { user, userId, vipMultiplier, refreshUser } = useUser();
  const [phase, setPhase] = useState<'start' | 'playing' | 'gameover'>('start');
  const [timer, setTimer] = useState(60);
  const [finalScore, setFinalScore] = useState(0);
  const [earnedCash, setEarnedCash] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Listen for postMessage from game iframe
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'GAME_OVER') {
        handleGameOver(e.data.finalScore || 0);
      } else if (e.data?.type === 'GAME_SCORE_UPDATE') {
        setFinalScore(e.data.score || 0);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleGameOver = useCallback(async (score: number) => {
    clearInterval(timerRef.current);
    setFinalScore(score);
    const earned = await addGameScore(userId, score);
    setEarnedCash(earned);
    setPhase('gameover');
    await refreshUser();
  }, [userId, refreshUser]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleGameOver(finalScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, finalScore, handleGameOver]);

  const startGame = async () => {
    const success = await spendEnergy(userId);
    if (!success) return;
    setPhase('playing');
    setTimer(60);
    setFinalScore(0);
    // Send start message to iframe
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'GAME_START', playerName: user?.odl_username }, '*');
    }, 1000);
  };

  const closeModal = () => {
    clearInterval(timerRef.current);
    setPhase('start');
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      >
        {/* Start screen */}
        {phase === 'start' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
            <h1 className="font-orbitron text-2xl text-cyber-cyan neon-text">BREAKING RACKS 4 CASH</h1>
            <div className="glass-card p-6 text-center space-y-4 w-full max-w-sm">
              <p className="text-gray-400">Your Balance</p>
              <p className="font-orbitron text-3xl text-white">{user?.cashBalance?.toLocaleString() ?? 0} <span className="text-cyber-gold text-lg">CASH</span></p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><FaFire className="text-cyber-orange" /> 1 Energy</span>
                <span>60s Match</span>
              </div>
              {user && user.vipTier > 0 && (
                <p className="text-cyber-gold text-xs">VIP {['', 'Bronze', 'Silver', 'Gold'][user.vipTier]}: {vipMultiplier}x score multiplier active</p>
              )}
            </div>

            <button
              onClick={startGame}
              disabled={!user || user.gameEnergy <= 0}
              className="w-full max-w-sm py-4 rounded-xl font-orbitron text-lg font-bold fire-gradient text-white disabled:opacity-30 disabled:cursor-not-allowed glow-cyan transition-all active:scale-95"
            >
              {user && user.gameEnergy > 0 ? (
                <span className="flex items-center justify-center gap-2">START GAME <FaFire /></span>
              ) : (
                'No Energy — Resets at Midnight'
              )}
            </button>

            <button onClick={closeModal} className="text-gray-500 text-sm">Cancel</button>
          </div>
        )}

        {/* Playing */}
        {phase === 'playing' && (
          <>
            {/* Timer overlay */}
            <div className="absolute top-4 left-4 z-[110] flex items-center gap-2">
              <div className={`font-mono text-2xl font-bold px-4 py-2 rounded-lg glass ${timer <= 10 ? 'text-cyber-red animate-pulse' : 'text-cyber-cyan'}`}>
                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </div>
            </div>

            {/* VIP badge overlay */}
            {user && user.vipTier > 0 && (
              <div className="absolute top-4 right-4 z-[110] font-orbitron text-xs text-cyber-gold glass rounded-full px-3 py-1">
                {vipMultiplier}x
              </div>
            )}

            {/* Exit button */}
            <button
              onClick={() => handleGameOver(finalScore)}
              className="absolute top-4 right-16 z-[110] w-8 h-8 rounded-full glass flex items-center justify-center text-gray-400"
            >
              <FaTimes />
            </button>

            {/* Game iframe */}
            <iframe
              ref={iframeRef}
              src="/game/index.html"
              className="flex-1 w-full border-0"
              title="Breaking Racks 4 Cash"
              allow="autoplay"
            />
          </>
        )}

        {/* Game Over */}
        {phase === 'gameover' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6">
            <FaTrophy className="text-6xl text-cyber-gold" />
            <h2 className="font-orbitron text-xl text-white">GAME OVER</h2>
            <div className="glass-card p-6 text-center space-y-3 w-full max-w-sm">
              <p className="text-gray-400 text-sm">Score</p>
              <p className="font-orbitron text-3xl text-white">{finalScore}</p>
              {user && user.vipTier > 0 && (
                <p className="text-cyber-gold text-sm">× {vipMultiplier} VIP = {earnedCash} CASH</p>
              )}
              <div className="h-px bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
              <p className="text-cyber-cyan font-orbitron text-2xl">+{earnedCash} CASH</p>
            </div>
            <button
              onClick={closeModal}
              className="w-full max-w-sm py-3 rounded-xl font-orbitron bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 active:scale-95 transition-transform"
            >
              CONTINUE
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
