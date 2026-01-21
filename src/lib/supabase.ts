import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { storage } from './localStorage';

const customStorage = {
  getItem: (key: string) => storage.getItem(key),
  setItem: (key: string, value: string) => storage.setItem(key, value),
  removeItem: (key: string) => storage.removeItem(key),
};

const env = (import.meta as any).env || {};
const envSupabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const envSupabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabaseUrl = envSupabaseUrl || (projectId ? `https://${projectId}.supabase.co` : '');
const supabaseAnonKey = envSupabaseAnonKey || publicAnonKey || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? customStorage : undefined,
    },
  })
  : null as any;

export const getSupabaseClient = () => supabase;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string) => UUID_REGEX.test(value);

if (typeof window !== 'undefined' && env.DEV) {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase connected');
  } else {
    console.log('💾 Local mode enabled');
  }
}

// Types
export interface UserProgressDB {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  streak: number;
  badges: string[];
  lessons_completed: number;
  total_lessons: number;
  current_lesson: number;
  completed_lessons?: number[];
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  xp_earned: number;
  created_at: string;
}

export interface TradingSimulation {
  id: string;
  user_id: string;
  simulation_data: any;
  profit_loss: number;
  btc_price_at_start: number;
  btc_price_at_end: number | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  total_xp: number;
  level: number;
  streak: number;
  badges_count: number;
  rank: number;
  updated_at: string;
}

// Helper Functions

export async function getUserProgress(userId: string): Promise<UserProgressDB | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  if (!isUuid(userId)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809', '22P02'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error fetching user progress:', error);
      }
      return null;
    }

    return data;
  } catch (err) {
    // Silently catch any unexpected errors
    return null;
  }
}

export async function createUserProgress(userId: string, username: string): Promise<UserProgressDB | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  if (!isUuid(userId)) {
    return null;
  }

  try {
    const newProgress = {
      user_id: userId,
      level: 1,
      xp: 0,
      xp_to_next_level: 1000,
      streak: 0,
      badges: [],
      lessons_completed: 0,
      total_lessons: 15,
      current_lesson: 1,
      completed_lessons: [],
    };

    const { data, error } = await supabase
      .from('user_progress')
      .insert(newProgress)
      .select()
      .single();

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809', '22P02'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error creating user progress:', error);
      }
      return null;
    }

    // Also create leaderboard entry (silently fail if table doesn't exist)
    await supabase.from('leaderboard_entries').insert({
      user_id: userId,
      username: username,
      total_xp: 0,
      level: 1,
      streak: 0,
      badges_count: 0,
    }).catch(() => {
      // Silently ignore if leaderboard table doesn't exist
    });

    return data;
  } catch (err) {
    // Silently catch any unexpected errors
    return null;
  }
}

export async function updateUserProgress(
  userId: string,
  updates: Partial<UserProgressDB>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  if (!isUuid(userId)) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809', '22P02'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error updating user progress:', error);
      }
      return false;
    }

    // Update leaderboard if XP or level changed
    if (updates.xp !== undefined || updates.level !== undefined) {
      try {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('xp, level, streak, badges')
          .eq('user_id', userId)
          .single();

        if (progressData) {
          // Update leaderboard (silently fail if table doesn't exist)
          await supabase
            .from('leaderboard_entries')
            .update({
              total_xp: progressData.xp,
              level: progressData.level,
              streak: progressData.streak,
              badges_count: progressData.badges?.length || 0,
            })
            .eq('user_id', userId)
            .catch(() => {
              // Silently ignore if leaderboard table doesn't exist
            });

          // Recalculate ranks (silently fail if function doesn't exist)
          await supabase.rpc('update_leaderboard_ranks').catch(() => {
            // Silently ignore if RPC function doesn't exist
          });
        }
      } catch {
        // Silently ignore errors when updating leaderboard
      }
    }

    return true;
  } catch (err) {
    // Silently catch any unexpected errors
    return false;
  }
}

export async function addUserActivity(
  userId: string,
  activityType: string,
  description: string,
  xpEarned: number
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  if (!isUuid(userId)) return false;

  try {
    const { error } = await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      activity_description: description,
      xp_earned: xpEarned,
    });

    if (error) {
      // Silently ignore all errors for user activities
      // This is a non-critical feature that gracefully degrades when DB schema is missing
      return false;
    }

    return true;
  } catch (err) {
    // Silently catch any unexpected errors
    return false;
  }
}

export async function getUserActivities(userId: string, limit = 10): Promise<UserActivity[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  if (!isUuid(userId)) return [];

  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809', '22P02'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error fetching user activities:', error);
      }
      return [];
    }

    return data || [];
  } catch (err) {
    // Silently catch any unexpected errors
    return [];
  }
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      // 42P01: undefined_table, PGRST116: not found, PGRST204: column not found, PGRST205: table not in cache
      // 42703: undefined_column, 42809: SQL function/aggregate errors
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error fetching leaderboard:', error);
      }
      return [];
    }

    return data || [];
  } catch (err) {
    // Catch any unexpected errors
    return [];
  }
}

export async function saveTradingSimulation(
  userId: string,
  simulationData: any,
  btcPriceStart: number
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  if (!isUuid(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('trading_simulations')
      .insert({
        user_id: userId,
        simulation_data: simulationData,
        btc_price_at_start: btcPriceStart,
        status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809', '22P02'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error saving simulation:', error);
      }
      return null;
    }

    return data.id;
  } catch (err) {
    // Silently catch any unexpected errors
    return null;
  }
}

export async function completeTradingSimulation(
  simulationId: string,
  profitLoss: number,
  btcPriceEnd: number
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase
      .from('trading_simulations')
      .update({
        profit_loss: profitLoss,
        btc_price_at_end: btcPriceEnd,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', simulationId);

    if (error) {
      // Silently ignore table/column not found errors and SQL errors from missing schema
      const silentErrors = ['42P01', 'PGRST116', 'PGRST204', 'PGRST205', '42703', '42809'];
      const errorCode = error.code || '';
      if (!silentErrors.includes(errorCode)) {
        console.error('Error completing simulation:', error);
      }
      return false;
    }

    return true;
  } catch (err) {
    // Silently catch any unexpected errors
    return false;
  }
}
export async function saveSimulationState(userId: string, state: any): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  try {
    const { error } = await supabase.from('kv_store_7c0f82ca').upsert({
      key: `sim_state_${userId}`,
      value: state,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error saving simulation state to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error saving simulation state:', err);
    return false;
  }
}

export async function getSimulationState(userId: string): Promise<any | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('kv_store_7c0f82ca')
      .select('value')
      .eq('key', `sim_state_${userId}`)
      .maybeSingle();

    if (error) {
      console.error('Error fetching simulation state from Supabase:', error);
      return null;
    }

    return data?.value || null;
  } catch (err) {
    console.error('Unexpected error fetching simulation state:', err);
    return null;
  }
}
