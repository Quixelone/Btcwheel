# 🌐 Custom Domain Setup

Guida per configurare un dominio personalizzato su Vercel.

**Tempo:** 10-15 minuti  
**Requisiti:** Dominio registrato (da GoDaddy, Namecheap, Cloudflare, etc.)

---

## 📋 Overview

Invece di `your-app.vercel.app`, usa il tuo dominio:
- `btcwheel.academy`
- `www.btcwheel.academy`
- `app.yourdomain.com`

---

## 🚀 Setup su Vercel

### Step 1: Apri Vercel Dashboard

1. Vai su https://vercel.com/dashboard
2. Seleziona il tuo progetto
3. Settings → Domains

### Step 2: Aggiungi Dominio

1. Nella sezione "Domains", c'è un input field
2. Inserisci il tuo dominio:
   ```
   btcwheel.academy
   ```
3. Click "Add"

### Step 3: Verifica Status

Vercel mostrerà uno di questi stati:

**Caso A: Domain già verificato**
- ✅ Se il dominio è registrato con Vercel DNS
- Setup automatico completato

**Caso B: Configurazione DNS richiesta**
- ⚠️ Se il dominio usa altri DNS provider
- Vercel mostra record DNS da configurare

---

## 🔧 Configurazione DNS

### Opzione 1: A Record (Dominio Root)

Per `btcwheel.academy` (senza www):

**Record da aggiungere nel tuo DNS provider:**

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto (or 3600)
```

### Opzione 2: CNAME Record (Subdomain)

Per `www.btcwheel.academy` o `app.btcwheel.academy`:

**Record da aggiungere:**

```
Type: CNAME
Name: www (o app)
Value: cname.vercel-dns.com
TTL: Auto (or 3600)
```

### Opzione 3: Setup Completo (Root + WWW)

Aggiungi entrambi:

**A Record (Root):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (WWW):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Vercel redirecterà automaticamente www → non-www (o viceversa).

---

## 🌐 Provider-Specific Guides

### GoDaddy

1. Login su GoDaddy
2. My Products → Domain → Manage DNS
3. Records → Add
4. Aggiungi A/CNAME record (vedi sopra)
5. Save

**Propagazione:** 10-30 minuti

### Namecheap

1. Login su Namecheap
2. Domain List → Manage → Advanced DNS
3. Add New Record
4. Aggiungi A/CNAME record
5. Save

**Propagazione:** 5-15 minuti

### Cloudflare

1. Login su Cloudflare
2. Select Domain → DNS
3. Add Record
4. Aggiungi A/CNAME record
5. **Importante:** Proxy status = DNS only (grey cloud)
6. Save

**Propagazione:** 1-5 minuti

### Google Domains

1. Login su Google Domains
2. My Domains → Manage → DNS
3. Custom records → Manage custom records
4. Add record (A o CNAME)
5. Save

**Propagazione:** 5-20 minuti

---

## ⏱️ Propagazione DNS

### Verifica Status

Dopo aver configurato DNS:

```bash
# Check A record
dig btcwheel.academy

# Check CNAME record
dig www.btcwheel.academy

# O usa online tool:
# https://dnschecker.org/
```

**Tempo propagazione tipico:**
- Cloudflare: 1-5 minuti ⚡
- Namecheap: 5-15 minuti
- GoDaddy: 10-30 minuti
- Altri: Fino a 48 ore (raro)

### Durante la Propagazione

- ⏳ Alcuni utenti vedranno nuovo dominio
- ⏳ Altri ancora il vecchio
- ✅ Normale! Aspetta che si completi

---

## 🔐 SSL Certificate

### Automatic SSL (Free)

Vercel genera automaticamente certificato SSL gratuito:

1. Dominio aggiunto a Vercel
2. DNS configurato correttamente
3. Aspetta 5-10 minuti
4. ✅ HTTPS attivo automaticamente!

**Certificate provider:** Let's Encrypt

### Verifica SSL

```bash
# Check SSL
curl -I https://btcwheel.academy

