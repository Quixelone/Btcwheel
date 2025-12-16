# 🔐 Environment Variables Guide

Guida completa alle variabili d'ambiente necessarie per l'app.

---

## 📋 Variabili Richieste

### Frontend (Vite)

Le variabili con prefisso `VITE_` sono accessibili nel client.

```env
# Supabase Connection
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Dove trovarle:**
1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Settings → API
4. Copia "Project URL" e "anon/public key"

---

### Backend (Supabase Edge Functions)

Queste variabili sono configurate in Supabase, NON nel client.

```env
# OpenAI API (Optional)
OPENAI_API_KEY=sk-proj-...

# Supabase (Auto-configured)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...
```

**Setup in Supabase:**
1. Dashboard → Edge Functions → Secrets
2. Aggiungi `OPENAI_API_KEY` se usi AI features
3. Le altre variabili sono auto-configurate

---

## 🔧 Setup Locale

### Step 1: Crea .env.local

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local  # or your preferred editor
```

### Step 2: Compila i Valori

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test

```bash
npm run dev
```

L'app dovrebbe connettersi a Supabase senza errori.

---

## ☁️ Setup Production (Vercel)

### Vercel Dashboard

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto
3. Settings → Environment Variables

### Aggiungi Variabili

**Variable 1:**
```
Name: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development
```

**Variable 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

### Deploy

Dopo aver aggiunto le variabili, fai redeploy:

```bash
# Automatic (se hai push su GitHub)
git push origin main

# O manualmente da Vercel Dashboard
# Deployments → ... → Redeploy
```

---

## 🔐 Sicurezza

### ✅ Sicuro da Esporre

**VITE_SUPABASE_URL:**
- ✅ Pubblico
- URL del progetto Supabase

**VITE_SUPABASE_ANON_KEY:**
- ✅ Pubblico (protetto da RLS)
- Chiave "anonymous" per client-side

### ⚠️ NEVER Esporre

**SUPABASE_SERVICE_ROLE_KEY:**
- ❌ MAI nel client
- ❌ MAI in repository
- ✅ Solo in Edge Functions
- Ha accesso completo al database (bypassa RLS)

**OPENAI_API_KEY:**
- ❌ MAI nel client
- ✅ Solo in Edge Functions
- Prevent key leakage e rate limit abuse

---

## 🧪 Testing

### Verifica Connessione

```bash
# Start dev server
npm run dev

# Console dovrebbe mostrare:
# ✅ Supabase client initialized
# ✅ Connected to: https://your-project-id.supabase.co
```

### Test Variabili

```typescript
// In un componente React
import { projectId, publicAnonKey } from './utils/supabase/info';

console.log('Project ID:', projectId);
console.log('Anon Key exists:', !!publicAnonKey);
```

Dovresti vedere i valori corretti nella console.

---

## 🐛 Troubleshooting

### Errore: "Supabase client not initialized"

**Causa:** Variabili mancanti o errate

**Fix:**
```bash
# Verifica .env.local esiste
ls -la .env.local

# Verifica contenuto
cat .env.local

# Restart dev server
npm run dev
```

### Errore: "Invalid API key"

**Causa:** ANON_KEY sbagliata

**Fix:**
1. Vai su Supabase Dashboard → Settings → API
2. Copia di nuovo la "anon key"
3. Sostituisci in `.env.local`
4. Restart server

### Errore: "CORS policy" in production

**Causa:** URL non configurata in Supabase

**Fix:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Aggiungi il tuo URL Vercel a "Site URL"
3. Aggiungi a "Redirect URLs":
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/auth/callback
   ```

### Variabili non si aggiornano in Vercel

**Causa:** Deploy precedente usa vecchie variabili

**Fix:**
1. Modifica variabile in Vercel Settings
2. Fai redeploy manuale:
   - Deployments → Latest → ... → Redeploy
3. Seleziona "Use existing Build Cache" = OFF

---

## 📚 Environment per Ambiente

### Development (Local)

```env
# .env.local
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

### Preview (Vercel Preview Deployments)

Stesse variabili di production, ma puoi usare progetto Supabase separato per testing.

### Production (Vercel)

```env
# Vercel Environment Variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 🔄 Best Practices

### Do's ✅

- ✅ Usa `.env.local` per development (non committare!)
- ✅ Usa `.env.example` come template (committare!)
- ✅ Prefix `VITE_` per variabili client-side
- ✅ Documenta ogni variabile
- ✅ Usa Vercel/Netlify env vars per production
- ✅ Rotate keys regolarmente

### Don'ts ❌

- ❌ MAI committare `.env` o `.env.local`
- ❌ MAI hardcode API keys nel codice
- ❌ MAI esporre SERVICE_ROLE_KEY nel client
- ❌ MAI usare `console.log()` con sensitive data
- ❌ MAI condividere keys pubblicamente

---

## 📖 Risorse

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [12-Factor App Config](https://12factor.net/config)

---

<div align="center">

**Environment Variables Setup Completo!** 🔐

[⬆ Back to top](#-environment-variables-guide)

</div>
