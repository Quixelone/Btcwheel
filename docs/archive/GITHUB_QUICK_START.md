# ⚡ GitHub Quick Start - btcwheel

Guida veloce per configurare GitHub in 5 minuti.

---

## 📋 Prerequisiti

- [ ] Account GitHub
- [ ] Git installato: `git --version`
- [ ] Progetto btcwheel sul tuo computer

---

## 🚀 5 Minuti Setup

### Step 1: Crea Repository su GitHub (2 min)

1. Vai su [github.com/new](https://github.com/new)
2. Compila:
   ```
   Nome:        btcwheel
   Visibilità:  Private (o Public)
   ```
3. ⚠️ **NON** inizializzare con README/gitignore/license
4. Click **"Create repository"**
5. Copia URL: `https://github.com/tuousername/btcwheel.git`

### Step 2: Configura Git Locale (1 min)

Apri terminale nella cartella btcwheel:

```bash
# Inizializza Git
git init

# Aggiungi remote (sostituisci tuousername!)
git remote add origin https://github.com/tuousername/btcwheel.git
```

### Step 3: Primo Push (2 min)

```bash
# Stage tutti i file
git add .

# Commit
git commit -m "🎉 Initial commit - btcwheel v1.0.0"

# Push
git branch -M main
git push -u origin main
```

**Se chiede password:**
- Username: `tuousername`
- Password: usa **Personal Access Token** (vedi sotto)

---

## 🔐 Personal Access Token (se necessario)

Se Git chiede password e non funziona:

1. **Crea Token:**
   - GitHub → Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens)
   - **Generate new token (classic)**
   - Nome: `btcwheel-dev`
   - Scope: seleziona `repo`
   - **Generate token**
   - **⚠️ Copia subito!** (non lo vedrai più)

2. **Usa Token Come Password:**
   ```bash
   git push -u origin main
   ```
   - Username: `tuousername`
   - Password: `ghp_iltuotokengenerato`

3. **Salva Credenziali (opzionale):**
   ```bash
   # macOS
   git config --global credential.helper osxkeychain
   
   # Windows
   git config --global credential.helper wincred
   
   # Linux
   git config --global credential.helper cache
   ```

---

## ✅ Verifica Setup

```bash
# Controlla remote
git remote -v
# Output: origin https://github.com/tuousername/btcwheel.git

# Controlla status
git status
# Output: On branch main, nothing to commit

# Vedi su GitHub
# Vai su https://github.com/tuousername/btcwheel
# Dovresti vedere tutti i file!
```

---

## 🌿 Crea Branch Develop (opzionale ma raccomandato)

```bash
git checkout -b develop
git push -u origin develop
```

Su GitHub:
1. Settings → Branches
2. Default branch → Cambia in `develop`
3. ✅ Salva

**Workflow:**
- `develop` = branch di sviluppo (lavori qui)
- `main` = solo production releases

---

## 🔗 Integra Vercel (5 min)

1. **Vai su [vercel.com](https://vercel.com)**
2. **Import Git Repository**
   - Add New → Project
   - Import da GitHub
   - Seleziona `btcwheel`
3. **Configura:**
   ```
   Framework Preset:  Vite
   Build Command:     npm run build
   Output Directory:  dist
   ```
4. **Aggiungi Environment Variables:**
   - Copia da `.env.example`
   - Aggiungi tutte le variabili necessarie
5. **Deploy!**

**Deploy Automatici:**
```
main branch     → Production
develop branch  → Preview
PR             → Preview automatico
```

---

## 📝 Workflow Giornaliero

### Lavorare su Feature

```bash
# 1. Update
git checkout develop
git pull origin develop

# 2. Nuova feature
git checkout -b feature/nome-feature

# 3. Lavora, committa spesso
git add .
git commit -m "feat: description"

# 4. Push
git push -u origin feature/nome-feature

# 5. Su GitHub: crea Pull Request
# develop ← feature/nome-feature
```

### Convenzioni Commit

```bash
# Format: type: description
git commit -m "feat: add new lesson"       # Nuova feature
git commit -m "fix: resolve auth bug"      # Bug fix
git commit -m "docs: update README"        # Documentazione
git commit -m "style: improve spacing"     # Styling
git commit -m "refactor: simplify logic"   # Refactoring
```

---

## 🆘 Comandi Salvavita

```bash
# Annulla modifiche locali
git reset --hard HEAD

# Scarta file specifico
git checkout -- file.tsx

# Torna indietro di 1 commit (keep changes)
git reset --soft HEAD~1

# Vedi cosa è cambiato
git diff

# Status
git status

# History
git log --oneline -10
```

---

## 📚 Prossimi Passi

✅ GitHub configurato? Great!

**Ora:**
1. 🚀 [Deploy su Vercel](./VERCEL_DEPLOYMENT.md)
2. 🗄️ [Setup Supabase](./SUPABASE_SETUP.md)
3. 📱 [Configura Google OAuth](./docs/setup/GOOGLE_OAUTH_SETUP.md)

**Per approfondire:**
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Guida completa
- [Git Cheatsheet](./docs/development/GIT_CHEATSHEET.md) - Comandi Git
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Workflow team

---

## ✨ Done!

Il tuo progetto è ora su GitHub con:
- ✅ Version control
- ✅ Backup cloud
- ✅ CI/CD ready
- ✅ Team collaboration ready

**Happy coding!** 🚀

---

**Questions?**
- Full docs: [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- Git commands: [GIT_CHEATSHEET.md](./docs/development/GIT_CHEATSHEET.md)
