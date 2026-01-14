import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuizCalculationProps {
  question: string;
  correctAnswer: number;
  tolerance?: number; // Tolleranza per decimali (default 0.01)
  unit?: string; // Unità di misura (es. "$", "%", "BTC")
  explanation: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizCalculation({
  question,
  correctAnswer,
  tolerance = 0.01,
  unit = '',
  explanation,
  onAnswer,
  disabled = false,
}: QuizCalculationProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const numericAnswer = parseFloat(userAnswer);
    
    if (isNaN(numericAnswer)) {
      return;
    }

    // Check if answer is within tolerance
    const difference = Math.abs(numericAnswer - correctAnswer);
    const correct = difference <= tolerance;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer && !showFeedback) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="mb-6">
        <p className="text-gray-900 mb-6 leading-relaxed">{question}</p>
      </div>

      {/* Calculator Input */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span className="text-gray-700 font-semibold">Inserisci la tua risposta:</span>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Input
              type="number"
              step="any"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled || showFeedback}
              placeholder="0.00"
              className="h-14 text-lg text-center font-semibold border-2 border-gray-300 focus:border-blue-500"
            />
            {unit && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {unit}
              </span>
            )}
          </div>
          
          {!showFeedback && (
            <Button
              onClick={handleSubmit}
              disabled={!userAnswer || disabled}
              className="h-14 px-6 bg-blue-600 hover:bg-blue-700"
            >
              Verifica
            </Button>
          )}
        </div>

        {/* Hint */}
        <p className="text-sm text-gray-600 mt-3">
          💡 Puoi usare decimali. Es: 0.5 oppure 1.25
        </p>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-xl border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-gray-900 font-semibold mb-2">
                  {isCorrect ? '✓ Corretto!' : '✗ Non proprio...'}
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {explanation}
                </p>
                <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">La tua risposta:</span>
                    <span className="font-semibold text-gray-900">
                      {parseFloat(userAnswer).toFixed(2)} {unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risposta corretta:</span>
                    <span className="font-semibold text-green-700">
                      {correctAnswer.toFixed(2)} {unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
