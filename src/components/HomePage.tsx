import { useState } from 'react';
import { UserMenu } from './UserMenu';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useUserProgress } from '../hooks/useUserProgress';
import { motion } from 'motion/react';
import { 
  Zap, 
  Target, 
  Trophy, 
  Flame, 
  BookOpen, 
  Lock,
  Check,
  Star,
  Play,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { View } from '../App';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { progress: userProgress } = useUserProgress();
  const [hoveredLesson, setHoveredLesson] = useState<number | null>(null);
  
  const lessons = [
    { id: 1, title: 'Introduzione al Bitcoin', status: 'completed', xp: 100, category: 'Fondamenti' },
    { id: 2, title: 'Cos\'è la Wheel Strategy', status: 'completed', xp: 100, category: 'Fondamenti' },
    { id: 3, title: 'Vendere Cash-Secured Puts', status: 'completed', xp: 150, category: 'Strategie Base' },
    { id: 4, title: 'Vendere Covered Calls', status: 'completed', xp: 150, category: 'Strategie Base' },
    { id: 5, title: 'Gestione del Rischio', status: 'completed', xp: 200, category: 'Risk Management' },
    { id: 6, title: 'Calcolo della Volatilità', status: 'completed', xp: 200, category: 'Analisi Tecnica' },
    { id: 7, title: 'Strike Selection', status: 'completed', xp: 200, category: 'Analisi Tecnica' },
    { id: 8, title: 'Premium Collection', status: 'completed', xp: 250, category: 'Strategie Avanzate' },
    { id: 9, title: 'Roll & Adjust', status: 'current', xp: 250, category: 'Strategie Avanzate' },
    { id: 10, title: 'Trade Psychology', status: 'locked', xp: 300, category: 'Psicologia' },
    { id: 11, title: 'Portfolio Sizing', status: 'locked', xp: 300, category: 'Portfolio Management' },
    { id: 12, title: 'Market Analysis', status: 'locked', xp: 350, category: 'Analisi Mercato' },
    { id: 13, title: 'Advanced Strategies', status: 'locked', xp: 400, category: 'Strategie Avanzate' },
    { id: 14, title: 'Tax Considerations', status: 'locked', xp: 400, category: 'Fiscalità' },
    { id: 15, title: 'Master Exam', status: 'locked', xp: 500, category: 'Certificazione' }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fondamenti': 'from-blue-500 to-cyan-500',
      'Strategie Base': 'from-emerald-500 to-teal-500',
      'Risk Management': 'from-orange-500 to-red-500',
      'Analisi Tecnica': 'from-violet-500 to-purple-500',
      'Strategie Avanzate': 'from-pink-500 to-rose-500',
      'Psicologia': 'from-amber-500 to-yellow-500',
      'Portfolio Management': 'from-indigo-500 to-blue-500',
      'Analisi Mercato': 'from-teal-500 to-cyan-500',
      'Fiscalità': 'from-slate-500 to-gray-500',
      'Certificazione': 'from-yellow-400 to-orange-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-8 pb-8 text-white">
      
      {/* Background effects - slightly reduced since Layout handles background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none -z-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Modern Header */}
      <motion.header 
        className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-white/10 p-6 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
              Percorso di Apprendimento
            </h1>
            <p className="text-gray-400 text-sm">
              {userProgress.lessonsCompleted} di {userProgress.totalLessons} lezioni completate
            </p>
          </div>
          <div className="hidden md:block">
             <UserMenu onNavigate={onNavigate} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progresso Totale</span>
            <span>{Math.round((userProgress.lessonsCompleted / userProgress.totalLessons) * 100)}%</span>
          </div>
          <Progress value={(userProgress.lessonsCompleted / userProgress.totalLessons) * 100} className="h-2" />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
        
        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm">Livello</p>
                <p className="text-2xl font-bold">{userProgress.level}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-600 to-red-600 border-0 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-orange-100 text-sm">Streak</p>
                <p className="text-2xl font-bold">{userProgress.streak}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-violet-600 to-purple-600 border-0 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-purple-100 text-sm">Badge</p>
                <p className="text-2xl font-bold">{userProgress.badges.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 border-0 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Lezioni</p>
                <p className="text-2xl font-bold">{userProgress.lessonsCompleted}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lessons List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Tutte le Lezioni
          </h2>

          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isLocked = lesson.status === 'locked';
              const isCurrent = lesson.status === 'current';
              const isCompleted = lesson.status === 'completed';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  onHoverStart={() => setHoveredLesson(lesson.id)}
                  onHoverEnd={() => setHoveredLesson(null)}
                  whileHover={!isLocked ? { x: 4 } : {}}
                >
                  <Card 
                    className={`
                      relative overflow-hidden transition-all
                      ${isLocked ? 
                        'bg-gray-800/20 border-white/5 cursor-not-allowed' : 
                        'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-white/10 hover:border-white/20 cursor-pointer'
                      }
                      ${isCurrent ? 'ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-gray-950' : ''}
                    `}
                    onClick={() => !isLocked && onNavigate('lesson')}
                  >
                    {/* Animated gradient overlay for current lesson */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10"
                        animate={{ 
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                        style={{ backgroundSize: '200% 100%' }}
                      />
                    )}

                    <div className="relative p-4 md:p-5 flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={`
                        relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        ${isCompleted ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 
                          isCurrent ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                          'bg-gray-700/50'}
                      `}>
                        {isCompleted && <Check className="w-6 h-6 text-white" />}
                        {isCurrent && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Play className="w-6 h-6 text-white" />
                          </motion.div>
                        )}
                        {isLocked && <Lock className="w-6 h-6 text-gray-500" />}

                        {/* Pulse effect for current lesson */}
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-orange-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Lesson Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                            {lesson.title}
                          </h3>
                          {isCurrent && (
                            <motion.div
                              animate={{ rotate: [0, 14, -14, 14, 0] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                            </motion.div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            className={`
                              text-xs border-0
                              ${isLocked ? 'bg-gray-700/50 text-gray-500' : 
                                `bg-gradient-to-r ${getCategoryColor(lesson.category)} text-white`}
                            `}
                          >
                            {lesson.category}
                          </Badge>

                          <div className="flex items-center gap-1 text-xs">
                            <Zap className={`w-3 h-3 ${isLocked ? 'text-gray-600' : 'text-yellow-400'}`} />
                            <span className={isLocked ? 'text-gray-600' : 'text-gray-400'}>
                              {lesson.xp} XP
                            </span>
                          </div>

                          {isCompleted && (
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                              Completata
                            </Badge>
                          )}

                          {isCurrent && (
                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400 bg-orange-500/10">
                              In Corso
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Icon */}
                      {!isLocked && (
                        <motion.div
                          animate={hoveredLesson === lesson.id ? { x: [0, 4, 0] } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        </motion.div>
                      )}
                    </div>

                    {/* Progress bar for current lesson */}
                    {isCurrent && (
                      <div className="relative h-1 bg-white/5">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                          initial={{ width: '0%' }}
                          animate={{ width: '45%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="relative p-6 md:p-8 bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white overflow-hidden">
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Continua il tuo percorso!</h3>
                  <p className="text-emerald-100">
                    Hai completato {userProgress.lessonsCompleted} lezioni. Ancora {userProgress.totalLessons - userProgress.lessonsCompleted} da scoprire!
                  </p>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('lesson')}
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Riprendi Lezione
              </Button>
            </div>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}
