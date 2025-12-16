# 🚀 Getting Started - btcwheel

Benvenuto! Questa guida ti aiuterà a iniziare con btcwheel in base al tuo obiettivo.

---

## 🎯 Scegli Il Tuo Percorso

### 👨‍💻 Voglio Solo Provare L'App Localmente

**Tempo:** 5 minuti

1. **Clone & Install**
   ```bash
   git clone https://github.com/tuousername/btcwheel.git
   cd btcwheel
   npm install
   ```

2. **Run**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Vai su `http://localhost:5173`
   - 🎉 L'app funziona in modalità demo (localStorage)!

**⚠️ Note:** In modalità demo, i dati sono salvati solo nel tuo browser. Per sync cloud, configura Supabase (vedi sotto).

---

### 🗄️ Voglio Database e Auth Cloud (Supabase)

**Tempo:** 15 minuti

1. **Setup Locale** (vedi sopra ↑)

2. **Configura Supabase**
   - 📘 Segui: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Crea project su Supabase
   - Copia API keys
   - Configura .env

3. **Testa Auth**
   - Registra nuovo utente
   - Login e verifica sync progressi

**Features Abilitate:**
- ✅ Auth con email/password
- ✅ Google OAuth (opzionale)
- ✅ Sync progressi cross-device
- ✅ Leaderboard globale
- ✅ Data persistence cloud

---

### 🚀 Voglio Deployare in Production

**Tempo:** 20 minuti

1. **Setup GitHub**
   - ⚡ Quick: [GITHUB_QUICK_START.md](./GITHUB_QUICK_START.md) (5 min)
   - 📘 Completo: [GITHUB_SETUP.md](./GITHUB_SETUP.md) (dettagliato)

2. **Setup Supabase** (se non fatto)
   - 📘 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

3. **Deploy su Vercel**
   - 📘 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
   - Connect GitHub repo
   - Aggiungi environment variables
   - Deploy!

4. **(Opzionale) Custom Domain**
   - 📘 [docs/deployment/CUSTOM_DOMAIN.md](./docs/deployment/CUSTOM_DOMAIN.md)

**Risultato:**
- ✅ App live su Vercel
- ✅ CI/CD automatico
- ✅ HTTPS e CDN
- ✅ Production-ready!

---

### 👥 Voglio Contribuire al Progetto

**Tempo:** 10 minuti setup

1. **Fork Repository** su GitHub

2. **Clone & Setup**
   ```bash
   git clone https://github.com/tuousername/btcwheel.git
   cd btcwheel
   npm install
   ```

3. **Leggi Guide**
   - 📘 [CONTRIBUTING.md](./CONTRIBUTING.md) - Workflow contribuzione
   - 📘 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architettura
   - 📋 [docs/development/GIT_CHEATSHEET.md](./docs/development/GIT_CHEATSHEET.md) - Git commands

4. **Crea Branch Feature**
   ```bash
   git checkout -b feature/nome-feature
   ```

5. **Develop & Push**
   ```bash
   git add .
   git commit -m "feat: description"
   git push origin feature/nome-feature
   ```

6. **Crea Pull Request** su GitHub

---

### 🎨 Voglio Customizzare Design/Branding

**Risorse:**
- 📘 [docs/branding/LOGO_USAGE_GUIDE.md](./docs/branding/LOGO_USAGE_GUIDE.md) - Logo guidelines
- 📄 `styles/globals.css` - Design tokens e theme
- 🎨 Colors:
  ```css
  --primary: #10b981;      /* Emerald green */
  --secondary: #f97316;    /* Orange */
  ```

**Per Cambiare Theme:**
1. Modifica `/styles/globals.css`
2. Aggiorna `tailwind.config.ts` (se esiste)
3. Test su mobile e desktop

---

### 📱 Voglio Installare Come PWA

**Su Mobile (iOS):**
1. Apri app in Safari
2. Tap Share button
3. Seleziona "Add to Home Screen"
4. ✅ Icon su Home Screen!

