import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { FaRocket, FaTrophy, FaGamepad } from 'react-icons/fa';

interface Props {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: Props) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-cyber-dark flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-sm space-y-8 text-center"
        >
          {/* Logo / brand */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-24 h-24 mx-auto rounded-2xl fire-border flex items-center justify-center bg-gradient-to-br from-cyber-cyan/20 to-cyber-pink/20"
          >
            <FaGamepad className="text-5xl text-cyber-cyan" />
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-orbitron text-2xl font-bold bg-gradient-to-r from-cyber-cyan to-cyber-pink bg-clip-text text-transparent"
            >
              Breaking Racks 4 Cash
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-gray-400 text-sm"
            >
              Play. Earn. Compete. Rise through the leagues.
            </motion.p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {[
              { icon: FaGamepad, title: 'Play 8-Ball Pool', desc: 'Sink balls to earn cash in timed rounds', delay: 0.9 },
              { icon: FaRocket, title: 'Tap to Earn', desc: 'Tap 1,000 times to earn bonus cash + resets', delay: 1.1 },
              { icon: FaTrophy, title: 'Climb Leagues', desc: 'Compete on leaderboards for token prizes', delay: 1.3 },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <motion.div
                key={title}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay }}
                className="glass-card p-4 flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-cyber-cyan/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="font-orbitron text-xs text-white">{title}</p>
                  <p className="text-[11px] text-gray-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Welcome bonus */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="bg-gradient-to-r from-cyber-gold/10 to-cyber-orange/10 border border-cyber-gold/30 rounded-xl p-4"
          >
            <p className="text-cyber-gold font-orbitron text-xs">WELCOME BONUS</p>
            <p className="font-orbitron text-3xl text-white mt-1">+500 CASH</p>
          </motion.div>

          {/* Start button */}
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="w-full py-4 rounded-xl font-orbitron text-sm font-bold bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink text-white fire-border"
          >
            LET'S GO!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
