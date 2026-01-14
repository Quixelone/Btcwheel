import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import { LandingPage } from './components/LandingPage';
import { HomePage } from "./components/HomePage";
import { Dashboard } from "./components/Dashboard";
import { LessonView } from "./components/LessonView";
import { LessonList } from "./components/LessonList";
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
  // 🐛 DEBUG MODE: Bypass landing/auth - v2.1 Emerald Design Update
  // TODO: Set DEBUG_MODE = false when done testing
  const DEBUG_MODE = false; // ❌ DISABLED - Testing authentication flow
  
  // ALL HOOKS MUST BE CALLED FIRST - No conditional returns before all hooks are called
  const [currentView, setCurrentView] = useState<View>(DEBUG_MODE ? "dashboard" : "landing");
  const [currentLessonId, setCurrentLessonId] = useState<number>(9);
  const [hasSeenLanding, setHasSeenLanding] = useState(DEBUG_MODE ? true : false);
  const [mascotVisible, setMascotVisible] = useState(true); // 🎯 NEW: Mascot visibility state
  const [hasSeenAuth, setHasSeenAuth] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [shouldShowResults, setShouldShowResults] = useState(false);
  
  const authResult = useAuth();
  const { user, loading: authLoading } = authResult || { user: null, loading: true };
  
  const {
    onboarding,
    shouldShowOnboarding,
    loading: onboardingLoading,
  } = useOnboarding();

  // Memoize mascot toggle handler to prevent unnecessary re-renders
  const handleMascotToggle = useCallback(() => {
    setMascotVisible(true);
  }, []);

  // On mount, ensure we start fresh - don't auto-show results on page reload
  useEffect(() => {
    setShouldShowResults(false);
  }, []);

  // Check URL for test mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "supabase") {
      setShowTest(true);
    }
    if (params.get("test") === "chat") {
      setShowTest(true);
    }
    if (params.get("status") === "supabase") {
      setShowTest(true);
    }
  }, []);

  // Handle OAuth callback properly
  useEffect(() => {
    // Se abbiamo un utente, forziamo la vista home
    if (user && !authLoading) {
      console.log('👤 [App] User detected:', user.email);
      
      // Se eravamo in un flusso OAuth (c'è hash o query params tipici)
      const isOAuthFlow = window.location.hash.includes('access_token') || 
                         window.location.search.includes('code=') ||
                         // O se siamo appena atterrati sulla root dopo un redirect
                         (document.referrer.includes('google.com') || document.referrer.includes('supabase'));

      if (isOAuthFlow || currentView === 'landing') {
        console.log('🔄 [App] Switching to HOME view after login');
        setCurrentView('home');
        // Puliamo l'URL per estetica
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  }, [user, authLoading]);

  // Handle OAuth errors in URL
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Check for errors in URL
    if (hash.includes('error=') || search.includes('error=')) {
      console.error('❌ [App] OAuth error detected in URL');
      // Extract error description if possible
      const params = new URLSearchParams(hash.substring(1) || search); // Handle hash or search
      const errorDesc = params.get('error_description') || params.get('error');
      console.error('❌ [App] Error details:', errorDesc);
      
      if (errorDesc?.includes('Database error')) {
        toast.error('Errore database durante la registrazione. Riprova più tardi.');
      }
    }
  }, []);

  // Check if we should show onboarding results after completion
  useEffect(() => {
    if (onboarding.isComplete && onboarding.recommendations && user) {
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
  }, [onboarding.isComplete, onboarding.recommendations, user]);

  // Handler for navigation
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

  // Check if user skipped auth (demo mode)
  const isDemoMode = !user && hasSeenAuth;

  // NOW we can do conditional returns - all hooks have been called
  
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
  if ((authLoading || onboardingLoading) && currentView !== 'landing') {
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
          setHasSeenAuth(true);
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
  if (!DEBUG_MODE && !user && hasSeenLanding && currentView !== 'landing' && currentView !== 'auth') {
    console.log('[App] No user found, showing auth');
    return (
      <>
        <MobileOptimizations />
        <Toaster />
        <AuthView 
          onAuthSuccess={() => {
            setHasSeenAuth(true);
            // After auth, show onboarding if not completed, otherwise go to home
            if (shouldShowOnboarding) {
              setCurrentView('onboarding');
            } else {
              setCurrentView('home');
            }
          }} 
        />
      </>
    );
  }

  // Show onboarding results only if flag is set AND we're not on landing
  // This ensures results only show right after completing onboarding, not on page reload
  if (shouldShowResults && onboarding.recommendations && currentView !== 'landing' && hasSeenLanding) {
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
    <div className="min-h-screen bg-gray-50">
      <MobileOptimizations />
      <MobileGestures />
      <Toaster />
      <PWAInstallPrompt />
      <AppUpdatePrompt />
      {currentView === "landing" && (
        <LandingPage onNavigate={handleNavigation} />
      )}
      {currentView === "home" && (
        <HomePage onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "dashboard" && (
        <Dashboard onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "lessons" && (
        <LessonList onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "lesson" && (
        <LessonView onNavigate={(view) => handleNavigation(view)} lessonId={currentLessonId} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
      )}
      {currentView === "badges" && (
        <BadgeShowcase onNavigate={handleNavigation} mascotVisible={mascotVisible} onMascotToggle={handleMascotToggle} />
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
      
      {/* AI-Powered Mascot - Available globally (except landing) */}
      {currentView !== 'landing' && (
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
      )}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;