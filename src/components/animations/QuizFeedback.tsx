import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';

interface QuizFeedbackProps {
  isCorrect: boolean | null;
  show: boolean;
  onAnimationComplete?: () => void;
  onDismiss?: () => void;
}

export function QuizFeedback({ isCorrect, show, onAnimationComplete, onDismiss }: QuizFeedbackProps) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onAnimationComplete}>
      {show && isCorrect !== null && (
        <motion.div
          key="quiz-feedback"
          className="fixed inset-0 z-40 flex items-center justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
        >
          {/* Background Flash */}
          <motion.div
            className={`absolute inset-0 ${
              isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.6 }}
          />

          {/* Icon */}
          <motion.div
            className={`relative ${
              isCorrect 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            } rounded-full p-8 shadow-2xl`}
            initial={{ scale: 0, rotate: isCorrect ? -180 : 0 }}
            animate={{ 
              scale: isCorrect ? [0, 1.2, 1] : [0, 1],
              rotate: isCorrect ? [0, 10, -10, 10, 0] : [-10, 10, -10, 10, -5, 5, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              duration: isCorrect ? 0.5 : 0.6,
              ease: isCorrect ? [0.34, 1.56, 0.64, 1] : 'easeInOut',
            }}
            style={{
              boxShadow: isCorrect 
                ? '0 0 50px rgba(34, 197, 94, 0.6)'
                : '0 0 50px rgba(239, 68, 68, 0.6)',
            }}
          >
            {isCorrect ? (
              <Check className="w-24 h-24" strokeWidth={3} />
            ) : (
              <X className="w-24 h-24" strokeWidth={3} />
            )}
          </motion.div>

          {/* Ripple Effect for Correct */}
          {isCorrect && (
            <>
              <motion.div
                className="absolute w-32 h-32 border-4 border-green-500 rounded-full"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute w-32 h-32 border-4 border-green-400 rounded-full"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
