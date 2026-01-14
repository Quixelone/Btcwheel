# 📱 Mobile App & PWA Guide

L'app è una Progressive Web App (PWA) completa, installabile su iOS e Android.

---

## ✨ Features PWA

### Installabile
- ✅ Icona sulla home screen
- ✅ Splash screen custom
- ✅ Fullscreen (nasconde browser UI)
- ✅ Comportamento come app nativa

### Offline First
- ✅ Funziona senza connessione
- ✅ Service Worker per caching
- ✅ Local Storage fallback
- ✅ Sync automatico quando online

### Mobile Optimized
- ✅ Design responsive
- ✅ Touch gestures
- ✅ Haptic feedback
- ✅ Safe area support (notch iPhone)

---

## 📲 Installazione

### iOS (Safari)

1. Apri l'app in Safari
2. Tocca pulsante **Condividi** (quadrato con freccia)
3. Scorri e tocca **"Aggiungi a Home"**
4. Personalizza nome (opzionale)
5. Tocca **"Aggiungi"**

✅ L'icona apparirà sulla home screen!

### Android (Chrome)

1. Apri l'app in Chrome
2. Vedrai un banner: **"Installa l'App"**
3. Tocca **"Installa"**
4. Conferma

✅ L'app apparirà nel drawer!

**Alternativa (se banner non appare):**
1. Menu (⋮) → "Aggiungi a Home"
2. Conferma

---

## 🎨 Configurazione PWA

### Manifest.json

Il file `/public/manifest.json` definisce:

```json
{
  "name": "Bitcoin Wheel Strategy",
  "short_name": "BTC Wheel",
  "description": "Impara la Bitcoin Wheel Strategy",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Service Worker

Il Service Worker (`/public/service-worker.js`) gestisce:
- ✅ Caching delle risorse statiche
- ✅ Strategia cache-first per performance
- ✅ Aggiornamenti automatici
- ✅ Offline fallback

---

## 🔧 Setup Icone

### Generare Icone PWA

Le icone sono già generate, ma se vuoi personalizzarle:

**Tool consigliato:** https://www.pwabuilder.com/imageGenerator

1. Carica logo quadrato (min 512x512px)
2. Genera tutte le dimensioni
3. Scarica package
4. Sostituisci in `/public/icons/`

**Dimensioni necessarie:**
- 72x72, 96x96, 128x128, 144x144
- 192x192 (richiesto)
- 384x384, 512x512 (richiesto)

### Splash Screens iOS

Per splash screen ottimizzati per ogni device iOS:

```bash
npx pwa-asset-generator logo.png ./public/splash --splash-only
```

Aggiungi i link in `index.html`:
```html
<link rel="apple-touch-startup-image" 
      href="/splash/apple-splash-2048-2732.png"
      media="(device-width: 1024px) and (device-height: 1366px)">
```

---

## 📊 Testing PWA

### Lighthouse Audit

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://your-app.vercel.app --view

# Obiettivo: Score PWA 100/100
```

### Checklist PWA

- [ ] Manifest.json accessibile
- [ ] Service Worker registrato
- [ ] HTTPS attivo (auto con Vercel)
- [ ] Icone 192x192 e 512x512 presenti
- [ ] `theme-color` meta tag presente
- [ ] `viewport` meta tag presente
- [ ] App installabile su mobile
- [ ] Funziona offline

---

## 🎯 Mobile Optimizations

### Gestures

L'app include gesture native:

```typescript
// Swipe per navigare
<MobileGestures />

// Features:
- Swipe left/right per navigare lezioni
- Pull-to-refresh (coming soon)
- Long press per azioni rapide
```

### Haptic Feedback

```typescript
// Feedback tattile su azioni importanti
useHaptics()

// Trigger automaticamente su:
- Guadagno XP
- Badge unlock
- Quiz completato
- Errori
```

### Safe Area

```css
/* Supporto notch iPhone */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 🔄 Offline Support

### Come Funziona

1. **Prima visita:** Risorse cached dal Service Worker
2. **Offline:** App carica da cache
3. **Dati:** Salvati in localStorage
4. **Online again:** Sync automatico a Supabase

### Test Offline Mode

**Desktop:**
1. Apri DevTools (F12)
2. Network tab → Throttling → "Offline"
3. Ricarica pagina
4. ✅ App dovrebbe funzionare!

**Mobile:**
1. Installa app
2. Usa normalmente
3. Attiva modalità aereo
4. Riapri app
5. ✅ Dovrebbe funzionare!
6. Disattiva aereo
7. ✅ Progressi si sincronizzano

---

## 🐛 Troubleshooting

### App non si installa

**Causa:** Requisiti PWA non soddisfatti

**Fix:**
1. Verifica HTTPS attivo
2. Controlla manifest.json accessibile: `https://your-app.com/manifest.json`
3. Verifica Service Worker registrato (DevTools → Application)
4. Icone 192x192 e 512x512 presenti

### Service Worker non si aggiorna

**Causa:** Vecchia versione cached

**Fix:**
```javascript
// Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

O manualmente:
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Ricarica pagina

### Splash screen non appare (iOS)

**Causa:** Meta tags mancanti

**Fix:** Aggiungi in `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

---

## 📈 Performance Tips

### Ottimizzare Performance Mobile

**1. Code Splitting**
```typescript
// Lazy load componenti pesanti
const SimulationView = lazy(() => import('./SimulationView'));
```

**2. Image Optimization**
```typescript
// Use WebP con fallback
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="...">
</picture>
```

**3. Preload Critical Resources**
```html
<link rel="preload" href="/fonts/main.woff2" as="font">
```

**4. Minimize JavaScript**
- Rimuovi console.logs in production
- Tree-shaking automatico con Vite
- Comprimi bundle con gzip/brotli (auto con Vercel)

---

## 🎯 Target Performance Metrics

**Lighthouse Goals:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- **PWA: 100** ✅

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## 📚 Risorse

- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [iOS PWA Support](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

<div align="center">

**Mobile & PWA Setup Completo!** 📱

[⬆ Back to top](#-mobile-app--pwa-guide)

</div>