**Su Mobile (Android):**
1. Apri app in Chrome
2. Tap menu (⋮)
3. Seleziona "Install app"
4. ✅ App installata!

**Su Desktop:**
1. Apri app in Chrome/Edge
2. Click install icon in address bar
3. ✅ App installata come desktop app!

---

## 📚 Documentazione Completa

### 🏁 Quick Start
- [README.md](./README.md) - Overview e quick start
- [GETTING_STARTED.md](./GETTING_STARTED.md) - Questa guida

### 🔧 Setup & Config
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database e auth
- [GITHUB_QUICK_START.md](./GITHUB_QUICK_START.md) - GitHub in 5 minuti
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub guida completa
- [.env.example](./.env.example) - Environment variables template

### 🚀 Deployment
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Deploy su Vercel
- [docs/deployment/QUICK_DEPLOY.md](./docs/deployment/QUICK_DEPLOY.md) - Quick deploy
- [docs/deployment/CUSTOM_DOMAIN.md](./docs/deployment/CUSTOM_DOMAIN.md) - Domain custom

### 👨‍💻 Development
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Come contribuire
- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architettura completa
- [CHANGELOG.md](./CHANGELOG.md) - Storia versioni
- [docs/development/GIT_CHEATSHEET.md](./docs/development/GIT_CHEATSHEET.md) - Git commands
- [docs/development/OPTIMIZATIONS.md](./docs/development/OPTIMIZATIONS.md) - Performance tips

### ✨ Features
- [docs/features/GAMIFICATION.md](./docs/features/GAMIFICATION.md) - Sistema XP/badge
- [docs/features/MASCOT_ANIMATION_GUIDE.md](./docs/features/MASCOT_ANIMATION_GUIDE.md) - Mascotte AI
- [docs/features/MOBILE_APP_GUIDE.md](./docs/features/MOBILE_APP_GUIDE.md) - PWA mobile

### 🧪 Testing
- [docs/testing/TESTING_GUIDE.md](./docs/testing/TESTING_GUIDE.md) - Testing completo

### 📖 Reference
- [docs/README.md](./docs/README.md) - Indice documentazione completo

---

## 🆘 Troubleshooting

### L'App Non Si Avvia

```bash
# Prova a reinstallare dipendenze
rm -rf node_modules package-lock.json
npm install

# Verifica Node version (18+)
node --version

# Pulisci cache
npm cache clean --force
```

### Errori Auth / Database

**Sintomo:** "Supabase URL is undefined"

**Soluzione:**
1. Verifica file `.env` esista nella root
2. Controlla variabili siano corrette:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. Restart dev server: `npm run dev`

**Nota:** App funziona anche SENZA Supabase (modalità demo)!

### Build Fallisce

```bash
# Check TypeScript errors
npm run type-check

# Fix lint issues
npm run lint

# Clean build
rm -rf dist
npm run build
```

### PWA Non Installabile

**Checklist:**
- [ ] App servita via HTTPS (o localhost)
- [ ] `manifest.json` presente e valido
- [ ] Service Worker registrato correttamente
- [ ] Icons 192x192 e 512x512 presenti

### GitHub Push Rejected

**Errore:** "Authentication failed"

