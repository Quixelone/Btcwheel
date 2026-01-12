# 🚀 Guida Deploy Vercel - btcwheel.io

Guida completa per deployare btcwheel su Vercel con dominio personalizzato.

---

## ✅ Checklist Pre-Deploy

```
□ Codice esportato da Figma Make
□ Repository GitHub creato
□ Account Vercel attivo
□ Dominio btcwheel.io registrato su Namecheap
□ Environment variables pronte (Supabase, OpenAI)
```

---

## 🔧 Step 1: Preparazione Repository

### File Essenziali Già Presenti

- ✅ `vercel.json` - Configurazione Vercel
- ✅ `vite.config.ts` - Build configuration
- ✅ `package.json` - Dependencies
- ✅ `.gitignore` - File da ignorare
- ✅ `.env.example` - Template variabili

### Crea File `.env` Locale

```bash
# Copia il template
cp .env.example .env

# Modifica con i tuoi valori
# NON committare questo file!
```

---

## 📦 Step 2: Push su GitHub

### Con GitHub Desktop (Facile)

1. Apri GitHub Desktop
2. File → Add Local Repository
3. Seleziona cartella btcwheel
4. Commit to main: "Initial commit"
5. Publish repository
6. Push origin

### Con Git CLI

```bash
# Nella cartella btcwheel
git init
git add .
git commit -m "Initial commit - btcwheel app"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/btcwheel.git
git push -u origin main
```

---

## 🚀 Step 3: Import su Vercel

### 1. Login Vercel

- Vai su https://vercel.com
- Login with GitHub

### 2. Import Project

1. Click **Add New** → **Project**
2. Import Git Repository
3. Seleziona `btcwheel`
4. Click **Import**

### 3. Configure Project

**Framework Preset:** Vite (auto-rilevato)

**Build & Output Settings:**
```
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
Development Command:  npm run dev
```

### 4. Environment Variables

Click **Add Environment Variable** per ognuna:

```env
Name:  VITE_SUPABASE_URL
Value: https://xxx.supabase.co

Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Name:  OPENAI_API_KEY
Value: sk-proj-xxx...
```

⚠️ **IMPORTANTE:** Le variabili per frontend devono iniziare con `VITE_`

### 5. Deploy

- Click **Deploy**
- Aspetta 1-3 minuti
- ✅ Live su: `btcwheel.vercel.app`

---

## 🌐 Step 4: Custom Domain btcwheel.io

### In Vercel

1. **Settings** → **Domains**
2. **Add Domain**
3. Inserisci: `btcwheel.io`
4. Click **Add**

Vercel ti mostra:

```
A Record:
Type:  A
Name:  @
Value: 76.76.19.142

CNAME Record:
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
```

### In Namecheap

1. **Login** → Domain List
2. **btcwheel.io** → Manage
3. **Advanced DNS**

#### Aggiungi/Modifica Record Web:

```
Type:   A Record
Host:   @
Value:  76.76.19.142  (da Vercel)
TTL:    Automatic

Type:   CNAME Record
Host:   www
Value:  cname.vercel-dns.com  (da Vercel)
TTL:    Automatic
```

#### 🚨 MANTIENI Record Email:

```
Type:     MX Record
Host:     @
Value:    mx1.privateemail.com
Priority: 10

Type:     MX Record
Host:     @
Value:    mx2.privateemail.com
Priority: 10

Type:  TXT Record
Host:  @
Value: v=spf1 include:spf.privateemail.com ~all
```

4. **Save All Changes**

### Verifica

1. Aspetta 30-60 min (propagazione DNS)
2. Test: https://dnschecker.org → `btcwheel.io`
3. Vercel verifica automaticamente
4. SSL generato automaticamente

### Test Finale

- ✅ https://btcwheel.io
- ✅ https://www.btcwheel.io
- ✅ Auto-redirect www → non-www (o viceversa)

---

## 🔄 Step 5: Deploy Automatico (CI/CD)

### Configurazione Automatica

Vercel monitora il tuo repository GitHub:

