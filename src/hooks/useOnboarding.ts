import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import type { UserProfile, PersonalizedRecommendation } from '../lib/openai';
import { analyzeUserProfile } from '../lib/openai';

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

  // Load onboarding state from localStorage
  // Note: Onboarding data is stored locally as it's user-specific and doesn't need cloud sync
  useEffect(() => {
    const loadOnboardingState = async () => {
      setLoading(true);
      
      try {
        // Load from localStorage
        // Using a user-specific key if user is logged in
        const storageKey = user 
          ? `btc-wheel-onboarding-${user.id}` 
          : 'btc-wheel-onboarding';
        
        const saved = localStorage.getItem(storageKey);
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

        // Save to localStorage with user-specific key
        const storageKey = user 
          ? `btc-wheel-onboarding-${user.id}` 
          : 'btc-wheel-onboarding';
        
        console.log('🟡 useOnboarding: Saving to localStorage with key:', storageKey);
        localStorage.setItem(storageKey, JSON.stringify(newState));
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
        localStorage.setItem(storageKey, JSON.stringify(fallbackState));
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
  const skipOnboarding = useCallback(() => {
    const defaultState: OnboardingState = {
      completed: true,
      profile: null,
      recommendations: null,
    };

    const storageKey = user 
      ? `btc-wheel-onboarding-${user.id}` 
      : 'btc-wheel-onboarding';
    localStorage.setItem(storageKey, JSON.stringify(defaultState));
    setOnboarding(defaultState);
  }, [user]);

  // Reset onboarding (for testing or re-profiling)
  const resetOnboarding = useCallback(async () => {
    const storageKey = user 
      ? `btc-wheel-onboarding-${user.id}` 
      : 'btc-wheel-onboarding';
    localStorage.removeItem(storageKey);
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