**Soluzione:**
- Usa Personal Access Token, non password
- Vedi: [GITHUB_SETUP.md - Authentication](./GITHUB_SETUP.md#step-4-configurare-autenticazione)

---

## 💡 Tips per Iniziare

### 1. Inizia con Demo Mode
Non serve configurare nulla! L'app funziona subito in modalità demo.

### 2. Setup Supabase Solo Se Serve
Configura database solo se vuoi:
- Sync cross-device
- Multi-user leaderboard
- Persistenza cloud

### 3. Git Workflow Semplificato
```bash
# Ogni giorno
git pull origin develop
git checkout -b feature/qualcosa
# ...lavora...
git push origin feature/qualcosa
# Pull Request su GitHub
```

### 4. Test su Mobile Subito
L'app è mobile-first. Testa sempre su smartphone reale o DevTools mobile view.

### 5. Usa Debug Views
- `?status=supabase` - Status Supabase connection
- `?test=chat` - Test chat AI tutor
- Console browser per log dettagliati

---

## 🎓 Learning Path Raccomandato

### Giorno 1: Familiarizzare
1. ✅ Clone e run locale
2. ✅ Esplora interfaccia utente
3. ✅ Prova onboarding flow
4. ✅ Leggi [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

### Giorno 2: Setup Infrastructure
1. ✅ Setup GitHub (5 min)
2. ✅ Setup Supabase (15 min)
3. ✅ Test auth e sync
4. ✅ Leggi [CONTRIBUTING.md](./CONTRIBUTING.md)

### Giorno 3: Deploy
1. ✅ Deploy su Vercel (10 min)
2. ✅ Test production build
3. ✅ Configura custom domain (opzionale)
4. ✅ Setup monitoring

### Giorno 4+: Develop & Contribute
1. ✅ Leggi feature docs
2. ✅ Esplora codebase
3. ✅ Implementa features
4. ✅ Submit PR

---

## 📞 Supporto

### Debug Tools Built-in
- **Status Dashboard:** Aggiungi `?status=supabase` all'URL
- **Chat Test:** Aggiungi `?test=chat` all'URL
- **Console Logs:** F12 → Console (browser DevTools)

### Documentation
- **Root Docs:** File `.md` nella root del progetto
- **Detailed Guides:** Cartella `/docs/`
- **Code Comments:** Nel codice sorgente

### Community
- **GitHub Issues:** Per bug reports e feature requests
- **GitHub Discussions:** Per domande e discussioni
- **Pull Requests:** Per contributi codice

---

## ✅ Checklist Setup Completo

### Minimal Setup (5 min)
- [ ] `git clone` repository
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] 🎉 App funzionante in demo mode!

### Full Setup (30 min)
- [ ] Clone e install (5 min)
- [ ] GitHub configurato (5 min)
- [ ] Supabase configurato (15 min)
- [ ] Deploy Vercel (5 min)
- [ ] 🚀 Production ready!

### Complete Setup (1 ora)
- [ ] Full setup ↑
- [ ] Google OAuth configurato
- [ ] Custom domain setup
- [ ] Monitoring e analytics
- [ ] Documentation letta
- [ ] 🎓 Expert level!

---

## 🎯 Next Steps

Dopo aver completato setup:

**Per Utenti Finali:**
1. 🎮 Completa onboarding personalizzato
2. 📚 Inizia con Lezione 1
3. 🏆 Sblocca primi badge
4. 🎯 Prova simulatore trading

**Per Sviluppatori:**
1. 📖 Studia [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. 🔧 Esplora struttura codice
3. ✨ Implementa una feature
4. 🚀 Submit PR

**Per Deploy Production:**
1. ✅ Test completo tutte features
2. 🔐 Verifica security checklist
3. 📊 Setup analytics
4. 🚀 Launch!

---

## 📊 Status Progetto

**Versione Corrente:** 1.0.1  
**Status:** 🟢 Production Ready  
**Last Update:** 2024-12-12

**Funzionalità Completate:**
- ✅ Sistema gamification completo
- ✅ AI integration (onboarding, quiz, chat)
- ✅ Trading simulator con 5 missioni
- ✅ Auth completa (email + Google OAuth)
- ✅ PWA installabile
- ✅ Mobile responsive
- ✅ Database cloud + localStorage fallback
- ✅ Documentazione completa

**Deployment Ready:**
- ✅ Build production funzionante
- ✅ Environment variables configurabili
- ✅ CI/CD setup documentato
- ✅ Security checklist completo

---

**Happy Learning!** 🚀

Domande? Consulta la documentazione o apri un issue su GitHub.

---

<div align="center">

**btcwheel v1.0.1**

Impara la Bitcoin Wheel Strategy giocando 🎮📈

[🏠 Home](./README.md) • [📚 Docs](./docs/README.md) • [🤝 Contributing](./CONTRIBUTING.md)

</div>
