# 🚀 Guida Deployment Vercel - btcwheel

## 📋 Overview

Questa guida ti spiega come deployare l'app **btcwheel** su Vercel e collegare il tuo dominio personalizzato.

---

## ⚠️ Importante da Sapere

**Figma Make non supporta deployment automatico su Vercel.** Dovrai:

1. ✅ Esportare il codice da Figma Make
2. ✅ Caricare su GitHub
3. ✅ Collegare Vercel a GitHub
4. ✅ Configurare dominio personalizzato

---

## 📦 Step 1: Esporta il Codice

### Da Figma Make

1. Clicca sul pulsante **"Export"** o **"Download"** in Figma Make
2. Scarica tutto il progetto come file ZIP
3. Estrai il contenuto in una cartella locale

**Struttura prevista:**
```
btcwheel/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── utils/
├── public/
├── package.json
├── vite.config.ts
├── index.html
└── tsconfig.json
```

---

## 🔧 Step 2: Setup Repository GitHub

### 2.1 Crea Repository

1. Vai su https://github.com
2. Clicca **"New repository"**
3. Nome: `btcwheel` (o quello che preferisci)
4. Scegli: **Private** (per non esporre il codice)
5. **NON** inizializzare con README
6. Clicca **"Create repository"**

### 2.2 Push del Codice

Apri il terminale nella cartella del progetto:

```bash
# Inizializza git
git init

# Aggiungi tutti i file
git add .

# Commit iniziale
git commit -m "Initial commit - btcwheel app"

# Collega al repository remoto
git remote add origin https://github.com/TUO-USERNAME/btcwheel.git

# Push
git branch -M main
git push -u origin main
```

**⚠️ Sostituisci `TUO-USERNAME` con il tuo username GitHub!**

---

## 🚀 Step 3: Deploy su Vercel

### 3.1 Crea Account Vercel

1. Vai su https://vercel.com
2. Clicca **"Sign Up"**
3. Scegli **"Continue with GitHub"**
4. Autorizza Vercel ad accedere ai tuoi repository

### 3.2 Importa il Progetto

1. Dalla dashboard Vercel, clicca **"Add New..."** → **"Project"**

2. Trova il repository `btcwheel` e clicca **"Import"**

3. **Configure Project:**

   **Framework Preset:** Vite
   
   **Root Directory:** ./
   
   **Build Command:**
   ```bash
   npm run build
   ```
   
   **Output Directory:**
   ```bash
   dist
   ```
   
   **Install Command:**
   ```bash
   npm install
   ```

4. **Environment Variables** (IMPORTANTE!)

   Clicca su **"Environment Variables"** e aggiungi:

   ```
   Nome: VITE_SUPABASE_URL
   Valore: https://rsmvjsokqolxgczclqjv.supabase.co
   ```

   ```
   Nome: VITE_SUPABASE_ANON_KEY
   Valore: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo
   ```

   ⚠️ **Nota:** Queste variabili sono già configurate nell'app tramite `/utils/supabase/info.tsx`, ma averle come env vars è best practice per production.

5. Clicca **"Deploy"**

6. Attendi 1-3 minuti per il build

7. ✅ **Deployment completato!**

   Vedrai un URL tipo: `https://btcwheel-xyz123.vercel.app`

---

## 🌐 Step 4: Configura Dominio Personalizzato

### 4.1 Aggiungi Dominio su Vercel

1. Vai al tuo progetto su Vercel

2. Clicca su **"Settings"** → **"Domains"**

3. Inserisci il tuo dominio (es. `btcwheel.com`)

4. Clicca **"Add"**

