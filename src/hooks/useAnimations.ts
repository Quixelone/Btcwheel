import { useState, useCallback } from 'react';
import { useHaptics } from './useHaptics';
import { useMascotSounds } from './useMascotSounds';

export interface AnimationTriggers {
  xpGain: boolean;
  quizFeedback: { show: boolean; isCorrect: boolean | null };
  streakIncrement: boolean;
  levelUp: boolean;
  badgeUnlock: boolean;
  lessonComplete: boolean;
}

export function useAnimations() {
  const haptics = useHaptics();
  const mascotSounds = useMascotSounds();

  const [triggers, setTriggers] = useState<AnimationTriggers>({
    xpGain: false,
    quizFeedback: { show: false, isCorrect: null },
    streakIncrement: false,
    levelUp: false,
    badgeUnlock: false,
    lessonComplete: false,
  });

  // XP Gain Animation
  const triggerXPGain = useCallback((_amount: number) => {
    setTriggers(prev => ({ ...prev, xpGain: true }));
    mascotSounds.success();
    haptics.success();

    setTimeout(() => {
      setTriggers(prev => ({ ...prev, xpGain: false }));
    }, 100);
  }, [mascotSounds, haptics]);

  // Quiz Feedback Animation
  const triggerQuizFeedback = useCallback((isCorrect: boolean) => {
    setTriggers(prev => ({
      ...prev,
      quizFeedback: { show: true, isCorrect }
    }));

    if (isCorrect) {
      mascotSounds.excited();
      haptics.success();
    } else {
      mascotSounds.disappointed();
      haptics.error();
    }

    // Hide after animation completes (increased to 1000ms for smoother experience)
    setTimeout(() => {
      setTriggers(prev => ({
        ...prev,
        quizFeedback: { show: false, isCorrect: null }
      }));
    }, 1000);
  }, [mascotSounds, haptics]);

  // Dismiss Quiz Feedback immediately
  const dismissQuizFeedback = useCallback(() => {
    setTriggers(prev => ({
      ...prev,
      quizFeedback: { show: false, isCorrect: null }
    }));
  }, []);

  // Streak Increment Animation
  const triggerStreakIncrement = useCallback(() => {
    setTriggers(prev => ({ ...prev, streakIncrement: true }));
    mascotSounds.excited();
    haptics.success();

    setTimeout(() => {
      setTriggers(prev => ({ ...prev, streakIncrement: false }));
    }, 100);
  }, [mascotSounds, haptics]);

  // Level Up Animation (to be implemented with Runway)
  const triggerLevelUp = useCallback((_newLevel: number) => {
    setTriggers(prev => ({ ...prev, levelUp: true }));
    mascotSounds.success();
    haptics.success();

    // Level up should stay visible longer - controlled by component
    setTimeout(() => {
      setTriggers(prev => ({ ...prev, levelUp: false }));
    }, 100);
  }, [mascotSounds, haptics]);

  // Badge Unlock Animation (to be implemented with Runway)
  const triggerBadgeUnlock = useCallback((_badgeId: string) => {
    setTriggers(prev => ({ ...prev, badgeUnlock: true }));
    mascotSounds.success();
    haptics.success();

    setTimeout(() => {
      setTriggers(prev => ({ ...prev, badgeUnlock: false }));
    }, 100);
  }, [mascotSounds, haptics]);

  // Lesson Complete Animation (to be implemented with Runway)
  const triggerLessonComplete = useCallback(() => {
    setTriggers(prev => ({ ...prev, lessonComplete: true }));
    mascotSounds.success();
    haptics.success();

    setTimeout(() => {
      setTriggers(prev => ({ ...prev, lessonComplete: false }));
    }, 100);
  }, [mascotSounds, haptics]);

  // Reset all triggers
  const resetAll = useCallback(() => {
    setTriggers({
      xpGain: false,
      quizFeedback: { show: false, isCorrect: null },
      streakIncrement: false,
      levelUp: false,
      badgeUnlock: false,
      lessonComplete: false,
    });
  }, []);

  return {
    triggers,
    triggerXPGain,
    triggerQuizFeedback,
    dismissQuizFeedback,
    triggerStreakIncrement,
    triggerLevelUp,
    triggerBadgeUnlock,
    triggerLessonComplete,
    resetAll,
  };
}
