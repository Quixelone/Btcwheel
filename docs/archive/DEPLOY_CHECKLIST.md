# ✅ VERCEL DEPLOYMENT CHECKLIST - btcwheel

## 📋 PRE-DEPLOYMENT

### Local Files ✅
```
✅ .gitignore created
✅ .env.example created
✅ .node-version (Node 20)
✅ .nvmrc (Node 20)
✅ package.json (Vite 6, @types/node)
✅ vercel.json (explicit config)
✅ src/main.tsx (import with .tsx extension)
```

---

## 🚀 DEPLOYMENT FLOW

### Step 1: Export da Figma Make

```
1. Figma Make → File → Export Project
2. Download ZIP completo
3. Estrai in: C:\Users\Quixel\Desktop\btcwheel-latest
```

### Step 2: GitHub Sync

**Opzione A - Re-publish (SAFE):**
```
1. GitHub Desktop → Remove current repository
2. File → Add Local Repository
3. Seleziona: C:\Users\Quixel\Desktop\btcwheel-latest
4. Create repository (se necessario)
5. Publish repository
   - Name: btcwheel
   - Private: ✅ (o Public)
6. Push
```

**Opzione B - Update existing:**
```
1. Copia file modificati nella cartella repository esistente
2. GitHub Desktop → Vedi changes
3. Commit message: "Fix: Vercel build with Vite 6 and Node 20"
4. Commit to main
5. Push origin
```

### Step 3: Vercel Auto-Deploy

```
⏰ Aspetta 2-3 minuti

📧 Email 1: "Deployment Started"
🔨 Building...
📧 Email 2: "Deployment Ready" ✅
```

### Step 4: Verify Deployment

```
1. Open: https://btcwheel.vercel.app
2. Check landing page loads
3. Click "Inizia" → Login page
4. No errors in console (F12)
```

---

## 🔧 VERCEL SETTINGS VERIFICATION

### Before First Deploy

**Vercel Dashboard → Settings → General:**

```
Framework Preset:         Vite ✅
Build Command:            (leave empty - uses vercel.json)
Output Directory:         dist ✅
Install Command:          npm install ✅
Node.js Version:          20.x ✅
```

### Environment Variables

**Vercel Dashboard → Settings → Environment Variables:**

```
Add these 3 variables:

1. VITE_SUPABASE_URL
   Value: https://xxx.supabase.co
   Environments: Production, Preview, Development ✅

2. VITE_SUPABASE_ANON_KEY
   Value: eyJhbG...
   Environments: Production, Preview, Development ✅

3. OPENAI_API_KEY
   Value: sk-proj-...
   Environments: Production, Preview, Development ✅
```

**⚠️ Dopo aver aggiunto variabili:**
- Deployments → Redeploy

---

## 🐛 TROUBLESHOOTING

### Build Failed?

#### Error: "Cannot resolve /src/main.tsx"

**Fix 1:** Verifica struttura file in GitHub:
```
/index.html        ✅ Must exist in root
/src/main.tsx      ✅ Must exist
/App.tsx           ✅ Must exist in root
```

**Fix 2:** GitHub Desktop → Show in Explorer → Verify all files are there

**Fix 3:** Re-export da Figma Make e re-push

---

#### Error: "Type error in vite.config.ts"

**Fix:** Verifica package.json includes:
```json
"devDependencies": {
  "@types/node": "^20.11.0"
}
```

Se manca, re-export da Figma Make.

---

#### Error: "Module not found: motion"

**Fix:** Missing dependencies

```bash
# In Vercel Dashboard
Settings → General → Install Command
npm ci --legacy-peer-deps
```

---

### Build Success but White Screen?

**Causa:** Missing environment variables

**Fix:**
1. Vercel → Settings → Environment Variables
2. Add all 3 variables (see above)
3. Deployments → Redeploy
4. Wait 2-3 minutes
5. Refresh browser

---

### Build Success but Login Fails?

**Causa 1:** Supabase URL configurato male

```
Settings → Environment Variables
VITE_SUPABASE_URL must start with https://
```

**Causa 2:** Google OAuth non configurato

Follow: `/GOOGLE_OAUTH_CONFIG.md`

---

## 🌐 CUSTOM DOMAIN (Post-Deploy)

### After Successful Deployment

**1. Add Domain in Vercel:**
```
Vercel → Settings → Domains
Add: btcwheel.io
```

**2. Configure DNS (Namecheap):**
```
Type:    A Record
Host:    @
Value:   76.76.21.21 (Vercel IP)

Type:    CNAME
Host:    www
Value:   cname.vercel-dns.com
```

**3. Wait & Verify:**
```
⏰ Wait: 30-60 minutes
Test: https://btcwheel.io
```

---

## 📊 BUILD METRICS

### Normal Build Times:
```
Dependencies:     30-45 sec
TypeScript Check: 10-15 sec
Vite Build:       40-60 sec
Total:           ~90-120 sec
```

### File Sizes (expected):
```
dist/index.html:           ~3 KB
dist/assets/index.[hash].js:  ~500-800 KB (gzipped: ~150 KB)
dist/assets/index.[hash].css: ~50-80 KB (gzipped: ~10 KB)
```

---

## 🎯 SUCCESS CRITERIA

```
✅ Build completes in < 3 minutes
✅ No TypeScript errors
✅ No console errors in production
✅ Landing page loads in < 2 seconds
✅ Images load correctly
✅ Login flow works
✅ Navigation works
✅ Mobile responsive
```

---

## 📞 EMERGENCY CONTACTS

### Vercel Support
- Dashboard: https://vercel.com/support
- Docs: https://vercel.com/docs

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs

---

## 🔄 REDEPLOY TRIGGERS

Vercel auto-redeploys when:
- ✅ Push to `main` branch
- ✅ Merge pull request
- ✅ Manual redeploy from dashboard

**Manual Redeploy:**
```
Deployments → Latest → Menu (⋮) → Redeploy
```

---

## 📝 NOTES

- **Node Version:** Locked to 20 (`.node-version`, `.nvmrc`)
- **Vite Version:** Upgraded to 6.0.0 for better compatibility
- **Build Command:** Simplified to `vite build` (no tsc)
- **Framework:** Explicitly set to Vite in `vercel.json`

---

**Status:** ✅ Ready to Deploy  
**Last Updated:** Dicembre 2024  
**Version:** 2.0
