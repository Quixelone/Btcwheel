# 🚀 Deploy Nuovo Progetto Vercel per btcwheel

## Problema
Il deployment attuale carica finanzacreativa.live invece di btcwheel.

---

## ✅ SOLUZIONE: Deploy da Zero

### Metodo 1: Vercel Dashboard (Più Facile)

#### Passo 1: Elimina Progetto Vecchio (Opzionale)
1. Vai su https://vercel.com/dashboard
2. Trova il progetto btcwheel attuale
3. Settings → **Delete Project** (solo se vuoi rimuoverlo)

#### Passo 2: Nuovo Import
1. Vai su https://vercel.com/new
2. **Import Git Repository**
3. **IMPORTANTE:** Assicurati di selezionare il repository giusto di btcwheel
   - NON selezionare il repo di finanzacreativa
   - Verifica l'URL del repo Git

#### Passo 3: Configure Project
```
Project Name: btcwheel
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Passo 4: Environment Variables (Opzionali)
Se servono (per Figma Make di solito NO):
```
SUPABASE_URL = https://tzorfzsdhyceyumhlfdp.supabase.co
SUPABASE_ANON_KEY = eyJhbGc... (la tua key)
```

#### Passo 5: Deploy
1. Clicca **Deploy**
2. Aspetta 2-3 minuti
3. ✅ Nuovo URL: `btcwheel-xxx.vercel.app`

#### Passo 6: Test
1. Visita il nuovo URL
2. Apri Developer Tools (F12)
3. Controlla che sia btcwheel (non finanzacreativa)
4. Test login

---

### Metodo 2: Vercel CLI (Avanzato)

#### Passo 1: Installa Vercel CLI
```bash
npm install -g vercel
```

#### Passo 2: Login
```bash
vercel login
```

#### Passo 3: Deploy
```bash
cd /path/to/btcwheel
vercel
```

Rispondi alle domande:
```
? Set up and deploy "~/btcwheel"? [Y/n] y
? Which scope? <il-tuo-account>
? Link to existing project? [y/N] n
? What's your project's name? btcwheel
? In which directory is your code located? ./
```

Auto-detected settings:
```
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
```

#### Passo 4: Production Deploy
```bash
vercel --prod
```

✅ Ti darà il nuovo URL di produzione

---

## 🔍 Troubleshooting

### Problema: Ancora carica finanzacreativa

**Causa:** Stai usando il repository Git sbagliato

**Soluzione:**
1. Controlla Settings → Git Repository
2. Assicurati che punti a `<tuo-account>/btcwheel`
3. NON `<tuo-account>/finanzacreativa`

### Problema: Build Error

**Errore Comune:** `Cannot find module`

**Soluzione:**
```bash
# In locale, testa il build
npm run build

# Se funziona, commit e push
git add .
git commit -m "Fix build"
git push
```

Vercel rideployerà automaticamente.

### Problema: Redirect 404

**Causa:** Output directory sbagliata

**Soluzione:**
1. Settings → General
2. Output Directory: `dist` (non `build`)
3. Rideploy

---

## 📋 Checklist

- [ ] Vai su vercel.com/new
- [ ] Import repository GIUSTO (btcwheel, non finanzacreativa)
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Deploy
- [ ] Test nuovo URL
- [ ] Verifica che sia btcwheel (non finanzacreativa)
- [ ] Test login
- [ ] Aggiorna Site URL su Supabase con nuovo URL Vercel

---

## ✅ Risultato Atteso

Dopo il deploy:
✅ Nuovo URL Vercel: `btcwheel-xxx.vercel.app`
✅ Carica btcwheel (non finanzacreativa)
✅ Build successful
✅ Login funzionante

---

## 🎯 Prossimi Passi (Dopo Deploy)

1. **Aggiorna Supabase Site URL:**
   - Vai su Supabase Dashboard
   - Authentication → URL Configuration
   - Site URL: `https://btcwheel-xxx.vercel.app`
   - Redirect URLs: Aggiungi il nuovo URL

2. **Domini Custom (Opzionale):**
   - Settings → Domains
   - Add: `btcwheel.io` (se hai il dominio)

3. **Test Completo:**
   - [ ] Landing page
   - [ ] Login email/password
   - [ ] Google OAuth
   - [ ] Onboarding
   - [ ] App principale

---

**Status:** 🟢 Ready to Deploy
**Tempo stimato:** ⏱️ 10 minuti
**Difficoltà:** 🟢 Facile
