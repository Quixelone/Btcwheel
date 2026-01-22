# 🗺️ BTC Wheel Pro - Piano di Implementazione

**Versione:** 1.0.0  
**Data:** Gennaio 2026  
**Obiettivo:** Trasformare l'app attuale nella piattaforma di gestione patrimoniale a lungo termine descritta nel PROJECT_OVERVIEW.md

---

## 📋 Indice

1. [Principi Guida UX/UI](#principi-guida-uxui)
2. [Information Architecture](#information-architecture)
3. [User Flow Principale](#user-flow-principale)
4. [Piano di Implementazione Fasi](#piano-di-implementazione-fasi)
5. [Dettaglio Sezioni App](#dettaglio-sezioni-app)
6. [Priorità e Dipendenze](#priorità-e-dipendenze)
7. [Timeline Stimata](#timeline-stimata)

---

## 🎯 Principi Guida UX/UI

### Filosofia: "Clarity Over Complexity"

L'utente tipo (35-55 anni, non tech-savvy) deve:
- **Capire in 5 secondi** cosa fare ogni volta che apre l'app
- **Mai sentirsi sopraffatto** da troppe informazioni
- **Sempre vedere il suo PERCHÉ** (obiettivo di vita)
- **Fidarsi del sistema** (no elementi "gamey" infantili)

### Regole di Design

| Regola | Applicazione |
|--------|--------------|
| **1 azione primaria per schermata** | Ogni view ha UN bottone principale evidente |
| **Progressive disclosure** | Info avanzate nascoste, accessibili se serve |
| **Consistenza totale** | Stessi pattern ovunque (card, bottoni, colori) |
| **Mobile-first** | 70%+ utenti useranno smartphone |
| **Feedback immediato** | Ogni azione ha conferma visiva/sonora |

### Gerarchia Visiva

```
┌─────────────────────────────────────────────┐
│  HEADER: Logo + Obiettivo + Avatar          │ ← Sempre visibile
├─────────────────────────────────────────────┤
│                                             │
│  HERO SECTION                               │ ← Info più importante
│  (cambia in base alla sezione)              │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  CONTENT CARDS                              │ ← Azioni/Info secondarie
│                                             │
├─────────────────────────────────────────────┤
│  BOTTOM NAV (5 icone max)                   │ ← Navigazione principale
└─────────────────────────────────────────────┘
```

---

## 🏗️ Information Architecture

### Struttura App (5 Sezioni Principali)

```
btcwheel.io/
│
├── 🏠 HOME (Dashboard)
│   ├── Compound Vision (obiettivo + proiezione)
│   ├── Daily Briefing (summary Prof Satoshi)
│   ├── Quick Stats (capitale, settimana, streak)
│   └── Next Action (cosa fare oggi)
│
├── 📈 TRADING
│   ├── Exchange Hub
│   │   ├── Exchange collegati
│   │   ├── Confronto premium oggi
│   │   └── Collega nuovo exchange
│   ├── Posizioni Attive
│   │   ├── Opzioni aperte
│   │   ├── Storico operazioni
│   │   └── P&L dettagliato
│   └── PAC Tracker
│       ├── Stato PAC settimanale
│       ├── Storico versamenti
│       └── Proiezione DCA
│
├── 🤖 PROF SATOSHI
│   ├── Daily Briefing (completo)
│   │   ├── Bias sociale
│   │   ├── Macro outlook
│   │   ├── Analisi tecnica
│   │   └── 3 Strike consigliati
│   ├── Chat Assistant
│   │   └── Domande libere + context app
│   └── Storico Briefing
│       └── Archivio ultimi 30 giorni
│
├── 📚 ACADEMY
│   ├── Il Mio Percorso
│   │   ├── Progresso fasi
│   │   ├── Lezioni completate
│   │   └── Prossima lezione
│   ├── Lezione Corrente
│   │   ├── Video/Podcast
│   │   ├── Contenuto testuale
│   │   └── Quiz dinamico
│   └── Risorse
│       ├── Glossario
│       ├── FAQ
│       └── Podcast library
│
└── ⚙️ PROFILO
    ├── Il Mio Obiettivo
    │   ├── Modifica obiettivo
    │   ├── Timeline
    │   └── Milestone passate
    ├── Profilo Rischio
    │   ├── Risultato quiz
    │   ├── Modifica profilo
    │   └── Storico variazioni
    ├── Notifiche
    │   ├── Preferenze (push/telegram/email)
    │   └── Orari
    ├── Abbonamento
    │   ├── Piano attuale
    │   ├── Upgrade/Downgrade
    │   └── Fatture
    └── Account
        ├── Dati personali
        ├── Sicurezza
        └── Logout/Elimina
```

---

## 🔄 User Flow Principale

### Flow Giornaliero (Utente Attivo)

```
┌─────────────────────────────────────────────────────────────────┐
│                        MATTINA (08:30+)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. NOTIFICA: "Daily Briefing disponibile"                      │
│        │                                                        │
│        ▼                                                        │
│  2. APRE APP → HOME                                             │
│     • Vede obiettivo + proiezione (Compound Vision)             │
│     • Vede card "Daily Briefing" con preview                    │
│        │                                                        │
│        ▼                                                        │
│  3. TAP su Daily Briefing → PROF SATOSHI                        │
│     • Legge bias (bullish/bearish)                              │
│     • Vede 3 strike consigliati                                 │
│     • Satoshi spiega ragionamento                               │
│        │                                                        │
│        ▼                                                        │
│  4. DECIDE strike → VA SU EXCHANGE (esterno)                    │
│     • L'app NON esegue l'ordine                                 │
│     • L'utente crea opzione manualmente                         │
│        │                                                        │
│        ▼                                                        │
│  5. TORNA SU APP → TRADING                                      │
│     • L'app rileva la nuova posizione via API                   │
│     • Conferma visiva "Nuova posizione rilevata"                │
│     • Aggiorna P&L e proiezione Compound Vision                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SETTIMANALE (Mercoledì)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. NOTIFICA: "Nuova lezione disponibile"                       │
│        │                                                        │
│        ▼                                                        │
│  2. APRE APP → ACADEMY                                          │
│     • Vede progresso percorso                                   │
│     • Nuova lezione evidenziata                                 │
│        │                                                        │
│        ▼                                                        │
│  3. STUDIA LEZIONE (10 min)                                     │
│     • Video o Podcast                                           │
│     • Contenuto testuale                                        │
│        │                                                        │
│        ▼                                                        │
│  4. QUIZ DINAMICO                                               │
│     • Domande generate da NotebookLM                            │
│     • Se sbaglia: nuove domande, non ripetizione                │
│     • Prof Satoshi commenta risultato                           │
│        │                                                        │
│        ▼                                                        │
│  5. AGGIORNA PROFILO RISCHIO                                    │
│     • Se quiz rivela cambio comprensione →                      │
│       Satoshi calibra suggerimenti futuri                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SETTIMANALE (Giorno PAC)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. NOTIFICA: "Oggi è il giorno del PAC"                        │
│        │                                                        │
│        ▼                                                        │
│  2. APRE APP → PAC TRACKER                                      │
│     • Vede stato PAC (fatto/da fare)                            │
│     • Vede storico versamenti                                   │
│        │                                                        │
│        ▼                                                        │
│  3A. UTENTE PREMIUM:                                            │
│     • App verifica via API se versamento fatto                  │
│     • Conferma automatica                                       │
│                                                                 │
│  3B. UTENTE FREE:                                               │
│     • Bottone "Ho fatto il versamento"                          │
│     • Conferma manuale                                          │
│        │                                                        │
│        ▼                                                        │
│  4. AGGIORNA PROIEZIONE                                         │
│     • Compound Vision ricalcolato                               │
│     • Celebrazione se milestone raggiunto                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DOMENICA (Weekly Review)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. NOTIFICA: "Weekly Review pronto"                            │
│        │                                                        │
│        ▼                                                        │
│  2. APRE APP → HOME (Weekly Review mode)                        │
│     • Riepilogo settimana:                                      │
│       - Operazioni eseguite                                     │
│       - P&L settimana                                           │
│       - Streak attuale                                          │
│       - Lezioni completate                                      │
│        │                                                        │
│        ▼                                                        │
│  3. PROF SATOSHI COMMENTA                                       │
│     • "Questa settimana hai scelto strike conservativi,         │
│        il mercato era volatile, buona scelta!"                  │
│     • Suggerimento per settimana prossima                       │
│        │                                                        │
│        ▼                                                        │
│  4. AWARD STREAK                                                │
│     • Se 4+ settimane consecutive → sblocco feature             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Piano di Implementazione Fasi

### 🔴 FASE 0: Pulizia e Fondamenta (OBBLIGATORIA)
**Durata stimata:** 1-2 settimane

Prima di costruire nuovo, dobbiamo sistemare le basi.

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 0.1 | Rimuovere componenti non necessari (simulatore paper, gamification vecchia) | 🔴 CRITICO | - |
| 0.2 | Refactor Navigation per 5 sezioni (Home, Trading, Satoshi, Academy, Profilo) | 🔴 CRITICO | 0.1 |
| 0.3 | Creare PageWrapper unificato per layout consistente | 🔴 CRITICO | 0.2 |
| 0.4 | Creare BottomNav mobile-first | 🔴 CRITICO | 0.2 |
| 0.5 | Setup routing con React Router (o stato globale migliorato) | 🟡 ALTO | 0.3 |
| 0.6 | Creare componenti UI base: StatCard, InfoCard, ProgressCard, ActionCard | 🟡 ALTO | 0.3 |

**Output Fase 0:**
- App con 5 sezioni vuote ma navigabili
- Layout consistente su tutte le pagine
- Nessun elemento legacy

---

### 🟡 FASE 1: Core Experience (MVP)
**Durata stimata:** 3-4 settimane

Il minimo per un utente reale.

#### 1A. Onboarding Nuovo Utente

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 1A.1 | Landing Page aggiornata con nuova value proposition | 🔴 CRITICO | 0.* |
| 1A.2 | Onboarding Flow: definizione obiettivo (predefinito + custom) | 🔴 CRITICO | 0.* |
| 1A.3 | Onboarding Flow: quiz profilo rischio iniziale | 🔴 CRITICO | 1A.2 |
| 1A.4 | Onboarding Flow: collega primo exchange | 🟡 ALTO | 1A.3 |
| 1A.5 | Onboarding Flow: imposta PAC (importo + giorno) | 🟡 ALTO | 1A.4 |

#### 1B. Home Dashboard

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 1B.1 | Compound Vision Card (obiettivo + proiezione) | 🔴 CRITICO | 1A.2 | ✅ COMPLETATO (Compound Tracker) |
| 1B.2 | Quick Stats (capitale, streak, settimana) | 🔴 CRITICO | 0.6 |
| 1B.3 | Daily Briefing Preview Card (link a Satoshi) | 🟡 ALTO | 2A.* |
| 1B.4 | Next Action Card (cosa fare oggi) | 🟡 ALTO | 1B.1 |
| 1B.5 | Weekly Review Mode (domenica) | 🟢 MEDIO | 1B.* |

#### 1C. Exchange Integration (Base)

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 1C.1 | Componente collegamento exchange (API key input) | 🔴 CRITICO | 0.* |
| 1C.2 | Integrazione Deribit API (posizioni + storico) | 🔴 CRITICO | 1C.1 |
| 1C.3 | Visualizzazione posizioni attive | 🔴 CRITICO | 1C.2 |
| 1C.4 | Rilevamento automatico nuove posizioni | 🟡 ALTO | 1C.2 |
| 1C.5 | Calcolo P&L automatico | 🟡 ALTO | 1C.3 | ✅ COMPLETATO (Trade Journal) |

**Output Fase 1:**
- Utente può fare onboarding completo
- Dashboard mostra obiettivo + proiezione
- 1 exchange (Deribit) funzionante
- Posizioni visualizzate correttamente

---

### 🟢 FASE 2: Prof Satoshi Intelligence
**Durata stimata:** 3-4 settimane

Il cuore differenziante dell'app.

#### 2A. Daily Briefing

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 2A.1 | Backend: Bias Scanner (scraper X, Telegram, Reddit) | 🔴 CRITICO | - |
| 2A.2 | Backend: Macro Analyst (news API + parsing) | 🔴 CRITICO | - |
| 2A.3 | Backend: Technical Analyst (BB, RSI, MACD via API) | 🔴 CRITICO | - |
| 2A.4 | Backend: Strike Calculator (3 livelli rischio) | 🔴 CRITICO | 2A.1-3 |
| 2A.5 | Cron Job: Esegui analisi 00:00-08:30 | 🔴 CRITICO | 2A.4 |
| 2A.6 | UI: Daily Briefing Full View | 🔴 CRITICO | 2A.5 |
| 2A.7 | UI: Strike Cards con spiegazione | 🔴 CRITICO | 2A.6 |
| 2A.8 | Personalizzazione strike su profilo rischio | 🟡 ALTO | 1A.3, 2A.4 |

#### 2B. Chat Assistant

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 2B.1 | Setup NotebookLM con documentazione app | 🟡 ALTO | - |
| 2B.2 | API integration NotebookLM | 🟡 ALTO | 2B.1 |
| 2B.3 | UI: Chat interface | 🟡 ALTO | 2B.2 |
| 2B.4 | Context injection (schermata attuale, dati utente) | 🟢 MEDIO | 2B.3 |
| 2B.5 | Storico conversazioni | 🟢 MEDIO | 2B.3 |

**Output Fase 2:**
- Daily Briefing funzionante ogni mattina
- 3 strike personalizzati su profilo rischio
- Chat assistant che conosce l'app
- Notifiche (almeno in-app)

---

### 🔵 FASE 3: Academy Adattiva
**Durata stimata:** 3-4 settimane

Il sistema educativo completo.

#### 3A. Struttura Corso

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 3A.1 | Database lezioni (titolo, contenuto, fase, ordine) | 🔴 CRITICO | - |
| 3A.2 | UI: Percorso visivo (fasi + progresso) | 🔴 CRITICO | 3A.1 |
| 3A.3 | UI: Lezione View (video embed + testo) | 🔴 CRITICO | 3A.1 |
| 3A.4 | Contenuti Fase 1 (6 lezioni scritte) | 🔴 CRITICO | 3A.3 |
| 3A.5 | Video produzione Fase 1 (6 video) | 🟡 ALTO | 3A.4 |

#### 3B. Quiz Dinamici

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 3B.1 | Setup NotebookLM per generazione quiz | 🔴 CRITICO | - |
| 3B.2 | API: Genera domande per argomento | 🔴 CRITICO | 3B.1 |
| 3B.3 | UI: Quiz component (non riusa domande) | 🔴 CRITICO | 3B.2 |
| 3B.4 | Tracking risposte per profilo rischio | 🟡 ALTO | 3B.3 |
| 3B.5 | Calibrazione difficoltà automatica | 🟢 MEDIO | 3B.4 |

#### 3C. Podcast

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 3C.1 | Setup NotebookLM Audio | 🟢 MEDIO | - |
| 3C.2 | Generazione podcast per lezione | 🟢 MEDIO | 3C.1 |
| 3C.3 | Player audio in-app | 🟢 MEDIO | 3C.2 |
| 3C.4 | Delivery via Telegram | 🟢 MEDIO | 3C.2, 5A.* |

**Output Fase 3:**
- Corso Fase 1 completo (6 lezioni + video)
- Quiz MAI con domande ripetute
- Podcast disponibili (almeno in-app)

---

### 🟣 FASE 4: Multi-Exchange & PAC
**Durata stimata:** 2-3 settimane

Espansione exchange e tracciamento PAC.

#### 4A. Multi-Exchange

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 4A.1 | Integrazione OKX API | 🔴 CRITICO | 1C.* |
| 4A.2 | Integrazione Binance API (Dual Investment) | 🔴 CRITICO | 1C.* |
| 4A.3 | UI: Confronto premium cross-exchange | 🔴 CRITICO | 4A.1-2 |
| 4A.4 | Integrazione Bybit | 🟢 MEDIO | 1C.* |
| 4A.5 | Integrazione Bitget | 🟢 MEDIO | 1C.* |

#### 4B. PAC Tracker

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 4B.1 | UI: PAC Dashboard (stato + storico) | 🟡 ALTO | 1A.5 | ✅ COMPLETATO (Compound Tracker) |
| 4B.2 | Reminder notifiche (in-app) | 🟡 ALTO | 4B.1 |
| 4B.3 | Verifica PAC via API (Premium) | 🟢 MEDIO | 4A.*, 4B.1 |
| 4B.4 | Conferma manuale PAC (Free) | 🟡 ALTO | 4B.1 |
| 4B.5 | Proiezione DCA visuale | 🟢 MEDIO | 4B.1 |

**Output Fase 4:**
- 3+ exchange supportati
- Confronto premium funzionante
- PAC tracciato e con reminder

---

### ⚫ FASE 5: Monetizzazione & Notifiche
**Durata stimata:** 2-3 settimane

Revenue e retention.

#### 5A. Notifiche

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 5A.1 | Telegram Bot setup | 🟡 ALTO | - |
| 5A.2 | Push notifications (web + PWA) | 🟡 ALTO | - |
| 5A.3 | Email integration (Resend/SendGrid) | 🟡 ALTO | - |
| 5A.4 | Preferenze notifiche UI | 🟡 ALTO | 5A.1-3 |

#### 5B. Pagamenti

| ID | Task | Priorità | Dipendenze |
|----|------|----------|------------|
| 5B.1 | Stripe integration | 🟡 ALTO | - |
| 5B.2 | UI: Paywall per feature Premium | 🟡 ALTO | 5B.1 |
| 5B.3 | UI: Gestione abbonamento | 🟢 MEDIO | 5B.1 |
| 5B.4 | Webhook per rinnovi/cancellazioni | 🟢 MEDIO | 5B.1 |

**Output Fase 5:**
- Notifiche su 3 canali (push, telegram, email)
- Pagamenti funzionanti
- Distinzione Free/Premium operativa

---

## 📱 Dettaglio Sezioni App (Wireframe Concettuali)

### 🏠 HOME

```
┌─────────────────────────────────────────────┐
│  🎯 Università di Marco                 [👤]│  ← Header con obiettivo
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  COMPOUND VISION                    │    │  ← Card principale
│  │  ───────────────────────────────    │    │
│  │  Se continui: €52,340 ✅            │    │
│  │  Obiettivo: €50,000 | 2038          │    │
│  │  ───────────────────────────────    │    │
│  │  ████████████████████░░░ 78%        │    │
│  │  ───────────────────────────────    │    │
│  │  Prossimo milestone: €10k (-€847)   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📊 DAILY BRIEFING                  │    │  ← Card secondaria
│  │  Oggi: Bias Bullish 🟢              │    │
│  │  3 strike disponibili               │    │
│  │                          [Apri →]   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ €4,230   │ │ Week 7   │ │ 3/3 ✓    │    │  ← Quick stats
│  │ Capitale │ │ Streak   │ │ Attività │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  ⚡ PROSSIMA AZIONE                 │    │  ← Next action
│  │  Completa la lezione settimanale    │    │
│  │                       [Inizia →]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠    📈    🤖    📚    ⚙️              │  ← Bottom nav
└─────────────────────────────────────────────┘
```

### 📈 TRADING

```
┌─────────────────────────────────────────────┐
│  📈 Trading                             [👤]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  CONFRONTO PREMIUM OGGI             │    │
│  │  ───────────────────────────────    │    │
│  │  🥇 Deribit   │ 1.8%  │ $96,000    │    │
│  │  🥈 OKX       │ 1.6%  │ $95,800    │    │
│  │  🥉 Binance   │ 1.4%  │ $95,500    │    │
│  │                                     │    │
│  │  [+ Collega Exchange]               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── Posizioni Attive (2) ──────────────    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  PUT $94,000 | Deribit              │    │
│  │  Scade: Oggi 08:00 UTC              │    │
│  │  Premium: $450 (1.2%)               │    │
│  │  Status: 🟢 In profitto             │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  DUAL | Binance                     │    │
│  │  Scade: Domani                      │    │
│  │  APY: 45%                           │    │
│  │  Status: 🟡 In attesa               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── PAC Settimanale ───────────────────    │
│  ┌─────────────────────────────────────┐    │
│  │  Questa settimana: ✅ Versato       │    │
│  │  Prossimo: Lunedì 20 Gen            │    │
│  │  Totale YTD: €2,100                 │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠    📈    🤖    📚    ⚙️              │
└─────────────────────────────────────────────┘
```

### 🤖 PROF SATOSHI

```
┌─────────────────────────────────────────────┐
│  🤖 Prof Satoshi                        [👤]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🌅 DAILY BRIEFING                  │    │
│  │  17 Gennaio 2026 • 08:30            │    │
│  │  ───────────────────────────────    │    │
│  │                                     │    │
│  │  📊 BIAS: BULLISH 🟢                │    │
│  │  "Sentiment positivo su X e Reddit. │    │
│  │   ETF inflows in aumento."          │    │
│  │                                     │    │
│  │  🌍 MACRO: NEUTRO 🟡                │    │
│  │  "Fed silent, no eventi oggi.       │    │
│  │   Attenzione CPI domani."           │    │
│  │                                     │    │
│  │  📈 TECNICO:                        │    │
│  │  RSI: 58 | MACD: Bullish cross      │    │
│  │  Supporto: $92,400 | Res: $98,200   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── I TUOI 3 STRIKE ───────────────────    │
│  (Basati sul tuo profilo: MODERATO)        │
│                                             │
│  ┌───────────┐┌───────────┐┌───────────┐   │
│  │ 🟢 SAFE  ││ 🟡 MEDIUM ││ 🔴 RISK  │   │
│  │ $93,500  ││ $94,800   ││ $96,000  │   │
│  │ 0.8%     ││ 1.2%      ││ 1.8%     │   │
│  │ ━━━━━━━  ││ ━━━━━━━━  ││ ━━━━━━   │   │
│  └───────────┘└───────────┘└───────────┘   │
│                                             │
│  💡 "Per il tuo profilo moderato,          │
│      oggi consiglio $94,800. Il bias       │
│      è positivo ma non esagerare."         │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  💬 Chiedi a Satoshi...             │    │
│  └─────────────────────────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠    📈    🤖    📚    ⚙️              │
└─────────────────────────────────────────────┘
```

### 📚 ACADEMY

```
┌─────────────────────────────────────────────┐
│  📚 Academy                             [👤]│
├─────────────────────────────────────────────┤
│                                             │
│  ── Il Tuo Percorso ───────────────────    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  FASE 1: FONDAMENTA                 │    │
│  │  ████████████████████░░░░░ 4/6      │    │
│  │  ───────────────────────────────    │    │
│  │  ✅ 1.1 Cos'è Bitcoin               │    │
│  │  ✅ 1.2 Opzioni Put/Call            │    │
│  │  ✅ 1.3 La Wheel Strategy           │    │
│  │  ✅ 1.4 Interesse Composto          │    │
│  │  🔵 1.5 Cos'è un PAC ← PROSSIMA     │    │
│  │  🔒 1.6 Setup Exchange              │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  FASE 2: COSTRUZIONE         🔒     │    │
│  │  Sblocca completando Fase 1         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── Continua ──────────────────────────    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  📖 1.5 Cos'è un PAC               │    │
│  │  ───────────────────────────────    │    │
│  │  🎬 Video: 8 min                    │    │
│  │  🎧 Podcast disponibile             │    │
│  │  📝 Quiz: 5 domande                 │    │
│  │                                     │    │
│  │            [▶️ INIZIA]              │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ── Risorse ───────────────────────────    │
│  📖 Glossario  |  ❓ FAQ  |  🎧 Podcast    │
│                                             │
├─────────────────────────────────────────────┤
│  🏠    📈    🤖    📚    ⚙️              │
└─────────────────────────────────────────────┘
```

---

## 🎯 Priorità e Dipendenze

### Mappa Dipendenze

```
FASE 0 (Fondamenta)
    │
    ├──→ FASE 1A (Onboarding) ──→ FASE 1B (Home) 
    │         │                        │
    │         ▼                        │
    │    FASE 1C (Exchange) ◄──────────┘
    │         │
    ▼         ▼
FASE 2A (Daily Briefing) ──→ FASE 2B (Chat)
    │
    ▼
FASE 3 (Academy) ◄── può iniziare in parallelo a Fase 2
    │
    ▼
FASE 4A (Multi-Exchange)
FASE 4B (PAC Tracker)
    │
    ▼
FASE 5 (Monetizzazione)
```

### Priorità Assolute (Blockers)

**Senza queste, l'app NON ha senso:**
1. ✅ Onboarding con obiettivo
2. ✅ Almeno 1 exchange funzionante
3. ✅ Daily Briefing con 3 strike
4. ✅ Compound Vision che si aggiorna

**Importanti ma non bloccanti:**
- 🟡 Quiz dinamici (può partire con quiz statici)
- 🟡 Video (può partire solo testo)
- 🟡 Telegram (può partire solo in-app)

---

## 📅 Timeline Stimata

### Scenario Realistico (1 sviluppatore)

| Fase | Durata | Data Fine (stimata) |
|------|--------|---------------------|
| Fase 0 | 2 settimane | 31 Gennaio 2026 |
| Fase 1 | 4 settimane | 28 Febbraio 2026 |
| Fase 2 | 4 settimane | 28 Marzo 2026 |
| Fase 3 | 3 settimane | 18 Aprile 2026 |
| Fase 4 | 3 settimane | 9 Maggio 2026 |
| Fase 5 | 2 settimane | 23 Maggio 2026 |

**MVP Pubblico:** Fine Febbraio 2026 (dopo Fase 1)
**Versione Completa:** Fine Maggio 2026

### Scenario Accelerato (2-3 sviluppatori)

| Milestone | Data |
|-----------|------|
| MVP (Fase 0+1) | Inizio Febbraio 2026 |
| Prof Satoshi (Fase 2) | Fine Febbraio 2026 |
| Academy (Fase 3) | Metà Marzo 2026 |
| Full Launch (Fase 4+5) | Fine Marzo 2026 |

---

## ✅ Checklist Inizio Lavori

Prima di iniziare Fase 0:

- [ ] Confermi la struttura delle 5 sezioni?
- [ ] Confermi i wireframe concettuali?
- [ ] Quale exchange vuoi integrare per primo? (consiglio Deribit)
- [ ] Hai già le API key di test per l'exchange?
- [ ] NotebookLM: hai già il progetto creato?
- [ ] Vuoi che inizio dalla Fase 0 subito?

---

**Documento creato:** 17 Gennaio 2026  
**Prossimo update:** Dopo conferma struttura

---

## 🔄 Aggiornamento Stato - Gennaio 2026

### ✅ Funzionalità Completate (22/01/2026)

#### 1. Compound Tracker (ex Compound Vision + PAC)
- **Vista dedicata:** `CompoundTrackerView.tsx`
- **Funzioni:**
  - Calcolo interesse composto giornaliero
  - Proiezione vs Reale
  - Input manuale depositi (PAC)
  - **Auto-Sync:** Legge automaticamente i profitti dal Trade Journal
  - Persistenza su Supabase (`compound_tracker` table)

#### 2. Trade Journal Avanzato
- **Vista:** `TradeJournalView.tsx`
- **Funzioni:**
  - Registrazione trade (PUT/CALL)
  - Gestione esiti (ITM/OTM/CLOSED)
  - **Buyback:** Gestione chiusura anticipata e calcolo P&L reale
  - **Cloud Sync:** Salvataggio su Supabase (`trades` table)
  - Statistiche automatiche (Win Rate, Premium Totale)

#### 3. Onboarding & Persistenza
- **Fix:** Risolto loop onboarding al refresh
- **Robustezza:** Fallback automatico a localStorage se DB non raggiungibile

