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
} from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserProgress } from '../App';

export function useUserProgress() {
  const { user } = useAuth();
  const useLocalStorage = !isSupabaseConfigured || !user;
  const [progress, setProgress] = useState<UserProgress>({
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
  });
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load progress from localStorage or Supabase
  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use localStorage if Supabase is not configured or user not logged in
      if (useLocalStorage) {
        const savedProgress = localStorage.getItem('btc-wheel-progress');
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setProgress({
            ...parsed,
            completedLessons: parsed.completedLessons || [],
            perfectQuizzes: parsed.perfectQuizzes || 0,
            profitableSimulations: parsed.profitableSimulations || 0,
          });
        }
        setLoading(false);
        return;
      }

      // Load from Supabase if configured and user is logged in
      if (user) {
        let progressData = await getUserProgress(user.id);
        console.log('Dati recuperati (UserProgress):', progressData);

        // If no progress exists, create new
        if (!progressData) {
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
          progressData = await createUserProgress(user.id, username);
          console.log('Nuovi dati creati:', progressData);
        }

        if (progressData) {
          setProgress({
            level: progressData.level,
            xp: progressData.xp,
            xpToNextLevel: progressData.xp_to_next_level,
            streak: progressData.streak,
            badges: progressData.badges || [],
            lessonsCompleted: progressData.lessons_completed,
            totalLessons: progressData.total_lessons,
            currentLesson: progressData.current_lesson,
            completedLessons: (progressData as any).completed_lessons || [],
            perfectQuizzes: (progressData as any).perfect_quizzes || 0,
            profitableSimulations: (progressData as any).profitable_simulations || 0,
          });
        }

        // Load recent activities
        const activitiesData = await getUserActivities(user.id, 10);
        console.log('Dati recuperati (Activities):', activitiesData);
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Impossibile caricare i dati dal server.');
    } finally {
      setLoading(false);
    }
  }, [user, useLocalStorage]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Sync progress to localStorage or Supabase
  const syncProgress = useCallback(
    async (updatedProgress: Partial<UserProgress>) => {
      setSyncing(true);
      try {
        const newProgress = { ...progress, ...updatedProgress };
        
        // Save to localStorage always (as backup)
        localStorage.setItem('btc-wheel-progress', JSON.stringify(newProgress));
        
        // Sync to Supabase if configured and user logged in
        if (!useLocalStorage && user) {
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

      // Level up logic
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

      // Sync to Supabase
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

    // Sync to Supabase
    if (user) {
      await syncProgress(updatedProgress);
      await addUserActivity(
        user.id,
        'lesson_completed',
        `Completata lezione ${completedLessonId}`,
        250
      );
      
      // Reload activities
      const activitiesData = await getUserActivities(user.id, 10);
      setActivities(activitiesData);
    }
    
    // Return updated progress for badge checking
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

      // Sync to Supabase
      if (user) {
        await syncProgress(updatedProgress);
        await addUserActivity(
          user.id,
          'badge_earned',
          `Sbloccato badge: ${badgeId}`,
          500
        );
        
        // Reload activities
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

      // Sync to Supabase
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
    error,
    addXP,
    completeLesson,
    addBadge,
    updateStreak,
    syncProgress,
    reloadProgress: loadProgress,
  };
}
