# 🚨 FIX URGENTE: Google OAuth per whellstrategy.figma.site

## ❌ Problema che hai ora:

Quando fai login con Google:
1. ✅ Redirect a Google funziona
2. ✅ Autorizzi l'app
3. ✅ Torni a whellstrategy.figma.site
4. ✅ Sessione viene creata
5. ❌ **Sessione viene invalidata subito dopo**
6. ❌ Torni alla landing in loop

**Causa:** Google OAuth non configurato per il dominio `whellstrategy.figma.site`

---

## ✅ SOLUZIONE (15 minuti):

### 🎯 STEP 1: Configura Google Cloud Console

1. **Vai su:** https://console.cloud.google.com/apis/credentials

2. **Trova il tuo OAuth Client** (probabilmente si chiama "btcwheel Web Client" o simile)
   - Se non esiste, creane uno nuovo (vedi sotto)

3. **Clicca sull'OAuth Client per modificarlo**

4. **Sezione "Authorized JavaScript origins"** - Aggiungi:
   ```
   https://whellstrategy.figma.site
   ```

5. **Sezione "Authorized redirect URIs"** - Aggiungi TUTTE queste (una per riga):
   ```
   https://whellstrategy.figma.site
   https://whellstrategy.figma.site/auth/callback
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```
   
   > ⚠️ **LA PIÙ IMPORTANTE È LA TERZA** (quella con supabase.co)!

6. **Clicca "SAVE"**

7. **Aspetta 2-3 minuti** per propagazione modifiche

---

### 🎯 STEP 2: Verifica Supabase (QUICK CHECK)

1. **Vai su:** https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers

2. **Trova "Google" nella lista**

3. **Verifica che sia abilitato (toggle verde)**

4. **Se NON è abilitato:**
   - Abilitalo
   - Inserisci Client ID (da Google Cloud Console)
   - Inserisci Client Secret (da Google Cloud Console)
   - Clicca "Save"

5. **Se È GIÀ abilitato:** Salta questo step, è già configurato ✅

---

### 🎯 STEP 3: Verifica Site URL Supabase

1. **Vai su:** https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/url-configuration

2. **Verifica che Site URL sia:**
   ```
   https://whellstrategy.figma.site
   ```

3. **Verifica che Redirect URLs contenga:**
   ```
   https://whellstrategy.figma.site
   https://whellstrategy.figma.site/*
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```

4. **Se manca qualcosa, aggiungila e clicca "Save"**

---

### 🎯 STEP 4: TEST!

1. **Vai su:** https://whellstrategy.figma.site

2. **Pulisci cache browser:**
   - Premi `F12` (Developer Tools)
   - Tab `Console`
   - Scrivi: `localStorage.clear()`
   - Premi `Enter`
   - Chiudi Developer Tools

3. **Ricarica la pagina** (Ctrl+R o Cmd+R)

4. **Clicca "Inizia"**

5. **Clicca "Continua con Google"**

6. **Seleziona il tuo account Google**

7. **Autorizza l'app** (se richiesto)

8. ✅ **Dovresti tornare all'app LOGGATO!**

---

## 📋 Checklist Veloce

Prima di testare, verifica:

### Google Cloud Console
- [ ] OAuth Client esiste
- [ ] `https://whellstrategy.figma.site` in JavaScript origins
- [ ] `https://whellstrategy.figma.site` in Redirect URIs
- [ ] `https://whellstrategy.figma.site/auth/callback` in Redirect URIs
- [ ] `https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback` in Redirect URIs
- [ ] Salvato modifiche
- [ ] Aspettato 2-3 minuti

### Supabase Dashboard
- [ ] Google provider abilitato (toggle verde)
- [ ] Client ID configurato
- [ ] Client Secret configurato
- [ ] Site URL = `https://whellstrategy.figma.site`
- [ ] Redirect URLs contiene `whellstrategy.figma.site`

