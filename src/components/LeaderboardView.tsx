import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserProgress } from '../hooks/useUserProgress';
import { useAuth } from '../hooks/useAuth';
import { getLeaderboard, isSupabaseConfigured, type LeaderboardEntry as SupabaseLeaderboardEntry } from '../lib/supabase';
import { LoadingSkeleton } from './animations/LoadingSkeleton';
import { Trophy, Medal, Crown, Zap, TrendingUp, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import type { View } from '../App';

interface LeaderboardViewProps {
  onNavigate: (view: View) => void;
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

// Mock data for fallback when Supabase is not configured
const mockGlobalLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'CryptoMaster99', level: 12, xp: 5420, streak: 45, badges: 15, initials: 'CM', color: 'from-yellow-400 to-yellow-600' },
  { rank: 2, username: 'BTCTrader', level: 11, xp: 4890, streak: 38, badges: 14, initials: 'BT', color: 'from-gray-300 to-gray-400' },
  { rank: 3, username: 'WheelPro', level: 10, xp: 4320, streak: 42, badges: 13, initials: 'WP', color: 'from-orange-400 to-orange-600' },
  { rank: 4, username: 'OptionGuru', level: 9, xp: 3850, streak: 28, badges: 12, initials: 'OG', color: 'from-blue-400 to-blue-600' },
  { rank: 5, username: 'SatoshiFan', level: 8, xp: 3210, streak: 31, badges: 11, initials: 'SF', color: 'from-purple-400 to-purple-600' },
  { rank: 6, username: 'DiamondHands', level: 7, xp: 2890, streak: 22, badges: 10, initials: 'DH', color: 'from-green-400 to-green-600' },
  { rank: 7, username: 'CryptoLearner', level: 6, xp: 2450, streak: 19, badges: 9, initials: 'CL', color: 'from-pink-400 to-pink-600' },
  { rank: 8, username: 'TradingNinja', level: 6, xp: 2180, streak: 25, badges: 8, initials: 'TN', color: 'from-indigo-400 to-indigo-600' },
  { rank: 9, username: 'CryptoUser', level: 5, xp: 1250, streak: 7, badges: 4, initials: 'CU', color: 'from-blue-400 to-blue-600' },
  { rank: 10, username: 'HODLKing', level: 5, xp: 1180, streak: 15, badges: 7, initials: 'HK', color: 'from-teal-400 to-teal-600' }
];

const globalLeaderboard = mockGlobalLeaderboard;

const weeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'QuickLearner', level: 6, xp: 890, streak: 7, badges: 3, initials: 'QL', color: 'from-yellow-400 to-yellow-600' },
  { rank: 2, username: 'CryptoUser', level: 5, xp: 750, streak: 7, badges: 4, initials: 'CU', color: 'from-gray-300 to-gray-400' },
  { rank: 3, username: 'FastTrader', level: 4, xp: 680, streak: 5, badges: 2, initials: 'FT', color: 'from-orange-400 to-orange-600' },
  { rank: 4, username: 'NewbiePro', level: 3, xp: 520, streak: 6, badges: 2, initials: 'NP', color: 'from-blue-400 to-blue-600' },
  { rank: 5, username: 'StudyMaster', level: 4, xp: 490, streak: 4, badges: 3, initials: 'SM', color: 'from-purple-400 to-purple-600' }
];

