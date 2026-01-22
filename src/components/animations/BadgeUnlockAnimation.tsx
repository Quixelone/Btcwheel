import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Sparkles, X } from 'lucide-react';
import { badges, rarityColors, rarityLabels } from '../../lib/badges';

interface BadgeUnlockAnimationProps {
  badgeId: string | null;
  onClose: () => void;
}

export function BadgeUnlockAnimation({ badgeId, onClose }: BadgeUnlockAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const badge = badgeId ? badges[badgeId] : null;

  useEffect(() => {
    if (badgeId && badge) {
      setIsVisible(true);

      // Play celebration sound if available
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    }
  }, [badgeId, badge]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!badge) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Badge Card */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
                transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 20
                }
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.2 }
              }}
              className="w-full max-w-md"
            >
              <Card className="relative overflow-hidden p-8 text-center">
                {/* Animated Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-yellow-400"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                        opacity: 0
                      }}
                      animate={{
                        x: `${Math.random() * 100}%`,
                        y: `${Math.random() * 100}%`,
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.05,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-gray-900">Badge Sbloccato!</h2>
                  </div>
                </motion.div>

                {/* Badge Icon with Glow */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: 0.3
                    }
                  }}
                  className="relative mb-6"
                >
                  <div className={`absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r ${rarityColors[badge.rarity]}`} />
                  <div className="relative text-8xl filter drop-shadow-xl">
                    {badge.icon}
                  </div>
                </motion.div>

                {/* Badge Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  {/* Rarity Tag */}
                  <div className="flex justify-center">
                    <span className={`inline-block px-4 py-1 rounded-full text-sm bg-gradient-to-r ${rarityColors[badge.rarity]} text-white`}>
                      {rarityLabels[badge.rarity]}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-gray-900 text-2xl">
                    {badge.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600">
                    {badge.description}
                  </p>

                  {/* Rewards */}
                  {badge.reward && (
                    <div className="flex items-center justify-center gap-2 text-green-600 pt-4">
                      <Sparkles className="w-5 h-5" />
                      <div className="space-x-3">
                        {badge.reward.xp && (
                          <span className="font-semibold">+{badge.reward.xp} XP</span>
                        )}
                        {badge.reward.multiplier && (
                          <span className="text-sm">
                            {((badge.reward.multiplier - 1) * 100).toFixed(0)}% XP Boost
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Action Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6"
                >
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Fantastico!
                  </Button>
                </motion.div>

                {/* Confetti Animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${50 + (Math.random() - 0.5) * 20}%`,
                        top: `${50 + (Math.random() - 0.5) * 20}%`,
                      }}
                      animate={{
                        y: [0, -200 - Math.random() * 100],
                        x: [(Math.random() - 0.5) * 200],
                        rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                        opacity: [1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random(),
                        delay: 0.4 + Math.random() * 0.3,
                        ease: 'easeOut',
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{
                          backgroundColor: [
                            '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'
                          ][Math.floor(Math.random() * 6)]
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
