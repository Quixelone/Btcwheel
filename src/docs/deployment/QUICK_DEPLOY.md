# ⚡ Deploy Rapido - 5 Minuti

Hai fretta? Segui questi comandi per un deploy veloce!

---

## 🚀 Opzione 1: Vercel (Consigliato)

### Step 1: Push su GitHub

```bash
# Init git (se non già fatto)
git init
git add .
git commit -m "feat: Initial release"

# Crea repo su GitHub poi:
git remote add origin https://github.com/YOUR_USERNAME/btc-wheel-academy.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy su Vercel

1. Vai su https://vercel.com/new
2. Import repository `btc-wheel-academy`
3. Aggiungi Environment Variables:
   - `VITE_SUPABASE_URL` = `https://rsmvjsokqolxgczclqjv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (vedi docs)
4. Click "Deploy"

**Fatto!** ✅

### Step 3: Configura Supabase Redirect

https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/auth/url-configuration

Aggiungi il tuo URL Vercel ai "Redirect URLs" → Save

---

## 🌐 Opzione 2: Netlify

### Step 1: Push su GitHub
(Vedi sopra)

### Step 2: Deploy su Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Init e deploy
netlify init
netlify deploy --prod
```

Oppure usa Netlify UI:
1. https://app.netlify.com/start
2. Import from GitHub
3. Aggiungi env vars
4. Deploy

---

## 📝 Environment Variables Necessarie

```env
VITE_SUPABASE_URL=https://rsmvjsokqolxgczclqjv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo
```

---

## 🔍 Verifica Rapida

Dopo il deploy:

```bash
# Apri l'URL live nel browser
# Verifica:
✓ Landing page carica
✓ Click "Inizia Gratis" → Login screen
✓ Nessun errore in console (F12)
```

---

## ❌ Problemi Comuni

**Build fails?**
```bash
npm run build  # Testa in locale
```

**Auth non funziona?**
→ Aggiungi URL ai Supabase Redirect URLs

**Variabili d'ambiente non funzionano?**
→ Assicurati inizino con `VITE_`

---

## 📖 Guide Dettagliate

Per step-by-step completo: **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**

Per checklist completa: **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)**

---

**Fatto!** 🎉 App live in 5 minuti!
