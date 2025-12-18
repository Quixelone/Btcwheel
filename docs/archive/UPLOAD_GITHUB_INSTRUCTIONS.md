# 🚀 GUIDA UPLOAD SU GITHUB - COPIA/INCOLLA

## 📋 PREREQUISITI

- ✅ Git installato (verifica con: `git --version`)
- ✅ Account GitHub: https://github.com/Quixelone
- ✅ Repository esistente: https://github.com/Quixelone/btcwheel.git

---

## 🎯 METODO 1: GitHub Desktop (PIÙ SEMPLICE) ⭐ CONSIGLIATO

### **STEP 1: Scarica GitHub Desktop (se non ce l'hai)**

```
https://desktop.github.com/
→ Download for Windows
→ Installa
→ Sign in con il tuo account GitHub
```

### **STEP 2: Export da Figma Make**

```
1. Figma Make → Menu (☰) in alto a sinistra
2. Click "Export Project"
3. Download ZIP
4. Salva in: C:\Users\Quixel\Desktop\btcwheel-export.zip
```

### **STEP 3: Estrai ZIP**

```
1. Click destro su btcwheel-export.zip
2. "Estrai tutto"
3. Destinazione: C:\Users\Quixel\Desktop\btcwheel-export\
4. Click "Estrai"
```

### **STEP 4: ⚠️ VERIFICA CRITICA - Controlla che /src esista**

```
Apri Windows Explorer
Vai in: C:\Users\Quixel\Desktop\btcwheel-export\

DEVI VEDERE:
btcwheel-export\
├── src\                    ← DEVE ESSERCI
│   ├── main.tsx           ← DEVE ESSERCI
│   └── globals.css        ← DEVE ESSERCI
├── components\
├── supabase\
├── index.html
├── App.tsx
├── package.json
└── vercel.json

❌ Se NON vedi la cartella "src\" → VAI AL METODO 3 sotto
✅ Se vedi la cartella "src\" → Continua
```

### **STEP 5: GitHub Desktop - Remove Old Repository**

```
1. Apri GitHub Desktop
2. Menu in alto → Repository → Remove
3. Conferma (NON cancellare i file dal disco, solo remove da GitHub Desktop)
```

### **STEP 6: GitHub Desktop - Add New Repository**

```
1. File → Add Local Repository
2. Click "Choose..." button
3. Seleziona: C:\Users\Quixel\Desktop\btcwheel-export
4. Se dice "not a git repository":
   → Click "Create a repository"
   → Nome: btcwheel
   → Description: Bitcoin Wheel Strategy Learning Platform
   → ✅ Initialize with README: NO (lascia deselezionato)
   → Click "Create Repository"
```

### **STEP 7: Verifica Files in "Changes" Tab**

```
1. GitHub Desktop → Click tab "Changes" (a sinistra)
2. Dovresti vedere TUTTI i file (~100+ files)
3. ⚠️ VERIFICA CRITICA - Scorri la lista e assicurati di vedere:
   ✅ src/main.tsx
   ✅ src/globals.css
   
   Se NON li vedi → PROBLEMA! Vai al METODO 3
```

### **STEP 8: Commit**

```
1. In basso a sinistra, nel campo "Summary":
   Scrivi: Complete project with /src directory fixed

2. Click "Commit to main"
```

### **STEP 9: Publish/Push**

```
Se vedi "Publish repository":
  → Click "Publish repository"
  → Name: btcwheel
  → ✅ Keep this code private (o deseleziona se vuoi pubblico)
  → Click "Publish repository"

Se vedi "Push origin":
  → Click "Push origin"
```

### **STEP 10: ✅ Verifica su GitHub**

```
1. Apri browser
2. Vai su: https://github.com/Quixelone/btcwheel
3. Refresh pagina (F5)
4. Click sulla cartella "src"
5. ✅ SUCCESSO: Vedi main.tsx e globals.css
6. Aspetta 1-2 minuti → Vercel farà automaticamente il deploy
7. Email da Vercel: "Deployment Ready ✅"
```

---

## 🎯 METODO 2: Git Command Line (Per Esperti)

### **Prerequisito: Git installato**

Verifica:
```bash
git --version
```

Se non installato → Scarica da: https://git-scm.com/download/win

---

### **STEP 1-3: Export e Estrai** (come Metodo 1)

### **STEP 4: Apri PowerShell/CMD**

```
1. Windows + R
2. Scrivi: powershell
3. Enter
```

### **STEP 5: Comandi Git** (COPIA/INCOLLA uno alla volta)

```bash
# Vai nella cartella estratta
cd C:\Users\Quixel\Desktop\btcwheel-export

# Verifica che sia la cartella giusta (deve mostrare index.html, App.tsx, ecc.)
dir

# Verifica che /src esista
dir src

# Se "src" non esiste → VAI AL METODO 3
# Se "src" esiste → Continua

# Inizializza Git (se non già fatto)
git init

# Aggiungi il remote (se non già fatto)
git remote add origin https://github.com/Quixelone/btcwheel.git

# Oppure se già esiste, aggiorna il remote:
git remote set-url origin https://github.com/Quixelone/btcwheel.git

# Aggiungi TUTTI i file
git add .

# Verifica che src/main.tsx sia incluso
git status

# Dovresti vedere nella lista:
# new file:   src/main.tsx
# new file:   src/globals.css

# Commit
git commit -m "Complete project with /src directory fixed"

# Push (forza l'overwrite del repository esistente)
git push -f origin main
```

### **Se ti chiede username/password:**

```
Username: Quixelone
Password: [Il tuo Personal Access Token, NON la password normale]

🔐 Come ottenere il Personal Access Token:
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Scope: ✅ repo (seleziona tutto sotto "repo")
5. Generate token
6. COPIA il token (appare una sola volta!)
7. Incollalo come password
```

