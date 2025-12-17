import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getUserProfile,
  getUserGamification,
  getDailyJournalStats,
  getLatestAiSignal,
  UserProfile,
  UserGamification,
  AiTradingSignal
} from '../lib/supabase';

export interface DashboardData {
  profile: UserProfile | null;
  gamification: UserGamification | null;
  journalStats: { totalTrades: number; totalPnL: number };
  aiSignal: AiTradingSignal | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    gamification: null,
    journalStats: { totalTrades: 0, totalPnL: 0 },
    aiSignal: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const [profile, gamification, journalStats, aiSignal] = await Promise.all([
          getUserProfile(user.id),
          getUserGamification(user.id),
          getDailyJournalStats(user.id),
          getLatestAiSignal()
        ]);

        setData({
          profile,
          gamification,
          journalStats,
          aiSignal,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setData(prev => ({ ...prev, loading: false, error: 'Errore nel caricamento dei dati.' }));
      }
    }

    fetchData();
  }, [user]);

  return data;
}