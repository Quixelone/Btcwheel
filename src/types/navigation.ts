/**
 * Navigation Types - BTC Wheel Pro 2.0
 * 
 * Struttura app riorganizzata in 5 sezioni principali:
 * 1. Home - Dashboard con Compound Vision
 * 2. Trading - Exchange, Posizioni, PAC
 * 3. Satoshi - Daily Briefing, Chat, Storico
 * 4. Academy - Corso, Lezioni, Quiz
 * 5. Profilo - Obiettivo, Rischio, Settings, Account
 */

// ============================================
// MAIN NAVIGATION SECTIONS
// ============================================

export type MainSection = 'home' | 'trading' | 'satoshi' | 'academy' | 'profile';

// ============================================
// SUB-VIEWS PER SEZIONE
// ============================================

// HOME Section
export type HomeView =
    | 'home'              // Dashboard principale
    | 'weekly-review';    // Review domenicale

// TRADING Section
export type TradingView =
    | 'trading'           // Overview trading
    | 'exchange-hub'      // Lista exchange + confronto
    | 'exchange-connect'  // Collega nuovo exchange
    | 'positions'         // Posizioni attive
    | 'position-detail'   // Dettaglio singola posizione
    | 'pac-tracker'       // PAC settimanale
    | 'trade-journal'     // Trade Journal
    | 'best-deals'        // Multi-exchange best premium deals
    | 'compound-tracker'; // Compound Interest Tracker

// SATOSHI Section
export type SatoshiView =
    | 'satoshi'           // Daily Briefing
    | 'satoshi-chat'      // Chat con Satoshi
    | 'satoshi-history';  // Storico briefing

// ACADEMY Section
export type AcademyView =
    | 'academy'           // Overview percorso
    | 'lesson'            // Singola lezione
    | 'quiz'              // Quiz in corso
    | 'resources';        // Glossario, FAQ, Podcast

// PROFILE Section
export type ProfileView =
    | 'profile'           // Overview profilo
    | 'objective'         // Modifica obiettivo
    | 'risk-profile'      // Profilo rischio
    | 'notifications'     // Preferenze notifiche
    | 'subscription'      // Abbonamento
    | 'account';          // Account settings

// ============================================
// SPECIAL VIEWS (Non nella nav principale)
// ============================================

export type SpecialView =
    | 'landing'           // Landing page (non loggato)
    | 'auth'              // Login/Signup
    | 'onboarding'        // Onboarding nuovo utente
    | 'onboarding-results'; // Risultati onboarding

// ============================================
// LEGACY VIEWS (Per compatibilità con vecchi componenti)
// ============================================

export type LegacyView =
    | 'dashboard'         // Vecchio dashboard
    | 'lessons'           // Lista lezioni (legacy)
    | 'badges'            // Badge showcase (legacy)
    | 'simulation'        // Simulatore trading (legacy)
    | 'longterm'          // Simulatore lungo termine (legacy)
    | 'wheel-strategy'    // Wheel strategy view (legacy)
    | 'leaderboard'       // Classifica (legacy)
    | 'settings'          // Settings (legacy -> profile)
    | 'exchange';         // Exchange (legacy -> trading)

// ============================================
// VIEW UNIFICATO
// ============================================

export type View =
    | HomeView
    | TradingView
    | SatoshiView
    | AcademyView
    | ProfileView
    | SpecialView
    | LegacyView;

// ============================================
// NAVIGATION CONFIG
// ============================================

export interface NavItem {
    id: MainSection;
    label: string;
    icon: string; // Nome icona Lucide
    defaultView: View;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'Home', defaultView: 'home' },
    { id: 'trading', label: 'Trading', icon: 'TrendingUp', defaultView: 'trading' },
    { id: 'satoshi', label: 'Satoshi', icon: 'Bot', defaultView: 'satoshi' },
    { id: 'academy', label: 'Academy', icon: 'GraduationCap', defaultView: 'academy' },
    { id: 'profile', label: 'Profilo', icon: 'User', defaultView: 'profile' },
];

// ============================================
// HELPER: Trova la sezione principale di una view
// ============================================

export function getMainSection(view: View): MainSection | null {
    const homeViews: View[] = ['home', 'weekly-review'];
    const tradingViews: View[] = ['trading', 'exchange-hub', 'exchange-connect', 'positions', 'position-detail', 'pac-tracker', 'trade-journal', 'best-deals', 'compound-tracker'];
    const satoshiViews: View[] = ['satoshi', 'satoshi-chat', 'satoshi-history'];
    const academyViews: View[] = ['academy', 'lesson', 'quiz', 'resources'];
    const profileViews: View[] = ['profile', 'objective', 'risk-profile', 'notifications', 'subscription', 'account'];

    if (homeViews.includes(view)) return 'home';
    if (tradingViews.includes(view)) return 'trading';
    if (satoshiViews.includes(view)) return 'satoshi';
    if (academyViews.includes(view)) return 'academy';
    if (profileViews.includes(view)) return 'profile';

    return null; // Special views (landing, auth, onboarding)
}

// ============================================
// HELPER: View richiede autenticazione?
// ============================================

export function requiresAuth(view: View): boolean {
    const publicViews: View[] = ['landing', 'auth'];
    return !publicViews.includes(view);
}
