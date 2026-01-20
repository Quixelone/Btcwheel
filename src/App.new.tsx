/**
 * App.tsx - BTC Wheel Pro 2.0
 * 
 * Main application entry point con nuova struttura a 5 sezioni:
 * - Home: Dashboard + Compound Vision
 * - Trading: Exchange + Posizioni + PAC
 * - Satoshi: Daily Briefing + Chat
 * - Academy: Corso + Lezioni + Quiz
 * - Profilo: Obiettivo + Settings + Account
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOnboarding } from './hooks/useOnboarding';
import { Toaster } from "sonner";

// Types
import type { View } from './types/navigation';
import { requiresAuth } from './types/navigation';

// Layout Components
import { MainNavigation } from './components/navigation/MainNavigation';
import { MobileOptimizations } from './components/MobileOptimizations';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AppUpdatePrompt } from './components/AppUpdatePrompt';

// Special Views (non autenticate)
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { OnboardingResults } from './components/OnboardingResults';

// Main Section Views
import { HomeView } from './views/HomeView';
import { TradingView } from './views/TradingView';
import { SatoshiView } from './views/SatoshiView';
import { AcademyView } from './views/AcademyView';
import { ProfileView } from './views/ProfileView';

// Legacy Views (riutilizzati)
import { LongTermSimulator } from './components/LongTermSimulator';
import { SimulationView } from './components/SimulationView';
import { WheelStrategyView } from './components/WheelStrategyView';
import { ExchangeConnectionView } from './views/ExchangeConnectionView';

// Dev/Debug Views
import { ChatTutorTest } from './components/ChatTutorTest';
import { SupabaseStatus } from './components/SupabaseStatus';
import { SupabaseTestView } from './components/SupabaseTestView';

// ============================================
// MAIN APP COMPONENT
// ============================================

function AppContent() {
    const [currentView, setCurrentView] = useState<View>('landing');
    const [lessonId, setLessonId] = useState<number>(1);

    const authResult = useAuth();
    const { user, loading: authLoading } = authResult || { user: null, loading: true };

    const {
        onboarding,
        shouldShowOnboarding,
        loading: onboardingLoading,
    } = useOnboarding();

    // ============================================
    // NAVIGATION
    // ============================================

    const handleNavigation = useCallback((view: View, params?: { lessonId?: number }) => {
        setCurrentView(view);
        if (params?.lessonId) {
            setLessonId(params.lessonId);
        }
    }, []);

    // ============================================
    // AUTH STATE EFFECTS
    // ============================================

    // Redirect dopo login
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // OAuth callback handling
            const isOAuthFlow = window.location.hash.includes('access_token') ||
                window.location.search.includes('code=');

            if (isOAuthFlow) {
                window.history.replaceState(null, '', window.location.pathname);
            }

            // Redirect dopo login
            if (currentView === 'landing' || currentView === 'auth') {
                if (shouldShowOnboarding) {
                    setCurrentView('onboarding');
                } else {
                    setCurrentView('home');
                }
            }
        }
    }, [user, authLoading, shouldShowOnboarding, currentView]);

    // ============================================
    // LEGACY VIEW REDIRECTS
    // ============================================

    // Redirect delle view legacy alle nuove sezioni
    useEffect(() => {
        const legacyRedirects: Record<string, View> = {
            'dashboard': 'home',
            'lessons': 'academy',
            'badges': 'profile',
            // simulation, longterm, wheel-strategy mantengono i vecchi componenti
            'leaderboard': 'profile',
            'settings': 'profile',
            'exchange': 'trading',
        };

        if (currentView in legacyRedirects) {
            setCurrentView(legacyRedirects[currentView as keyof typeof legacyRedirects]);
        }
    }, [currentView]);

    // ============================================
    // DEBUG/TEST ROUTES
    // ============================================

    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get("test") === "chat") return <ChatTutorTest />;
        if (params.get("status") === "supabase") return <SupabaseStatus />;
        if (params.get("test") === "supabase") return <SupabaseTestView />;
    }

    // ============================================
    // LOADING STATE
    // ============================================

    if (authLoading || onboardingLoading) {
        return (
            <div className="min-h-screen bg-[#030305] flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#888899] text-sm font-medium">Caricamento...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // SPECIAL VIEWS (No Navigation)
    // ============================================

    // Landing Page (non loggato)
    if (currentView === 'landing') {
        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <LandingPage onNavigate={handleNavigation} />
            </>
        );
    }

    // Auth View
    if (currentView === 'auth' || (!user && requiresAuth(currentView))) {
        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <AuthView
                    onAuthSuccess={() => {
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

    // Onboarding
    if (currentView === 'onboarding') {
        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <OnboardingView
                    onComplete={() => setCurrentView('home')}
                />
            </>
        );
    }

    // Onboarding Results
    if (currentView === 'onboarding-results' && onboarding.recommendations) {
        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <OnboardingResults
                    recommendations={onboarding.recommendations}
                    onStart={() => setCurrentView('home')}
                />
            </>
        );
    }

    // ============================================
    // MAIN APP (Con Navigation)
    // ============================================

    return (
        <div className="min-h-screen bg-[#030305]">
            <MobileOptimizations />
            <Toaster />
            <PWAInstallPrompt />
            <AppUpdatePrompt />

            {/* Navigation */}
            <MainNavigation
                currentView={currentView}
                onNavigate={handleNavigation}
            />

            {/* Main Content Area */}
            <main className="md:pl-20">
                {/* HOME SECTION */}
                {(currentView === 'home' || currentView === 'weekly-review') && (
                    <HomeView
                        currentView={currentView}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* TRADING SECTION */}
                {(['trading', 'exchange-hub', 'exchange-connect', 'positions', 'position-detail', 'pac-tracker'] as View[]).includes(currentView) && (
                    <TradingView
                        currentView={currentView}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* SATOSHI SECTION */}
                {(['satoshi', 'satoshi-chat', 'satoshi-history'] as View[]).includes(currentView) && (
                    <SatoshiView
                        currentView={currentView}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* ACADEMY SECTION */}
                {(['academy', 'lesson', 'quiz', 'resources'] as View[]).includes(currentView) && (
                    <AcademyView
                        currentView={currentView}
                        lessonId={lessonId}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* PROFILE SECTION */}
                {(['profile', 'objective', 'risk-profile', 'notifications', 'subscription', 'account'] as View[]).includes(currentView) && (
                    <ProfileView
                        currentView={currentView}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* LEGACY: Long Term Simulator (Crea Piano) */}
                {currentView === 'longterm' && (
                    <LongTermSimulator
                        onNavigate={handleNavigation}
                    />
                )}

                {/* LEGACY: Simulation View */}
                {currentView === 'simulation' && (
                    <SimulationView
                        onNavigate={handleNavigation}
                    />
                )}

                {/* LEGACY: Wheel Strategy View (Registra Operazioni) */}
                {currentView === 'wheel-strategy' && (
                    <WheelStrategyView
                        onNavigate={handleNavigation}
                        standalone={true}
                    />
                )}

                {/* Exchange Connection View */}
                {currentView === 'exchange-connect' && (
                    <ExchangeConnectionView
                        onNavigate={handleNavigation}
                    />
                )}
            </main>
        </div>
    );
}

// ============================================
// APP WRAPPER
// ============================================

function App() {
    return <AppContent />;
}

export default App;


// ============================================
// LEGACY EXPORTS (per compatibilità temporanea)
// ============================================

export type { View } from './types/navigation';

export interface UserProgress {
    level: number;
    xp: number;
    xpToNextLevel: number;
    streak: number;
    badges: string[];
    lessonsCompleted: number;
    totalLessons: number;
    currentLesson: number;
    completedLessons: number[];
    perfectQuizzes?: number;
    profitableSimulations?: number;
}