# Dovrebbe ritornare:
# HTTP/2 200
# ✅ No certificate errors
```

---

## 🔄 Redirect Setup

### WWW → Non-WWW

Vercel gestisce automaticamente se aggiungi entrambi:

```
btcwheel.academy (primary)
www.btcwheel.academy → redirects to primary
```

### Non-WWW → WWW

Se preferisci WWW come primary:

1. Vercel Dashboard → Project Settings
2. Domains → click sui 3 puntini accanto a `www.domain.com`
3. "Set as Primary Domain"
4. `domain.com` redirecterà a `www.domain.com`

---

## 📧 Email Setup (Optional)

### Email Forwarding

Se vuoi email `hello@btcwheel.academy`:

**Opzione A: ImprovMX (Free)**
1. https://improvmx.com/
2. Add domain
3. Setup DNS (MX records)
4. Forward to Gmail/etc

**Opzione B: Cloudflare Email Routing (Free)**
1. Cloudflare → Email → Email Routing
2. Enable
3. Add routing rules
4. Forward to your email

**Opzione C: Google Workspace ($6/mo)**
- Professional email
- Gmail interface
- Calendario, Drive, etc.

---

## 🔄 Update Supabase URLs

Dopo aver configurato custom domain:

### Step 1: Update Authentication URLs

1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL:**
   ```
   https://btcwheel.academy
   ```

3. **Redirect URLs:** Aggiungi:
   ```
   https://btcwheel.academy
   https://btcwheel.academy/auth/callback
   ```

4. **Rimuovi** vecchio URL Vercel (opzionale)

5. Save

### Step 2: Update Google OAuth

Se usi Google OAuth:

1. Google Cloud Console → Credentials
2. OAuth Client → Authorized redirect URIs
3. Aggiungi:
   ```
   https://rsmvjsokqolxgczclqjv.supabase.co/auth/v1/callback
   ```
   
   (Questo URL Supabase resta invariato)

4. Save

### Step 3: Test

1. Apri `https://btcwheel.academy`
2. Test login/signup
3. Verifica redirect funzionano
4. ✅ Tutto dovrebbe funzionare!

---

## 🐛 Troubleshooting

### Domain non si connette dopo 48 ore

**Causa:** DNS misconfigured

**Fix:**
```bash
# Check DNS
dig btcwheel.academy

# Dovrebbe mostrare:
# A record: 76.76.21.21
```

Se diverso:
1. Verifica DNS settings nel provider
2. Aspetta 5 min e riprova
3. Clear browser cache

### SSL Certificate error

**Causa:** Propagazione incompleta

**Fix:**
1. Aspetta che DNS propaghi completamente
2. Vercel Dashboard → Domains → Refresh SSL
3. Aspetta 5-10 minuti
4. Hard refresh browser (Ctrl+Shift+R)

### "This site can't be reached"

**Causa:** DNS non propagato o sbagliato

**Fix:**
```bash
# Check DNS propagation
https://dnschecker.org/

# Se non propagato:
# - Aspetta più tempo
# - Verifica records DNS corretti
```

### Auth redirect non funziona

**Causa:** Supabase URLs non aggiornati

**Fix:**
1. Supabase → Authentication → URL Configuration
2. Aggiungi custom domain ai Redirect URLs
3. Save
4. Riprova login

---

## 📊 Domain Analytics

### Vercel Analytics

Dopo setup custom domain:

1. Vercel Dashboard → Analytics
2. Vedrai traffico per custom domain
3. Performance metrics
4. Real-time data

### Google Analytics (Optional)

Per analytics più dettagliato:

1. Crea property Google Analytics
2. Aggiungi tracking code in `index.html`:
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 💰 Costs

**Domain Registration:**
- .com: $10-15/year
- .academy: $20-30/year
- .app: $12-15/year

**Vercel Hosting:**
- Hobby: Free (unlimited projects)
- Pro: $20/month (se serve)

**SSL Certificate:**
- Free (Let's Encrypt via Vercel)

**Total:** ~$10-30/year (solo domain)

---

## 📚 Risorse

- [Vercel Domains Docs](https://vercel.com/docs/concepts/projects/domains)
- [DNS Checker](https://dnschecker.org/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)
- [Let's Encrypt](https://letsencrypt.org/)

---

<div align="center">

**Custom Domain Setup Completo!** 🌐

[⬆ Back to top](#-custom-domain-setup)

</div>
