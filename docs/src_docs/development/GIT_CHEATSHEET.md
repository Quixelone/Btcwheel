# 🎯 Git Cheatsheet - btcwheel

Quick reference per comandi Git più usati nel workflow btcwheel.

---

## 🚀 Setup Iniziale

```bash
# Clona repository
git clone https://github.com/tuousername/btcwheel.git
cd btcwheel

# Configura user (se non fatto)
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua-email@example.com"

# Verifica config
git config --list
```

---

## 📊 Status & Info

```bash
# Status corrente
git status

# Lista branch
git branch -a

# Branch corrente
git branch --show-current

# Log commits recenti
git log --oneline -10

# Log grafico
git log --graph --oneline --all -10

# Differenze non staged
git diff

# Differenze staged
git diff --staged

# Storia di un file
git log --follow -p -- path/to/file.tsx
```

---

## 🌿 Branch Management

```bash
# Crea nuovo branch
git checkout -b feature/nome-feature

# Switch branch esistente
git checkout develop
git switch develop  # (alternativa moderna)

# Crea branch da specifico commit
git checkout -b hotfix/bug abc123

# Rinomina branch
git branch -m vecchio-nome nuovo-nome

# Elimina branch locale
git branch -d feature/completata

# Elimina branch forzato (non merged)
git branch -D feature/da-buttare

# Elimina branch remoto
git push origin --delete feature/vecchia

# Lista branch merged
git branch --merged

# Lista branch non merged
git branch --no-merged
```

---

## 💾 Stage & Commit

```bash
# Aggiungi tutti i file
git add .

# Aggiungi file specifico
git add path/to/file.tsx

# Aggiungi per pattern
git add src/**/*.tsx

# Aggiungi interattivamente
git add -p

# Commit con messaggio
git commit -m "feat: add new feature"

# Commit con body multiline
git commit -m "feat: add feature" -m "Detailed description here"

# Amend ultimo commit (cambia messaggio)
git commit --amend -m "feat: fixed message"

# Amend aggiungendo file dimenticati
git add forgotten-file.tsx
git commit --amend --no-edit

# Unstage file
git reset HEAD path/to/file.tsx
git restore --staged path/to/file.tsx  # (moderno)

# Discard modifiche locale
git checkout -- path/to/file.tsx
git restore path/to/file.tsx  # (moderno)
```

---

## 🔄 Sync & Update

```bash
# Fetch da remote (no merge)
git fetch origin

# Pull (fetch + merge)
git pull origin develop

# Pull con rebase
git pull --rebase origin develop

# Push branch corrente
git push origin feature/nome

# Push e set upstream
git push -u origin feature/nome

# Force push (⚠️ PERICOLOSO!)
git push --force origin feature/nome

# Force push più sicuro
git push --force-with-lease origin feature/nome

# Push tutti i branch
git push origin --all

# Push tags
git push origin --tags
```

---

## 🔀 Merge & Rebase

```bash
# Merge branch in corrente
git merge feature/completata

# Merge con messaggio custom
git merge feature/completata -m "Merge feature X"

# Abort merge in caso di conflitti
git merge --abort

# Rebase su develop
git rebase develop

# Rebase interattivo (modifica storia)
git rebase -i HEAD~3

# Continua rebase dopo fix conflitti
git rebase --continue

# Abort rebase
git rebase --abort

# Cherry-pick commit specifico
git cherry-pick abc123
```

---

## 🏷️ Tags & Releases

```bash
# Lista tags
git tag

# Crea tag annotato
git tag -a v1.0.0 -m "Release v1.0.0"

# Crea tag lightweight
git tag v1.0.0

# Push tag
git push origin v1.0.0

# Push tutti i tags
git push origin --tags

# Elimina tag locale
git tag -d v1.0.0

# Elimina tag remoto
git push origin --delete v1.0.0

# Checkout tag
git checkout v1.0.0
```

---

## 🧹 Cleanup & Undo

```bash
# Scarta tutte le modifiche locali
git reset --hard HEAD

# Torna indietro di N commits (keep changes)
git reset --soft HEAD~3

# Torna indietro di N commits (discard changes)
git reset --hard HEAD~3

# Revert commit (crea nuovo commit)
git revert abc123

# Pulisci file untracked
git clean -n  # dry run
git clean -f  # execute
git clean -fd # include directories

# Remove file from Git but keep local
git rm --cached file.txt
git rm --cached -r folder/

# Stash modifiche temporanee
git stash
git stash save "WIP: descrizione"

# Lista stash
git stash list

# Apply stash
git stash apply stash@{0}
git stash pop  # apply + remove

# Drop stash
git stash drop stash@{0}

# Clear all stash
git stash clear
```

---

## 🔍 Search & Inspect