### **STEP 6: Verifica** (come Metodo 1 STEP 10)

---

## 🎯 METODO 3: Fix Manuale se /src NON viene esportato

Se la cartella `/src` NON appare nel ZIP esportato, c'è un bug di export. Fix:

### **OPZIONE A: Crea /src Manualmente nella Repository Locale**

#### **1. Export normalmente** (anche se /src manca)

#### **2. Crea cartella /src manualmente**

```bash
# PowerShell
cd C:\Users\Quixel\Desktop\btcwheel-export
mkdir src
```

#### **3. Crea file src/main.tsx**

```bash
notepad src\main.tsx
```

**Incolla questo codice esatto:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.tsx'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Salva** (Ctrl+S) e **chiudi Notepad**

#### **4. Crea file src/globals.css**

```bash
notepad src\globals.css
```

**Incolla questo codice esatto:**

```css
@import '../styles/globals.css';
```

**Salva** (Ctrl+S) e **chiudi Notepad**

#### **5. Verifica**

```bash
dir src
```

Dovresti vedere:
```
main.tsx
globals.css
```

#### **6. Continua con METODO 1 o METODO 2**

Ora puoi usare GitHub Desktop (Metodo 1 da STEP 5) o Git CLI (Metodo 2 da STEP 5).

---

### **OPZIONE B: Crea /src Direttamente su GitHub Web**

Se proprio non riesci con i metodi sopra:

#### **1. Vai su GitHub**

```
https://github.com/Quixelone/btcwheel
```

#### **2. Crea src/main.tsx**

```
1. Click "Add file" → "Create new file"
2. Nel campo "Name your file", scrivi: src/main.tsx
   (il "/" crea automaticamente la cartella src/)
3. Copia e incolla il contenuto di main.tsx (vedi sopra in OPZIONE A punto 3)
4. Scroll down
5. Commit message: "Add src/main.tsx"
6. Click "Commit new file"
```

#### **3. Crea src/globals.css**

```
1. Vai su: https://github.com/Quixelone/btcwheel/tree/main/src
2. Click "Add file" → "Create new file"
3. Nome file: globals.css
4. Copia e incolla: @import '../styles/globals.css';
5. Commit message: "Add src/globals.css"
6. Click "Commit new file"
```

#### **4. Vercel farà automaticamente il redeploy**

Aspetta 2-3 minuti → Email "Deployment Ready ✅"

---

## ✅ VERIFICA FINALE

Dopo qualsiasi metodo:

### **1. GitHub:**

```
https://github.com/Quixelone/btcwheel/tree/main/src
```

✅ Dovresti vedere: `main.tsx` e `globals.css`

### **2. Email da Vercel:**

```
📧 "Deployment Started" (entro 1 minuto dal push)
⏱️ Wait 2-3 minuti
📧 "Deployment Ready ✅"
```

### **3. Sito Live:**

```
https://btcwheel.vercel.app
```

✅ Landing page si carica correttamente!

---

## 🚨 TROUBLESHOOTING

### **Problema: "permission denied" su git push**

**Fix:**
```bash
git push -f origin main
```

Il `-f` forza l'overwrite.

---

### **Problema: "repository not found"**

**Fix:**

Verifica che il remote sia corretto:
```bash
git remote -v
```

Dovresti vedere:
```
origin  https://github.com/Quixelone/btcwheel.git (fetch)
origin  https://github.com/Quixelone/btcwheel.git (push)
```

Se diverso, aggiorna:
```bash
git remote set-url origin https://github.com/Quixelone/btcwheel.git
```

---

### **Problema: /src ancora non appare su GitHub dopo il push**

**Causa:** .gitignore lo blocca

**Fix:**

1. Apri `.gitignore` nella cartella del progetto
2. Verifica che NON contenga:
   ```
   src/
   /src/
   src
   ```
3. Se c'è, rimuovi quella riga
4. Salva
5. Riprova il push:
   ```bash
   git add .
   git commit -m "Fix .gitignore to include src/"
   git push origin main
   ```

---

### **Problema: Vercel build ancora fallisce dopo il push**

**1. Vai su Vercel Dashboard:**
```
https://vercel.com/dashboard
```

**2. Click sul progetto "btcwheel"**

**3. Click su "Deployments"**

**4. Click sull'ultimo deployment fallito**

**5. Click "View Build Logs"**

**6. Copia TUTTI i logs e inviali per debug**

---

## 📞 SUPPORTO

Se hai problemi con uno qualsiasi di questi metodi:

**Fornisci queste informazioni:**

1. ✅ Quale metodo stai usando? (1, 2, o 3)
2. ✅ A che STEP sei bloccato?
3. ✅ Quale errore vedi? (screenshot o copia/incolla il messaggio)
4. ✅ Screenshot di:
   - Windows Explorer che mostra la cartella btcwheel-export\src\
   - GitHub Desktop Changes tab (se usi Metodo 1)
   - Output del comando `git status` (se usi Metodo 2)
5. ✅ Link GitHub: https://github.com/Quixelone/btcwheel
   - La cartella /src appare? SÌ / NO

---

## 🎯 METODO CONSIGLIATO

**Per te:** METODO 1 (GitHub Desktop)

**Perché:**
- ✅ Interfaccia grafica (niente comandi)
- ✅ Mostra visivamente quali file vengono caricati
- ✅ Gestione automatica dell'autenticazione
- ✅ Puoi vedere se /src è incluso prima del push

**Tempo stimato:** 5-10 minuti (incluso download GitHub Desktop)

---

**Buon upload! 🚀**
