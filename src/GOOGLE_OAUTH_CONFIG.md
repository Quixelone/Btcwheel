# ⚡ Configurazione Rapida Google OAuth

**Per progetto btcwheel - Project ID: tzorfzsdhyceyumhlfdp**

---

## 📋 URLs Pre-Configurati

### Callback URL Supabase (PRINCIPALE)
```
https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
```

### Redirect URIs da aggiungere a Google Cloud Console

**Development + Production:**
```
http://localhost:5173
http://localhost:5173/auth/callback
https://whellstrategy.figma.site
https://whellstrategy.figma.site/auth/callback
https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
```

**Se deployato su Vercel (sostituisci con tuo URL):**
```
https://tuoapp.vercel.app
https://tuoapp.vercel.app/auth/callback
```

---

## 🚀 Setup in 5 Minuti

### Step 1: Google Cloud Console

1. **Vai su:** [console.cloud.google.com](https://console.cloud.google.com)

2. **Crea progetto:** `btcwheel-oauth`

3. **OAuth Consent Screen:**
   - User type: External
   - App name: btcwheel
   - Support email: [tua email]
   - Test user: [tua email]

4. **Crea OAuth Client ID:**
   - Type: Web application
   - Name: btcwheel Web Client
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://whellstrategy.figma.site
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:5173
   http://localhost:5173/auth/callback
   https://whellstrategy.figma.site
   https://whellstrategy.figma.site/auth/callback
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```

5. **Copia credenziali:**
   - Client ID
   - Client Secret

---

### Step 2: Supabase Dashboard

1. **Vai su:** [app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers](https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers)

2. **Trova "Google" e abilita:**
   - Toggle ON
   - Incolla Client ID
   - Incolla Client Secret
   - Click "Save"

3. **Verifica Callback URL mostrato:**
   ```
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```
   
   ✅ Questo deve matchare esattamente con quello in Google Cloud Console!

---

### Step 3: Test

1. **Apri app locale:**
   ```bash
   npm run dev
   ```

2. **Vai su:** http://localhost:5173

3. **Click "Login con Google"**

4. **Seleziona account e autorizza**

5. **✅ Dovresti essere loggato!**

---

## 🐛 Troubleshooting Veloce

### Errore 403?
👉 Segui guida completa: [GOOGLE_OAUTH_FIX_403.md](./GOOGLE_OAUTH_FIX_403.md)

**Quick fixes:**
- [ ] Stai usando Gmail personale (non aziendale)?
- [ ] Hai configurato OAuth Consent Screen?
- [ ] Hai aggiunto tua email come test user?

---

### Errore redirect_uri_mismatch?

**Verifica che in Google Cloud Console ci sia ESATTAMENTE:**
```
https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
```

**No trailing slash! No http! No extra caratteri!**

---

### Login non funziona?

**Checklist:**
- [ ] Client ID e Secret copiati correttamente?
- [ ] Salvato su Supabase?
- [ ] Aspettato 5 minuti dopo modifiche?
- [ ] Refresh cache browser (Ctrl+Shift+R)?

---

## 📊 Checklist Completa

**Google Cloud Console:**
- [ ] Progetto creato: `btcwheel-oauth`
- [ ] OAuth Consent Screen configurato (External)
- [ ] Test user aggiunto (tua email)
- [ ] OAuth Client creato (Web application)
- [ ] Redirect URIs aggiunti:
  - [ ] http://localhost:5173
  - [ ] http://localhost:5173/auth/callback
  - [ ] https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
- [ ] Client ID salvato
- [ ] Client Secret salvato

**Supabase Dashboard:**
- [ ] Google provider abilitato (toggle ON)
- [ ] Client ID incollato
- [ ] Client Secret incollato
- [ ] Configurazione salvata
- [ ] Callback URL verificato

**Test:**
- [ ] App locale funziona (npm run dev)
- [ ] Click "Login con Google"
- [ ] Redirect a Google OK
- [ ] Autorizzazione OK
- [ ] Redirect indietro OK
- [ ] ✅ User loggato!

---

## 🎯 URLs Utili

### Google Cloud
- **Console:** [console.cloud.google.com](https://console.cloud.google.com)
- **OAuth Consent:** [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)
- **Credentials:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

### Supabase
- **Dashboard:** [app.supabase.com](https://app.supabase.com)
- **Auth Providers (Diretta):** [app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers](https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers)

### Documentazione
- **Setup Completo:** [docs/setup/GOOGLE_OAUTH_SETUP.md](./docs/setup/GOOGLE_OAUTH_SETUP.md)
- **Fix Errore 403:** [GOOGLE_OAUTH_FIX_403.md](./GOOGLE_OAUTH_FIX_403.md)

---

## 📝 Note Importanti

### Sicurezza
- ✅ Client ID può essere pubblico
- ✅ Client Secret deve restare segreto
- ✅ Mai committare Client Secret su Git
- ✅ Usa environment variables

### Testing Mode vs Production
**Testing Mode (Default):**
- Max 100 test users
- Devi aggiungere ogni email manualmente
- Va bene per sviluppo

**Production Mode:**
- TUTTI possono loggarsi
- Richiede verifica Google (1-3 giorni)
- Necessario per release pubblica

### Per Passare in Production
1. Google Cloud Console → OAuth consent screen
2. Click **"PUBLISH APP"**
3. Compila form verifica
4. Attendi approvazione Google

---

## ✨ Dopo Setup

### Environment Variables (.env)
```env
# Già configurate
VITE_SUPABASE_URL=https://tzorfzsdhyceyumhlfdp.supabase.co
VITE_SUPABASE_ANON_KEY=[il tuo anon key]

# Non serve aggiungere nulla per Google OAuth!
# Configurato direttamente su Supabase Dashboard
```

### Deploy Vercel

Quando deployi su Vercel:

1. **Aggiungi redirect URIs su Google:**
   ```
   https://tuoapp.vercel.app
   https://tuoapp.vercel.app/auth/callback
   ```

2. **Verifica environment variables su Vercel:**
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

3. **Redeploy**

4. **Test login su production URL**

---

## 💡 Tips

### Debug Console Browser
```javascript
// In browser console, per vedere errori OAuth:
localStorage.clear() // Reset stato auth
// Poi riprova login e guarda console per errori
```

### Test Multipli Account
- Usa finestra incognito per testare diversi account
- Ogni test user deve essere aggiunto manualmente (Testing mode)

### Sicurezza Redirect URIs
- Google valida redirect URIs ESATTAMENTE
- Case-sensitive
- Trailing slash conta
- http vs https conta
- Porta (:5173) conta

---

## 🎉 Success!

Quando tutto funziona vedrai:

```
1. User click "Login con Google"
2. Redirect a Google OAuth
3. User seleziona account
4. User autorizza app
5. Redirect a Supabase callback
6. Supabase crea sessione
7. Redirect a app
8. ✅ User loggato nella dashboard!
```

---

**Setup Completato!** 🚀

Hai altre domande? Controlla:
- [GOOGLE_OAUTH_FIX_403.md](./GOOGLE_OAUTH_FIX_403.md) - Fix errori
- [docs/setup/GOOGLE_OAUTH_SETUP.md](./docs/setup/GOOGLE_OAUTH_SETUP.md) - Setup dettagliato

---

**Creato:** 2024-12-12  
**Project:** btcwheel v1.0.1  
**Supabase Project ID:** tzorfzsdhyceyumhlfdp
