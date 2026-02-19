import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-cyber-dark">
      {/* Floating embers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-ember"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: '-5%',
            background: ['#FF6B00', '#FF1744', '#FFD700'][i % 3],
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Dual spinning rings */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyber-cyan border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-cyber-pink border-b-transparent"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple" />
        </motion.div>
      </div>

      <motion.p
        className="font-orbitron text-sm text-cyber-cyan tracking-[0.3em]"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        LOADING
      </motion.p>
    </div>
  );
}
