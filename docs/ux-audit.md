# Audit UX & QA (Gen 2026)

## 1) Prima impressione (ruolo: utente appena atterrato sulla Landing)

### Emozioni che arrivano
- **Curiosità e “wow”**: il contrasto scuro + glow viola, le animazioni e la mascotte in hero comunicano un prodotto moderno e “premium”.
- **Senso di guida/sicurezza**: l’idea di un percorso guidato (CTA “Inizia il Percorso”) e la promessa “senza rischi” riducono l’ansia da trading.
- **Ambizione/competizione**: “XP, badge, leaderboard” e numeri (“Studenti”, “Success Rate”) generano stimolo e FOMO positivo.
- **Leggera diffidenza**: copy molto assertivo (“Domina”, “unica accademia”, numeri molto alti) può attivare una reazione “marketing-driven” se non supportata da prove concrete (testimonianze, demo reale, esempi di lezioni).
- **Sovraccarico visivo (per alcuni)**: tanti effetti + tanti elementi (floating UI + griglie + glow) possono risultare “molto” su device meno potenti o per utenti più sobri.

### Cosa funziona bene
- **Gerarchia chiara**: headline forte, CTA primaria evidente.
- **Proposta di valore leggibile**: AI tutor + missioni + paper trading + gamification.
- **Cura estetica coerente**: palette dark + neon, stile uniforme.

### Frizioni principali (landing)
- I link top “Funzionalità/Metodo/Prezzi/FAQ” puntano ad anchor `#...` ma nella pagina non risultano sezioni con `id` corrispondenti (rischio: click “morto” e perdita di fiducia).
- CTA “Guarda Demo” non sembra collegata ad azione reale (se resta un bottone “vuoto”, è un punto critico di credibilità).
- Copy numeri (15k studenti/94%) senza contesto può sembrare “finto”.

## 2) Inventario pagine + cosa dovrebbe fare l’utente

Routing è “state-based” (nessun react-router): `currentView` in `App.tsx`.

### Pagine principali
- **Landing**: convincere → onboarding o auth.
- **Auth**: login/signup/OAuth/guest.
- **Onboarding**: profiling in 6 step, generazione raccomandazioni.
- **Home**: hub rapido (progress, CTA verso lezioni).
- **Dashboard**: panoramica progress + azioni + badge + milestone.
- **Lessons (Learning Path)**: mappa lezioni, sblocchi per livello.
- **Lesson**: esperienza didattica + quiz + ricompense.
- **Badges**: catalogo, progresso requisiti.
- **Simulation**: paper trading + missioni + XP.
- **Longterm**: simulatore interesse composto + salvataggio piani.
- **Wheel Strategy**: dashboard strategie + trade journal + stats.
- **Leaderboard**: classifica.
- **Settings**: profilo + preferenze (audio/haptic) + admin tools.
- **Exchange**: connessione exchange (UI + guide).

### Schermate “debug” via query
- `?test=chat`, `?status=supabase`, `?test=supabase`.

## 3) Test eseguiti (in questa sessione)

### Smoke test tecnico
- Avvio dev server ok (Vite).
- Apertura app in browser ok, console senza errori.
- Build produzione ok (`npm run build`).

### Review funzionale (code-driven)
Ho verificato i flussi principali leggendo le view e i punti di integrazione (auth/onboarding, localStorage vs Supabase, funzioni edge). Non sostituisce un test manuale end-to-end, ma evidenzia rischi reali.

## 4) Checklist QA (da provare manualmente)

### Navigazione & shell
- Sidebar: tutte le voci portano alla view corretta.
- Stato attivo coerente.
- Mobile bottom nav: non copre CTA, safe-area ok.

### Landing
- Anchor top: ogni link scrolla alla sezione giusta.
- “Guarda Demo”: o apre demo reale o viene rimosso.
- Performance: first paint su device medio (no jank).

### Auth
- Signup email → email conferma (messaggio chiaro).
- Login credenziali errate → errore coerente.
- Google OAuth → redirect pulito (URL hash/code ripulito).
- Guest mode → accesso e dati locali persistenti.
- Reset password → flusso completo.

### Onboarding
- Step gating: il tasto “Avanti” è disabilitato finché non completo.
- Skip onboarding: porta a dashboard senza blocchi.
- Output raccomandazioni: comprensibile e “azione immediata”.

### Lessons/Lesson
- Lock/unlock per livello corretto.
- Quiz: tutte le tipologie funzionano (MCQ, calc, drag-drop).
- Progress/XP: non si duplica al refresh.

### Simulation
- Missioni: completamento, reward, salvataggio.
- Persistenza: local vs cloud (se loggato) coerente.
- Errori rete: fallback e messaggi.

### Longterm + Wheel Strategy
- Salvataggio piani e riapertura.
- Wheel: caricamento strategie/trade/stats, modalità cloud/local.
- Inserimento trade: calcoli, validazione, chiusura trade.

### Leaderboard
- Cloud: carica classifica, posizione utente.
- Fallback: mostra dati mock senza crash.

### Settings
- Toggle audio/haptic mascotte persiste su refresh.
- Area admin: protetta e non visibile a non-admin.

## 5) Problemi/rischi osservati

### UX/Credibilità
- Anchor della topbar landing non collegate a sezioni reali.
- “Guarda Demo” senza azione reale.
- Numeri/claim senza prova (testimonianze, screenshot reali, preview lezione).

### Performance
- Bundle principale ancora grande (chunk > 500kB). È ok per desktop, ma su mobile può rallentare.
- PWA dev warning su `globPattern` in `dev-dist`: da pulire per ridurre rumore.

### Robustezza dati
- Percentuali basate su divisioni (es. XP/XPToNext) devono sempre gestire `0`/undefined (NaN).
- Modalità cloud vs local: evitare che UI sembri “salvare” quando in realtà è locale.

### Mascotte (interazione)
- Deve poter essere richiamata sempre dalla sidebar.
- Quando visibile può coprire CTA: serve un modo immediato per nasconderla.

## 6) Miglioramenti consigliati (prioritizzati)

### P0 (impatto alto, sforzo basso)
- **Landing: fix anchor** aggiungendo `id` reali alle sezioni o rimuovendo link non implementati.
- **Landing: demo reale** (anche un video/overlay o “tour” interno) oppure eliminare il bottone.
- **Guardie anti-NaN** per progressi e percentuali.
- **Mascotte: richiamo sempre disponibile** e comportamento che non blocca UI.

### P1 (impatto alto, sforzo medio)
- **Riduzione bundle**: lazy-load dei moduli pesanti (recharts, supabase, pannelli admin) e code-splitting per view.
- **Chiarezza cloud/local**: badge persistente e copy chiaro (“stai salvando localmente”).
- **Coerenza branding**: “BTC Wheel Pro” vs “btcwheel” vs “Design App Educativa Bitcoin”.

### P2 (impatto medio)
- **Prove sociali**: testimonianze, screenshot reali lezioni, mini-case.
- **Accessibilità**: contrasto testo grigio su dark, focus states, aria-label su CTA chiave.
- **Telemetry minima**: misurare funnel (landing→onboarding→prima lezione) + drop-off.

## 7) Note operative

Se vuoi, posso trasformare questa checklist in una matrice QA (browser/device/permessi) e aggiungere una sezione “Definition of Done” per ogni pagina.

