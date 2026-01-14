import { motion } from 'motion/react';
import { AlertCircle, Heart, X } from 'lucide-react';

interface QuizAttemptsProps {
  attemptsLeft: number;
  maxAttempts: number;
  showWarning?: boolean;
}

export function QuizAttempts({ attemptsLeft, maxAttempts, showWarning }: QuizAttemptsProps) {
  const lostAttempts = maxAttempts - attemptsLeft;

  return (
    <div className="flex items-center gap-3">
      {/* Hearts/Lives display */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: maxAttempts }).map((_, i) => {
          const isLost = i < lostAttempts;
          return (
            <motion.div
              key={i}
              initial={{ scale: 1 }}
              animate={isLost ? { scale: [1, 1.2, 0.8], opacity: [1, 0.5, 0.3] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isLost ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Text indicator */}
      <span className={`text-sm font-medium ${attemptsLeft === 1 ? 'text-red-500' : 'text-gray-400'}`}>
        {attemptsLeft} {attemptsLeft === 1 ? 'tentativo' : 'tentativi'} rimasti
      </span>

      {/* Warning for last attempt */}
      {showWarning && attemptsLeft === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1.5"
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-400 font-medium">Ultimo tentativo!</span>
        </motion.div>
      )}
    </div>
  );
}
