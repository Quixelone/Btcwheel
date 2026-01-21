import { useState, useEffect, useCallback } from 'react';
import {
  getUserProgress,
  createUserProgress,
  updateUserProgress,
  addUserActivity,
  getUserActivities,
  isSupabaseConfigured,
  type UserProgressDB,
  type UserActivity,
  supabase,
} from '../lib/supabase';
import { storage } from '../lib/localStorage';
import { useAuth } from './useAuth';
import type { UserProgress } from '../App';
import { PersistenceService } from '../services/PersistenceService';

export function useUserProgress() {
  const { user, session } = useAuth();
  const isLocalUser = user?.app_metadata?.provider === 'local';
  const useLocalStorage = !isSupabaseConfigured || !user || isLocalUser || !session;

  const defaultProgress: UserProgress = {
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    streak: 0,
    badges: [],
    lessonsCompleted: 0,
    totalLessons: 15,
    currentLesson: 1,
    completedLessons: [],
    perfectQuizzes: 0,
    profitableSimulations: 0,
  };

  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load progress
  const loadProgress = useCallback(async () => {
    setLoading(true);

    // 1. Always load local data first as fallback
    let localData: UserProgress | null = null;
    try {
      const savedProgress = storage.getItem('btc-wheel-progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        localData = {
          ...defaultProgress,
          ...parsed,
          completedLessons: parsed.completedLessons || [],
        };
      }
    } catch (e) { console.warn('Error reading local storage', e); }

    // If we are forced to use local storage, just use it
    if (useLocalStorage) {
      if (localData) setProgress(localData);
      setLoading(false);
      return;
    }

    // 2. Try loading from Supabase
    if (user) {
      try {
        let progressData = await getUserProgress(user.id);

        // If no progress exists, create new
        if (!progressData) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
          progressData = await createUserProgress(user.id, username);
        }

        // Load completed lessons from Persistence Service
        const kvData = await PersistenceService.load(user.id, 'progress');
        const kvCompletedLessons = kvData?.completedLessons || [];

        if (progressData) {
          const dbProgress = {
            level: progressData.level,
            xp: progressData.xp,
            xpToNextLevel: progressData.xp_to_next_level,
            streak: progressData.streak,
            badges: progressData.badges || [],
            lessonsCompleted: progressData.lessons_completed,
            totalLessons: progressData.total_lessons,
            currentLesson: progressData.current_lesson,
            completedLessons: kvCompletedLessons.length > 0 ? kvCompletedLessons : (localData?.completedLessons || []), // Prefer KV, then Local
            perfectQuizzes: (progressData as any).perfect_quizzes || 0,
            profitableSimulations: (progressData as any).profitable_simulations || 0,
          };

          setProgress(dbProgress);

          // Load recent activities
          const activitiesData = await getUserActivities(user.id, 10);
          setActivities(activitiesData);

          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.warn('Error loading from DB, falling back to local data:', dbError);
      }
    }

    // 3. Fallback: If DB failed or returned nothing, use local data
    if (localData) {
      console.log('Using local data as fallback');
      setProgress(localData);
    }

    setLoading(false);
  }, [user, useLocalStorage]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Sync progress
  const syncProgress = useCallback(
    async (updatedProgress: Partial<UserProgress>) => {
      setSyncing(true);
      try {
        const newProgress = { ...progress, ...updatedProgress };

        // 1. Save to localStorage always (as backup)
        storage.setItem('btc-wheel-progress', JSON.stringify(newProgress));

        // 2. Sync to Supabase if logged in
        if (!useLocalStorage && user) {
          try {
            const updates: Partial<UserProgressDB> = {
              level: updatedProgress.level,
              xp: updatedProgress.xp,
              xp_to_next_level: updatedProgress.xpToNextLevel,
              streak: updatedProgress.streak,
              badges: updatedProgress.badges,
              lessons_completed: updatedProgress.lessonsCompleted,
              current_lesson: updatedProgress.currentLesson,
            };

            await updateUserProgress(user.id, updates);

            // Sync completed lessons to Persistence Service
            if (updatedProgress.completedLessons) {
              await PersistenceService.save(user.id, 'progress', {
                completedLessons: updatedProgress.completedLessons
              });
            }
          } catch (dbError) {
            console.warn('Failed to sync to DB, but local storage updated:', dbError);
          }
        }

        setProgress(newProgress);
        return true;
      } catch (error) {
        console.error('Error syncing progress:', error);
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [user, progress, useLocalStorage]
  );

  // Add XP
  const addXP = useCallback(
    async (amount: number) => {
      const newXP = progress.xp + amount;
      let newLevel = progress.level;
      let newXPToNextLevel = progress.xpToNextLevel;

      if (newXP >= progress.xpToNextLevel) {
        newLevel += 1;
        newXPToNextLevel = progress.xpToNextLevel + 500;
      }

      const updatedProgress = {
        ...progress,
        xp: newXP,
        level: newLevel,
        xpToNextLevel: newXPToNextLevel,
      };

      setProgress(updatedProgress);

      if (user) {
        await syncProgress(updatedProgress);
      }
    },
    [progress, user, syncProgress]
  );

  // Complete lesson
  const completeLesson = useCallback(async (lessonId?: number) => {
    const completedLessonId = lessonId || progress.currentLesson;
    const completedLessonsArray = progress.completedLessons || [];
    const alreadyCompleted = completedLessonsArray.includes(completedLessonId);

    const updatedProgress = {
      ...progress,
      lessonsCompleted: alreadyCompleted ? progress.lessonsCompleted : progress.lessonsCompleted + 1,
      currentLesson: progress.currentLesson + 1,
      completedLessons: alreadyCompleted
        ? completedLessonsArray
        : [...completedLessonsArray, completedLessonId],
    };

    setProgress(updatedProgress);

    if (user) {
      await syncProgress(updatedProgress);
      await addUserActivity(
        user.id,
        'lesson_completed',
        `Completata lezione ${completedLessonId}`,
        250
      );

      const activitiesData = await getUserActivities(user.id, 10);
      setActivities(activitiesData);
    }

    return updatedProgress;
  }, [progress, user, syncProgress]);

  // Add badge
  const addBadge = useCallback(
    async (badgeId: string) => {
      if (progress.badges.includes(badgeId)) return;

      const updatedProgress = {
        ...progress,
        badges: [...progress.badges, badgeId],
      };

      setProgress(updatedProgress);

      if (user) {
        await syncProgress(updatedProgress);
        await addUserActivity(
          user.id,
          'badge_earned',
          `Sbloccato badge: ${badgeId}`,
          500
        );

        const activitiesData = await getUserActivities(user.id, 10);
        setActivities(activitiesData);
      }
    },
    [progress, user, syncProgress]
  );

  // Update streak
  const updateStreak = useCallback(
    async (newStreak: number) => {
      const updatedProgress = {
        ...progress,
        streak: newStreak,
      };

      setProgress(updatedProgress);

      if (user) {
        await syncProgress(updatedProgress);
      }
    },
    [progress, user, syncProgress]
  );

  return {
    progress,
    activities,
    loading,
    syncing,
    addXP,
    completeLesson,
    addBadge,
    updateStreak,
    syncProgress,
    reloadProgress: loadProgress,
  };
}