export function LeaderboardView({ onNavigate }: LeaderboardViewProps) {
  const { progress: userProgress } = useUserProgress();
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<SupabaseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Load leaderboard data
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && user) {
        const data = await getLeaderboard(50);
        setLeaderboardData(data);
        
        // Find user's rank
        const userEntry = data.find(entry => entry.user_id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      } else {
        // Use mock data if Supabase not configured
        setLeaderboardData(mockGlobalLeaderboard as any);
      }
    } catch (error) {
      // Silently fallback to mock data - errors are already logged in supabase.ts if needed
      setLeaderboardData(mockGlobalLeaderboard as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <span className="text-gray-600">#{rank}</span>;
  };

  const renderLeaderboard = (data: LeaderboardEntry[], currentUser?: boolean) => (
    <div className="space-y-3">
      {data.map((entry) => {
        const isCurrentUser = currentUser && entry.username === 'CryptoUser';
        
        return (
          <Card 
            key={entry.rank} 
            className={`p-4 transition-all ${
              isCurrentUser 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              {/* Rank */}
              <div className="w-10 md:w-12 text-center flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-11 h-11 md:w-12 md:h-12 flex-shrink-0">
                <AvatarFallback className={`bg-gradient-to-br ${entry.color} text-white`}>
                  {entry.initials}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900 truncate">{entry.username}</h3>
                  {isCurrentUser && (
                    <Badge className="bg-blue-600 text-white flex-shrink-0">Tu</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 flex-shrink-0" />
                    {entry.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 flex-shrink-0" />
                    {entry.xp}
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    {entry.streak}d
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="hidden md:block text-right flex-shrink-0">
                <p className="text-gray-600">Badge</p>
                <p className="text-gray-900">{entry.badges}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="leaderboard" onNavigate={onNavigate} />
      
      {/* Mobile-Optimized Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-8 md:px-6 md:py-12 safe-area-top">
        <div className="max-w-6xl text-center">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-yellow-300" />
          <h1 className="text-white mb-2">Classifica</h1>
          <p className="text-blue-100">Compete e scala la classifica!</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl px-4 py-5 md:px-6 md:py-8">
        {/* Your Stats - Mobile Optimized */}
        <Card className="p-5 md:p-6 mb-6 md:mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-5 md:mb-0">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <Avatar className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  CU
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 truncate">La Tua Posizione</h2>
                <p className="text-gray-600 hidden md:block">Continua a imparare per scalare!</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-gray-900 font-bold mb-1">
                {loading ? '...' : userRank ? `#${userRank}` : 'N/A'}
              </p>
              <p className="text-gray-600">Globale</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-6">
            <div className="text-center p-3 md:p-3 bg-white rounded-lg">
              <p className="text-gray-600 mb-1">Livello</p>
              <p className="text-gray-900 font-bold">{userProgress.level}</p>
            </div>
            <div className="text-center p-3 md:p-3 bg-white rounded-lg">
              <p className="text-gray-600 mb-1">XP</p>
              <p className="text-gray-900 font-bold">{userProgress.xp}</p>
            </div>
            <div className="text-center p-3 md:p-3 bg-white rounded-lg">
              <p className="text-gray-600 mb-1">Streak</p>
              <p className="text-gray-900 font-bold">{userProgress.streak}</p>
            </div>
            <div className="text-center p-3 md:p-3 bg-white rounded-lg">
              <p className="text-gray-600 mb-1">Badge</p>
              <p className="text-gray-900 font-bold">{userProgress.badges.length}</p>
            </div>
          </div>
        </Card>

        {/* Leaderboards - Mobile Optimized */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8 h-11">
            <TabsTrigger value="global">Globale</TabsTrigger>
            <TabsTrigger value="weekly">Settimana</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <h2 className="text-gray-900">Top Trader</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadLeaderboard}
                  disabled={loading}
                  className="h-9"
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Aggiorna
                </Button>
              </div>
              {renderLeaderboard(leaderboardData.length > 0 ? leaderboardData : globalLeaderboard, true)}
            </Card>
          </TabsContent>

          <TabsContent value="weekly">
            <Card className="p-5 md:p-6">
              <h2 className="text-gray-900 mb-5 md:mb-6">Questa Settimana</h2>
              {renderLeaderboard(weeklyLeaderboard, true)}
              <p className="text-sm text-gray-500 text-center mt-4">
                ℹ️ La classifica settimanale sarà disponibile a breve
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Challenges - Mobile Optimized */}
        <Card className="p-5 md:p-6 mt-6 md:mt-8">
          <h2 className="text-gray-900 mb-5 md:mb-6">Sfide Attive</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Settimana Perfetta</h3>
                <Badge className="bg-orange-600 text-white flex-shrink-0">In corso</Badge>
              </div>
              <p className="text-gray-700 mb-4">Completa una lezione ogni giorno per 7 giorni</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progresso</span>
                  <span className="text-gray-900 font-semibold">{userProgress.streak}/7</span>
                </div>
                <div className="w-full bg-white rounded-full h-3">
                  <div 
                    className="bg-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((userProgress.streak / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900">Trading Master</h3>
                <Badge className="bg-blue-600 text-white flex-shrink-0">In corso</Badge>
              </div>
              <p className="text-gray-700 mb-4">Completa 20 simulazioni con profitto</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Progresso</span>
                  <span className="text-gray-900 font-semibold">12/20</span>
                </div>
                <div className="w-full bg-white rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: '60%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
