import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserProgress } from '../hooks/useUserProgress';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard, isSupabaseConfigured, type LeaderboardEntry as SupabaseLeaderboardEntry } from '../lib/supabase';
import { Trophy, Medal, Crown, Zap, TrendingUp, RefreshCcw, Sparkles, Target, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import type { View } from '../App';

interface LeaderboardViewProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  streak: number;
  badges: number;
  initials: string;
  color: string;
}

const mockGlobalLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'CryptoMaster99', level: 12, xp: 5420, streak: 45, badges: 15, initials: 'CM', color: 'from-yellow-400 to-yellow-600' },
  { rank: 2, username: 'BTCTrader', level: 11, xp: 4890, streak: 38, badges: 14, initials: 'BT', color: 'from-slate-300 to-slate-400' },
  { rank: 3, username: 'WheelPro', level: 10, xp: 4320, streak: 42, badges: 13, initials: 'WP', color: 'from-orange-400 to-orange-600' },
  { rank: 4, username: 'OptionGuru', level: 9, xp: 3850, streak: 28, badges: 12, initials: 'OG', color: 'from-blue-400 to-blue-600' },
  { rank: 5, username: 'SatoshiFan', level: 8, xp: 3210, streak: 31, badges: 11, initials: 'SF', color: 'from-purple-400 to-purple-600' },
  { rank: 6, username: 'DiamondHands', level: 7, xp: 2890, streak: 22, badges: 10, initials: 'DH', color: 'from-emerald-400 to-emerald-600' },
  { rank: 7, username: 'CryptoLearner', level: 6, xp: 2450, streak: 19, badges: 9, initials: 'CL', color: 'from-pink-400 to-pink-600' },
  { rank: 8, username: 'TradingNinja', level: 6, xp: 2180, streak: 25, badges: 8, initials: 'TN', color: 'from-indigo-400 to-indigo-600' },
  { rank: 9, username: 'CryptoUser', level: 5, xp: 1250, streak: 7, badges: 4, initials: 'CU', color: 'from-blue-400 to-blue-600' },
  { rank: 10, username: 'HODLKing', level: 5, xp: 1180, streak: 15, badges: 7, initials: 'HK', color: 'from-teal-400 to-teal-600' }
];

const weeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'QuickLearner', level: 6, xp: 890, streak: 7, badges: 3, initials: 'QL', color: 'from-yellow-400 to-yellow-600' },
  { rank: 2, username: 'CryptoUser', level: 5, xp: 750, streak: 7, badges: 4, initials: 'CU', color: 'from-slate-300 to-slate-400' },
  { rank: 3, username: 'FastTrader', level: 4, xp: 680, streak: 5, badges: 2, initials: 'FT', color: 'from-orange-400 to-orange-600' },
  { rank: 4, username: 'NewbiePro', level: 3, xp: 520, streak: 6, badges: 2, initials: 'NP', color: 'from-blue-400 to-blue-600' },
  { rank: 5, username: 'StudyMaster', level: 4, xp: 490, streak: 4, badges: 3, initials: 'SM', color: 'from-purple-400 to-purple-600' }
];

