import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/LandingPage';
import { HomePage } from "./components/HomePage";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { LessonList } from "./components/LessonList";
import { BadgeShowcase } from "./components/BadgeShowcase";
import { SimulationView } from "./components/SimulationView";
import { LeaderboardView } from "./components/LeaderboardView";
import { SettingsView } from "./components/SettingsView";
import { OnboardingView } from "./components/OnboardingView";
import { OnboardingResults } from "./components/OnboardingResults";
import { AuthView } from "./components/AuthView";
import { MascotAI } from "./components/MascotAI";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { AppUpdatePrompt } from "./components/AppUpdatePrompt";
import { MobileOptimizations } from "./components/MobileOptimizations";
import { MobileGestures } from "./components/MobileGestures";
import { SupabaseTestView } from "./components/SupabaseTestView";
import { SupabaseStatus } from "./components/SupabaseStatus";
import { ChatTutorTest } from "./components/ChatTutorTest";
import { useOnboarding } from "./hooks/useOnboarding";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/Layout";

export type View =
  | "landing"
  | "home"
  | "dashboard"
  | "lessons"
  | "lesson"
  | "badges"
  | "simulation"
  | "leaderboard"
  | "settings"
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
  // 🐛 DEBUG MODE: Bypass landing/auth to test mascot animations immediately
  // TODO: Set DEBUG_MODE = false when done testing
  const DEBUG_MODE = false; // ✅ ENABLED - Per testare il nuovo design
  
  const [currentView, setCurrentView] = useState<View>(DEBUG_MODE ? "dashboard" : "landing");
  const [currentLessonId, setCurrentLessonId] = useState<number>(9);
  const [hasSeenLanding, setHasSeenLanding] = useState(DEBUG_MODE ? true : false);
  const authResult = useAuth();
  const { user, loading: authLoading } = authResult || { user: null, loading: true };
  
  const handleNavigation = (view: View, lessonId?: number) => {
    // When navigating away from landing, mark it as seen
    if (currentView === 'landing' && view !== 'landing') {
      setHasSeenLanding(true);
    }
    setCurrentView(view);
    if (lessonId !== undefined) {
      setCurrentLessonId(lessonId);
    }
  };
  const {
    onboarding,
    shouldShowOnboarding,
    loading: onboardingLoading,
  } = useOnboarding();
  const [shouldShowResults, setShouldShowResults] = useState(false);

  // On mount, ensure we start fresh - don't auto-show results on page reload
  useEffect(() => {
    setShouldShowResults(false);
  }, []);

  // Redirect to dashboard if user is already logged in and on landing page
  useEffect(() => {
    if (user && !authLoading && currentView === 'landing') {
      console.log('[App] User logged in, redirecting from landing to dashboard');
      setHasSeenLanding(true);
      setCurrentView('dashboard');
    }
  }, [user, authLoading, currentView]);

  // Check if we should show onboarding results after completion
  useEffect(() => {
    if (onboarding.completed && onboarding.recommendations && user) {
      const resultsShown = localStorage.getItem('btcwheel_onboarding_results_shown');
      
      if (!resultsShown) {
        setShouldShowResults(true);
        setHasSeenLanding(true);
      } else {
        setShouldShowResults(false);
        setHasSeenLanding(true);
      }
    } else {
      // Reset results flag if conditions not met (initial page load, etc.)
      setShouldShowResults(false);
    }
  }, [onboarding.completed, onboarding.recommendations, user]);

  // Check URL params for test views
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "chat") {
      return <ChatTutorTest />;
    }
    if (params.get("status") === "supabase") {
      return <SupabaseStatus />;
    }
    if (params.get("test") === "supabase") {
      return <SupabaseTestView />;
    }
  }

  // ALWAYS show landing page if that's the current view (skip all auth/onboarding checks)
  // Landing page is PUBLIC and accessible without authentication
  if (currentView === 'landing') {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <LandingPage onNavigate={handleNavigation} />
      </>
    );
  }

  // Show loading while checking auth and onboarding state (only for non-landing views)
  // If we're on landing, don't show loading spinner - just show the landing page
  // unless we are processing an auth redirect (user is logged in)
  const isAuthRedirect = user && currentView === ('landing' as View);
  
  if ((authLoading || onboardingLoading) && !isAuthRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if requested explicitly
  if (currentView === 'auth') {
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <AuthView onAuthSuccess={() => {
          // After auth, show onboarding if not completed, otherwise go to home
          if (shouldShowOnboarding) {
            setCurrentView('onboarding');
          } else {
            setCurrentView('home');
          }
        }} />
      </>
    );
  }


  // Show auth screen if no user and user has left the landing page
  // Auth is REQUIRED to access the app after leaving landing
  // SKIP in DEBUG_MODE
  if (!DEBUG_MODE && !user && hasSeenLanding) {
    console.log('[App] No user found, showing auth');
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <AuthView 
          onAuthSuccess={() => {
            // After auth, show onboarding if not completed, otherwise go to dashboard
            // Also ensure landing page is marked as seen
            setHasSeenLanding(true);
            
            if (shouldShowOnboarding) {
              setCurrentView('onboarding');
            } else {
              setCurrentView('dashboard');
            }
          }} 
        />
      </>
    );
  }

  // Show onboarding results only if flag is set AND we're not on landing
  // This ensures results only show right after completing onboarding, not on page reload
  if (shouldShowResults && onboarding.recommendations && hasSeenLanding) {
    console.log('[App] Rendering onboarding results');
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <OnboardingResults
          recommendations={onboarding.recommendations}
          onStart={() => {
            console.log('[App] Starting course from onboarding results');
            // Mark results as shown
            localStorage.setItem(
              'btcwheel_onboarding_results_shown',
              "true",
            );
            // Hide results and navigate to dashboard (not home)
            setShouldShowResults(false);
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  // Show onboarding ONLY if explicitly navigating to it (not automatically)
  // We never auto-redirect to onboarding - user must click "Inizia Gratis" from landing
  if (currentView === 'onboarding') {
    console.log('[App] Rendering onboarding view');
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <OnboardingView
          onComplete={() => {
            console.log('[App] ✅ Onboarding completed! Navigating to dashboard...');
            // Mark as seen
            setHasSeenLanding(true);
            
            // ALWAYS navigate to dashboard immediately
            // The results will be shown via the useEffect above if available
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  // Normal app flow
  console.log('[App] Rendering normal app flow, currentView:', currentView);
  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden">
      <MobileOptimizations />
      <MobileGestures />
      <Toaster />
      <PWAInstallPrompt />
      <AppUpdatePrompt />

      {/* Main App Layout - Wraps all internal app views */}
      <Layout currentView={currentView} onNavigate={handleNavigation}>
        {currentView === "home" && (
          <HomePage onNavigate={handleNavigation} />
        )}
        {currentView === "dashboard" && (
          <Dashboard onNavigate={handleNavigation} />
        )}
        {currentView === "lessons" && (
          <LessonList onNavigate={handleNavigation} />
        )}
        {currentView === "lesson" && (
          <LessonView onNavigate={(view) => handleNavigation(view)} lessonId={currentLessonId} />
        )}
        {currentView === "badges" && (
          <BadgeShowcase onNavigate={handleNavigation} />
        )}
        {currentView === "simulation" && (
          <SimulationView onNavigate={handleNavigation} />
        )}
        {currentView === "leaderboard" && (
          <LeaderboardView onNavigate={handleNavigation} />
        )}
        {currentView === "settings" && (
          <SettingsView onNavigate={handleNavigation} />
        )}
      </Layout>
      
      {/* AI-Powered Mascot - Available globally */}
      <MascotAI 
        lessonContext={
          currentView === 'lesson' 
            ? {
                lessonId: currentLessonId,
                lessonTitle: `Lezione ${currentLessonId}`,
              }
            : undefined
        }
      />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
