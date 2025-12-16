import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Target, Clock, Lightbulb, TrendingUp, ArrowRight } from 'lucide-react';
import type { PersonalizedRecommendation } from '../lib/openai';

interface OnboardingResultsProps {
  recommendations: PersonalizedRecommendation;
  onStart: () => void;
}

export function OnboardingResults({ recommendations, onStart }: OnboardingResultsProps) {
  const handleStart = () => {
    console.log('[OnboardingResults] Button clicked - calling onStart');
    onStart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4 safe-area-inset">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card className="p-6 md:p-10 shadow-2xl">
          {/* Success Icon */}
          <motion.div
            className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-gray-900 mb-3">Percorso Personalizzato Pronto! 🎉</h1>
            <p className="text-gray-600 text-lg">
              L'AI ha analizzato il tuo profilo e creato un percorso formativo su misura per te
            </p>
          </motion.div>

          {/* Custom Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <p className="text-gray-900 leading-relaxed">{recommendations.customMessage}</p>
            </Card>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900">Lezione di Partenza</h3>
              </div>
              <p className="text-3xl text-blue-600 font-bold">#{recommendations.startingLesson}</p>
              <p className="text-sm text-gray-600 mt-1">Inizierai dal livello giusto per te</p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-gray-900">Durata Stimata</h3>
              </div>
              <p className="text-3xl text-purple-600 font-bold">{recommendations.estimatedDuration}</p>
              <p className="text-sm text-gray-600 mt-1">Al tuo ritmo di apprendimento</p>
            </Card>
          </motion.div>

          {/* Recommended Path */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">Percorso Raccomandato</h3>
            </div>
            <div className="space-y-2">
              {recommendations.recommendedPath.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Badge className="bg-blue-600 text-white flex-shrink-0">{index + 1}</Badge>
                  <span className="text-gray-900">{lesson}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="text-gray-900">Aree di Focus</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendations.focusAreas.map((area, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-orange-300 text-orange-700 bg-orange-50"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="text-gray-900">Consigli per il Successo</h3>
            </div>
            <div className="space-y-2">
              {recommendations.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-yellow-600 flex-shrink-0 mt-1">💡</span>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg"
            >
              Inizia il Tuo Percorso
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
