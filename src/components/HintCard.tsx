import { motion } from 'motion/react';
import { Lightbulb, X } from 'lucide-react';

interface HintCardProps {
  hint: string;
  onClose: () => void;
}

export function HintCard({ hint, onClose }: HintCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-300 shadow-lg">
        <div className="flex items-start gap-3">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            className="flex-shrink-0"
          >
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-900 font-semibold">💡 Suggerimento da Prof Satoshi</h4>
              <button
                onClick={onClose}
                className="p-1 hover:bg-yellow-100 rounded-full transition-colors"
                aria-label="Chiudi suggerimento"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">{hint}</p>
          </div>
        </div>

        {/* Pulsing border effect */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-yellow-400 pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}
