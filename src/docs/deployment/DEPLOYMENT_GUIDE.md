# 🚀 Guida Deployment Completa

**Tempo stimato:** 10-15 minuti  
**Difficoltà:** ⭐⭐☆☆☆  
**Prerequisiti:** Account GitHub (gratuito)

---

## 📋 Indice

1. [Verifica Prerequisiti](#1-verifica-prerequisiti)
2. [Setup Repository GitHub](#2-setup-repository-github)
3. [Deploy su Vercel](#3-deploy-su-vercel)
4. [Configurazione Supabase](#4-configurazione-supabase)
5. [Test Finale](#5-test-finale)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Verifica Prerequisiti

### ✅ Checklist Pre-Deploy

- [ ] Node.js >= 18.0.0 installato
- [ ] Account GitHub attivo
- [ ] Account Vercel (puoi crearlo gratis con GitHub)
- [ ] Progetto Supabase attivo con credenziali

### 🔍 Verifica Struttura Repository

Il repository deve contenere:
- ✅ `package.json` con script di build
- ✅ `vite.config.ts` configurato
- ✅ `vercel.json` per routing
- ✅ `LICENSE` file
- ✅ `.github/workflows/` per CI/CD

**Status:** ✅ Tutti i file presenti e verificati!

---

## 2. Setup Repository GitHub

### Step 2.1: Inizializza Git

Apri il terminale nella cartella del progetto:

```bash
# Inizializza repository (se non già fatto)
git init

# Aggiungi tutti i file
git add .

# Verifica i file staged
git status

# Primo commit
git commit -m "feat: Initial release - BTC Wheel Academy v1.0.0

- Educational platform for Bitcoin Wheel Strategy
- Gamification system with XP, badges, streak tracking
- Paper trading simulator with live charts
- AI-powered onboarding with GPT-4o-mini
- PWA installable on iOS/Android
- Supabase backend with auth & cloud sync
- 85% functional, ready for production"
```

✅ **Completato!** Repository locale pronto.

---

### Step 2.2: Crea Repository GitHub

1. **Vai su GitHub:**  
   https://github.com/new

2. **Configura repository:**
   - **Repository name:** `btc-wheel-academy` (o nome a tua scelta)
   - **Description:** `Educational app for Bitcoin Wheel Strategy with gamification and AI tutoring`
   - **Visibility:** Private (consigliato) o Public
   
3. **⚠️ IMPORTANTE - NON spuntare:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   
   *Questi file esistono già nel progetto!*

4. **Click:** "Create repository"

✅ **Completato!** Repository GitHub creato.

---

### Step 2.3: Push del Codice

GitHub ti mostrerà i comandi. Eseguili sostituendo `YOUR_USERNAME` con il tuo username:

```bash
# Connetti repository locale a GitHub
git remote add origin https://github.com/YOUR_USERNAME/btc-wheel-academy.git

# Assicurati di essere sul branch main
git branch -M main

# Push del codice
git push -u origin main
```

**Attendi 10-30 secondi per il caricamento...**

✅ **Completato!** Codice su GitHub! 🎉

**Verifica:** Ricarica la pagina GitHub → dovresti vedere tutti i file.

---

## 3. Deploy su Vercel

Vercel è la piattaforma consigliata per il deploy (gratuita per progetti hobby).

### Step 3.1: Accedi a Vercel

1. Vai su: https://vercel.com/new
2. Se non hai un account, fai "Sign up with GitHub" (gratuito)
3. Autorizza Vercel ad accedere a GitHub

✅ **Completato!** Account Vercel attivo.

---

### Step 3.2: Importa Repository

1. Nella sezione **"Import Git Repository"**, cerca `btc-wheel-academy`
2. Click **"Import"** accanto al repository

Vercel rileverà automaticamente:
- ✅ Framework: **Vite**
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

**Non modificare nulla qui - è tutto corretto!** ✨

---

### Step 3.3: Configura Environment Variables

**Questo è l'unico step manuale importante!**

Click su **"Environment Variables"** per espandere.

#### Aggiungi le seguenti variabili:

**1. VITE_SUPABASE_URL**

```
Name: VITE_SUPABASE_URL
Value: https://rsmvjsokqolxgczclqjv.supabase.co
```

Click "Add" ✅

**2. VITE_SUPABASE_ANON_KEY**

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo
```

Click "Add" ✅

> **Nota:** Queste sono le credenziali del progetto Supabase configurato. Se usi un progetto diverso, sostituisci con le tue credenziali.

---

### Step 3.4: Deploy!

Click il grande pulsante blu **"Deploy"**

**Processo di build (2-4 minuti):**
1. ⏳ Cloning repository...
2. ⏳ Installing dependencies... (1-2 min)
3. ⏳ Building... (TypeScript + Vite)
4. ⏳ Deploying...
5. ✅ **Success!**

Vedrai una schermata di conferma con il tuo URL live!

---

### Step 3.5: Verifica Deploy

Vercel ti darà un URL tipo:
```
https://btc-wheel-academy-abc123xyz.vercel.app
```

**Click sul link** e verifica:
- ☐ Landing page si carica correttamente
- ☐ Design blu/arancione appare
- ☐ Nessun errore in console (F12 → Console)
- ☐ Pulsanti "Inizia Gratis" e "Login" funzionano

✅ **Completato!** App live! 🚀

---

## 4. Configurazione Supabase

### Step 4.1: Configura Authentication Redirects

**Questo step è essenziale per far funzionare login/signup!**

1. Vai su Supabase Auth Settings:  
   https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/auth/url-configuration

2. Nella sezione **"Redirect URLs"**, aggiungi:

```
https://your-app.vercel.app
https://your-app.vercel.app/auth/callback
```

**⚠️ Sostituisci `your-app.vercel.app` con il TUO URL Vercel!**

3. Click **"Save"**

✅ **Completato!** Auth redirect configurati.

---

### Step 4.2: Verifica Database (Opzionale)

Se hai già configurato il database Supabase, salta questo step.

Altrimenti, consulta la [Guida Setup Supabase](../setup/SUPABASE_SETUP.md).

---

## 5. Test Finale

### Test Authentication

1. Apri l'app live
2. Click "Inizia Gratis" o "Login"
3. Prova a creare un account:
   - Email: `test@example.com`
   - Password: `TestPass123!`
4. Verifica che:
   - ☐ Signup funziona
   - ☐ Login funziona
   - ☐ Vieni reindirizzato all'app
   - ☐ Vedi il tuo profilo/XP

✅ **Completato!** Authentication funzionante.

---

### Test Features

Naviga nell'app e verifica:

- ☐ **Dashboard** → Mostra XP, livello, streak
- ☐ **Lezioni** → Click su "Lezione 9" → carica correttamente
- ☐ **Quiz** → Completa un quiz → vedi feedback + XP gain
- ☐ **Simulatore** → Apri trading simulator → grafici caricano
- ☐ **Leaderboard** → Mostra classifica
- ☐ **Settings** → Puoi fare logout

Se tutto funziona → **PERFETTO!** 🎉

---

## 6. Troubleshooting

### Problema: Build fallisce su Vercel

**Causa comune:** Errori TypeScript

**Soluzione:**
```bash
# In locale, verifica errori TypeScript
npm run type-check

# Se ci sono errori, fixali e ri-pusha
git add .
git commit -m "fix: TypeScript errors"
git push
```

Vercel farà auto-redeploy.

---

### Problema: App carica ma login non funziona

**Causa:** Redirect URLs non configurati

**Soluzione:**
1. Vai su Supabase Auth Settings
2. Aggiungi il tuo URL Vercel ai Redirect URLs
3. Salva e riprova

---

### Problema: "Cannot find module" error

**Causa:** Dipendenze mancanti

**Soluzione:**
```bash
# Pulisci e reinstalla
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Se funziona in locale, ri-pusha
git add .
git commit -m "fix: Update dependencies"
git push
```

---

### Problema: Environment variables non funzionano

**Causa:** Variabili non configurate correttamente

**Soluzione:**
1. Vai su Vercel Dashboard → Project Settings → Environment Variables
2. Verifica che `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` siano presenti
3. **Importante:** I nomi devono iniziare con `VITE_` per essere accessibili nel client
4. Dopo aver modificato, fai un re-deploy:
   - Vercel Dashboard → Deployments → "..." → Redeploy

---

## 🎉 Congratulazioni!

La tua app è live! 🚀

### Next Steps

- 📱 **[Configura PWA](../features/MOBILE_APP_GUIDE.md)** → App installabile su mobile
- 🔐 **[Setup Google OAuth](../setup/GOOGLE_OAUTH_SETUP.md)** → Login con Google
- 📊 **[Analytics Setup](../setup/ANALYTICS.md)** → Traccia utilizzo app
- 🎨 **[Custom Domain](./CUSTOM_DOMAIN.md)** → Usa il tuo dominio

---

## 📞 Supporto

- 📖 [Torna all'indice documentazione](../README.md)
- 🐛 [Report un bug](https://github.com/yourusername/btc-wheel-academy/issues)
- 💬 [Fai una domanda](https://github.com/yourusername/btc-wheel-academy/discussions)

---

<div align="center">

**Made with ❤️ for Bitcoin traders**

[⬆ Back to top](#-guida-deployment-completa)

</div>
