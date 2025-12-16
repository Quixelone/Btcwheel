import { motion } from 'motion/react';
import { AlertTriangle, BookOpen, RefreshCw, TrendingDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ReviewSuggestionProps {
  aiFeedback: string;
  weakTopics: string[];
  accuracy: number;
  onReviewLesson: () => void;
  onContinueAnyway: () => void;
  isBlocking?: boolean;
  isLoadingFeedback?: boolean;
}

export function ReviewSuggestion({
  aiFeedback,
  weakTopics,
  accuracy,
  onReviewLesson,
  onContinueAnyway,
  isBlocking = false,
  isLoadingFeedback = false
}: ReviewSuggestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="max-w-lg w-full bg-gradient-to-br from-gray-900 to-gray-800 border-orange-500/30 p-6 md:p-8 text-white">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">
              {isBlocking ? '⚠️ Pausa Obbligatoria' : '💡 Suggerimento di Ripasso'}
            </h3>
            <p className="text-gray-400 text-sm">
              {isBlocking 
                ? 'Troppi errori consecutivi. È il momento di rivedere i concetti!'
                : 'Sembra che tu abbia qualche difficoltà con questa lezione.'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-gray-400">Accuracy</span>
            </div>
            <p className={`text-2xl font-bold ${accuracy < 50 ? 'text-red-400' : 'text-orange-400'}`}>
              {Math.round(accuracy)}%
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Punti Deboli</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {weakTopics.length}
            </p>
          </div>
        </div>

        {/* Weak Topics */}
        {weakTopics.length > 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-300 mb-2">Argomenti da rivedere:</p>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((topic, i) => (
                <span 
                  key={i}
                  className="text-xs bg-orange-500/20 text-orange-200 px-2 py-1 rounded-md border border-orange-500/30"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Feedback */}
        <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
          {isLoadingFeedback ? (
            <div className="flex items-center gap-2 text-gray-400">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              <span className="text-sm">Generando feedback personalizzato...</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-emerald-400 font-medium mb-2">💬 Prof Satoshi dice:</p>
              <p className="text-sm text-gray-300 leading-relaxed">{aiFeedback}</p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onReviewLesson}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Rivedi la Lezione
          </Button>

          {!isBlocking && (
            <Button
              onClick={onContinueAnyway}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-white/5"
            >
              Continua comunque (non consigliato)
            </Button>
          )}
        </div>

        {/* Motivational note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-center text-gray-500 mt-4"
        >
          {isBlocking 
            ? '🔒 Rivedere la lezione è obbligatorio per continuare'
            : '💪 Ripassare ora ti aiuterà ad apprendere meglio!'}
        </motion.p>
      </Card>
    </motion.div>
  );
}
