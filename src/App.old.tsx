import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import { LandingPage } from './components/LandingPage';
import { HomePage } from "./components/HomePage";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { LearningPath } from "./components/LearningPath";
import { BadgeShowcase } from "./components/BadgeShowcase";
import { SimulationView } from "./components/SimulationView";
import { LongTermSimulator } from "./components/LongTermSimulator";
import { WheelStrategyView } from "./components/WheelStrategyView";
import { LeaderboardView } from "./components/LeaderboardView";
import { SettingsView } from "./components/SettingsView";
import { ExchangeView } from "./components/ExchangeView";
import { AuthView } from "./components/AuthView";
import { OnboardingView } from "./components/OnboardingView";
import { OnboardingResults } from "./components/OnboardingResults";
import { MascotAI } from "./components/MascotAI";
import { Toaster } from "sonner";
import { MobileOptimizations } from "./components/MobileOptimizations";
import { MobileGestures } from "./components/MobileGestures";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { AppUpdatePrompt } from "./components/AppUpdatePrompt";
import { ChatTutorTest } from "./components/ChatTutorTest";
import { SupabaseStatus } from "./components/SupabaseStatus";
import { SupabaseTestView } from "./components/SupabaseTestView";
import { seedLocalDemoData } from './lib/qaSeed';

export type View =
  | "landing"
  | "home"
  | "dashboard"
  | "lessons"
  | "lesson"
  | "badges"
  | "simulation"
  | "longterm"
  | "wheel-strategy"
  | "leaderboard"
  | "settings"
  | "exchange"
  | "auth"
  | "onboarding";

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  badges: string[];
  lessonsCompleted: number;
  totalLessons: number;
  currentLesson: number;
  completedLessons: number[]; // Array of completed lesson IDs
  perfectQuizzes?: number; // Number of perfect quiz scores
  profitableSimulations?: number; // Number of profitable simulations
}

function AppContent() {
  const DEBUG_MODE = false;

  const [currentView, setCurrentView] = useState<View>(DEBUG_MODE ? "dashboard" : "landing");
  const [currentLessonId, setCurrentLessonId] = useState<number>(1);
  const [hasSeenLanding, setHasSeenLanding] = useState(DEBUG_MODE ? true : false);
  const [mascotVisible, setMascotVisible] = useState(true);
  const [shouldShowResults, setShouldShowResults] = useState(false);
  const qaSeededRef = useRef(false);

  const authResult = useAuth();
  const { user, loading: authLoading } = authResult || { user: null, loading: true };

  const {
    onboarding,
    shouldShowOnboarding,
    loading: onboardingLoading,
  } = useOnboarding();

  useEffect(() => {
    if (typeof window === 'undefined' || qaSeededRef.current) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('seed') !== '1') return;

    qaSeededRef.current = true;
    seedLocalDemoData();

    const localUser = localStorage.getItem('btcwheel_local_user');
    window.dispatchEvent(new CustomEvent('btcwheel-storage', { detail: { key: 'btcwheel_local_user', value: localUser } }));

    setHasSeenLanding(true);
    const requestedView = params.get('view') as View | null;
    if (requestedView) {
      setCurrentView(requestedView);
    }
  }, []);

  const handleMascotToggle = useCallback(() => {
    setMascotVisible(true);
  }, []);

  useEffect(() => {
    setShouldShowResults(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const isOAuthFlow = window.location.hash.includes('access_token') ||
        window.location.search.includes('code=');

      if (isOAuthFlow || currentView === 'landing') {
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        if (shouldShowOnboarding) {
          setCurrentView('onboarding');
        } else {
          setCurrentView('home');
        }
      }
    }
  }, [user, authLoading, shouldShowOnboarding, currentView]);

  useEffect(() => {
    if (onboarding.completed && onboarding.recommendations && user) {
      const resultsShown = localStorage.getItem('btcwheel_onboarding_results_shown');
      if (!resultsShown) {
        setShouldShowResults(true);
        setHasSeenLanding(true);
      }
    }
  }, [onboarding.completed, onboarding.recommendations, user]);

  const handleNavigation = (view: View, lessonId?: number) => {
    if (currentView === 'landing' && view !== 'landing') {
      setHasSeenLanding(true);
    }
    setCurrentView(view);
    if (lessonId !== undefined) {
      setCurrentLessonId(lessonId);
    }
  };

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "chat") return <ChatTutorTest />;
    if (params.get("status") === "supabase") return <SupabaseStatus />;
    if (params.get("test") === "supabase") return <SupabaseTestView />;
  }

  if (currentView === 'landing') {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <LandingPage onNavigate={handleNavigation} />
      </>
    );
  }

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <AuthView onAuthSuccess={() => {
          if (shouldShowOnboarding) setCurrentView('onboarding');
          else setCurrentView('home');
        }} />
      </>
    );
  }

  if (!DEBUG_MODE && !user && hasSeenLanding) {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <AuthView onAuthSuccess={() => {
          if (shouldShowOnboarding) setCurrentView('onboarding');
          else setCurrentView('home');
        }} />
      </>
    );
  }

  if (shouldShowResults && onboarding.recommendations && hasSeenLanding) {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <OnboardingResults
          recommendations={onboarding.recommendations}
          onStart={() => {
            localStorage.setItem('btcwheel_onboarding_results_shown', "true");
            setShouldShowResults(false);
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  if (currentView === 'onboarding') {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <OnboardingView
          onComplete={() => {
            setHasSeenLanding(true);
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MobileOptimizations />
      <MobileGestures />
      <Toaster />
      <PWAInstallPrompt />
      <AppUpdatePrompt />
      {currentView === "home" && (
        <HomePage onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "dashboard" && (
        <Dashboard onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "lessons" && (
        <LearningPath onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "lesson" && (
        <LessonView onNavigate={handleNavigation} lessonId={currentLessonId} />
      )}
      {currentView === "badges" && (
        <BadgeShowcase onNavigate={handleNavigation} />
      )}
      {currentView === "simulation" && (
        <SimulationView onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "longterm" && (
        <LongTermSimulator onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "wheel-strategy" && (
        <WheelStrategyView onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "leaderboard" && (
        <LeaderboardView onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "settings" && (
        <SettingsView onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "exchange" && (
        <ExchangeView onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}

      <MascotAI
        lessonContext={
          currentView === 'lesson'
            ? {
              lessonId: currentLessonId,
              lessonTitle: `Lezione ${currentLessonId}`,
            }
            : undefined
        }
        isVisible={mascotVisible}
        onVisibilityChange={setMascotVisible}
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
