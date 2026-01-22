import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { storage } from '../lib/localStorage';
import type { UserProfile, PersonalizedRecommendation } from '../lib/openai';
import { analyzeUserProfile } from '../lib/openai';
import { PersistenceService } from '../services/PersistenceService';

interface OnboardingState {
  completed: boolean;
  profile: UserProfile | null;
  recommendations: PersonalizedRecommendation | null;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState<OnboardingState>({
    completed: false,
    profile: null,
    recommendations: null,
  });

  // Internal loading state for the async operation
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Track which user ID the current data belongs to
  // undefined = initial state, null = guest/no user, string = user ID
  const [loadedUserId, setLoadedUserId] = useState<string | null | undefined>(undefined);

  // Load onboarding state
  useEffect(() => {
    const loadOnboardingState = async () => {
      setLoading(true);

      // Current user ID at start of operation
      const currentUserId = user?.id || null;

      // 1. Try DB if user exists
      if (user) {
        try {
          const dbData = await PersistenceService.load(user.id, 'onboarding');
          if (dbData && dbData.completed) {
            const newState = {
              completed: true,
              profile: dbData.data?.profile || null,
              recommendations: dbData.data?.recommendations || null
            };
            setOnboarding(newState);

            // Sync to local storage for future speed
            const storageKey = `btc-wheel-onboarding-${user.id}`;
            storage.setItem(storageKey, JSON.stringify(newState));

            setLoadedUserId(user.id);
            setLoading(false);
            return;
          }
        } catch (dbError) {
          console.warn('Onboarding DB load failed, trying local:', dbError);
          // Continue to local fallback
        }
      }

      // 2. Fallback to localStorage (runs if DB failed, returned null, or no user)
      try {
        const storageKey = user
          ? `btc-wheel-onboarding-${user.id}`
          : 'btc-wheel-onboarding';

        const saved = storage.getItem(storageKey);
        if (saved) {
          setOnboarding(JSON.parse(saved));
        } else {
          // Explicitly reset if nothing found
          setOnboarding({
            completed: false,
            profile: null,
            recommendations: null
          });
        }
      } catch (localError) {
        console.error('Error loading local onboarding:', localError);
      } finally {
        setLoadedUserId(currentUserId);
        setLoading(false);
      }
    };

    loadOnboardingState();
  }, [user]);

  // Complete onboarding with profile
  const completeOnboarding = useCallback(
    async (profile: UserProfile) => {
      setAnalyzing(true);

      try {
        // Try to get AI recommendations
        let recommendations: PersonalizedRecommendation | null = null;
        try {
          recommendations = await analyzeUserProfile(profile);
        } catch (aiError) {
          console.warn('AI analysis failed, continuing:', aiError);
        }

        const newState: OnboardingState = {
          completed: true,
          profile,
          recommendations,
        };

        // 1. Save to localStorage (Backup)
        const storageKey = user
          ? `btc-wheel-onboarding-${user.id}`
          : 'btc-wheel-onboarding';
        storage.setItem(storageKey, JSON.stringify(newState));

        // 2. Save to Supabase (Primary)
        if (user) {
          try {
            await PersistenceService.save(user.id, 'onboarding', {
              completed: true,
              data: newState
            });
          } catch (dbError) {
            console.error('Failed to save onboarding to DB:', dbError);
            // Don't throw, we saved locally
          }
        }

        setOnboarding(newState);
        // Update loadedUserId so we don't think we are loading anymore
        setLoadedUserId(user?.id || null);

        return recommendations;
      } catch (error) {
        console.error('Error completing onboarding:', error);
        return null;
      } finally {
        setAnalyzing(false);
      }
    },
    [user]
  );

  // Skip onboarding
  const skipOnboarding = useCallback(async () => {
    const defaultState: OnboardingState = {
      completed: true,
      profile: null,
      recommendations: null,
    };

    // Local Storage
    const storageKey = user
      ? `btc-wheel-onboarding-${user.id}`
      : 'btc-wheel-onboarding';
    storage.setItem(storageKey, JSON.stringify(defaultState));

    // Supabase
    if (user) {
      try {
        await PersistenceService.save(user.id, 'onboarding', {
          completed: true,
          data: defaultState
        });
      } catch (dbError) {
        console.error('Failed to save skip onboarding to DB:', dbError);
      }
    }

    setOnboarding(defaultState);
    setLoadedUserId(user?.id || null);
  }, [user]);

  // Reset onboarding
  const resetOnboarding = useCallback(async () => {
    const storageKey = user
      ? `btc-wheel-onboarding-${user.id}`
      : 'btc-wheel-onboarding';
    storage.removeItem(storageKey);

    // We don't delete from DB in this version to avoid accidental data loss via reset button
    // But we update local state
    setOnboarding({
      completed: false,
      profile: null,
      recommendations: null,
    });
    setLoadedUserId(user?.id || null);
  }, [user]);

  // Calculate effective loading state
  // If the user ID we loaded for doesn't match current user ID, we are still loading (race condition fix)
  const currentUserId = user?.id || null;
  const isLoadedForCurrentUser = loadedUserId === currentUserId;

  // If loadedUserId is undefined (initial), we are loading.
  // If loading is true (async op running), we are loading.
  // If loadedUserId mismatch, we are effectively loading (waiting for effect).
  const effectiveLoading = loading || loadedUserId === undefined || !isLoadedForCurrentUser;

  return {
    onboarding,
    loading: effectiveLoading,
    analyzing,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !effectiveLoading && !onboarding.completed,
  };
}