import { useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useDashboardData } from '../hooks/useDashboardData';
import { motion, useInView } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp,
  Sparkles,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Brain,
  Rocket,
  ArrowRight,
  Clock,
  Play,
  AlertTriangle
} from 'lucide-react';
import type { View } from '../App';
import { TradingGoals } from './TradingGoals';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, gamification, journalStats, aiSignal, loading, error } = useDashboardData();
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true });

  if (loading) {
    return (
      <div className="w-full relative p-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-16 h-16 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-zinc-800" />
            <Skeleton className="h-4 w-48 bg-zinc-800" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-zinc-800" />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl bg-zinc-800" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl bg-zinc-800" />
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-96 rounded-xl bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Lezioni Completate', 
      value: gamification?.lessons_completed || 0, 
      total: 15, 
      icon: BookOpen,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      percentage: ((gamification?.lessons_completed || 0) / 15) * 100
    },
    { 
      label: 'Quiz Score', 
      value: gamification?.quiz_score_total || 0, 
      total: 1000, // Example total
      icon: CheckCircle2,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      percentage: ((gamification?.quiz_score_total || 0) / 1000) * 100
    },
    { 
      label: 'Trading Volume', 
      value: `$${(gamification?.trading_volume ?? 0).toLocaleString()}`, 
      total: null, 
      icon: BarChart3,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      percentage: 100
    },
    { 
      label: 'PnL Totale', 
      value: `$${(journalStats?.totalPnL ?? 0).toLocaleString()}`, 
      total: null, 
      icon: TrendingUp,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      percentage: (journalStats?.totalPnL ?? 0) > 0 ? 100 : 0
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

  const goalsData = [
    {
      id: 'goal-1',
      title: 'Il Tuo Primo Premium',
      target: 1,
      current: (journalStats?.totalTrades ?? 0) > 0 ? 1 : 0,
      status: (journalStats?.totalTrades ?? 0) > 0 ? 'completed' as const : 'active' as const,
    },
    {
      id: 'goal-2',
      title: 'Colleziona $1,000 Premium',
      target: 1000,
      current: gamification?.trading_volume ?? 0,
      status: (gamification?.trading_volume ?? 0) >= 1000 ? 'completed' as const : 'active' as const,
    },
    {
      id: 'goal-3',
      title: 'Gestisci un’Assegnazione',
      target: 1,
      current: 0,
      status: 'locked' as const,
    },
  ];

  return (
    <div className="w-full relative">
      
      {/* Error Alert */}
      {error && (
        <div className="mb-6 w-full">
          <div className="bg-red-500/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold">Errore di Connessione</h3>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with User Info */}
      <motion.header 
        className="relative mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/30 border border-white/5 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full opacity-75 blur opacity-20"></div>
            <Avatar className="w-16 h-16 border-2 border-white/10 shadow-xl relative">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white text-xl font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-1">
              <div className="bg-green-500 w-3 h-3 rounded-full border border-[#050505]"></div>
            </div>
          </motion.div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Bentornato, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{profile?.full_name || 'Trader'}</span>
              </h1>
              <motion.div
                animate={{ 
                  rotate: [0, 14, -14, 14, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              >
                <img src="/mascot-excited.png" alt="FinGenius" className="w-8 h-8" />
              </motion.div>
            </div>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Il mercato ti aspetta. Ecco i tuoi progressi di oggi.</span>
            </p>
          </div>
        </div>
      </motion.header>

      {/* Stats Grid - Fixed Layout */}
      <motion.div
        ref={statsRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial="hidden"
        animate={isStatsInView ? "visible" : "hidden"}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              onHoverStart={() => {}}
              onHoverEnd={() => {}}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card className="relative p-6 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden group hover:border-white/20 transition-all h-full">
                {/* Gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} relative`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    {stat.percentage > 0 && (
                       <Badge className="bg-white/10 text-white border-0">
                         {Math.round(stat.percentage)}%
                       </Badge>
                    )}
                  </div>

                  <div>
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
                      {stat.total && <span className="text-gray-400">/ {stat.total}</span>}
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & AI Signal */}
        <div className="lg:col-span-2 space-y-8">
          
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
                      className={`w-full h-auto p-6 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-start gap-4 ${action.highlight ? 'ring-1 ring-emerald-500/50' : ''}`}
                    >
                       <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.gradient}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-full">
                          <p className="font-bold text-white mb-1 text-left">{action.title}</p>
                          <p className="text-xs text-white/60 text-left">{action.description}</p>
                        </div>
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* AI Signal / Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Ultimo Segnale AI
            </h2>

            {aiSignal ? (
              <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4">
                    <Badge className={
                      aiSignal.signal_type === 'buy' ? 'bg-emerald-500' : 
                      aiSignal.signal_type === 'sell' ? 'bg-red-500' : 'bg-zinc-500'
                    }>
                      {aiSignal.signal_type ? aiSignal.signal_type.toUpperCase() : 'NEUTRAL'}
                    </Badge>
                 </div>
                 <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{aiSignal.symbol}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-400 text-sm">Strike Price:</span>
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                          ${(aiSignal.strike_price ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">Premium Stimato: ${aiSignal.premium}</p>
                    </div>
                    <p className="text-gray-300 italic">"{aiSignal.reasoning}"</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(aiSignal.created_at).toLocaleString()}</span>
                    </div>
                 </div>
              </Card>
            ) : (
              <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 text-center text-gray-400">
                Nessun segnale AI recente disponibile.
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Badges & XP */}
        <div className="space-y-6">
          <TradingGoals goals={goalsData} />
          <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Livello & Badge
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('badges')} className="text-emerald-400">
                Vedi tutti
              </Button>
            </div>

            {/* XP Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">XP Totali</span>
                <span className="text-white font-bold">{gamification?.quiz_score_total || 0} / 1000</span>
              </div>
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]" 
                  style={{ width: `${Math.min(((gamification?.quiz_score_total || 0) / 1000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Continua così per il prossimo livello!</p>
            </div>
            
             {/* Badge List (Column) */}
             <div className="flex flex-col gap-4 flex-1">
                {/* Dynamically render badges here based on gamification data later if needed */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0">
                      <Star className="w-6 h-6 text-yellow-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white">Primi Passi</h4>
                      <p className="text-xs text-gray-400">Completa la prima lezione</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                      <Flame className="w-6 h-6 text-orange-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white">On Fire</h4>
                      <p className="text-xs text-gray-400">3 giorni di streak</p>
                   </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <Brain className="w-6 h-6 text-purple-500" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white">Knowledge Seeker</h4>
                      <p className="text-xs text-gray-400">Punteggio quiz perfetto</p>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Floating Mascot */}
      <motion.div
        className="fixed bottom-8 right-8 z-50 pointer-events-none hidden md:block"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
           animate={{ y: [0, -10, 0] }}
           transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
           className="relative w-40 h-40 filter drop-shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
             <img 
               src="/mascotte.png" 
               onError={(e) => e.currentTarget.src = '/mascot.png'}
               alt="Mascot" 
               className="w-full h-full object-contain"
             />
        </motion.div>
      </motion.div>
    </div>
  );
}
