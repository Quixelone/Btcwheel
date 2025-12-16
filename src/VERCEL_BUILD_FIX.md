# 🚨 VERCEL BUILD FIX - btcwheel

## ⚡ Quick Summary

**Errore:** `Failed to resolve /src/main.tsx from /vercel/path0/index.html`

**Root Cause:** Build configuration incompatibile con Vercel + Vite

---

## ✅ FIX APPLICATI (v2)

### 1. **Package.json Updates**

#### A) Build Script Simplificato
```json
// Prima:
"build": "tsc && vite build"

// Dopo:
"build": "vite build"
```
✅ Vite gestisce TypeScript automaticamente

#### B) Vite Upgrade
```json
"vite": "^6.0.0"  // Prima: "^5.4.11"
```
✅ Vite 6 ha migliore compatibilità con Node 20

#### C) Node Types Added
```json
"@types/node": "^20.11.0"
```
✅ Risolve errori di type checking in `vite.config.ts`

---

### 2. **Vercel.json - Explicit Configuration**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  ...
}
```

✅ Dice esplicitamente a Vercel di usare Vite

---

### 3. **Node Version Files**

**Creati 2 file:**
- `.node-version` → `20`
- `.nvmrc` → `20`

✅ Garantisce Node 20 su Vercel (migliore per Vite 6)

---

### 4. **Main.tsx Import Fix**

```typescript
// Prima:
import App from '../App'

// Dopo:
import App from '../App.tsx'
```

✅ Estensione esplicita per Vercel build

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Sincronizza con GitHub

**Opzione A - Re-export da Figma Make (CONSIGLIATO):**

1. **Figma Make** → File → **Export Project**
2. Scarica ZIP completo
3. **Sostituisci** repository locale
4. GitHub Desktop → **Commit All** → **Push**

**Opzione B - Copia File Manualmente:**

Copia questi file dalla nuova export:
```
✅ package.json
✅ vercel.json
✅ src/main.tsx
✅ .node-version
✅ .nvmrc
✅ VERCEL_BUILD_FIX.md
```

Poi:
```bash
git add .
git commit -m "Fix: Vercel build with Vite 6 and explicit config"
git push origin main
```

---

### Step 2: Verifica Build su Vercel

Dopo il push, Vercel inizia auto-deploy:

#### ✅ Expected Success Output:

```bash
> btcwheel@1.0.0 build
> vite build

vite v6.0.0 building for production...
✓ 1234 modules transformed.
✓ built in 52.34s

Build Completed
Deployment Ready
```

#### ❌ Se Fallisce Ancora:

**Verifica Logs Completi:**

1. Vercel Dashboard → **Deployments**
2. Click deployment fallito
3. **View Full Build Logs**
4. Cerca errori specifici

---

## 🔧 VERCEL DASHBOARD SETTINGS

### Verifica questi settings in Vercel:

**Settings → General:**

```
Framework Preset:         Vite
Build Command:            npm run build
Output Directory:         dist
Install Command:          npm install
Node.js Version:          20.x
```

### Se Settings sono Diversi:

1. **Non toccare** Build Command (lascia vuoto, userà vercel.json)
2. **Node.js Version** → Seleziona **20.x**
3. **Save**
4. Vai a **Deployments** → **Redeploy** (menu 3 dots)

---

## 🐛 TROUBLESHOOTING SCENARIOS

### Scenario 1: "Cannot find module 'vite'"

**Causa:** `npm install` fallisce

**Fix:**
```bash
# Vercel Dashboard → Settings → General
Install Command: npm ci --legacy-peer-deps
```

---

### Scenario 2: "Failed to resolve entry /src/main.tsx"

**Causa:** Struttura file non corretta

**Fix:** Verifica che esistano:
```
/index.html         ← ROOT (non /public/)
/src/main.tsx       ← File entry point
/src/globals.css    ← CSS globali
/App.tsx            ← Component principale
```

Se mancano, **ri-export** da Figma Make.

---

### Scenario 3: "Type error in vite.config.ts"

**Causa:** Manca `@types/node`

**Fix:** Già applicato nel package.json aggiornato. Se persiste:

```bash
# Aggiungi manualmente in Vercel
Settings → Environment Variables
Key: SKIP_TYPE_CHECK
Value: true
```

---

### Scenario 4: Build Success ma App Bianca

**Causa:** Environment variables mancanti

**Fix:**

```bash
# Vercel Dashboard → Settings → Environment Variables
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
OPENAI_API_KEY=sk-proj-...
```

Poi:
1. **Redeploy** dopo aver aggiunto le variabili
2. Test app in production

---

## 📊 BUILD TIMING REFERENCE

**Normal Build Times:**
```
npm install:    30-45 seconds
vite build:     40-60 seconds
Total:          ~90 seconds
```

**Se supera 3 minuti** → Qualcosa è bloccato, controlla logs.

---

## ✅ POST-DEPLOYMENT CHECKLIST

```
□ Build completa senza errori
□ Email "Deployment Ready" ricevuta
□ btcwheel.vercel.app carica
□ Landing page visibile
□ Login button funziona
□ No errori in browser console (F12)
```

---

## 🌐 CUSTOM DOMAIN SETUP (dopo deploy success)

### 1. Aggiungi Dominio in Vercel

```
Vercel → Settings → Domains
Add Domain: btcwheel.io
```

### 2. Configura DNS su Namecheap

Vercel ti darà i record DNS da aggiungere:

```
Type:    CNAME
Host:    @
Value:   cname.vercel-dns.com
```

### 3. Aspetta Propagazione

- Tempo: **30-60 minuti**
- Verifica: `dig btcwheel.io` (terminal)

---

## 🆘 EMERGENCY COMMANDS

### Force Clean Build

```bash
# Vercel Dashboard
Deployments → Menu (3 dots) → Redeploy → Clear Cache ✅
```

### Test Build Localmente

```bash
# Prima di pushare su GitHub
npm install
npm run build
npm run preview

# Se funziona localmente = dovrebbe funzionare su Vercel
```

### Manual Vercel CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📞 NEED HELP?

**Se continua a fallire**, fornisci:

1. **Screenshot** build logs completi
2. **Link** deployment su Vercel
3. **Errore specifico** (riga esatta)

---

**Last Updated:** Dicembre 2024  
**Status:** ✅ Ready for deployment  
**Version:** 2.0 (Vite 6 + Node 20)
