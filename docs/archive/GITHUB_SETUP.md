# 🚀 GitHub Setup Guide - btcwheel

Guida completa per configurare GitHub e integrare il progetto con CI/CD.

---

## 📋 Prerequisiti

- Account GitHub (gratuito o Pro)
- Git installato localmente ([Download](https://git-scm.com/downloads))
- Progetto btcwheel pronto sul tuo computer

---

## 🎯 Step 1: Creare Repository GitHub

### Opzione A: Via Web Interface (Raccomandato)

1. **Vai su GitHub**
   - Apri [github.com](https://github.com)
   - Login con il tuo account

2. **Crea Nuovo Repository**
   - Click sul `+` in alto a destra
   - Seleziona **"New repository"**

3. **Configura Repository**
   ```
   Repository name:    btcwheel
   Description:        Educational Bitcoin Wheel Strategy app with gamification
   Visibility:         🔒 Private (o Public se vuoi open source)
   
   ⚠️ NON inizializzare con:
   ❌ README.md (già esiste nel progetto)
   ❌ .gitignore (già esiste nel progetto)
   ❌ License (già esiste nel progetto)
   ```

4. **Crea Repository**
   - Click su **"Create repository"**
   - Copia l'URL che appare (es: `https://github.com/tuousername/btcwheel.git`)

### Opzione B: Via GitHub CLI (Avanzato)

```bash
# Installa GitHub CLI se non ce l'hai
# macOS: brew install gh
# Windows: scoop install gh

# Login
gh auth login

# Crea repository
gh repo create btcwheel --private --description "Educational Bitcoin Wheel Strategy app"
```

---

## 🔧 Step 2: Inizializzare Git Localmente

Apri il terminale nella cartella del progetto btcwheel:

### 1. Inizializza Git

```bash
git init
```

### 2. Configura Informazioni Utente (se non fatto)

```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua-email@example.com"
```

### 3. Aggiungi Remote Repository

Sostituisci `tuousername` con il tuo username GitHub:

```bash
git remote add origin https://github.com/tuousername/btcwheel.git
```

Verifica che sia stato aggiunto:

```bash
git remote -v
```

Output atteso:
```
origin  https://github.com/tuousername/btcwheel.git (fetch)
origin  https://github.com/tuousername/btcwheel.git (push)
```

---

## 📦 Step 3: Primo Commit e Push

### 1. Verifica File da Committare

```bash
git status
```

Dovresti vedere tutti i file del progetto in rosso (untracked).

### 2. Aggiungi Tutti i File

```bash
git add .
```

### 3. Verifica Cosa Verrà Committato

```bash
git status
```

Ora i file dovrebbero essere in verde (staged).

### 4. Crea il Primo Commit

```bash
git commit -m "🎉 Initial commit - btcwheel v1.0.0

- Complete educational Bitcoin Wheel Strategy app
- Gamification system with XP, badges, streaks
- AI-powered onboarding with GPT-4o-mini
- 5 progressive guided trading missions
- Interactive lessons with dynamic AI quizzes
- Mascot 'Prof Satoshi' with emotional states
- Supabase auth (email/password + Google OAuth)
- PWA installable with offline support
- Full responsive design (mobile-first)
- Green emerald & orange modern theme"
```

### 5. Crea Branch Main

```bash
git branch -M main
```

### 6. Push al Repository

```bash
git push -u origin main
```

Se richiesto, inserisci username e password GitHub.

**⚠️ Note su Autenticazione:**
- GitHub non accetta più password via HTTPS
- Usa **Personal Access Token** o **SSH keys**

---

## 🔐 Step 4: Configurare Autenticazione

### Opzione A: Personal Access Token (Raccomandato)

1. **Crea Token**
   - Vai su GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click **"Generate new token (classic)"**
   - Nome: `btcwheel-dev`
   - Scopes: seleziona `repo` (full control)
   - Click **"Generate token"**
   - **⚠️ Copia il token SUBITO** (non potrai più vederlo!)

2. **Usa Token Come Password**
   ```bash
   git push -u origin main
   ```
   - Username: `tuo-username-github`
   - Password: `ghp_tuotokengenerato`

3. **Salva Credenziali (Opzionale)**
   ```bash
   # macOS
   git config --global credential.helper osxkeychain
   
   # Windows
   git config --global credential.helper wincred
   
   # Linux
   git config --global credential.helper cache --timeout=3600
   ```

### Opzione B: SSH Keys (Più Sicuro)

1. **Genera SSH Key**
   ```bash
   ssh-keygen -t ed25519 -C "tua-email@example.com"
   ```
   - Premi Enter per posizione default
   - (Opzionale) Inserisci passphrase

2. **Aggiungi Key all'Agent**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Copia Chiave Pubblica**
   ```bash
   # macOS
   pbcopy < ~/.ssh/id_ed25519.pub
   
   # Linux
   cat ~/.ssh/id_ed25519.pub
   # Copia manualmente
   
   # Windows (Git Bash)
   clip < ~/.ssh/id_ed25519.pub
   ```

4. **Aggiungi Key su GitHub**
   - Vai su GitHub → Settings → SSH and GPG keys
   - Click **"New SSH key"**
   - Title: `btcwheel-dev-machine`
   - Paste la chiave copiata
   - Click **"Add SSH key"**

5. **Cambia Remote a SSH**
   ```bash
   git remote set-url origin git@github.com:tuousername/btcwheel.git
   ```

6. **Push**
   ```bash
   git push -u origin main
   ```

---

## 🌿 Step 5: Configurare Branch Strategy

### Strategia Raccomandata: Git Flow Semplificato

```bash
# Branch principale (production)
main          → Deploy automatico su Vercel (production)

# Branch sviluppo
develop       → Testing e staging

# Branch feature (esempio)
feature/new-lesson
feature/ai-improvements
fix/auth-bug
```

### Crea Branch Develop

```bash
git checkout -b develop
git push -u origin develop
```

### Imposta Branch Default su GitHub

1. Vai su GitHub repository
2. Settings → Branches
3. Default branch → Cambia da `main` a `develop`
4. Conferma

**Rationale:** Develop diventa il branch di lavoro, main solo per production releases.

---

## 🔒 Step 6: Branch Protection Rules (Raccomandato)

Proteggi il branch `main` da push accidentali:

### Configurazione su GitHub

1. **Vai su Repository Settings**
   - Settings → Branches → Add rule

2. **Configura Rule per Main**
   ```
   Branch name pattern:    main
   
   ✅ Require pull request reviews before merging
      - Required approvals: 1 (se lavori in team)
   
   ✅ Require status checks to pass before merging
      - Se hai CI/CD configurato (Vercel)
   
   ✅ Require branches to be up to date before merging
   
   ✅ Include administrators (opzionale, ma raccomandato)
   ```

3. **Salva**

### Workflow Consigliato

```bash
# Lavora su develop o feature branch
git checkout develop
git pull origin develop

# Crea feature branch
git checkout -b feature/nuova-funzionalita

# Lavora e committa
git add .
git commit -m "feat: add new feature"
git push origin feature/nuova-funzionalita

# Su GitHub: crea Pull Request
# develop ← feature/nuova-funzionalita

# Dopo review e merge:
git checkout develop
git pull origin develop
git branch -d feature/nuova-funzionalita
```

---

## 🔗 Step 7: Integrare con Vercel

### Setup Automatico

1. **Vai su Vercel Dashboard**
   - [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Import Repository**
   - Click **"Add New..."** → **"Project"**
   - Seleziona **"Import Git Repository"**
   - Autorizza GitHub se richiesto
   - Seleziona repository `btcwheel`

3. **Configura Deploy Settings**
   ```
   Framework Preset:       Vite
   Root Directory:         ./
   Build Command:          npm run build
   Output Directory:       dist
   Install Command:        npm install
   ```

4. **Configura Environment Variables**
   - Aggiungi tutte le variabili da `.env`:
     ```
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     OPENAI_API_KEY
     ... (tutte le altre)
     ```

5. **Deploy**
   - Click **"Deploy"**
   - Attendi completamento (~2-3 min)

### Deploy Automatici

Vercel configurerà automaticamente:

```
main branch       → Production (btcwheel.vercel.app)
develop branch    → Preview (btcwheel-git-develop.vercel.app)
PR branches       → Preview automatico per ogni PR
```

---

## 📝 Step 8: Configurare GitHub Issues & Projects (Opzionale)

### Issues Templates

Crea template per bug reports e feature requests:

1. **Settings → Issues → Set up templates**
2. Aggiungi template:
   - 🐛 Bug Report
   - ✨ Feature Request
   - 📚 Documentation

### GitHub Projects

Per gestire roadmap:

1. **Projects → New Project**
2. Template: **"Board"**
3. Colonne: `Backlog`, `Todo`, `In Progress`, `Review`, `Done`

---

## 🏷️ Step 9: Release e Tags

### Creare Release v1.0.0

```bash
# Crea tag
git tag -a v1.0.0 -m "Release v1.0.0 - Initial production release"

# Push tag
git push origin v1.0.0
```

### Release su GitHub

1. **Vai su Releases**
   - Repository → Releases → Draft a new release

2. **Configura Release**
   ```
   Tag:        v1.0.0
   Title:      🎉 btcwheel v1.0.0 - Production Launch
   
   Description:
   First production release of btcwheel - Educational Bitcoin Wheel Strategy app.
   
   ## 🎯 Features
   - Complete gamification system
   - AI-powered personalization
   - 5 guided trading missions
   - Interactive lessons with AI quizzes
   - Mascot with emotional states
   - Full authentication system
   - PWA installable
   
   ## 🚀 Deploy
   Live at: https://btcwheel.vercel.app
   
   ## 📚 Documentation
   See README.md for setup instructions.
   ```

3. **Publish Release**

---

## 📊 Step 10: README Badge (Opzionale)

Aggiungi badge al README per mostrare status:

```markdown
# btcwheel

![GitHub release](https://img.shields.io/github/v/release/tuousername/btcwheel)
![Deploy](https://img.shields.io/github/deployments/tuousername/btcwheel/production?label=vercel)
![License](https://img.shields.io/github/license/tuousername/btcwheel)

...rest of README...
```

---

## 🔄 Workflow Giornaliero

### Lavorare su Nuove Features

```bash
# 1. Assicurati di essere aggiornato
git checkout develop
git pull origin develop

# 2. Crea feature branch
git checkout -b feature/nome-feature

# 3. Lavora e committa spesso
git add .
git commit -m "feat: description of change"

# 4. Push al remote
git push origin feature/nome-feature

# 5. Su GitHub: crea Pull Request
# develop ← feature/nome-feature

# 6. Dopo merge, cleanup
git checkout develop
git pull origin develop
git branch -d feature/nome-feature
```

### Hotfix per Produzione

```bash
# 1. Crea branch da main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix e commit
git add .
git commit -m "fix: critical bug description"

# 3. Push e PR
git push origin hotfix/critical-bug

# 4. Crea PR verso main E develop
# main ← hotfix/critical-bug
# develop ← hotfix/critical-bug
```

---

## 🎨 Convenzioni Commit Messages

### Format: `type(scope): description`

**Types:**
- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Solo documentazione
- `style`: Formatting, no logic change
- `refactor`: Code refactoring
- `test`: Aggiungi test
- `chore`: Maintenance

**Examples:**
```bash
git commit -m "feat(lessons): add lesson 10 on risk management"
git commit -m "fix(auth): resolve Google OAuth redirect issue"
git commit -m "docs(readme): update setup instructions"
git commit -m "style(dashboard): improve mobile responsiveness"
git commit -m "refactor(mascot): simplify emotion state logic"
```

---

## 📋 Checklist Setup Completo

- [ ] Repository GitHub creato
- [ ] Git inizializzato localmente
- [ ] `.gitignore` configurato
- [ ] Remote origin aggiunto
- [ ] Primo commit e push effettuato
- [ ] Autenticazione configurata (Token o SSH)
- [ ] Branch `develop` creato
- [ ] Branch protection su `main` attivato
- [ ] Vercel integrato per CI/CD
- [ ] Environment variables su Vercel configurate
- [ ] Release v1.0.0 pubblicata
- [ ] README badges aggiunti (opzionale)
- [ ] Issues templates configurati (opzionale)
- [ ] GitHub Projects setup (opzionale)

---

## 🆘 Troubleshooting

### Errore: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/tuousername/btcwheel.git
```

### Errore: "Authentication failed"

Usa Personal Access Token invece della password:
- Vedi [Step 4: Configurare Autenticazione](#step-4-configurare-autenticazione)

### Errore: "Push rejected - protected branch"

Non puoi pushare direttamente su `main` se hai branch protection.
Soluzione: Crea PR da develop.

### File Sensibili Committati per Errore

```bash
# Remove from git but keep locally
git rm --cached .env

# Force push (ATTENZIONE: pericoloso su branch condivisi)
git push origin main --force

# IMPORTANTE: Rigenera tutti i secrets esposti!
```

### Voglio Rimuovere History Completa

```bash
# ⚠️ ATTENZIONE: Questo cancella tutta la storia
rm -rf .git
git init
git add .
git commit -m "Initial commit - fresh start"
git branch -M main
git remote add origin https://github.com/tuousername/btcwheel.git
git push -u origin main --force
```

---

## 🔐 Security Best Practices

### 1. Mai Committare Secrets

✅ **Giusto:**
```
.env               # Gitignored
.env.example       # Template pubblico (no values)
```

❌ **Sbagliato:**
```
.env.local         # Contiene secrets
config.js          # Con API keys hardcoded
```

### 2. Use Environment Variables

```javascript
// ✅ Giusto
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// ❌ Sbagliato
const apiKey = "sk-..."; // Hardcoded
```

### 3. Rotate Keys se Esposte

Se committi accidentalmente secrets:
1. Remove dal repo
2. **Rigenera TUTTI i secrets esposti**
3. Update su Vercel e localmente

### 4. Usa Vercel Environment Variables

Non committare secrets nel codice, usali solo su Vercel dashboard.

---

## 📚 Risorse Utili

- **Git Documentation:** [git-scm.com/doc](https://git-scm.com/doc)
- **GitHub Guides:** [guides.github.com](https://guides.github.com)
- **GitHub Flow:** [githubflow.github.io](https://githubflow.github.io)
- **Conventional Commits:** [conventionalcommits.org](https://www.conventionalcommits.org)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)

---

## 🎯 Next Steps

Dopo GitHub setup:

1. ✅ **Deploy su Vercel** - Vedi [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. ✅ **Configure Domain** - Setup custom domain
3. ✅ **Setup Monitoring** - Analytics e error tracking
4. ✅ **Team Collaboration** - Invita collaboratori

---

**Setup GitHub Completato!** 🎉

Il tuo progetto btcwheel è ora sotto version control professionale con CI/CD automatico.

---

**Creato:** Dicembre 2024  
**Versione:** 1.0.0  
**Prossimo:** Deploy Vercel Production
