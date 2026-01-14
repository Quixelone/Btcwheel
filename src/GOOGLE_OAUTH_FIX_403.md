# 🔧 Fix Errore 403 Google OAuth

Guida completa per risolvere l'errore 403 durante setup Google OAuth.

---

## 🎯 Soluzione Completa Step-by-Step

### Step 1: Verifica Account Google

**Usa account Gmail personale (@gmail.com)**

```
✅ GIUSTO: tuoemail@gmail.com
❌ SBAGLIATO: tuoemail@azienda.com (se ha restrizioni)
```

**Come switchare account:**
1. Logout da [console.cloud.google.com](https://console.cloud.google.com)
2. Login con Gmail personale
3. Continua con step successivi

---

### Step 2: Crea Progetto Google Cloud

1. **Vai su Google Cloud Console**
   - [console.cloud.google.com](https://console.cloud.google.com)

2. **Crea Nuovo Progetto**
   - Click dropdown progetto (in alto vicino al logo)
   - Click **"NEW PROJECT"**
   
   Compila:
   ```
   Project name:     btcwheel-oauth
   Organization:     No organization
   Location:         No organization
   ```
   
   - Click **"CREATE"**
   - Attendi creazione (~30 secondi)

3. **Seleziona Progetto**
   - Click dropdown progetto
   - Seleziona **"btcwheel-oauth"**
   - ✅ Verifica che sia selezionato (nome appare in alto)

---

### Step 3: Configura OAuth Consent Screen

**⚠️ IMPORTANTE: Questo step è OBBLIGATORIO prima di creare credenziali!**

1. **Vai a OAuth Consent Screen**
   - Sidebar → **APIs & Services** → **OAuth consent screen**
   - URL diretta: [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)

2. **Seleziona User Type**
   ```
   ⚪ Internal (solo se hai Google Workspace)
   🔘 External (SELEZIONA QUESTO)
   ```
   - Click **"CREATE"**

3. **App Information**
   ```
   App name:                 btcwheel
   User support email:       tuoemail@gmail.com
   App logo:                 (opzionale, skip per ora)
   ```

4. **App Domain (Opzionale per test)**
   ```
   Application home page:     https://tuoapp.vercel.app
   (Lascia vuoto se ancora non deployed)
   ```

5. **Developer Contact Information**
   ```
   Email addresses:          tuoemail@gmail.com
   ```
   - Click **"SAVE AND CONTINUE"**

6. **Scopes (Step 2)**
   - Click **"ADD OR REMOVE SCOPES"**
   
   Seleziona:
   ```
   ✅ .../auth/userinfo.email
   ✅ .../auth/userinfo.profile
   ✅ openid
   ```
   
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

7. **Test Users (Step 3)**
   
   **Se hai scelto "External":**
   - Click **"+ ADD USERS"**
   - Aggiungi la tua email: `tuoemail@gmail.com`
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

8. **Summary (Step 4)**
   - Review tutto
   - Click **"BACK TO DASHBOARD"**

✅ **OAuth Consent Screen Configurato!**

---

### Step 4: Crea OAuth Credentials

**SOLO DOPO aver completato Step 3!**

1. **Vai a Credentials**
   - Sidebar → **APIs & Services** → **Credentials**
   - URL: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

2. **Crea Credenziali**
   - Click **"+ CREATE CREDENTIALS"**
   - Seleziona **"OAuth client ID"**

3. **Configura OAuth Client**
   
   **Application type:**
   ```
   🔘 Web application
   ```
   
   **Name:**
   ```
   btcwheel Web Client
   ```
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://tuoapp.vercel.app
   ```
   (Aggiungi entrambi per dev + production)
   
   **Authorized redirect URIs:**
   ```
   http://localhost:5173
   https://tuoapp.vercel.app
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```
   
   ⚠️ **IMPORTANTE:** Il terzo URL è il tuo callback Supabase (già corretto!)
   
   Aggiungi anche per development:
   ```
   http://localhost:5173/auth/callback
   ```
   
   (Se deployato) Aggiungi anche:
   ```
   https://tuoapp.vercel.app/auth/callback
   ```

4. **Crea**
   - Click **"CREATE"**

5. **Copia Credenziali**
   
   Ti appariranno:
   ```
   Client ID:        123456789-abcdef.apps.googleusercontent.com
   Client secret:    GOCSPX-abc123xyz
   ```
   
   **⚠️ COPIA ENTRAMBI SUBITO!**

---

### Step 5: Configura Supabase

1. **Vai su Supabase Dashboard**
   - [app.supabase.com](https://app.supabase.com)
   - Seleziona il tuo progetto btcwheel

2. **Vai a Authentication → Providers**
   - Sidebar → Authentication
   - Tab **"Providers"**
   - Scorri fino a **"Google"**

3. **Abilita Google Provider**
   - Toggle **"Enable Sign in with Google"** → ON
   
   Incolla credenziali:
   ```
   Google Client ID:      123456789-abcdef.apps.googleusercontent.com
   Google Client Secret:  GOCSPX-abc123xyz
   ```

4. **Copia Callback URL**
   
   Supabase ti mostrerà:
   ```
   Callback URL (for Google):
   https://[tuo-project-id].supabase.co/auth/v1/callback
   ```
   
   **COPIA QUESTO URL!**

5. **Salva**
   - Click **"Save"**

---

### Step 6: Aggiungi Callback URL a Google

**TORNA a Google Cloud Console**

1. **Vai a Credentials**
   - [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

2. **Modifica OAuth Client**
   - Click sul nome client creato: `btcwheel Web Client`

3. **Aggiungi Redirect URI**
   
   In **"Authorized redirect URIs"**, VERIFICA che ci sia:
   ```
   https://[tuo-project-id].supabase.co/auth/v1/callback
   ```
   
   Se non c'è:
   - Click **"+ ADD URI"**
   - Incolla la callback URL da Supabase
   - Click **"SAVE"**

---

### Step 7: Testa OAuth

1. **Vai sulla tua app**
   - Locale: `http://localhost:5173`
   - Production: `https://tuoapp.vercel.app`

2. **Click "Login con Google"**

3. **Accetta Permessi**
   - Google mostrerà schermata consenso
   - Click **"Continue"**
   - Seleziona account
   - Click **"Allow"**

4. **✅ Dovresti essere loggato!**

---

## 🆘 Troubleshooting Errore 403

### Errore: "403 access_denied"

**Causa 1: OAuth Consent Screen non configurato**

Soluzione:
- Segui [Step 3](#step-3-configura-oauth-consent-screen) sopra
- Assicurati di completare TUTTI i substep

**Causa 2: Email non in Test Users**

Se app è in "Testing" mode:
- Google Cloud Console → OAuth consent screen
- Scroll a "Test users"
- Click **"+ ADD USERS"**
- Aggiungi tua email
- Riprova login

**Causa 3: App non pubblicata**

Se vuoi che TUTTI possano loggarsi:
1. Google Cloud Console → OAuth consent screen
2. Click **"PUBLISH APP"**
3. Conferma
4. Status cambierà a "In production"

---

### Errore: "redirect_uri_mismatch"

**Causa:** URI di redirect non corrisponde

**Soluzione:**

1. **Controlla URL esatto dell'errore**
   - Google ti dice quale URL ha ricevuto

2. **Vai a Google Cloud Console**
   - Credentials → OAuth client
   - Sezione **"Authorized redirect URIs"**

3. **Aggiungi URL esatto**
   - Deve matchare ESATTAMENTE (case-sensitive)
   - Include http:// o https://
   - Include porta se presente (es: :5173)

Esempi:
```
✅ https://abc123.supabase.co/auth/v1/callback
❌ https://abc123.supabase.co/auth/v1/callback/  (trailing slash)
❌ http://abc123.supabase.co/auth/v1/callback   (http invece di https)
```

---

### Errore: "invalid_client"

**Causa:** Client ID o Secret sbagliato

**Soluzione:**

1. **Verifica credenziali su Google**
   - Credentials → OAuth client
   - Vedi Client ID e Secret

2. **Aggiorna su Supabase**
   - Authentication → Providers → Google
   - Incolla nuovamente Client ID e Secret
   - Save

---

### Errore: "App is not published"

**Causa:** App in testing mode e utente non in test users

**Soluzione Rapida (Testing):**
- OAuth consent screen
- Test users → ADD USERS
- Aggiungi email utente

**Soluzione Permanente (Production):**
- OAuth consent screen
- Click **"PUBLISH APP"**
- Compila form verifica (se richiesto)
- Attendi approvazione Google (1-3 giorni)

**Oppure: Mantieni in Testing**
- Max 100 test users
- Va bene per sviluppo e progetti piccoli

---

## 📋 Checklist Completa

### Prerequisiti
- [ ] Account Gmail personale (@gmail.com)
- [ ] Progetto Supabase creato
- [ ] App locale funzionante

### Google Cloud Console
- [ ] Progetto creato (`btcwheel-oauth`)
- [ ] Progetto selezionato (verificato in alto)
- [ ] OAuth Consent Screen configurato
  - [ ] User type: External
  - [ ] App name: btcwheel
  - [ ] Email impostata
  - [ ] Scopes aggiunti (email, profile, openid)
  - [ ] Test user aggiunto (tua email)
- [ ] OAuth Client ID creato
  - [ ] Type: Web application
  - [ ] Authorized origins aggiunti
  - [ ] Redirect URIs aggiunti
  - [ ] Client ID copiato
  - [ ] Client Secret copiato

### Supabase
- [ ] Google provider abilitato
- [ ] Client ID incollato
- [ ] Client Secret incollato
- [ ] Callback URL copiata
- [ ] Salvato

### Verifica Google Cloud
- [ ] Callback URL Supabase aggiunta a redirect URIs
- [ ] Salvato

### Test
- [ ] Login con Google testato
- [ ] ✅ Funziona!

---

## 🎯 URL di Riferimento

**Google Cloud Console:**
- Dashboard: [console.cloud.google.com](https://console.cloud.google.com)
- OAuth Consent: [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)
- Credentials: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

**Supabase:**
- Dashboard: [app.supabase.com](https://app.supabase.com)
- Auth Providers: `app.supabase.com/project/[tuo-id]/auth/providers`

**Documentation:**
- Google OAuth: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- Supabase Auth: [supabase.com/docs/guides/auth/social-login/auth-google](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## ✨ Dopo Setup Completo

Una volta che tutto funziona:

### Development
```env
# .env
VITE_SUPABASE_URL=https://[tuo-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Production (Vercel)
1. Vercel Dashboard → Settings → Environment Variables
2. Aggiungi stesse variabili
3. Redeploy

### Testing
```bash
# Locale
npm run dev
# Apri http://localhost:5173
# Click "Login con Google"
# ✅ Dovrebbe funzionare!
```

---

## 📞 Ancora Problemi?

**Debug Steps:**

1. **Check Console Browser**
   - F12 → Console
   - Cerca errori rossi
   - Copia messaggio errore

2. **Check Network Tab**
   - F12 → Network
   - Filtra: "oauth" o "callback"
   - Vedi quale request fallisce

3. **Check Supabase Logs**
   - Supabase Dashboard → Logs
   - Auth logs
   - Vedi errori specifici

4. **Verifica Configurazione**
   - Rileggi checklist sopra
   - Assicurati di aver completato TUTTI gli step

---

**Setup Completato!** 🎉

Google OAuth dovrebbe ora funzionare correttamente.

---

**Creato:** 2024-12-12  
**Versione:** 1.0  
**Per:** btcwheel v1.0.1