```
Git Push → Vercel Auto-Deploy → Live in 1-2 min
```

### Workflow

```bash
# 1. Modifica codice in locale
code .

# 2. Test locale
npm run dev

# 3. Commit e push
git add .
git commit -m "Update: nuova feature"
git push

# 4. Vercel deploya automaticamente
# 5. Notifica email quando completato
# 6. Live su btcwheel.io in 1-2 min
```

### Preview Deployments

Ogni **Pull Request** crea un deploy preview:

- URL unico: `btcwheel-pr-123.vercel.app`
- Test prima del merge
- Nessun impatto su production

---

## 📊 Monitoring & Analytics

### Vercel Dashboard

- **Deployments:** Storico deploy
- **Analytics:** Traffico, performance
- **Logs:** Runtime logs
- **Functions:** Edge functions usage

### Real User Monitoring

```typescript
// Già configurato in vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-DNS-Prefetch-Control",
          "value": "on"
        }
      ]
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Build Failed

**Errore:** `Failed to resolve /src/main.tsx`

**Soluzione:**
```bash
# Verifica che esista
ls src/main.tsx

# Verifica vite.config.ts
cat vite.config.ts
```

**Errore:** `Module not found: path`

**Soluzione:** Già fixato in `vite.config.ts` con:
```typescript
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

### DNS Non Si Propaga

```bash
# Check propagazione
nslookup btcwheel.io
# oppure
https://dnschecker.org

# Aspetta 1-2 ore
# Prova browser incognito
# Hard refresh: CTRL+F5
```

### SSL Certificate Error

1. Vercel genera SSL automaticamente
2. Aspetta 10-15 min dopo verifica DNS
3. Se persiste: Settings → Domains → Regenerate Certificate

### Environment Variables Non Funzionano

1. Devono iniziare con `VITE_` per frontend
2. Redeploy dopo aggiunte variabili
3. Verifica: Settings → Environment Variables

---

## 🎯 Performance Optimization

### Già Implementato

- ✅ **Code splitting** (vite.config.ts)
- ✅ **Asset caching** (vercel.json)
- ✅ **Service Worker** (PWA)
- ✅ **Image optimization** (Vercel automatico)
- ✅ **Edge Network** (Vercel CDN globale)

### Score Obiettivo

```
Lighthouse Score:
Performance:    95+
Accessibility:  100
Best Practices: 100
SEO:            100
PWA:            Installable
```

---

## 📱 Post-Deploy Checklist

```
□ Sito carica su btcwheel.io
□ SSL funzionante (https)
□ Login Supabase funziona
□ Google OAuth funziona (se configurato)
□ Dashboard mostra nuovo design
□ AI tutor risponde
□ Quiz dinamici funzionano
□ PWA installabile su mobile
□ Email funzionano (test su mxtoolbox.com)
□ Analytics attivati
□ Service Worker registrato
□ Performance score > 90
```

---

## 🔐 Security Best Practices

### ✅ Già Implementate

- Environment variables sicure
- HTTPS enforced
- Supabase RLS policies
- CORS headers configurati
- CSP headers (se necessario)

### 🚨 NON Fare MAI

- ❌ Committare `.env` su Git
- ❌ Esporre chiavi API nel frontend
- ❌ Disabilitare HTTPS
- ❌ Usare Service Role Key nel client

---

## 📚 Risorse Utili

- 📘 [Vercel Docs](https://vercel.com/docs)
- 🔧 [Vite Docs](https://vitejs.dev)
- 🗄️ [Supabase Docs](https://supabase.com/docs)
- 🌐 [DNS Checker](https://dnschecker.org)
- 📧 [MX Toolbox](https://mxtoolbox.com)

---

## 🎉 Deploy Completato!

Il tuo sito btcwheel è ora live su:

🌐 **https://btcwheel.io**

Prossimi step:
- Configura Google Analytics
- Setup email transazionali
- Monitora performance
- Raccogli feedback utenti

---

**Creato per btcwheel** | Ultima modifica: Dicembre 2024
