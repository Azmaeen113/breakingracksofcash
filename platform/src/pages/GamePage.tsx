import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { spendEnergy, addGameScore } from '@/services/firestore';
import { FaHome } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function GamePage() {
  const { user, userId, vipMultiplier, refreshUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const gameEndedRef = useRef(false);
  const earnedRef = useRef(0);

  const gameMode = searchParams.get('mode') || 'normal';
  const iframeSrc = gameMode === 'rackattack'
    ? '/game/index.html?mode=rackattack'
    : '/game/index.html';

  const energySpentRef = useRef(false);

  // Spend energy in background — don't block game loading
  useEffect(() => {
    if (energySpentRef.current) return; // Already spent energy for this game session
    energySpentRef.current = true;
    let cancelled = false;
    spendEnergy(userId).then(async (success) => {
      if (cancelled) return;
      if (!success) {
        toast.error('No energy left! Buy more in the shop.');
        navigate('/shop', { replace: true });
      } else {
        // Update local state so energy UI reflects the spend
        await refreshUser();
      }
    });
    return () => { cancelled = true; };
  }, [userId, navigate, refreshUser]);

  // Listen for game messages
  const handleGameOver = useCallback(async (score: number) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    setGameEnded(true);
    const earned = await addGameScore(userId, score);
    earnedRef.current = earned;
    await refreshUser();
    toast.success(`+${earned.toLocaleString()} CASH earned!`, {
      icon: '🎉',
      duration: 4000,
      style: { background: '#1a0a2e', color: '#fff', border: '1px solid rgba(0,255,255,0.3)' },
    });
  }, [userId, refreshUser]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.type === 'GAME_OVER') {
        handleGameOver(e.data.finalScore || 0);
      }
      if (e.data?.type === 'REPLAY_GAME') {
        const score = e.data.finalScore || 0;
        // Process score first if not already done
        if (score > 0 && !gameEndedRef.current) {
          gameEndedRef.current = true;
          setGameEnded(true);
          addGameScore(userId, score).then(() => refreshUser()).catch(() => {});
        } else {
          refreshUser().catch(() => {});
        }
        // Instead of reloading just the iframe, trigger a page reload to cleanly remount everything, deducting energy again
        window.location.reload();
      }
      if (e.data?.type === 'GO_HOME') {
        const score = e.data.finalScore || 0;
        // Only add score if GAME_OVER hasn't already been processed
        if (score > 0 && !gameEndedRef.current) {
          gameEndedRef.current = true;
          setGameEnded(true);
          addGameScore(userId, score).then(() => refreshUser()).catch(() => {});
        } else {
          refreshUser().catch(() => {});
        }
        navigate('/', { replace: true });
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [handleGameOver, navigate, userId, refreshUser]);

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
        src={iframeSrc}
        className="flex-1 w-full border-0"
        title="Breaking Racks 4 Cash"
        allow="autoplay"
      />
    </div>
  );
}