```bash
# Cerca in codice
git grep "searchTerm"
git grep "searchTerm" -- "*.tsx"

# Chi ha modificato riga
git blame path/to/file.tsx

# Mostra commit specifico
git show abc123

# Mostra file in commit
git show abc123:path/to/file.tsx

# Differenza tra branch
git diff develop..feature/test

# File cambiati tra branch
git diff --name-only develop..feature/test

# Commits in branch ma non in develop
git log develop..feature/test
```

---

## 🔧 Config & Remote

```bash
# Lista remote
git remote -v

# Aggiungi remote
git remote add upstream https://github.com/original/repo.git

# Cambia URL remote
git remote set-url origin https://github.com/new/url.git

# Remove remote
git remote remove upstream

# Config locale repository
git config user.name "Nome Specifico Repo"
git config user.email "email@repo.com"

# Config globale
git config --global core.editor "code --wait"
git config --global merge.tool vscode
git config --global init.defaultBranch main
```

---

## 🆘 Emergency Commands

### Ho committato un secret per errore!

```bash
# 1. Rimuovi file
git rm --cached .env

# 2. Force push (solo se branch NON condiviso!)
git commit -m "Remove sensitive file"
git push --force origin feature/branch

# ⚠️ IMPORTANTE: Rigenera TUTTI i secrets esposti!
```

### Ho fatto push sul branch sbagliato!

```bash
# 1. Crea branch corretto da current commit
git branch correct-branch

# 2. Reset branch sbagliato
git reset --hard origin/wrong-branch

# 3. Push branch corretto
git push -u origin correct-branch
```

### Conflitti durante merge!

```bash
# 1. Vedi file con conflitti
git status

# 2. Apri e risolvi conflitti manualmente
# (cerca <<<<<<< HEAD)

# 3. Dopo fix
git add file-risolto.tsx
git commit -m "Resolve merge conflict"

# Oppure abort
git merge --abort
```

### Ho cancellato commits per errore!

```bash
# Trova commit perso
git reflog

# Recupera
git checkout abc123
git branch recovery abc123
```

---

## 📋 Workflow btcwheel

### Nuova Feature

```bash
# 1. Update develop
git checkout develop
git pull origin develop

# 2. Crea feature branch
git checkout -b feature/nome-feature

# 3. Lavora e committa
git add .
git commit -m "feat: implement feature X"

# 4. Push
git push -u origin feature/nome-feature

# 5. Su GitHub: crea PR develop ← feature/nome-feature
```

### Hotfix Production

```bash
# 1. Branch da main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix e commit
git add .
git commit -m "fix: critical bug in production"

# 3. Push e PR verso main E develop
git push -u origin hotfix/critical-bug

# Su GitHub: crea 2 PR
# - main ← hotfix/critical-bug
# - develop ← hotfix/critical-bug
```

### Release

```bash
# 1. Merge develop in main
git checkout main
git merge develop

# 2. Tag
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main
git push origin v1.1.0

# 3. Su GitHub: crea Release da tag
```

---

## 🎨 Commit Message Convention

### Format

```
type(scope): short description

Optional longer description.
Can be multiline.

Refs: #123
```

### Types

- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Solo documentazione
- `style`: Formatting (no logic change)
- `refactor`: Code refactoring
- `test`: Add tests
- `chore`: Maintenance
- `perf`: Performance improvement

### Examples

```bash
git commit -m "feat(lessons): add lesson 10 on risk management"
git commit -m "fix(auth): resolve Google OAuth redirect"
git commit -m "docs(readme): update setup instructions"
git commit -m "style(dashboard): improve spacing"
git commit -m "refactor(mascot): simplify state logic"
git commit -m "perf(quiz): optimize question loading"
```

---

## 🔐 .gitignore Quick Reference

```gitignore
# Node
node_modules/
dist/

# Env
.env
.env.local

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel/

# Debug
DEBUG_*.md
*.log
```

---

## 📚 Risorse

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://githubflow.github.io)
- [Conventional Commits](https://conventionalcommits.org)
- [Oh Shit, Git!?!](https://ohshitgit.com/) - Recovery guide

---

## 💡 Tips

**Commit Often, Push Once**
- Commit locale frequenti (ogni task completato)
- Push quando feature/task è completo

**Branch per Ogni Feature**
- Isola lavoro in branch dedicati
- Facilita code review e testing

**Pull Before Push**
- Sempre `git pull` prima di `git push`
- Risolvi conflitti localmente

**Write Good Messages**
- Commit message descrivono "cosa" e "perché"
- Seguono convention (type: description)

**Use Rebase for Clean History**
- `git pull --rebase` per storia lineare
- Rebase interattivo per cleanup pre-PR

---

**Happy Coding!** 🚀

Vedi anche: [GITHUB_SETUP.md](../../GITHUB_SETUP.md) per setup completo.
