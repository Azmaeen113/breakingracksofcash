import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { spendEnergy, addGameScore } from '@/services/firestore';
import { FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function GamePage() {
  const { user, userId, vipMultiplier, refreshUser } = useUser();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const earnedRef = useRef(0);

  // Spend energy in background — don't block game loading
  useEffect(() => {
    let cancelled = false;
    spendEnergy(userId).then(success => {
      if (!success && !cancelled) {
        toast.error('No energy left!');
        navigate('/', { replace: true });
      }
    });
    return () => { cancelled = true; };
  }, [userId, navigate]);

  // Listen for game messages
  const handleGameOver = useCallback(async (score: number) => {
    if (gameEnded) return;
    setGameEnded(true);
    const earned = await addGameScore(userId, score);
    earnedRef.current = earned;
    await refreshUser();
    toast.success(`+${earned.toLocaleString()} CASH earned!`, {
      icon: '🎉',
      duration: 4000,
      style: { background: '#1a0a2e', color: '#fff', border: '1px solid rgba(0,255,255,0.3)' },
    });
  }, [userId, refreshUser, gameEnded]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'GAME_OVER') {
        handleGameOver(e.data.finalScore || 0);
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handleGameOver]);

  const goHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Home button overlay */}
      <button
        onClick={goHome}
        className="absolute bottom-3 right-3 z-[210] w-12 h-12 rounded-full bg-cyber-dark/80 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan backdrop-blur-sm active:scale-90 transition-transform"
        title="Back to Home"
      >
        <FaHome className="text-xl" />
      </button>

      {/* Game iframe - full screen */}
      <iframe
        ref={iframeRef}
        src="/game/index.html"
        className="flex-1 w-full border-0"
        title="Breaking Racks 4 Cash"
        allow="autoplay"
      />
    </div>
  );
}
