import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { Button } from './ui/button';

import { Badge } from './ui/badge';
import { useUserProgress } from '../hooks/useUserProgress';
import { motion } from 'motion/react';
import { StatCard, StatCardSmall } from './ui/stat-card';
import { LessonCard } from './ui/lesson-card';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from './layout/PageWrapper';
import {
  Zap,
  Target,
  Trophy,
  Flame,
  BookOpen,
  Play,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react';
import type { View } from '../App';

interface HomePageProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

export function HomePage({ onNavigate, mascotVisible, onMascotToggle }: HomePageProps) {
  const { progress: userProgress } = useUserProgress();

  const totalLessons = userProgress.totalLessons || 15;
  const completedLessons = userProgress.lessonsCompleted || 0;
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100) || 0;

  const lessons = [
    { id: 1, title: 'Introduzione al Bitcoin', status: 'completed' as const, xp: 100, category: 'Fondamenti' },
    { id: 2, title: 'Cos\'è la Wheel Strategy', status: 'completed' as const, xp: 100, category: 'Fondamenti' },
    { id: 3, title: 'Vendere Cash-Secured Puts', status: 'completed' as const, xp: 150, category: 'Strategie Base' },
    { id: 4, title: 'Vendere Covered Calls', status: 'completed' as const, xp: 150, category: 'Strategie Base' },
    { id: 5, title: 'Gestione del Rischio', status: 'completed' as const, xp: 200, category: 'Risk Management' },
    { id: 6, title: 'Calcolo della Volatilità', status: 'completed' as const, xp: 200, category: 'Analisi Tecnica' },
    { id: 7, title: 'Strike Selection', status: 'current' as const, xp: 200, category: 'Analisi Tecnica' },
    { id: 8, title: 'Premium Collection', status: 'locked' as const, xp: 250, category: 'Strategie Avanzate' },
    { id: 9, title: 'Roll & Adjust', status: 'locked' as const, xp: 250, category: 'Strategie Avanzate' }
  ];

  return (
    <PageWrapper>
      <Navigation currentView="home" onNavigate={onNavigate} onMascotToggle={onMascotToggle} mascotVisible={mascotVisible} />

      <PageContent>
        {/* Header */}
        <PageHeader
          title="Accademia Bitcoin"
          subtitle={`${completedLessons}/${totalLessons} lezioni completate • ${progressPercentage}% del percorso`}
          badge={
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 mr-2 fill-current" />
              Il Tuo Percorso
            </Badge>
          }
          actions={
            <div className="flex items-center gap-3">
              <StatCardSmall label="Streak" value={userProgress.streak || 0} icon={Flame} color="orange" />
              <StatCardSmall label="XP" value={userProgress.xp || 0} icon={Zap} color="yellow" />
              <UserMenu onNavigate={onNavigate} />
            </div>
          }
        />

        {/* Progress Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Verso il Livello {(userProgress.level || 1) + 1}</h3>
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-2">Continua così!</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-[#666677]">Progresso</span>
                    <span className="text-white">{progressPercentage}%</span>
                  </div>
                  <div className="h-4 bg-[#050506] rounded-full overflow-hidden border border-white/[0.05]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center px-12 py-6 bg-white/[0.02] rounded-[24px] border border-white/[0.05]">
                <p className="text-6xl font-bold text-white tracking-tighter">{userProgress.level || 1}</p>
                <p className="text-xs font-bold text-[#666677] uppercase tracking-widest mt-2">Livello</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Livello" value={userProgress.level || 1} icon={Target} color="cyan" delay={0.3} />
          <StatCard label="Streak" value={`${userProgress.streak || 0}d`} icon={Flame} color="orange" delay={0.35} />
          <StatCard label="Badge" value={userProgress.badges?.length || 0} icon={Trophy} color="yellow" delay={0.4} />
          <StatCard label="Lezioni" value={completedLessons} icon={BookOpen} color="green" delay={0.45} />
        </div>

        {/* Lessons Section */}
        <section className="space-y-8">
          <SectionHeader
            title="Il Tuo Percorso"
            subtitle="Completa le lezioni per sbloccare nuovi contenuti"
            actions={
              <Button
                onClick={() => onNavigate('lessons')}
                className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-6 h-10 font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all group text-sm"
              >
                Vedi Tutto
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            }
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                category={lesson.category}
                xp={lesson.xp}
                status={lesson.status}
                onClick={() => onNavigate('lesson')}
                delay={0.5 + index * 0.05}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-12 bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 rounded-[32px] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 mx-auto mb-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                Pronto per la prossima <span className="text-purple-400">lezione?</span>
              </h2>
              <p className="text-[#888899] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                Continua il tuo percorso verso la padronanza della Wheel Strategy
              </p>

              <Button
                onClick={() => onNavigate('lesson')}
                className="h-14 px-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] group transition-all hover:-translate-y-1"
              >
                <Play className="w-5 h-5 mr-3 fill-current" />
                Inizia Lezione
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </motion.div>
      </PageContent>
    </PageWrapper>
  );
}