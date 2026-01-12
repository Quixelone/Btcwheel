# 🔍 Checklist: Verifica Configurazione Vercel

## ❌ Problema Attuale
L'URL Vercel di btcwheel carica finanzacreativa.live

---

## ✅ Cosa Controllare

### 1. **Repository Git Collegato**

#### Dove guardare:
Vercel Dashboard → Tuo Progetto → Settings → Git

#### Cosa verificare:
```
✅ Repository: <tuo-account>/btcwheel
❌ Repository: <tuo-account>/finanzacreativa  ← SBAGLIATO!
```

#### Se è sbagliato:
- **Disconnetti** il repository
- **Riconnetti** il repository giusto (btcwheel)
- **Rideploy**

---

### 2. **Root Directory**

#### Dove guardare:
Vercel Dashboard → Settings → General → Root Directory

#### Cosa verificare:
```
✅ Root Directory: ./  (o vuoto)
❌ Root Directory: /finanzacreativa  ← SBAGLIATO!
```

---

### 3. **Build Settings**

#### Dove guardare:
Vercel Dashboard → Settings → General → Build & Development Settings

#### Configurazione corretta:
```
Framework Preset:    Vite
Build Command:       npm run build  (o auto-detected)
Output Directory:    dist
Install Command:     npm install
```

#### Se è sbagliato:
- Clicca **Edit**
- Correggi i valori
- **Save**
- Vai su Deployments → Redeploy

---

### 4. **Domini Collegati**

#### Dove guardare:
Vercel Dashboard → Settings → Domains

#### Cosa verificare:
```
✅ btcwheel-xxx.vercel.app
❌ finanzacreativa.live  ← SE PRESENTE, RIMUOVI!
```

#### Se vedi finanzacreativa.live:
1. Clicca sui **3 puntini** accanto al dominio
2. **Remove Domain**
3. **Conferma**

---

### 5. **Redirects/Rewrites**

#### Dove guardare:
Vercel Dashboard → Settings → Redirects (o vercel.json nel codice)

#### Cosa verificare:
```json
// ✅ CORRETTO (nel tuo vercel.json)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

// ❌ SBAGLIATO (se presente)
{
  "redirects": [
    { "source": "/(.*)", "destination": "https://finanzacreativa.live" }
  ]
}
```

#### Se vedi redirect sbagliati:
- **Elimina** le regole sbagliate
- **Save**
- **Rideploy**

---

### 6. **Environment Variables**

#### Dove guardare:
Vercel Dashboard → Settings → Environment Variables

#### Cosa verificare:
NON dovrebbero esserci variabili che puntano a finanzacreativa:

```
❌ NEXT_PUBLIC_SITE_URL = https://finanzacreativa.live
❌ VERCEL_URL = finanzacreativa.live
```

Se presenti:
- **Elimina** o **Modifica** con il tuo URL btcwheel
- **Rideploy**

---

### 7. **Deployment Source**

#### Dove guardare:
Vercel Dashboard → Tuo Progetto → Deployments → (ultimo deploy) → Clicca su "Deployment Details"

#### Cosa verificare:
```
Source: git <tuo-account>/btcwheel @ main ✅
Source: git <tuo-account>/finanzacreativa @ main ❌
```

#### Se il source è sbagliato:
- Il progetto Vercel sta puntando al repository sbagliato
- **Soluzione:** Crea nuovo progetto Vercel e importa il repository giusto

---

## 🚨 CASO CRITICO: Repository Sbagliato

Se il **Git Repository** collegato è `finanzacreativa` invece di `btcwheel`:

### Non puoi semplicemente "cambiarlo" - devi rifare il deploy:

#### Opzione A: Disconnetti e Riconnetti
1. Settings → Git → **Disconnect**
2. **Connect Git Repository**
3. Seleziona **btcwheel** (quello giusto!)
4. **Redeploy**

#### Opzione B: Nuovo Progetto (Più Sicuro)
1. **Delete** il progetto attuale
2. **New Project** → Import **btcwheel**
3. Deploy

---

## 📸 Screenshot di Riferimento

### Come Controllare Repository:
```
Vercel Dashboard
└── [Tuo Progetto]
    └── Settings
        └── Git
            └── Repository: <devi vedere "btcwheel" qui>
```

### Come Controllare Build Settings:
```
Vercel Dashboard
└── [Tuo Progetto]
    └── Settings
        └── General
            └── Build & Development Settings
                ├── Framework Preset: Vite
                ├── Build Command: npm run build
                ├── Output Directory: dist
                └── Install Command: npm install
```

---

## ✅ Checklist Finale

- [ ] Repository Git collegato è **btcwheel** (non finanzacreativa)
- [ ] Root Directory è **./** o vuoto
- [ ] Framework Preset è **Vite**
- [ ] Output Directory è **dist**
- [ ] NON ci sono domini `finanzacreativa.live` collegati
- [ ] NON ci sono redirect a finanzacreativa
- [ ] NON ci sono variabili d'ambiente che puntano a finanzacreativa
- [ ] L'ultimo deployment ha source **btcwheel**

---

## 🎯 Se Tutto È Corretto Ma Non Funziona

### Prova queste soluzioni:

#### 1. **Force Redeploy**
```
Deployments → [Latest] → ⋮ → Redeploy
```

#### 2. **Clear Build Cache**
```
Settings → General → Build & Development Settings
→ "Clear Cache" (se disponibile)
→ Redeploy
```

#### 3. **Delete e Rideploy**
```
Deployments → [Latest] → ⋮ → Delete
→ Vai su Overview → Redeploy (dall'ultimo commit Git)
```

#### 4. **Crea Nuovo Progetto** (ultima risorsa)
Segui `/DEPLOY_VERCEL_NUOVO.md`

---

## 🆘 Contatti Vercel Support

Se niente funziona:
- https://vercel.com/support
- Spiega: "Il mio progetto btcwheel carica contenuti di un altro progetto (finanzacreativa.live)"

---

**Data:** 2026-01-05
**Status:** 🔍 Diagnostic Guide
**Tempo:** ⏱️ 5-10 minuti per controllo completo