export function LeaderboardView({ onNavigate, mascotVisible, onMascotToggle }: LeaderboardViewProps) {
  const { progress: userProgress } = useUserProgress();
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<SupabaseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        const data = await getLeaderboard(50);
        setLeaderboardData(data);
        const userEntry = data.find(entry => entry.user_id === user.id);
        if (userEntry) setUserRank(userEntry.rank);
      } else {
        setLeaderboardData(mockGlobalLeaderboard as any);
      }
    } catch (error) {
      setLeaderboardData(mockGlobalLeaderboard as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />;
    if (rank === 2) return <Medal className="w-10 h-10 text-slate-400 drop-shadow-[0_0_15px_rgba(148,163,184,0.4)]" />;
    if (rank === 3) return <Medal className="w-10 h-10 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />;
    return <span className="text-slate-600 font-black text-xl">#{rank}</span>;
  };

  const renderLeaderboard = (data: LeaderboardEntry[], currentUser?: boolean) => (
    <div className="space-y-5">
      {data.map((entry, index) => {
        const isCurrentUser = currentUser && (entry.username === 'CryptoUser' || entry.username === user?.email?.split('@')[0]);

        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`p-8 transition-all duration-300 border-white/5 rounded-[2.5rem] relative overflow-hidden group shadow-xl ${isCurrentUser
                ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/10'
                : 'bg-slate-950/40 backdrop-blur-3xl hover:bg-slate-900/60 hover:border-white/10'
                }`}
            >
              {isCurrentUser && (
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
              )}

              <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 text-center flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="w-16 h-16 flex-shrink-0 border-4 border-slate-950 shadow-2xl">
                  <AvatarFallback className={`bg-gradient-to-br ${entry.color} text-white font-black text-xl uppercase`}>
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{entry.username}</h3>
                    {isCurrentUser && (
                      <Badge className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border-0 shadow-lg">Tu</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Lvl {entry.level}
                    </span>
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      {entry.xp} XP
                    </span>
                    <span className="hidden sm:flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      {entry.streak} Giorni
                    </span>
                  </div>
                </div>

                <div className="hidden md:block text-right flex-shrink-0 px-10">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-1">Badge</p>
                  <p className="text-2xl font-black text-white">{entry.badges}</p>
                </div>

                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity border border-white/5">
                  <ArrowRight className="w-6 h-6 text-slate-500" />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen md:pl-24 bg-slate-950 text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[180px] pointer-events-none -mr-96 -mt-96" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[180px] pointer-events-none -ml-96 -mb-96" />

      <Navigation currentView="leaderboard" onNavigate={onNavigate} mascotVisible={mascotVisible} onMascotToggle={onMascotToggle} />

      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 px-6 py-24 md:px-12 md:py-32">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/20 shadow-2xl">
              <Trophy className="w-14 h-14 text-yellow-300 drop-shadow-2xl" />
            </div>
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase">Classifica</h1>
          <p className="text-emerald-50 text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
            Scala la vetta dell'accademia e diventa un Master indiscusso della Wheel Strategy!
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:px-12 space-y-16 pb-40">
        {/* User Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-12 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex items-center gap-10 flex-1">
                <Avatar className="w-28 h-28 border-4 border-emerald-500/20 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-4xl font-black uppercase">
                    {user?.email?.substring(0, 2).toUpperCase() || 'CU'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-3">La Tua Posizione</h2>
                  <p className="text-slate-500 text-lg font-medium">Continua a imparare per scalare la vetta!</p>
                </div>
              </div>
              <div className="text-center md:text-right px-12">
                <p className="text-7xl font-black text-emerald-400 mb-3 tracking-tighter drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                  {loading ? '...' : userRank ? `#${userRank}` : '#--'}
                </p>
                <p className="text-slate-600 font-black text-[11px] uppercase tracking-[0.4em]">Rank Globale</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { label: 'Livello', value: userProgress.level || 1, icon: Target, color: 'emerald' },
                { label: 'XP Totali', value: userProgress.xp || 0, icon: Zap, color: 'yellow' },
                { label: 'Streak', value: `${userProgress.streak || 0}d`, icon: TrendingUp, color: 'blue' },
                { label: 'Badge', value: userProgress.badges?.length || 0, icon: Medal, color: 'purple' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-950/50 p-8 rounded-[2rem] border border-white/5 group-hover:border-white/10 transition-colors shadow-inner">
                  <div className="flex items-center gap-4 mb-3">
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 h-20 bg-slate-950/40 backdrop-blur-3xl p-2 rounded-[2rem] border border-white/10 shadow-xl">
            <TabsTrigger value="global" className="rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all shadow-lg">GLOBALE</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-[1.5rem] font-black text-[11px] tracking-[0.2em] data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all shadow-lg">SETTIMANALE</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <div className="space-y-10">
              <div className="flex items-center justify-between px-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  Top Traders
                </h2>
                <Button
                  variant="ghost"
                  onClick={loadLeaderboard}
                  disabled={loading}
                  className="text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl px-8 h-14 border border-white/5"
                >
                  <RefreshCcw className={`w-5 h-5 mr-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Aggiorna</span>
                </Button>
              </div>
              {renderLeaderboard(leaderboardData.length > 0 ? (leaderboardData as any) : mockGlobalLeaderboard, true)}
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="space-y-10">
              <div className="flex items-center justify-between px-6">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Questa Settimana</h2>
              </div>
              {renderLeaderboard(weeklyLeaderboard, true)}
              <Card className="p-10 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] text-center shadow-xl">
                <p className="text-blue-400 text-sm font-black uppercase tracking-[0.2em]">
                  ℹ️ La classifica settimanale si resetta ogni Lunedì alle 00:00 UTC
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
