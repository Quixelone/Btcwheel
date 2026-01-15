# Mappa funzioni e stato implementazione

## 1. Struttura generale

- Frontend SPA React + TypeScript (Vite).
- Stato globale gestito tramite hook custom (useAuth, useUserProgress, useOnboarding).
- Persistenza locale tramite wrapper `storage` su localStorage.
- Integrazione cloud opzionale con Supabase (auth, progressi, leaderboard, simulazioni).
- Funzionalità AI tramite Edge Functions Supabase e OpenAI (`analyzeUserProfile`, `chatWithAITutor`).

## 2. Funzioni principali già presenti

### 2.1 App e routing

- `App` e `AppContent` ([App.tsx](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/App.tsx#L59-L360))  
  Gestione vista corrente (`View`), flusso Landing → Auth → Onboarding → Dashboard, gestione risultati onboarding e routing condizionale.

### 2.2 Hook custom (`/src/hooks`)

- `useAuth` ([useAuth.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/hooks/useAuth.ts))  
  Gestione autenticazione Supabase e modalità locale (demo), login/password, signup via Edge Function, Google OAuth, guest login.
- `useUserProgress` ([useUserProgress.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/hooks/useUserProgress.ts))  
  Sincronizza progressi utente tra localStorage e Supabase (se configurato), gestione XP, streak, badge, lezioni completate, attività.
- `useOnboarding` ([useOnboarding.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/hooks/useOnboarding.ts))  
  Salvataggio stato onboarding, profilo utente e raccomandazioni personalizzate, integrazione con OpenAI tramite `analyzeUserProfile`.
- `useAIQuizGenerator` ([useAIQuizGenerator.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/hooks/useAIQuizGenerator.ts))  
  Generazione quiz dinamici via backend AI, con fallback locale.
- `useBitcoinHistory` ([useBitcoinHistory.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/hooks/useBitcoinHistory.ts))  
  Recupero e caching storico prezzo BTC per simulazioni.
- `useMascotEmotion`, `useMascotSounds`, `useAnimations`, `useHaptics`  
  Gestione emozioni mascotte, suoni, animazioni UI e feedback aptico.

### 2.3 Librerie dominio (`/src/lib`)

- `supabase.ts` ([supabase.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/supabase.ts))  
  - Configurazione client Supabase con fallback a variabili d’ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) o `projectId/publicAnonKey`.  
  - Helper:
    - `getUserProgress`, `createUserProgress`, `updateUserProgress`  
    - `addUserActivity`, `getUserActivities`  
    - Tipi: `UserProgressDB`, `UserActivity`, `TradingSimulation`, `LeaderboardEntry`.
- `localStorage.ts` ([localStorage.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/localStorage.ts))  
  Wrapper `storage` con prefisso `btcwheel_`, migrazione chiavi legacy, evento custom `btcwheel-storage`.
- `openai.ts` ([openai.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/openai.ts))  
  - `analyzeUserProfile(profile)` → `PersonalizedRecommendation` via Edge Function `analyze-profile` con fallback locale.  
  - `chatWithAITutor(message, context?)` → risposta testuale via Edge Function `chat-tutor`.
- `lessons.ts` ([lessons.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/lessons.ts))  
  Definizione tipizzata delle lezioni, sezioni e domande, mappa `lessons`.
- `badges.ts` ([badges.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/badges.ts))  
  Definizione badge e helper: `getBadgesByCategory`, `getBadgesByRarity`, `checkBadgeUnlock`, `getUnlockedBadges`, `getNextBadgeToUnlock`.
- `mascot-images.ts` ([mascot-images.ts](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/lib/mascot-images.ts))  
  Selezione immagini mascotte (`getMascotImage`).

### 2.4 Componenti principali (`/src/components`)

- Navigazione e layout  
  - `Navigation`, `UserMenu`, `ActivePlanProgress`, `Dashboard`, `HomePage`, `LandingPage`.
- Learning e gamification  
  - `LessonList`, `LessonView`, `BadgeShowcase`, `LeaderboardView`, componenti quiz (`QuizDragDrop`, `QuizCalculation`, `QuizAttempts`, `ReviewSuggestion`).
- Simulazioni trading  
  - `SimulationView`, `SimulationTutorial`, `LongTermSimulator`, `PlanVsReal`, `WheelStrategyView`, `ManualTradeJournal`, `ManualTradeJournalSimple`.
- Integrazione exchange e dati  
  - `ExchangeView`, `ExchangeConnections`, `ExchangeLogos`, `DbDuplicatePanel`, `DataPreviewPanel`, `DataMigration`.
- Auth e onboarding  
  - `AuthView`, `AuthProvider`, `OnboardingView`, `OnboardingResults`.
- Mascotte e AI  
  - `MascotAI`, `ChatTutor`, `ChatTutorTest`.
- PWA e mobile  
  - `MobileOptimizations`, `MobileGestures`, `PWAInstallPrompt`, `AppUpdatePrompt`.
- Supabase tooling  
  - `SupabaseStatus`, `SupabaseTestView`.
- Admin  
  - `AdminDashboard`, `AdminUserManagement`, `AdminMigrationPanel`, `AdminBillingPanel`.
- Animazioni (`/components/animations`)  
  - Componenti per XP, streak, badge unlock, skeleton, indicatori AI, progress bar animate ecc.
- UI base (`/components/ui`)  
  - Tutti i componenti shadcn/ui (button, card, dialog, form, tabs, ecc.) e utilità `cn`, `useIsMobile`.

### 2.5 Backend / Edge Functions (`/src/supabase/functions/server`)

- `kv_store.tsx`  
  Funzioni `set`, `get`, `del`, `mset`, `mget`, `mdel`, `getByPrefix` su tabella `kv_store_7c0f82ca`.
- `exchange-connectors.tsx`  
  Connettori tipizzati per exchange: `BinanceConnector`, `BybitConnector`, `KucoinConnector`, `BingxConnector`, `OKXConnector`, `DeribitConnector`, `BitgetConnector`, registro `EXCHANGE_CONNECTORS`.

## 3. Funzionalità/documentate ma non ancora implementate o incomplete

Queste voci derivano dal codice e dalla documentazione (`*.md`).

### 3.1 PWA e service worker
- Stato: **COMPLETATO**
- Implementazione:
  - Installato `vite-plugin-pwa`.
  - Configurato `vite.config.ts` per generare service worker e manifest.
  - Abilitato `AppUpdatePrompt.tsx` con hook `useRegisterSW`.
  - Rimossa registrazione manuale obsoleta in `MobileOptimizations.tsx`.
  - Build verificata con successo.

### 3.2 Wheel Dashboard: integrazione backend

- Documento: [WHEEL_DASHBOARD.md](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/WHEEL_DASHBOARD.md)  
- Backend oggi:
  - Edge Functions dedicate in [`wheel-routes.tsx`](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/supabase/functions/server/wheel-routes.tsx) montate in [`index.tsx`](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/supabase/functions/server/index.tsx).
  - API attive:
    - `GET/POST /make-server-7c0f82ca/wheel/strategies`
    - `GET /make-server-7c0f82ca/wheel/trades/:strategyId`
    - `POST /make-server-7c0f82ca/wheel/trades`
    - `GET /make-server-7c0f82ca/wheel/strategies/:strategyId/stats`
  - `WheelStrategyView` usa queste API quando Supabase è configurato e l’utente è loggato, con fallback completo su `localStorage` quando si è in modalità locale/demo.
- Stato:
  - ✅ Integrazione backend di base completata (strategie, trade, statistiche per strategia).
  - ✅ Modalità ibrida locale/cloud gestita correttamente.
  - ⏳ Restano da implementare in futuro le feature avanzate descritte in `WHEEL_DASHBOARD.md` (sync real-time, metriche storiche avanzate, segnali 0DTE, integrazione AI sulla dashboard).

### 3.3 Gestione backup/ripristino profilo utente

- Documenti:
  - [USER_MANAGEMENT_COMPLETE.md](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/USER_MANAGEMENT_COMPLETE.md#L279-L281)  
    “Ripristino dati (TODO: da implementare nel frontend)”.
  - [USER_MANAGEMENT_SETUP.md](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/USER_MANAGEMENT_SETUP.md#L162)  
    Restore futuro indicato come opzionale.
- Stato: schema SQL e logica server descritti; manca una UI completa nel frontend per selezionare backup, ripristinare e gestire conflitti dati locali/cloud.

### 3.4 Costo medio BTC
- Stato: **COMPLETATO**
- Implementazione:
  - Backend: Aggiunta logica `updateBTCAccumulation` in `wheel-routes.tsx` per calcolare costo medio ponderato su assignment.
  - API: Nuovo endpoint `/can-sell-call` per verificare prezzo minimo di vendita.
  - Frontend: Aggiornata `WheelStrategyView` con card "BTC Accumulati" e calcolo locale per modalità offline.
  - Database: Aggiornato schema in `MIGRATION_SQL.md` (richiede migrazione manuale per cloud mode).

### 3.5 Pannello admin billing – UI avanzata

- Documento: [ADMIN_BILLING_COMPLETE.md](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/ADMIN_BILLING_COMPLETE.md#L499-L573)  
  - Note su pannello admin con TODO per UI specifiche (gestione piani, metodi pagamento, logica di restore).
- Stato: esiste `AdminBillingPanel` con logica di base; alcune funzionalità avanzate descritte nel documento non risultano ancora collegate o complete.

### 3.6 Altri elementi pianificati

- Da documentazione (`PROJECT_OVERVIEW.md`, `NEXT_STEPS_SUMMARY.md`):
  - Integrazioni future: live trading, community, mentor system, achievement NFT.
  - Miglioramenti analytics e monitoring.
  - Estensioni mobile-native oltre PWA.

## 4. Conflitti e incoerenze rilevate (alto livello)

Questi punti sono già stati corretti nel codice dove possibile, ma li elenchiamo per chiarezza:

1. **Incongruenza ID progetto Supabase**  
   - Prima: `SupabaseStatus` mostrava e linkava al project ID `rsmvjsokqolxgczclqjv`.  
   - Config effettiva: `projectId` in [`utils/supabase/info.tsx`](file:///Users/luigicoccimiglio/Downloads/Btcwheel_01/src/utils/supabase/info.tsx) è `tzorfzsdhyceyumhlfdp`.  
   - Soluzione: `SupabaseStatus` ora importa `projectId` e usa sempre il valore centralizzato.

2. **Configurazione Supabase e variabili d’ambiente**  
   - Prima: `supabase.ts` usava sempre `projectId/publicAnonKey` nonostante i doc parlassero di fallback su `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.  
   - Soluzione: ora `supabase.ts` prova prima le variabili d’ambiente e solo in assenza usa i valori di `info.tsx`. Questo evita conflitti tra ambiente locale e progetto generato da Figma.

3. **PWA documentata ma disattivata**  
   - Documentazione PWA e file manifest sono presenti, ma il service worker è disabilitato in HTML e nelle componenti.  
   - Soluzione proposta: implementare un service worker reale (es. Workbox) e riattivare la registrazione in `MobileOptimizations` e la logica di `AppUpdatePrompt`.

Questa mappa può essere estesa man mano che il progetto evolve, aggiungendo nuove funzioni o marcando come completate quelle attualmente in sezione “da implementare”.
