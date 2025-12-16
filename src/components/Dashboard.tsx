import { useState, useRef } from 'react';
import { Navigation } from './Navigation';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
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
  ChevronRight,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Brain,
  Rocket,
  ArrowRight,
  Clock,
  Play
} from 'lucide-react';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const badgeData = {
  'first-lesson': { name: 'Prima Lezione', icon: Star, color: 'from-yellow-400 to-yellow-600' },
  'week-streak': { name: 'Settimana Perfetta', icon: Flame, color: 'from-orange-400 to-orange-600' },
  'quick-learner': { name: 'Apprendimento Rapido', icon: Zap, color: 'from-blue-400 to-blue-600' },
  'paper-trader': { name: 'Paper Trader', icon: TrendingUp, color: 'from-green-400 to-green-600' }
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { progress: userProgress } = useUserProgress();
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const stats = [
    { 
      label: 'Lezioni', 
      value: userProgress.lessonsCompleted, 
      total: userProgress.totalLessons, 
      icon: BookOpen,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      percentage: (userProgress.lessonsCompleted / userProgress.totalLessons) * 100
    },
    { 
      label: 'Streak', 
      value: userProgress.streak, 
      total: 30, 
      icon: Flame,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      percentage: (userProgress.streak / 30) * 100
    },
    { 
      label: 'Quiz', 
      value: 24, 
      total: 30, 
      icon: CheckCircle2,
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      percentage: 80
    },
    { 
      label: 'Trading', 
      value: 12, 
      total: 20, 
      icon: BarChart3,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      percentage: 60
    }
  ];

  const quickActions = [
    {
      title: 'Continua a Imparare',
      description: 'Strike Price Selection',
      icon: Play,
      gradient: 'from-emerald-600 to-teal-600',
      action: () => onNavigate('lessons'),
      highlight: true
    },
    {
      title: 'Simulatore Trading',
      description: 'Pratica le strategie',
      icon: BarChart3,
      gradient: 'from-violet-600 to-purple-600',
      action: () => onNavigate('simulation')
    },
    {
      title: 'Test Skills',
      description: 'Quiz intelligenti AI',
      icon: Brain,
      gradient: 'from-orange-600 to-red-600',
      action: () => onNavigate('lessons')
    }
  ];

  const recentActivity = [
    { 
      time: '2 ore fa', 
      title: 'Lezione completata', 
      description: 'Premium Collection Strategy',
      xp: 250, 
      icon: BookOpen, 
      color: 'emerald' 
    },
    { 
      time: 'Ieri', 
      title: 'Quiz superato', 
      description: '10/10 - Strike Selection', 
      xp: 100, 
      icon: CheckCircle2, 
      color: 'green' 
    },
    { 
      time: '2 giorni fa', 
      title: 'Simulazione profittevole', 
      description: '+8.5% rendimento', 
      xp: 200, 
      icon: TrendingUp, 
      color: 'violet' 
    },
    { 
      time: '3 giorni fa', 
      title: 'Badge sbloccato', 
      description: 'Quick Learner 🏆', 
      xp: 500, 
      icon: Trophy, 
      color: 'orange' 
    }
  ];

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
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navigation currentView="dashboard" onNavigate={onNavigate} />
      
      {/* Modern Header */}
      <motion.header 
        className="relative safe-area-top border-b border-white/5 backdrop-blur-xl bg-gray-900/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="w-14 h-14 border-2 border-white/10 shadow-xl ring-4 ring-emerald-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-bold">
                    CU
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Bentornato, Crypto User
                  </h1>
                  <motion.div
                    animate={{ 
                      rotate: [0, 14, -14, 14, 0],
                      scale: [1, 1.1, 1.1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                </div>
                <p className="text-gray-400 text-sm mt-0.5">
                  Continua il tuo percorso verso il trading profittevole
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl px-4 py-2"
                whileHover={{ scale: 1.02 }}
              >
                <Star className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">Livello {userProgress.level}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl px-4 py-2"
                whileHover={{ scale: 1.02 }}
              >
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-gray-300">{userProgress.streak} giorni</span>
              </motion.div>
            </div>
          </div>

          {/* XP Progress Bar - Modern */}
          <motion.div 
            className="mt-6 max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-400">
                  Progresso Livello {userProgress.level}
                </span>
              </div>
              <motion.span 
                className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                key={userProgress.xp}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {userProgress.xp} / {userProgress.xpToNextLevel} XP
              </motion.span>
            </div>
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(userProgress.xp / userProgress.xpToNextLevel) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/40 to-transparent rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(userProgress.xp / userProgress.xpToNextLevel) * 100}%`,
                  opacity: [0.6, 0.3, 0.6]
                }}
                transition={{ 
                  width: { duration: 1, ease: "easeOut", delay: 0.3 },
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid - Modern Cards */}
        <motion.div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="relative p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 overflow-hidden group hover:border-white/20 transition-colors">
                  {/* Gradient overlay on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4 relative`}>
                    <Icon className="w-5 h-5 text-white" />
                    {hoveredCard === index && (
                      <motion.div
                        className="absolute inset-0 bg-white rounded-xl"
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    )}
                  </div>

                  {/* Value */}
                  <div className="relative">
                    <div className="flex items-baseline gap-1 mb-1">
                      <motion.span 
                        className="text-3xl font-bold text-white"
                        key={stat.value}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {stat.value}
                      </motion.span>
                      <span className="text-gray-400">/ {stat.total}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{stat.label}</p>

                    {/* Mini progress bar */}
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${stat.gradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-emerald-400" />
                Azioni Rapide
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ y: -4 }}
                    >
                      <Button
                        onClick={action.action}
                        className={`w-full h-auto p-6 bg-gradient-to-br ${action.gradient} hover:opacity-90 border-0 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden ${action.highlight ? 'ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-gray-900' : ''}`}
                      >
                        {action.highlight && (
                          <motion.div
                            className="absolute top-2 right-2"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity,
                              repeatDelay: 3 
                            }}
                          >
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                          </motion.div>
                        )}
                        
                        <div className="flex flex-col items-start gap-3 text-left w-full">
                          <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white mb-1">{action.title}</p>
                            <p className="text-sm text-white/80">{action.description}</p>
                          </div>
                          <motion.div
                            className="ml-auto"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                          </motion.div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Attività Recente
              </h2>

              <Card className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  const colorClasses = {
                    emerald: 'from-emerald-500 to-teal-500',
                    green: 'from-green-500 to-lime-500',
                    violet: 'from-violet-500 to-purple-500',
                    orange: 'from-orange-500 to-red-500'
                  }[activity.color];

                  return (
                    <motion.div
                      key={index}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClasses} flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-white">{activity.title}</p>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-400">+{activity.xp} XP</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </Card>
            </div>
          </div>

          {/* Right Column - Badges & Achievements */}
          <div className="space-y-6">
            
            {/* Badges Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  I Tuoi Badge
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('badges')}
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                >
                  Vedi tutti
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {userProgress.badges.slice(0, 4).map((badgeId, index) => {
                    const badge = badgeData[badgeId as keyof typeof badgeData];
                    if (!badge) return null;
                    const Icon = badge.icon;
                    
                    return (
                      <motion.div
                        key={badgeId}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${badge.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs text-gray-400 text-center">{badge.name}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {userProgress.badges.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Completa lezioni per sbloccare badge!</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Next Milestone */}
            <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Prossimo Traguardo</h3>
                  <p className="text-sm text-gray-400">Livello {userProgress.level + 1}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progressi</span>
                  <span className="font-medium text-emerald-400">
                    {Math.round((userProgress.xp / userProgress.xpToNextLevel) * 100)}%
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  <p>• Completa 2 lezioni ({userProgress.xp + 400} XP)</p>
                  <p className="mt-1">• Supera 3 quiz ({userProgress.xp + 300} XP)</p>
                  <p className="mt-1">• Mantieni lo streak ({userProgress.xp + 100} XP)</p>
                </div>
              </div>
            </Card>

            {/* Leaderboard Teaser */}
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Classifica</h3>
                  <p className="text-sm text-gray-400">Sei al #42 questa settimana</p>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('leaderboard')}
                variant="ghost"
                className="w-full bg-white/5 hover:bg-white/10 text-white justify-between"
              >
                Vedi classifica completa
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>

          </div>
        </div>

      </main>
    </div>
  );
}
