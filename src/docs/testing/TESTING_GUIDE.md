# 🧪 Testing Guide

Guida completa per testare l'applicazione.

---

## 📋 Test Types

1. **Unit Tests** - Funzioni e logica (Coming Soon)
2. **Integration Tests** - Flow completi (Coming Soon)
3. **Manual Testing** - Test funzionalità chiave
4. **Performance Testing** - Lighthouse & Core Web Vitals
5. **PWA Testing** - Installazione e offline

---

## 🚀 Quick Test Commands

```bash
# Type checking
npm run type-check

# Build test
npm run build

# Preview production build
npm run preview

# Lighthouse audit
npx lighthouse http://localhost:5173 --view
```

---

## ✅ Manual Testing Checklist

### 1. Authentication Flow

**Email/Password:**
- [ ] Signup nuovo utente funziona
- [ ] Email validation corretta
- [ ] Password strength check
- [ ] Login con credenziali corrette
- [ ] Errore con credenziali sbagliate
- [ ] Logout pulisce sessione
- [ ] Session persiste dopo refresh

**Google OAuth:**
- [ ] Click "Continua con Google" apre popup
- [ ] Selezione account funziona
- [ ] Redirect dopo auth OK
- [ ] Primo login crea account
- [ ] Login successivi usano account esistente

---

### 2. Onboarding Flow

- [ ] Onboarding appare per nuovi utenti
- [ ] Domande AI si caricano
- [ ] Risposte vengono salvate
- [ ] Raccomandazioni personalizzate generate
- [ ] Pulsante "Inizia" porta a dashboard
- [ ] Onboarding non si ripete per utenti esistenti

---

### 3. Dashboard & Navigation

**Homepage:**
- [ ] Livello e XP corretti
- [ ] Progress bar animata
- [ ] Streak counter aggiornato
- [ ] Quick actions funzionano
- [ ] Timeline attività mostra dati recenti

**Navigation:**
- [ ] Menu bottom/sidebar funziona
- [ ] Navigazione tra pagine smooth
- [ ] Back button browser funziona
- [ ] URL routing corretto

---

### 4. Lesson System

**Lesson List:**
- [ ] 15 lezioni visibili
- [ ] Lezione 9 completamente funzionale
- [ ] Altre lezioni mostrano "Coming Soon"
- [ ] Progress indicator per lezioni completate

**Lesson View:**
- [ ] Contenuto si carica
- [ ] Video/immagini embeddati funzionano
- [ ] Quiz appare alla fine
- [ ] Feedback corretto/sbagliato funziona
- [ ] XP gain animation appare
- [ ] Completion salva su database

---

### 5. Trading Simulator

**Setup:**
- [ ] Simulator si carica con dati iniziali
- [ ] BTC price chart appare
- [ ] Balance iniziale corretto

**Trading Actions:**
- [ ] Sell Put funziona
- [ ] Buy Call funziona
- [ ] Roll position funziona
- [ ] Close position funziona
- [ ] P&L calcola correttamente

**Completion:**
- [ ] Finish simulation salva risultati
- [ ] XP reward corretto
- [ ] Stats aggiornate
- [ ] Redirect a dashboard

---

### 6. Leaderboard

- [ ] Global leaderboard carica
- [ ] Ranking corretto per XP
- [ ] User position highlighted
- [ ] Weekly tab funziona (se implementato)
- [ ] Refresh aggiorna dati
- [ ] Loading state durante fetch

---

### 7. Badge System

- [ ] Badge showcase visualizza badge
- [ ] Badge locked/unlocked differenziati
- [ ] Badge unlock animation appare
- [ ] Toast notification su nuovo badge
- [ ] Progress verso prossimo badge visibile

---

### 8. Settings

- [ ] User info mostra dati corretti
- [ ] Edit profile funziona (se implementato)
- [ ] Logout button funziona
- [ ] Preferenze salvano (dark mode, etc)
- [ ] Delete account (se implementato)

---

## 📱 Mobile Testing

### iOS Testing

**Safari:**
- [ ] App carica correttamente
- [ ] Design responsive
- [ ] Touch gestures funzionano
- [ ] No horizontal scroll
- [ ] Safe area (notch) rispettata
- [ ] Add to Home Screen funziona
- [ ] Fullscreen mode OK
- [ ] Splash screen appare

**Installed PWA:**
- [ ] Icona corretta
- [ ] Nome corretto sotto icona
- [ ] App apre in fullscreen
- [ ] Navigazione funziona
- [ ] Keyboard non copre input
- [ ] Status bar styling OK

### Android Testing

**Chrome:**
- [ ] App carica correttamente
- [ ] Install banner appare
- [ ] Installazione funziona
- [ ] App nel drawer
- [ ] Notifiche funzionano (se implementate)

---

## 🌐 Browser Compatibility

### Desktop

**Chrome/Edge:**
- [ ] Layout corretto
- [ ] Animazioni smooth
- [ ] Performance buona (60fps)

