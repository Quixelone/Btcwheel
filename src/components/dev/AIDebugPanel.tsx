import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface AIDebugPanelProps {
  performance: {
    correctAnswers: number;
    wrongAnswers: number;
    consecutiveWrong: number;
    accuracy: number;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    previousQuestions: string[];
    weakTopics: string[];
  };
  isGenerating: boolean;
  onGenerateTest?: () => void;
}

export function AIDebugPanel({ performance, isGenerating, onGenerateTest }: AIDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="fixed bottom-20 right-4 z-50 md:bottom-4 bg-purple-600 text-white hover:bg-purple-700"
      >
        <Brain className="w-4 h-4 mr-2" />
        AI Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4 max-w-sm">
      <Card className="p-4 bg-gray-900 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Performance
          </h3>
          <Button
            onClick={() => setIsOpen(false)}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-3">
          {/* Difficulty Level */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Difficoltà:</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              performance.difficultyLevel === 'easy' ? 'bg-green-600' :
              performance.difficultyLevel === 'medium' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {performance.difficultyLevel.toUpperCase()}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Score:</span>
            <span className="text-white font-semibold">
              ✓ {performance.correctAnswers} | ✗ {performance.wrongAnswers}
            </span>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Accuracy:</span>
              <span className={`font-semibold ${
                performance.accuracy >= 70 ? 'text-green-400' :
                performance.accuracy >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {performance.accuracy.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  performance.accuracy >= 70 ? 'bg-green-500' :
                  performance.accuracy >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${performance.accuracy}%` }}
              />
            </div>
          </div>

          {/* Consecutive Wrong */}
          {performance.consecutiveWrong > 0 && (
            <div className="flex items-center gap-2 text-orange-400 bg-orange-900/30 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">
                {performance.consecutiveWrong} errori consecutivi
              </span>
            </div>
          )}

          {/* Weak Topics */}
          {performance.weakTopics.length > 0 && (
            <div className="bg-red-900/30 p-2 rounded">
              <p className="text-xs text-red-400 mb-1">Punti deboli:</p>
              <div className="flex flex-wrap gap-1">
                {performance.weakTopics.map((topic, i) => (
                  <span key={i} className="text-xs bg-red-800 px-2 py-0.5 rounded">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Previous Questions Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Domande storico:</span>
            <span className="text-white">{performance.previousQuestions.length}</span>
          </div>

          {/* AI Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Generando AI...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <Zap className="w-3 h-3" />
                <span className="text-xs">AI Ready</span>
              </div>
            )}
          </div>

          {/* Test Button */}
          {onGenerateTest && (
            <Button
              onClick={onGenerateTest}
              disabled={isGenerating}
              size="sm"
              className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Test AI Generation
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700">
          🤖 Sistema AI Quiz Dinamico attivo
        </p>
      </Card>
    </div>
  );
}