5. Vercel ti mostrerà i **DNS records** da configurare:

   **Per dominio root (btcwheel.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **Per www (www.btcwheel.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 4.2 Configura DNS

**Se il dominio è su:**

#### GoDaddy
1. Vai su https://dcc.godaddy.com/manage/
2. Clicca sul tuo dominio
3. **DNS** → **Manage**
4. Aggiungi i record A e CNAME
5. Salva

#### Namecheap
1. Vai su https://ap.www.namecheap.com/domains/list/
2. Clicca **"Manage"** sul dominio
3. **Advanced DNS**
4. Aggiungi i record
5. Salva

#### Cloudflare
1. Vai su https://dash.cloudflare.com
2. Seleziona il dominio
3. **DNS** → **Records**
4. Aggiungi i record
5. **⚠️ Importante:** Disabilita il "Proxy" (icona arancione) o mettilo in "DNS only" (grigio)
6. Salva

#### Altri Provider
Cerca "DNS settings" nel pannello di controllo del tuo provider e aggiungi i record forniti da Vercel.

### 4.3 Verifica Dominio

1. Torna su Vercel
2. Aspetta 5-10 minuti (propagazione DNS)
3. Clicca **"Refresh"** su Vercel
4. Quando vedi ✅ verde accanto al dominio = **TUTTO OK!**

---

## 🔒 Step 5: Configura HTTPS & SSL

**Vercel configura automaticamente SSL!** Non devi fare nulla.

Dopo la verifica del dominio, Vercel:
- ✅ Genera certificato SSL gratuito (Let's Encrypt)
- ✅ Abilita HTTPS automaticamente
- ✅ Redirect HTTP → HTTPS

Aspetta 5-10 minuti e il tuo sito sarà accessibile su:
- `https://btcwheel.com` 🔒
- `https://www.btcwheel.com` 🔒

---

## ⚙️ Step 6: Configurazioni Avanzate

### 6.1 Environment Variables per OpenAI (Opzionale)

Se usi l'AI onboarding, aggiungi su Vercel:

```
OPENAI_API_KEY=sk-proj-xxx...
```

**Come:**
1. **Settings** → **Environment Variables**
2. Aggiungi la chiave
3. Seleziona **Production**, **Preview**, **Development**
4. Salva
5. Rideploy: **Deployments** → **...** → **Redeploy**

### 6.2 Rewrite Rules (PWA)

Crea `/vercel.json` nella root del progetto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

**Commit e push:**
```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

Vercel farà automaticamente il redeploy.

### 6.3 Build Settings Ottimizzati

Nel file `vite.config.ts`, verifica che ci sia:

```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['lucide-react'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### 6.4 Analytics (Opzionale)

Abilita Vercel Analytics:

1. Vai su **Analytics** nel progetto
2. Clicca **"Enable"**
3. Gratis per 100k pageviews/mese

Installa il package:
```bash
npm install @vercel/analytics
```

Aggiungi in `/App.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <AppContent />
      <Analytics />
    </>
  );
}
```

---

## 🔄 Step 7: Workflow di Aggiornamento

Ogni volta che vuoi aggiornare l'app:

### Da Figma Make

1. Esporta il nuovo codice
2. Sovrascrivi i file locali
3. Commit e push:

```bash
git add .
git commit -m "Update: [descrizione modifiche]"
git push
```

4. **Vercel farà automaticamente il deploy!** 🎉

Puoi vedere il progresso su: `https://vercel.com/dashboard`

### Rollback Veloce

Se qualcosa va storto:

1. Vai su **Deployments**
2. Trova il deployment precedente
3. Clicca **"..."** → **"Promote to Production"**

---

## 🔐 Step 8: Sicurezza

### 8.1 Proteggi le Chiavi

**⚠️ MAI committare chiavi API nel codice!**

Usa sempre environment variables:

```typescript
// ❌ MALE
const apiKey = 'sk-proj-xxx...';

// ✅ BENE
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
```

### 8.2 Supabase RLS

Abilita Row Level Security su Supabase:

```sql
-- Esempio per user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own data
CREATE POLICY "Users can manage their own progress"
  ON user_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 8.3 CORS Headers

Vercel gestisce automaticamente CORS. Se hai problemi, aggiungi in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

---

## 📊 Step 9: Monitoring

### Vercel Dashboard

Monitora:
- 📈 **Usage:** Bandwidth, build time, function invocations
- 🚀 **Deployments:** Storia di tutti i deploy
- 🐛 **Logs:** Real-time logs
- ⚡ **Speed Insights:** Performance metriche

### Supabase Dashboard

Monitora:
- 📊 **Database:** Query performance
- 👥 **Auth:** Utenti registrati
- 💾 **Storage:** Files usage
- 📡 **API:** Request logs

---

## 🎯 Checklist Finale

Prima di andare live:

- [ ] ✅ Codice su GitHub
- [ ] ✅ Deploy su Vercel funzionante
- [ ] ✅ Dominio configurato e SSL attivo
- [ ] ✅ Environment variables configurate
- [ ] ✅ Supabase tabelle create
- [ ] ✅ Test autenticazione (signup/login)
- [ ] ✅ Test su mobile (responsive)
- [ ] ✅ PWA installabile
- [ ] ✅ Service Worker funzionante
- [ ] ✅ AI onboarding testato
- [ ] ✅ Simulatore trading funzionante
- [ ] ✅ Leaderboard visibile

---

## 🆘 Troubleshooting

### Build Fallisce

**Errore:** `Command "npm run build" exited with 1`

**Soluzione:**
1. Verifica `package.json` abbia `"build": "vite build"`
2. Controlla errori TypeScript localmente: `npm run build`
3. Verifica tutte le dipendenze: `npm install`

### Dominio Non Funziona

**Problema:** 404 o "Domain not found"

**Soluzione:**
1. Verifica DNS records su provider
2. Aspetta 24h per propagazione DNS completa
3. Usa https://dnschecker.org per verificare propagazione
4. Prova in incognito (cache browser)

### Supabase Errors

**Errore:** "Failed to fetch" o CORS errors

**Soluzione:**
1. Verifica URL Supabase corretto
2. Controlla ANON KEY valida
3. Controlla Supabase dashboard → Settings → API
4. Verifica RLS policies non bloccano richieste

### PWA Non Installabile

**Problema:** "Add to Home Screen" non appare

**Soluzione:**
1. Verifica `manifest.json` valido
2. Controlla HTTPS attivo (obbligatorio per PWA)
3. Apri DevTools → Application → Manifest
4. Verifica Service Worker registrato

---

## 📚 Risorse Utili

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **Supabase Docs:** https://supabase.com/docs
- **PWA Guide:** https://web.dev/progressive-web-apps/

---

## 🎉 Congratulazioni!

Se hai seguito tutti gli step, la tua app **btcwheel** è ora:

- 🌐 **Online** sul tuo dominio
- 🔒 **Sicura** con HTTPS
- ⚡ **Veloce** con Vercel CDN
- 📱 **Installabile** come PWA
- ☁️ **Cloud-powered** con Supabase
- 🤖 **AI-enhanced** con GPT-4o-mini

**Il tuo link:** `https://tuo-dominio.com` 🚀

---

## 💡 Pro Tips

1. **Preview Deployments:** Ogni branch su GitHub genera un URL di preview automatico
2. **Analytics:** Abilita Vercel Analytics per tracciare utenti
3. **Speed Insights:** Ottimizza performance con le metriche di Vercel
4. **Automatic HTTPS:** Vercel rinnova certificati SSL automaticamente
5. **Global CDN:** I tuoi utenti caricano l'app dal server più vicino
6. **Instant Rollback:** Puoi tornare a una versione precedente in 1 click

---

**Buon deploy! 🚀**

Hai domande? Chiedi pure! 😊