### Browser
- [ ] localStorage pulito
- [ ] Cache browser pulita (Ctrl+Shift+R)
- [ ] Finestra incognito (opzionale, ma consigliato)

---

## 🐛 Se NON Funziona Ancora

### Problema: "redirect_uri_mismatch"

**Screenshot dell'errore:** L'URL che Google ti mostra nell'errore

**Soluzione:**
1. Copia ESATTAMENTE l'URL dall'errore
2. Vai su Google Cloud Console → OAuth Client
3. Aggiungi ESATTAMENTE quell'URL ai Redirect URIs
4. Salva e riprova

---

### Problema: "Error 403: access_denied"

**Causa:** La tua email non è nella lista Test Users

**Soluzione:**
1. Google Cloud Console → OAuth consent screen
2. Sezione "Test users"
3. Clicca "Add users"
4. Aggiungi la tua email Gmail
5. Salva e riprova

> 📝 In Testing Mode, puoi avere max 100 test users

---

### Problema: Ancora loop sulla landing

**Causa 1:** Modifiche Google non ancora propagate

**Soluzione:**
- Aspetta 5 minuti dopo aver salvato su Google Cloud Console
- Poi riprova

**Causa 2:** localStorage contiene sessione vecchia

**Soluzione:**
```javascript
// In console (F12)
localStorage.clear();
sessionStorage.clear();
Object.keys(localStorage).forEach(key => {
  if (key.includes('sb-') || key.includes('supabase')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

**Causa 3:** Cookie di sessione corrotto

**Soluzione:**
1. Apri Developer Tools (F12)
2. Tab "Application" (o "Storage")
3. Sidebar → Cookies → `https://whellstrategy.figma.site`
4. Clicca destro → "Clear all cookies"
5. Ricarica pagina

---

## 📸 Screenshot di Riferimento

### Google Cloud Console - OAuth Client:

```
OAuth 2.0 Client IDs
├─ Client ID: [il tuo client id].apps.googleusercontent.com
│
└─ Edit OAuth Client:
   │
   ├─ Authorized JavaScript origins:
   │  ├─ http://localhost:5173
   │  └─ https://whellstrategy.figma.site ✅ IMPORTANTE
   │
   └─ Authorized redirect URIs:
      ├─ http://localhost:5173
      ├─ http://localhost:5173/auth/callback
      ├─ https://whellstrategy.figma.site ✅ IMPORTANTE
      ├─ https://whellstrategy.figma.site/auth/callback ✅ IMPORTANTE
      └─ https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback ✅ CRUCIALE
```

---

## 🔑 Se NON Hai Ancora Creato OAuth Client

### Crea da Zero:

1. **Google Cloud Console:** https://console.cloud.google.com

2. **Crea Progetto** (se non esiste):
   - Nome: `btcwheel-oauth`
   - Location: No organization

3. **OAuth Consent Screen:**
   - User type: **External**
   - App name: **btcwheel**
   - User support email: [tua email]
   - Developer contact: [tua email]
   - Scopes: Default (email, profile)
   - Test users: [tua email Gmail]
   - **Save and Continue**

