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
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // Load onboarding state
  useEffect(() => {
    const loadOnboardingState = async () => {
      setLoading(true);

      try {
        // 1. Try to fetch from Persistence Service (DB)
        if (user) {
          const dbData = await PersistenceService.load(user.id, 'onboarding');
          if (dbData && dbData.completed) {
            setOnboarding({
              completed: true,
              profile: dbData.data?.profile || null,
              recommendations: dbData.data?.recommendations || null
            });
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to localStorage
        const storageKey = user
          ? `btc-wheel-onboarding-${user.id}`
          : 'btc-wheel-onboarding';

        const saved = storage.getItem(storageKey);
        if (saved) {
          setOnboarding(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      } finally {
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
          await PersistenceService.save(user.id, 'onboarding', {
            completed: true,
            data: newState
          });
        }

        setOnboarding(newState);
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
      await PersistenceService.save(user.id, 'onboarding', {
        completed: true,
        data: defaultState
      });
    }

    setOnboarding(defaultState);
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
  }, [user]);

  return {
    onboarding,
    loading,
    analyzing,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !loading && !onboarding.completed,
  };
}