# 🔐 Setup Google OAuth

Guida per abilitare il login con Google nell'app.

**Tempo:** 10 minuti  
**Difficoltà:** ⭐⭐☆☆☆  
**Status:** Opzionale (Email/Password già funzionante)

---

## ⚠️ IMPORTANTE: Errore 403?

Se ricevi errore **"403 - Non disponi dell'autorizzazione"**, vedi la guida completa:

👉 **[GOOGLE_OAUTH_FIX_403.md](../../GOOGLE_OAUTH_FIX_403.md)** - Risoluzione errore 403

**Cause comuni:**
- ❌ Account Google Workspace aziendale con restrizioni → Usa Gmail personale
- ❌ OAuth Consent Screen non configurato → Segui Step 3 sotto COMPLETAMENTE
- ❌ Email non in Test Users → Aggiungi la tua email come test user

---

## 📋 Overview

Google OAuth richiede configurazione in **due posti**:
1. **Google Cloud Console** - Crea OAuth app
2. **Supabase Dashboard** - Connetti credenziali

---

## Part 1: Google Cloud Console

### Step 1: Crea Progetto

1. Vai su https://console.cloud.google.com/
2. Click "Select Project" → "New Project"
3. Nome: `Bitcoin Wheel Strategy`
4. Click "Create"

### Step 2: Abilita Google+ API

1. Menu → "APIs & Services" → "Library"
2. Cerca "Google+ API"
3. Click "Enable"

### Step 3: OAuth Consent Screen

1. Menu → "APIs & Services" → "OAuth consent screen"
2. User Type: "External"
3. Click "Create"

**Compila form:**
```
App name: Bitcoin Wheel Strategy
User support email: [tua email]
Developer contact email: [tua email]
```

Click "Save and Continue" → "Save and Continue" → "Back to Dashboard"

### Step 4: Crea OAuth Client

1. Menu → "APIs & Services" → "Credentials"
2. "+ Create Credentials" → "OAuth 2.0 Client ID"

**Configurazione:**
```
Application type: Web application
Name: BTC Wheel OAuth Client
```

**Authorized redirect URIs** (IMPORTANTE!):
```
https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
```

⚠️ **Copia-incolla esattamente questo URL!**

Click "Create"

### Step 5: Salva Credenziali

Il popup mostrerà:
```
Client ID: 578955602348-3spgg2ilpa9bve6ert1idj127ehld38e.apps.googleusercontent.com
Client Secret: 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
```

**Salva entrambi!** Li userai nel prossimo step.

---

## Part 2: Supabase Dashboard

### Step 1: Apri Supabase

Vai su: https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/auth/providers

### Step 2: Abilita Google Provider

1. Trova "Google" nella lista providers
2. Toggle "Enable Sign in with Google" → **ON**

### Step 3: Inserisci Credenziali

```
Client ID: [Incolla da Step 5 sopra]
Client Secret: [Incolla da Step 5 sopra]
```

Click "Save"

✅ Vedrai: "Google provider enabled ✓"

---

## 🧪 Test

### Testa il Login

1. Ricarica l'app
2. Click "Continua con Google"
3. Seleziona il tuo account Google
4. (Prima volta) Autorizza l'app
5. ✅ Dovresti essere loggato!

---

## 🐛 Troubleshooting

### Errore: "redirect_uri_mismatch"

**Fix:**
1. Google Console → Credentials → [Tuo OAuth Client]
2. Verifica redirect URI sia esattamente:  
   `https://rsmvjsokqolxgczclqjv.supabase.co/auth/v1/callback`
3. Salva e attendi 5 minuti
4. Riprova

### Errore: "Access blocked: This app's request is invalid"

**Fix:**
1. Google Console → OAuth consent screen
2. Verifica tutti i campi obbligatori siano compilati
3. Salva
4. Riprova

### Errore: "The OAuth client was not found"

**Fix:**
1. Supabase Dashboard → Authentication → Providers → Google
2. Re-inserisci Client ID e Secret
3. Salva
4. Riprova

---

## 📊 Checklist Completa

**Google Cloud Console:**
- [ ] Progetto creato
- [ ] Google+ API abilitata
- [ ] OAuth Consent Screen configurato
- [ ] OAuth Client creato
- [ ] Redirect URI aggiunta: `https://rsmvjsokqolxgczclqjv.supabase.co/auth/v1/callback`
- [ ] Credenziali salvate

**Supabase Dashboard:**
- [ ] Google provider abilitato (toggle ON)
- [ ] Client ID inserito
- [ ] Client Secret inserito
- [ ] Configurazione salvata

**Test:**
- [ ] Login con Google funziona
- [ ] Redirect dopo login OK
- [ ] Sessione persiste dopo ricarica

---

## ❓ FAQ

**È obbligatorio?**  
No. Email/Password già funziona. Google OAuth è opzionale per migliorare UX.

**Costa?**  
No. Gratis fino a milioni di utenti.

**Funziona su mobile/PWA?**  
Sì! Funziona su tutti i browser e nella PWA installata.

**Posso aggiungere altri provider?**  
Sì! Facebook, GitHub, ecc. seguono un processo simile.

---

## 📚 Risorse

- [Documentazione Supabase Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

<div align="center">

**Google OAuth Setup Completo!** 🎉

[⬆ Back to top](#-setup-google-oauth)

</div>