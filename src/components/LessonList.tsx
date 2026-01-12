import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useUserProgress } from '../hooks/useUserProgress';
import { lessons } from '../lib/lessons';
import { Lock, CheckCircle, Book, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { View } from '../App';

interface LessonListProps {
  onNavigate: (view: View, lessonId?: number) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

const difficultyColors = {
  beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzato'
};

export function LessonList({ onNavigate, mascotVisible, onMascotToggle }: LessonListProps) {
  const { progress } = useUserProgress();
  
  // Calculate completion stats
  const totalLessons = Object.keys(lessons).length;
  const completedLessons = progress.completedLessons.length;
  const completionPercentage = (completedLessons / totalLessons) * 100;

  const handleLessonClick = (lessonId: number) => {
    const lesson = lessons[lessonId];
    
    // Check if lesson is locked
    if (progress.level < lesson.requiredLevel) {
      return; // Locked lesson, do nothing
    }
    
    onNavigate('lesson', lessonId);
  };

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative">
      
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navigation 
        currentView="lessons" 
        onNavigate={(view) => onNavigate(view)}
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-8 md:px-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Book className="w-8 h-8 text-white drop-shadow-sm" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Percorso Formativo
              </h1>
              <motion.div
                animate={{ 
                  rotate: [0, 14, -14, 14, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </motion.div>
            </div>
            <p className="text-gray-400 mt-1">
              Impara la Bitcoin Wheel Strategy passo dopo passo
            </p>
          </div>
        </div>
        
        {/* Progress Summary */}
        <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Progresso Totale</span>
            <span className="text-emerald-400 font-bold">{completedLessons}/{totalLessons} Lezioni</span>
          </div>
          <Progress value={completionPercentage} className="h-3 bg-white/10" />
          <p className="text-gray-400 text-sm mt-3">
            {completionPercentage === 100 
              ? '🎉 Hai completato tutte le lezioni!' 
              : `Ancora ${totalLessons - completedLessons} lezioni da completare`}
          </p>
        </Card>
      </motion.header>

      {/* Lessons Grid */}
      <main className="relative max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Object.values(lessons).map((lesson, index) => {
            const isCompleted = progress.completedLessons.includes(lesson.id);
            const isLocked = progress.level < lesson.requiredLevel;
            const isAvailable = !isLocked;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={isAvailable ? { y: -4 } : {}}
              >
                <Card
                  className={`p-5 transition-all h-full ${
                    isLocked
                      ? 'bg-gray-800/20 border-white/5 opacity-50 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 cursor-pointer hover:border-emerald-500/50'
                      : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border-white/10 cursor-pointer hover:border-purple-500/40'
                  }`}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  {/* Lesson Number & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30' 
                          : isLocked
                          ? 'bg-gray-700/50'
                          : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6 text-gray-400" />
                        ) : (
                          <span className="font-bold text-white text-lg">{lesson.id}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={difficultyColors[lesson.difficulty]}>
                      {difficultyLabels[lesson.difficulty]}
                    </Badge>
                  </div>

                  {/* Lesson Title */}
                  <h3 className="text-white font-semibold mb-2 line-clamp-2 min-h-[3.5rem]">
                    {lesson.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[4rem]">
                    {lesson.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      <span>{lesson.questions.length} Quiz</span>
                    </div>
                  </div>

                  {/* Lock Info or CTA */}
                  {isLocked ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Lock className="w-4 h-4" />
                      <span>Livello {lesson.requiredLevel} richiesto</span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Completata</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonClick(lesson.id);
                      }}
                    >
                      Inizia Lezione
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Learning Path Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mt-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2 text-lg">📈 Percorso di Apprendimento Progressivo</h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  Ogni lezione sblocca nuovi contenuti. Completa le lezioni in ordine per massimizzare 
                  la comprensione e guadagnare XP per salire di livello!
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
                  <p className="text-white">
                    ✅ <strong className="text-emerald-400">Livello {progress.level}</strong> attuale • {progress.xp} XP
                  </p>
                  <p className="text-gray-300">
                    🔓 Hai accesso a {Object.values(lessons).filter(l => l.requiredLevel <= progress.level).length} lezioni
                  </p>
                  <p className="text-gray-300">
                    🔒 {Object.values(lessons).filter(l => l.requiredLevel > progress.level).length} lezioni ancora da sbloccare
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}