import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Target, Clock, Lightbulb, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import type { PersonalizedRecommendation } from '../lib/openai';

interface OnboardingResultsProps {
  recommendations: PersonalizedRecommendation;
  onStart: () => void;
}

export function OnboardingResults({ recommendations, onStart }: OnboardingResultsProps) {
  const handleStart = () => {
    onStart();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative z-10"
      >
        <Card className="p-8 md:p-12 bg-slate-900/50 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-10 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            <Sparkles className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Piano di Studi Pronto! 🎉</h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
              L'AI ha analizzato il tuo profilo e creato una strategia formativa su misura per le tue esigenze.
            </p>
          </motion.div>

          {/* Custom Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <Card className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Lightbulb className="w-20 h-20 text-emerald-500" />
              </div>
              <p className="text-emerald-100/80 leading-relaxed font-medium text-lg relative z-10 italic">
                "{recommendations.customMessage}"
              </p>
            </Card>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-10"
          >
            <Card className="p-8 bg-slate-950/50 border border-white/5 rounded-[2rem] group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lezione di Partenza</h3>
              </div>
              <p className="text-5xl font-black text-white tracking-tighter">#{recommendations.startingLesson}</p>
              <p className="text-xs text-slate-500 font-medium mt-2 uppercase tracking-widest">Livello Ottimizzato</p>
            </Card>

            <Card className="p-8 bg-slate-950/50 border border-white/5 rounded-[2rem] group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Durata Stimata</h3>
              </div>
              <p className="text-5xl font-black text-white tracking-tighter">{recommendations.estimatedDuration}</p>
              <p className="text-xs text-slate-500 font-medium mt-2 uppercase tracking-widest">Ritmo Personalizzato</p>
            </Card>
          </motion.div>

          {/* Recommended Path */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-10 space-y-6"
          >
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              Percorso Consigliato
            </h3>
            <div className="grid gap-3">
              {recommendations.recommendedPath.map((lesson, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:bg-slate-950 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                    {index + 1}
                  </div>
                  <span className="text-slate-300 font-medium">{lesson}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Focus Areas & Tips */}
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-4"
            >
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500" /> Aree di Focus
              </h3>
              <div className="flex flex-wrap gap-2">
                {recommendations.focusAreas.map((area, index) => (
                  <Badge
                    key={index}
                    className="bg-slate-800 text-slate-300 border-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb className="w-3 h-3 text-emerald-500" /> Consigli
              </h3>
              <div className="space-y-3">
                {recommendations.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button
              onClick={handleStart}
              className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Inizia il Tuo Percorso
              <ArrowRight className="w-6 h-6 ml-4" />
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