4. **Credentials → Create Credentials → OAuth Client ID:**
   - Application type: **Web application**
   - Name: **btcwheel Web Client**
   
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     https://whellstrategy.figma.site
     ```
   
   - **Authorized redirect URIs:**
     ```
     http://localhost:5173
     http://localhost:5173/auth/callback
     https://whellstrategy.figma.site
     https://whellstrategy.figma.site/auth/callback
     https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
     ```
   
   - **Create**

5. **Copia credenziali:**
   - Client ID: `[qualcosa].apps.googleusercontent.com`
   - Client Secret: `[stringa random]`

6. **Vai su Supabase Dashboard:**
   - https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers
   - Trova "Google"
   - Abilita (toggle ON)
   - Incolla Client ID
   - Incolla Client Secret
   - **Save**

7. **Aspetta 2-3 minuti**

8. **Test login!**

---

## 🎯 URL Diretti (Copia e Incolla)

### Google Cloud
- **Console principale:** https://console.cloud.google.com
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent
- **Credentials (OAuth Clients):** https://console.cloud.google.com/apis/credentials

### Supabase
- **Dashboard principale:** https://app.supabase.com
- **Auth Providers:** https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/providers
- **URL Configuration:** https://app.supabase.com/project/tzorfzsdhyceyumhlfdp/auth/url-configuration

### App
- **Production:** https://whellstrategy.figma.site
- **Local dev:** http://localhost:5173

---

## ✅ Cosa Aspettarsi Dopo il Fix

### Flow Corretto:

```
1. User su whellstrategy.figma.site
2. Click "Continua con Google"
3. Redirect a Google OAuth
4. User seleziona account
5. User autorizza (se prima volta)
6. ✅ Redirect a Supabase callback
   └─ URL: https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback?code=...
7. ✅ Supabase crea sessione
8. ✅ Redirect a whellstrategy.figma.site#access_token=...
9. ✅ App detecta callback OAuth
10. ✅ User loggato → Naviga a home/onboarding
11. 🎉 SEI DENTRO L'APP!
```

### Logs Console Attesi:

```
✅ [useAuth] Checking Supabase session...
✅ [useAuth] Session found! User: tuaemail@gmail.com
✅ [useAuth] Access token: eyJhbGc...
✅ [App] OAuth callback detected with user - marking auth as seen
✅ [App] Redirecting to home after OAuth
```

---

## 💡 Note Importanti

### Email di Test
- Devi usare un account **Gmail personale** (non @workspace)
- L'email deve essere nella lista "Test users" su Google Cloud Console
- In Testing Mode puoi avere max 100 test users

### Propagazione Modifiche
- Google Cloud: **2-3 minuti**
- Supabase: **Immediato** (ma a volte cache del browser rallenta)
- Soluzione: Usa **finestra incognito** per test più rapidi

### Sicurezza
- ✅ Client ID può essere pubblico (è nel codice frontend)
- ❌ Client Secret DEVE restare segreto (solo su Supabase backend)
- ✅ Mai committare Client Secret su Git

### Testing vs Production
**Ora sei in Testing Mode:**
- Solo test users possono loggarsi
- No review Google necessaria
- Perfetto per sviluppo

**Per andare in Production:**
1. Google Cloud Console → OAuth consent screen
2. Click "PUBLISH APP"
3. Submit for verification
4. Attendi 1-3 giorni approvazione Google
5. Dopo approvazione: TUTTI possono loggarsi

---

## 🚀 Dopo che Funziona

### Per usare email/password invece:

Se preferisci NON usare Google OAuth, puoi:

1. Nascondere il bottone "Continua con Google" nel codice
2. Usare solo signup/login con email e password
3. Funziona già, nessuna configurazione Google necessaria

File da modificare: `/components/AuthView.tsx` - rimuovi sezione Google OAuth

---

## 📞 Se Hai Ancora Problemi

**Fammi uno screenshot di:**

1. **Google Cloud Console:**
   - La pagina di modifica OAuth Client
   - Sezione "Authorized redirect URIs" completa

2. **Supabase Dashboard:**
   - Authentication → Providers → Google (toggle e configurazione)
   - Authentication → URL Configuration (Site URL e Redirect URLs)

3. **Browser console:**
   - Console completa dopo aver fatto login
   - Tab Network → filtra "auth" → mostra le chiamate

4. **Errore esatto** se ne vedi uno

Così posso debuggare il problema specifico!

---

**Data Fix:** 2026-01-05  
**App:** btcwheel @ whellstrategy.figma.site  
**Supabase Project:** tzorfzsdhyceyumhlfdp  
**Status:** 🔧 Configurazione richiesta  

**Tempo stimato:** ⏱️ 15 minuti  
**Difficoltà:** 🟡 Media (richiede accesso Google Cloud Console)
