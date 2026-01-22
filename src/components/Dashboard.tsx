import { useRef } from 'react';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { Button } from './ui/button';
import { useUserProgress } from '../hooks/useUserProgress';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from './layout/PageWrapper';
import { StatCard } from './ui/stat-card';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Star,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

const badgeData = {
  'first-lesson': { name: 'Prima Lezione', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  'week-streak': { name: 'Settimana Perfetta', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'quick-learner': { name: 'Apprendimento Rapido', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'paper-trader': { name: 'Paper Trader', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
};

export function Dashboard({ onNavigate, mascotVisible, onMascotToggle }: DashboardProps) {
  const { user } = useAuth();
  const { progress: userProgress } = useUserProgress();
  const statsRef = useRef<HTMLDivElement>(null);


  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Trader';


  const xpToNext = userProgress.xpToNextLevel && userProgress.xpToNextLevel > 0 ? userProgress.xpToNextLevel : 1000;
  const currentXP = userProgress.xp || 0;
  const xpPercentage = Math.min(100, Math.max(0, (currentXP / xpToNext) * 100)) || 0;

  const quickActions = [
    {
      title: 'Nuova Lezione',
      description: 'Continua il tuo percorso',
      icon: BookOpen,
      action: () => onNavigate('lessons'),
      color: 'purple'
    },
    {
      title: 'Simulatore',
      description: 'Trading senza rischi',
      icon: TrendingUp,
      action: () => onNavigate('simulation'),
      color: 'cyan'
    },
    {
      title: 'Classifica',
      description: 'Scala la vetta',
      icon: Trophy,
      action: () => onNavigate('leaderboard'),
      color: 'yellow'
    }
  ];

  const recentActivities = [
    { icon: BookOpen, text: 'Completata Lezione: Opzioni Call', time: '2 ore fa', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: TrendingUp, text: 'Nuovo Trade Simulato: BTC Put', time: '1 giorno fa', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { icon: Trophy, text: 'Guadagnato Badge: Prima Lezione', time: '2 giorni fa', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
  ];

  return (
    <PageWrapper>
      <Navigation currentView="dashboard" onNavigate={onNavigate} onMascotToggle={onMascotToggle} mascotVisible={mascotVisible} />

      <PageContent>
        {/* Header Section */}
        <PageHeader
          title={`Bentornato, ${userName}!`}
          subtitle="Ecco una panoramica dei tuoi progressi e delle prossime sfide."
          actions={
            <UserMenu onNavigate={onNavigate} />
          }
          badge={
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-[#888899]">
                <Target className="w-3.5 h-3.5 text-purple-400" /> Livello {userProgress.level || 1}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-[#888899]">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> {userProgress.streak || 0} Giorni
              </span>
            </div>
          }
        />

        {/* Level Progress Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative overflow-hidden bg-[#0A0A0C] border border-white/[0.08] rounded-[32px] p-8 md:p-12 shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]">
                    <Trophy className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Verso il Livello {(userProgress.level || 1) + 1}</h2>
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-2">Prossimo Traguardo</p>
                  </div>
                </div>

                <p className="text-[#888899] text-lg leading-relaxed mb-10">
                  Ti mancano solo <strong className="text-white">{Math.max(0, xpToNext - currentXP)} XP</strong> per sbloccare nuove strategie avanzate. Continua così!
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-[#666677]">Progresso Attuale</span>
                    <span className="text-white">{Math.round(xpPercentage)}%</span>
                  </div>
                  <div className="h-4 bg-[#050506] rounded-full overflow-hidden border border-white/[0.05]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>

              {/* Level Circle */}
              <div className="hidden md:flex flex-col items-center justify-center px-12 border-l border-white/[0.05]">
                <div className="relative">
                  <div className="text-8xl font-bold text-white tracking-tighter">{userProgress.level || 1}</div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
                </div>
                <div className="text-xs font-bold text-[#666677] uppercase tracking-widest mt-2">Livello Attuale</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Lezioni" value={userProgress.lessonsCompleted || 0} icon={BookOpen} color="cyan" delay={0.2} />
          <StatCard label="XP Totali" value={currentXP} icon={Zap} color="yellow" delay={0.3} />
          <StatCard label="Streak" value={`${userProgress.streak || 0}d`} icon={Flame} color="orange" delay={0.4} />
          <StatCard label="Badge" value={userProgress.badges?.length || 0} icon={Award} color="purple" delay={0.5} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Actions */}
            <section>
              <SectionHeader title="Azioni Rapide" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colors = {
                    purple: 'text-purple-400 group-hover:text-purple-300',
                    cyan: 'text-cyan-400 group-hover:text-cyan-300',
                    yellow: 'text-yellow-400 group-hover:text-yellow-300'
                  }[action.color];

                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <button
                        onClick={action.action}
                        className="w-full text-left bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6 hover:border-white/[0.15] hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col justify-between"
                      >
                        <div>
                          <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`w-6 h-6 ${colors}`} />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                          <p className="text-[#666677] text-sm font-medium leading-relaxed">{action.description}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white transition-colors">
                          Apri <ArrowRight className="w-3 h-3" />
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <SectionHeader title="Attività Recente" />
              <div className="mt-6 bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] overflow-hidden">
                <div className="divide-y divide-white/[0.05]">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center gap-5 p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${activity.bg} ${activity.border} ${activity.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">{activity.text}</p>
                          <p className="text-xs font-medium text-[#666677] mt-1">{activity.time}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            {/* Badges */}
            <section>
              <SectionHeader
                title="Badge"
                actions={
                  <Button variant="ghost" onClick={() => onNavigate('badges')} className="text-xs h-8 px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                    Vedi Tutti
                  </Button>
                }
              />
              <div className="mt-6 bg-[#0A0A0C] border border-white/[0.08] rounded-[24px] p-6">
                {userProgress.badges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {userProgress.badges.slice(0, 4).map((badgeId) => {
                      const badge = badgeData[badgeId as keyof typeof badgeData];
                      if (!badge) return null;
                      const Icon = badge.icon;
                      return (
                        <div key={badgeId} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors cursor-pointer">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${badge.bg} ${badge.border} ${badge.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-bold text-[#888899] uppercase tracking-wider">{badge.name}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-[#666677]">Nessun badge sbloccato</p>
                  </div>
                )}
              </div>
            </section>

            {/* Next Milestone */}
            <section>
              <SectionHeader title="Milestone" />
              <div className="mt-6 bg-gradient-to-br from-purple-900/10 to-transparent border border-purple-500/20 rounded-[24px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1">Prossimo</p>
                    <h4 className="text-xl font-bold text-white">Livello {userProgress.level + 1}</h4>
                  </div>
                  <Target className="w-6 h-6 text-purple-500" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-purple-500/70">XP</span>
                      <span className="text-white">{Math.round(xpPercentage)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#050506] rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[60%] shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${xpPercentage}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    {[
                      { text: 'Completa 3 lezioni', done: userProgress.lessonsCompleted >= 3 },
                      { text: 'Mantieni streak', done: userProgress.streak > 0 }
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-medium">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${task.done ? 'bg-purple-500 border-purple-500' : 'border-white/20'}`}>
                          {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={task.done ? 'text-white' : 'text-[#666677]'}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
}