**Firefox:**
- [ ] Layout corretto
- [ ] Features funzionano
- [ ] No console errors

**Safari:**
- [ ] Layout corretto
- [ ] WebKit prefixes OK
- [ ] Features funzionano

### Mobile

**iOS Safari:** (vedi sopra)

**Chrome Android:**
- [ ] Touch interactions
- [ ] Performance OK
- [ ] PWA install

**Samsung Internet:**
- [ ] Features funzionano
- [ ] Layout corretto

---

## ⚡ Performance Testing

### Lighthouse Audit

```bash
# Run full audit
lighthouse https://your-app.com --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
# PWA: 100
```

### Core Web Vitals

**Test con:** https://pagespeed.web.dev/

**Targets:**
- LCP (Largest Contentful Paint): < 2.5s ✅
- FID (First Input Delay): < 100ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

### Performance Tips

Se scores sono bassi:

1. **Ottimizza immagini:**
   ```bash
   # Convert a WebP
   cwebp image.png -o image.webp
   ```

2. **Code splitting:**
   ```typescript
   const HeavyComponent = lazy(() => import('./Heavy'));
   ```

3. **Preload critical resources:**
   ```html
   <link rel="preload" href="/critical.css" as="style">
   ```

---

## 🔌 Offline Testing

### Test Sequence

1. **Initial Load:**
   - [ ] Apri app con connessione
   - [ ] Usa normalmente (login, naviga)
   - [ ] Service Worker registrato

2. **Go Offline:**
   - [ ] Chrome DevTools → Network → Offline
   - [ ] O modalità aereo su mobile
   
3. **Test Offline:**
   - [ ] Ricarica pagina → App carica
   - [ ] Naviga tra pagine
   - [ ] Dati cached accessibili
   - [ ] Progressi salvano in localStorage
   - [ ] UI mostra "Offline mode"

4. **Go Online:**
   - [ ] Ritorna online
   - [ ] App rileva connessione
   - [ ] Sync automatico a Supabase
   - [ ] Progressi aggiornati
   - [ ] UI aggiornata

---

## 🔐 Security Testing

### Basic Security Checks

**Client-side:**
- [ ] No API keys nel client code
- [ ] HTTPS attivo (Vercel auto)
- [ ] No sensitive data in localStorage
- [ ] XSS protection (React auto)

**Supabase:**
- [ ] RLS attivo su tutte le tabelle
- [ ] Policies limitano accesso correttamente
- [ ] Service Role Key mai nel client
- [ ] Anon Key used (è OK pubblicamente)

### Test RLS

```sql
-- Test come utente specifico
SET request.jwt.claim.sub = 'user-id-here';

-- Prova query
SELECT * FROM user_progress;
-- Dovrebbe ritornare solo dati di quell'utente

-- Prova insert dati di altro utente
INSERT INTO user_progress (user_id, xp) 
VALUES ('other-user-id', 1000);
-- Dovrebbe fallire
```

---

## 🐛 Bug Reporting

### Template Issue

Quando trovi un bug, riporta:

```markdown
**Descrizione:**
[Cosa è successo]

**Expected:**
[Cosa doveva succedere]

**Steps to Reproduce:**
1. Vai su...
2. Click...
3. Vedi errore

**Environment:**
- Device: iPhone 14 Pro / Desktop
- OS: iOS 17 / Windows 11
- Browser: Safari 17 / Chrome 120
- App Version: 1.0.0

**Screenshots:**
[Se possibile]

**Console Errors:**
```
[Errori dalla console]
```
```

---

## 📊 Test Results Template

### Test Report

```markdown
# Test Run - [Date]

**Tester:** [Nome]
**Build:** [v1.0.0]
**Environment:** [Production/Staging]

## Summary
- Total Tests: 50
- Passed: 48 ✅
- Failed: 2 ❌
- Blocked: 0 ⏸️

## Failed Tests

### 1. Badge unlock animation
**Status:** ❌ Failed
**Severity:** Medium
**Details:** Animation non appare su iOS Safari
**Steps:** ...
**Expected:** ...
**Actual:** ...

### 2. Leaderboard refresh
**Status:** ❌ Failed  
**Severity:** Low
**Details:** ...

## Notes
...
```

---

## 🎯 Acceptance Criteria

App pronta per production quando:

- ✅ Tutti i test critici passano
- ✅ Performance scores > 85
- ✅ PWA installabile su iOS e Android
- ✅ Offline mode funziona
- ✅ No console errors critici
- ✅ Auth flow completo
- ✅ Database sync funziona
- ✅ Mobile UX ottimale

---

## 📚 Risorse

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Cypress E2E Testing](https://www.cypress.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supabase Testing](https://supabase.com/docs/guides/getting-started/local-development)

---

<div align="center">

**Testing Guide Completo!** 🧪

[⬆ Back to top](#-testing-guide)

</div>
