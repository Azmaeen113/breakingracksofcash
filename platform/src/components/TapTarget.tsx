import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { processTapBatch } from '@/services/firestore';
import { TAP_CYCLE_TOTAL } from '@/config/constants';

interface FloatText { id: number; x: number; y: number; }

export default function TapTarget() {
  const { user, userId, tapDamage, refreshUser } = useUser();
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [localTaps, setLocalTaps] = useState(0);
  const [cooldown, setCooldown] = useState('');
  const batchRef = useRef(0);
  const flushTimer = useRef<ReturnType<typeof setTimeout>>();
  const nextId = useRef(0);

  const progress = user ? Math.min(100, ((user.tapCycleProgress + localTaps * tapDamage) / TAP_CYCLE_TOTAL) * 100) : 0;
  const isOnCooldown = user?.tapCooldownUntil ? Date.now() < user.tapCooldownUntil : false;

  // Cooldown timer
  useEffect(() => {
    if (!user?.tapCooldownUntil) return;
    const update = () => {
      const remaining = user.tapCooldownUntil! - Date.now();
      if (remaining <= 0) { setCooldown(''); refreshUser(); return; }
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setCooldown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user?.tapCooldownUntil, refreshUser]);

  // Flush batch to Firebase
  const flushBatch = useCallback(async () => {
    if (batchRef.current === 0) return;
    const taps = batchRef.current;
    batchRef.current = 0;
    setLocalTaps(0);
    await processTapBatch(userId, taps, tapDamage);
    await refreshUser();
  }, [userId, tapDamage, refreshUser]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isOnCooldown) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x: number, y: number;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Add float text
    const id = nextId.current++;
    setFloats(prev => [...prev.slice(-8), { id, x, y }]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1000);

    // Increment local
    batchRef.current += 1;
    setLocalTaps(prev => prev + 1);

    // Debounce flush
    clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flushBatch, 500);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>{Math.floor((user?.tapCycleProgress ?? 0) + localTaps * tapDamage)} / {TAP_CYCLE_TOTAL}</span>
          <span>{tapDamage}x speed</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyber-pink to-cyber-cyan"
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </div>
      </div>

      {/* Tap target */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.92, rotateX: 10, rotateY: -5 }}
          onClick={handleTap}
          disabled={isOnCooldown}
          className="relative w-40 h-40 rounded-full flex items-center justify-center border-2 border-cyber-cyan/40 glow-cyan bg-cyber-mid disabled:opacity-40 disabled:border-gray-700"
          style={{ perspective: 500 }}
        >
          <span className="font-orbitron text-5xl font-bold bg-gradient-to-br from-cyber-cyan via-white to-cyber-pink bg-clip-text text-transparent select-none">
            8
          </span>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full border border-cyber-cyan/10 animate-glow-pulse" />
        </motion.button>

        {/* Float "+1" texts */}
        <AnimatePresence>
          {floats.map(f => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: 0, x: f.x - 70 }}
              animate={{ opacity: 0, y: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-0 text-cyber-cyan font-orbitron text-sm font-bold pointer-events-none select-none"
              style={{ left: f.x - 10 }}
            >
              +1
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Cooldown */}
      {isOnCooldown && cooldown && (
        <div className="text-center">
          <p className="font-mono text-xl text-cyber-pink">{cooldown}</p>
          <p className="text-[10px] text-gray-500 mt-1">Cooldown active</p>
        </div>
      )}
      {!isOnCooldown && (
        <p className="text-[10px] text-gray-500">Tap to earn CASH · {TAP_CYCLE_TOTAL} taps per cycle</p>
      )}
    </div>
  );
}
