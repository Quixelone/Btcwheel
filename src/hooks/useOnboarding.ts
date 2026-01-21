import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { storage } from '../lib/localStorage';
import type { UserProfile, PersonalizedRecommendation } from '../lib/openai';
import { analyzeUserProfile } from '../lib/openai';
import { supabase } from '../lib/supabase';

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
        // 1. If user is logged in, try to fetch from Supabase first
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed, onboarding_data')
            .eq('id', user.id)
            .single();

          if (data && !error) {
            if (data.onboarding_completed) {
              setOnboarding({
                completed: true,
                profile: data.onboarding_data?.profile || null,
                recommendations: data.onboarding_data?.recommendations || null
              });
              setLoading(false);
              return; // Exit early if found in DB
            }
          }
        }

        // 2. Fallback to localStorage (for anonymous or if DB is empty)
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
      console.log('🟡 useOnboarding: completeOnboarding called with profile:', profile);
      setAnalyzing(true);

      try {
        // Try to get AI recommendations, but continue even if it fails
        let recommendations: PersonalizedRecommendation | null = null;

        try {
          console.log('🟡 useOnboarding: Calling analyzeUserProfile...');
          recommendations = await analyzeUserProfile(profile);
          console.log('🟡 useOnboarding: AI analysis successful:', recommendations);
        } catch (aiError) {
          console.warn('⚠️ useOnboarding: AI analysis failed, continuing with onboarding:', aiError);
          // Continue without recommendations - not critical for onboarding completion
        }

        const newState: OnboardingState = {
          completed: true,
          profile,
          recommendations,
        };

        // 1. Save to localStorage (always as backup/cache)
        const storageKey = user
          ? `btc-wheel-onboarding-${user.id}`
          : 'btc-wheel-onboarding';

        console.log('🟡 useOnboarding: Saving to localStorage with key:', storageKey);
        storage.setItem(storageKey, JSON.stringify(newState));

        // 2. Save to Supabase if logged in
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              onboarding_completed: true,
              onboarding_data: newState,
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Failed to save onboarding to Supabase:', error);
          } else {
            console.log('✅ Onboarding saved to Supabase');
          }
        }

        setOnboarding(newState);
        console.log('🟡 useOnboarding: State saved successfully');

        return recommendations;
      } catch (error) {
        console.error('🔴 useOnboarding: Error completing onboarding:', error);

        // Even if everything fails, still mark as completed to not block the user
        const fallbackState: OnboardingState = {
          completed: true,
          profile,
          recommendations: null,
        };

        const storageKey = user
          ? `btc-wheel-onboarding-${user.id}`
          : 'btc-wheel-onboarding';

        console.log('🟡 useOnboarding: Saving fallback state to localStorage');
        storage.setItem(storageKey, JSON.stringify(fallbackState));
        setOnboarding(fallbackState);
        console.log('🟡 useOnboarding: Fallback state saved');

        // Don't throw - allow onboarding to complete
        return null;
      } finally {
        console.log('🟡 useOnboarding: Setting analyzing to false');
        setAnalyzing(false);
      }
    },
    [user]
  );

  // Skip onboarding (use default beginner path)
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
      await supabase.from('profiles').upsert({
        id: user.id,
        onboarding_completed: true,
        onboarding_data: defaultState,
        updated_at: new Date().toISOString()
      });
    }

    setOnboarding(defaultState);
  }, [user]);

  // Reset onboarding (for testing or re-profiling)
  const resetOnboarding = useCallback(async () => {
    const storageKey = user
      ? `btc-wheel-onboarding-${user.id}`
      : 'btc-wheel-onboarding';
    storage.removeItem(storageKey);

    if (user) {
      await supabase.from('profiles').update({
        onboarding_completed: false,
        onboarding_data: null
      }).eq('id', user.id);
    }

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