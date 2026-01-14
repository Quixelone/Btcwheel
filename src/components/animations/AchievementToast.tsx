import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Star, Zap, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: 'trophy' | 'star' | 'zap' | 'target';
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export function AchievementToast({ 
  achievement, 
  onDismiss,
  autoDismiss = true,
  duration = 4000 
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, autoDismiss, duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const getIcon = () => {
    switch (achievement?.icon) {
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'star': return <Star className="w-6 h-6" fill="currentColor" />;
      case 'zap': return <Zap className="w-6 h-6" fill="currentColor" />;
      case 'target': return <Target className="w-6 h-6" />;
      default: return <Trophy className="w-6 h-6" />;
    }
  };

  const getColorClasses = () => {
    switch (achievement?.color) {
      case 'blue': return 'from-blue-500 to-blue-600 text-white';
      case 'green': return 'from-green-500 to-green-600 text-white';
      case 'orange': return 'from-orange-500 to-orange-600 text-white';
      case 'purple': return 'from-purple-500 to-purple-600 text-white';
      default: return 'from-blue-500 to-purple-600 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && achievement && (
        <motion.div
          className="fixed top-4 left-1/2 z-50 w-full max-w-md px-4"
          initial={{ y: -100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: 'spring',
            damping: 20,
            stiffness: 300
          }}
        >
          <motion.div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getColorClasses()} shadow-2xl backdrop-blur-xl`}
            whileHover={{ scale: 1.02 }}
            style={{
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative p-4 flex items-center gap-4">
              {/* Icon with pulse */}
              <motion.div
                className="flex-shrink-0"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {getIcon()}
                </div>
              </motion.div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  className="font-semibold"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {achievement.title}
                </motion.h3>
                <motion.p
                  className="text-sm opacity-90"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Close button */}
              <motion.button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress bar for auto-dismiss */}
            {autoDismiss && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/40"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            )}

            {/* Sparkle particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement Toast Manager Hook
export function useAchievementToast() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  const show = (newAchievement: Achievement) => {
    setAchievement(newAchievement);
  };

  const dismiss = () => {
    setAchievement(null);
  };

  return { achievement, show, dismiss };
}
