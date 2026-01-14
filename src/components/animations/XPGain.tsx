import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface XPGainProps {
  amount: number;
  onComplete?: () => void;
  trigger: boolean;
}

export function XPGain({ amount, onComplete, trigger }: XPGainProps) {
  const [show, setShow] = useState(false);
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      
      // Animated counter
      let current = 0;
      const increment = amount / 20;
      const timer = setInterval(() => {
        current += increment;
        if (current >= amount) {
          setDisplayAmount(amount);
          clearInterval(timer);
        } else {
          setDisplayAmount(Math.floor(current));
        }
      }, 30);

      // Auto-hide after animation
      const hideTimer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2000);

      return () => {
        clearInterval(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [trigger, amount, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed left-1/2 top-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 20, x: '-50%', scale: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            y: [20, -60, -80, -100],
            scale: [0, 1.2, 1, 0.8],
            x: '-50%'
          }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ 
            duration: 2,
            times: [0, 0.2, 0.7, 1],
            ease: [0.34, 1.56, 0.64, 1]
          }}
        >
          <div className="relative">
            {/* Main XP Text */}
            <motion.div
              className="text-5xl px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl"
              style={{
                textShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
              }}
            >
              +{displayAmount} XP
            </motion.div>

            {/* Sparkles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <Sparkles className="w-6 h-6" fill="currentColor" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
