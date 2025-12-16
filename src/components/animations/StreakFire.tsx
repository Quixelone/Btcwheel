import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakFireProps {
  count: number;
  animated?: boolean;
}

export function StreakFire({ count, animated = true }: StreakFireProps) {
  return (
    <motion.div 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Animated Flame */}
      <motion.div
        animate={animated ? {
          scale: [1, 1.1, 1],
          opacity: [0.9, 1, 0.9],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Flame 
          className="w-6 h-6 text-yellow-300" 
          fill="currentColor"
        />
      </motion.div>

      {/* Counter */}
      <motion.span
        key={count}
        className="text-white"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.3 }}
      >
        {count}
      </motion.span>

      {/* Background Glow */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-400 -z-10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

// Streak Increment Animation - quando incrementa
interface StreakIncrementProps {
  show: boolean;
  onComplete?: () => void;
}

export function StreakIncrement({ show, onComplete }: StreakIncrementProps) {
  if (!show) return null;

  return (
    <motion.div
      className="fixed left-1/2 top-1/3 z-50 pointer-events-none -translate-x-1/2"
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        y: [0, -40, -60, -80],
        scale: [0.5, 1.2, 1, 0.8],
      }}
      transition={{ duration: 1.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="flex items-center gap-2 text-4xl">
        <Flame className="w-12 h-12 text-orange-500" fill="currentColor" />
        <span className="text-orange-500">+1 Streak!</span>
      </div>

      {/* Fire Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-400 rounded-full"
          initial={{ 
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 60,
            y: -(Math.random() * 40 + 20),
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}
