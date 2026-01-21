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
import { supabase } from './lib/supabase';

// Types
import type { View } from './types/navigation';
import { requiresAuth } from './types/navigation';

// Layout Components
import { MainNavigation } from './components/navigation/MainNavigation';
import { MobileOptimizations } from './components/MobileOptimizations';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AppUpdatePrompt } from './components/AppUpdatePrompt';
import { AppTutorial } from './components/AppTutorial';

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
import { TradeJournalView } from './views/TradeJournalView';
import { BestDealsView } from './views/BestDealsView';

// Dev/Debug Views
import { ChatTutorTest } from './components/ChatTutorTest';
import { SupabaseStatus } from './components/SupabaseStatus';
import { SupabaseTestView } from './components/SupabaseTestView';

import { MascotAI } from './components/MascotAI';

// ============================================
// MAIN APP COMPONENT
// ============================================

function AppContent() {
    const [currentView, setCurrentView] = useState<View>('landing');
    const [lessonId, setLessonId] = useState<number>(1);
    const [showTutorial, setShowTutorial] = useState(false);
    const [navigationParams, setNavigationParams] = useState<any>(null);
    const [mascotVisible, setMascotVisible] = useState(true);

    const authResult = useAuth();
    const { user, loading: authLoading } = authResult || { user: null, loading: true };

    const {
        onboarding,
        shouldShowOnboarding,
        loading: onboardingLoading,
    } = useOnboarding();

    // ============================================
    // TUTORIAL STATE MANAGEMENT
    // ============================================

    // Check if tutorial has been seen
    useEffect(() => {
        if (!user || onboardingLoading || shouldShowOnboarding) return;

        const checkTutorialStatus = async () => {
            // 1. Check Supabase first
            const { data } = await supabase
                .from('profiles')
                .select('tutorial_completed')
                .eq('id', user.id)
                .single();

            if (data?.tutorial_completed) {
                return; // Tutorial already seen
            }

            // 2. Fallback to localStorage (if DB check passed but false, or failed)
            const tutorialKey = `btc-wheel-tutorial-seen-${user.id}`;
            const hasSeenTutorial = localStorage.getItem(tutorialKey);

            // Se l'utente è in Home, ha finito l'onboarding e non ha mai visto il tutorial -> Mostralo
            if (currentView === 'home' && !hasSeenTutorial && !showTutorial) {
                // Piccolo delay per assicurarsi che la UI sia pronta
                const timer = setTimeout(() => {
                    setShowTutorial(true);
                }, 1000);
                return () => clearTimeout(timer);
            }
        };

        checkTutorialStatus();
    }, [currentView, user, onboardingLoading, shouldShowOnboarding, showTutorial]);

    const handleTutorialComplete = async () => {
        if (user) {
            // Save to localStorage
            localStorage.setItem(`btc-wheel-tutorial-seen-${user.id}`, 'true');

            // Save to Supabase
            await supabase.from('profiles').update({
                tutorial_completed: true
            }).eq('id', user.id);
        }
        setShowTutorial(false);
    };

    // ============================================
    // NAVIGATION
    // ============================================

    const handleNavigation = useCallback((view: View, params?: any) => {
        setCurrentView(view);
        if (params) {
            setNavigationParams(params);
            if (params.lessonId) {
                setLessonId(params.lessonId);
            }
        } else {
            setNavigationParams(null);
        }
    }, []);

    // ============================================
    // AUTH STATE EFFECTS
    // ============================================

    // Redirect dopo login/logout
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
        } else {
            // User logged out - redirect to landing if on protected route
            if (requiresAuth(currentView)) {
                setCurrentView('landing');
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
                <AuthView onAuthSuccess={() => {
                    // Redirect gestito da useEffect
                }} />
            </>
        );
    }

    // Onboarding
    if (currentView === 'onboarding') {
        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <OnboardingView onComplete={() => setCurrentView('onboarding-results')} />
            </>
        );
    }

    if (currentView === 'onboarding-results') {
        const defaultRecommendations = {
            startingLesson: 1,
            estimatedDuration: "4 Settimane",
            recommendedPath: ["Fondamenti Bitcoin", "Opzioni Base", "Wheel Strategy", "Gestione Rischio"],
            focusAreas: ["Basi", "Sicurezza"],
            tips: ["Inizia con calma", "Usa il simulatore"],
            customMessage: "Benvenuto! Iniziamo dalle basi per costruire solide fondamenta."
        };

        return (
            <>
                <MobileOptimizations />
                <Toaster />
                <OnboardingResults
                    recommendations={onboarding.recommendations || defaultRecommendations}
                    onStart={() => setCurrentView('home')}
                />
            </>
        );
    }

    // ============================================
    // MAIN APP LAYOUT
    // ============================================

    return (
        <div className="min-h-screen bg-[#030305] text-white font-sans pb-24 md:pb-0 md:pl-20">
            <MobileOptimizations />
            <PWAInstallPrompt />
            <AppUpdatePrompt />
            <Toaster />

            {/* Navigation */}
            <MainNavigation
                currentView={currentView}
                onNavigate={handleNavigation}
                mascotVisible={mascotVisible}
                onMascotShow={() => {
                    console.log('🎭 MainNavigation: onMascotShow called');
                    setMascotVisible(true);
                }}
            />

            {/* App Tutorial Overlay */}
            <AppTutorial
                isActive={showTutorial}
                onComplete={handleTutorialComplete}
                onSkip={handleTutorialComplete}
            />

            {/* Main Content Area */}
            <main className="min-h-screen">
                {/* HOME Section */}
                {(currentView === 'home' || currentView === 'weekly-review') && (
                    <HomeView
                        currentView={currentView}
                        onNavigate={handleNavigation}
                    />
                )}

                {/* TRADING Section */}
                {
                    (currentView === 'trading' ||
                        currentView === 'exchange-hub' ||
                        currentView === 'positions' ||
                        currentView === 'position-detail' ||
                        currentView === 'pac-tracker') && (
                        <TradingView
                            currentView={currentView}
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* SATOSHI Section */}
                {
                    (currentView === 'satoshi' ||
                        currentView === 'satoshi-chat' ||
                        currentView === 'satoshi-history') && (
                        <SatoshiView
                            currentView={currentView}
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* ACADEMY Section */}
                {
                    (currentView === 'academy' ||
                        currentView === 'lesson' ||
                        currentView === 'quiz' ||
                        currentView === 'resources') && (
                        <AcademyView
                            currentView={currentView}
                            lessonId={lessonId}
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* PROFILE Section */}
                {
                    (currentView === 'profile' ||
                        currentView === 'objective' ||
                        currentView === 'risk-profile' ||
                        currentView === 'notifications' ||
                        currentView === 'subscription' ||
                        currentView === 'account') && (
                        <ProfileView
                            currentView={currentView}
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* LEGACY VIEWS (Temporanei) */}
                {
                    currentView === 'simulation' && (
                        <SimulationView
                            onNavigate={handleNavigation}

                        />
                    )
                }

                {
                    currentView === 'longterm' && (
                        <LongTermSimulator
                            onNavigate={handleNavigation}

                        />
                    )
                }

                {
                    currentView === 'wheel-strategy' && (
                        <WheelStrategyView
                            onNavigate={handleNavigation}

                        />
                    )
                }

                {/* Exchange Connection View */}
                {
                    currentView === 'exchange-connect' && (
                        <ExchangeConnectionView
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* Trade Journal View */}
                {
                    currentView === 'trade-journal' && (
                        <TradeJournalView
                            onNavigate={handleNavigation}
                            initialData={navigationParams?.tradeData}
                        />
                    )
                }

                {/* Best Deals View */}
                {
                    currentView === 'best-deals' && (
                        <BestDealsView
                            onNavigate={handleNavigation}
                        />
                    )
                }

                {/* Global AI Mascot - Visible in main app views */}
                {
                    user && !shouldShowOnboarding && !showTutorial && (
                        <MascotAI
                            isVisible={mascotVisible}
                            onVisibilityChange={(visible) => {
                                console.log('🎭 MascotAI: onVisibilityChange called with:', visible);
                                setMascotVisible(visible);
                            }}
                            lessonContext={
                                currentView === 'lesson' || currentView === 'quiz'
                                    ? { lessonId, lessonTitle: `Lezione ${lessonId}` }
                                    : undefined
                            }
                        />
                    )
                }
            </main >
        </div >
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
    perfectQuizzes: number;
    profitableSimulations: number;
}
