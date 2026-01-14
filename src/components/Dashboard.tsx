import { useRef } from 'react';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUserProgress } from '../hooks/useUserProgress';
import { motion, useInView } from 'motion/react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Zap, 
  Star, 
  Target, 
  TrendingUp,
  Sparkles,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Brain,
  Rocket,
  Play,
  Link as LinkIcon,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

const badgeData = {
  'first-lesson': { name: 'Prima Lezione', icon: Star, color: 'from-yellow-400 to-yellow-600' },
  'week-streak': { name: 'Settimana Perfetta', icon: Flame, color: 'from-orange-400 to-orange-600' },
  'quick-learner': { name: 'Apprendimento Rapido', icon: Zap, color: 'from-blue-400 to-blue-600' },
  'paper-trader': { name: 'Paper Trader', icon: TrendingUp, color: 'from-green-400 to-green-600' }
};

export function Dashboard({ onNavigate, mascotVisible, onMascotToggle }: DashboardProps) {
  const { progress: userProgress } = useUserProgress();
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true });

  const stats = [
    { 
      label: 'Lezioni', 
      value: userProgress.lessonsCompleted, 
      total: userProgress.totalLessons, 
      icon: BookOpen,
      gradient: 'from-emerald-400 to-teal-500',
      percentage: (userProgress.lessonsCompleted / userProgress.totalLessons) * 100
    },
    { 
      label: 'Streak', 
      value: userProgress.streak, 
      total: 30, 
      icon: Flame,
      gradient: 'from-pink-500 to-red-500',
      percentage: (userProgress.streak / 30) * 100
    },
    { 
      label: 'Quiz', 
      value: 24, 
      total: 30, 
      icon: CheckCircle2,
      gradient: 'from-lime-400 to-green-500',
      percentage: 80
    },
    { 
      label: 'Trading', 
      value: 12, 
      total: 20, 
      icon: BarChart3,
      gradient: 'from-purple-500 to-violet-600',
      percentage: 60
    }
  ];

  const quickActions = [
    {
      title: 'Continua a Imparare',
      description: 'Strike Price Selection',
      icon: Play,
      gradient: 'from-emerald-500 to-teal-600',
      action: () => onNavigate('lessons'),
      badge: '✨'
    },
    {
      title: 'Connetti Exchange',
      description: 'Importa i tuoi trade reali',
      icon: LinkIcon,
      gradient: 'from-pink-500 to-purple-600',
      action: () => onNavigate('exchange')
    },
    {
      title: 'Wheel Strategy',
      description: 'Dashboard 0DTE Trading',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-600',
      action: () => onNavigate('wheel-strategy')
    },
    {
      title: 'Simulatore Trading',
      description: 'Pratica le strategie',
      icon: TrendingUp,
      gradient: 'from-purple-600 to-fuchsia-600',
      action: () => onNavigate('longterm')
    },
    {
      title: 'Test Skills',
      description: 'Quiz Intelligenti AI',
      icon: Brain,
      gradient: 'from-orange-500 to-red-600',
      action: () => onNavigate('lessons')
    }
  ];

  const recentActivities = [
    { icon: CheckCircle, text: 'Lezione completata', time: '2 ore fa', color: 'text-emerald-400' },
    { icon: Trophy, text: 'Nuovo badge ottenuto!', time: '1 giorno fa', color: 'text-yellow-400' },
    { icon: TrendingUp, text: 'Trade simulato', time: '2 giorni fa', color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navigation 
        currentView="dashboard" 
        onNavigate={onNavigate}
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />

      <div className="md:pl-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-[1600px]">
          
          {/* Header Card */}
          <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-emerald-500 shadow-lg shadow-emerald-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-xl font-bold">
                    CU
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Bentornato, Crypto User ✨
                  </h2>
                  <p className="text-sm text-gray-400">
                    Continua il tuo percorso verso il trading professionale
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* User Menu for logout */}
                <UserMenu onNavigate={onNavigate} />
                
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-400">Livello {userProgress.level}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-400">{userProgress.streak} giorni</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  ⚡ Progresso Livello {userProgress.level}
                </span>
                <span className="text-sm font-semibold text-emerald-400">
                  {userProgress.xp} / {userProgress.xpToNextLevel} XP
                </span>
              </div>
              <Progress 
                value={(userProgress.xp / userProgress.xpToNextLevel) * 100} 
                className="h-2 bg-slate-800"
              />
            </div>
          </Card>

          {/* Stats Grid */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    {/* Top gradient bar */}
                    <div className={`h-2 -mx-4 -mt-4 mb-4 rounded-t-lg bg-gradient-to-r ${stat.gradient}`} />
                    
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white leading-none">{stat.value}</p>
                        <p className="text-sm text-gray-500">/ {stat.total}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                    
                    <Progress 
                      value={stat.percentage} 
                      className="h-1.5 bg-slate-800"
                    />
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Actions & Activities */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Azioni Rapide */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Azioni Rapide</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          onClick={action.action}
                          className={`relative overflow-hidden p-5 cursor-pointer border-0 bg-gradient-to-br ${action.gradient} hover:shadow-xl transition-all duration-300 group`}
                        >
                          {action.badge && (
                            <div className="absolute top-3 right-3 text-xl">
                              {action.badge}
                            </div>
                          )}

                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          <h4 className="text-base font-bold text-white mb-1">
                            {action.title}
                          </h4>
                          <p className="text-white/90 text-sm">
                            {action.description}
                          </p>

                          <div className="mt-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Attività Recente */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Attività Recente</h3>
                </div>

                <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50">
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center ${activity.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{activity.text}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Badges & Next Milestone */}
            <div className="space-y-6">
              
              {/* I Tuoi Badge */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">I Tuoi Badge</h3>
                  </div>
                  <button 
                    onClick={() => onNavigate('leaderboard')}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Vedi tutti →
                  </button>
                </div>

                <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50">
                  {userProgress.badges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {userProgress.badges.slice(0, 4).map((badgeId) => {
                        const badge = badgeData[badgeId as keyof typeof badgeData];
                        if (!badge) return null;
                        const Icon = badge.icon;
                        
                        return (
                          <motion.div
                            key={badgeId}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="cursor-pointer"
                          >
                            <div className="text-center">
                              <div className={`w-16 h-16 mx-auto mb-2 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center shadow-lg`}>
                                <Icon className="w-8 h-8 text-white" />
                              </div>
                              <p className="text-xs text-gray-300">{badge.name}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-sm text-gray-400">
                        Completa lezioni per sbloccare badge!
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Prossimo Traguardo */}
              <div>
                <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/30">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                        <h4 className="font-bold text-white">Prossimo Traguardo</h4>
                      </div>
                      <p className="text-sm text-emerald-300">Livello {userProgress.level + 1}</p>
                    </div>
                    
                    {/* Target Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-gray-400">Progressi</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-300">
                      <span className="font-medium">{Math.round((userProgress.xp / userProgress.xpToNextLevel) * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Completa 3 lezioni ({userProgress.lessonsCompleted}/3)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Mantieni lo streak (100 XP)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Completa 2 quiz (80 XP)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
