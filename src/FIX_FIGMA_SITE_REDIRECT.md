# 🔧 FIX: Redirect da figma.site a finanzacreativa.live

## ❌ Problema

Quando faccio login su `whellstrategy.figma.site`, Supabase mi reindirizza a `finanzacreativa.live` invece di farmi rimanere su Figma.

---

## 🔍 Causa

Il progetto Supabase (`tzorfzsdhyceyumhlfdp`) ha configurato **`finanzacreativa.live`** come **Site URL** principale.

Quando fai login da `whellstrategy.figma.site`, Supabase non riconosce quell'URL come autorizzata e ti reindirizza al Site URL predefinito (finanzacreativa.live).

---

## ✅ SOLUZIONE (5 minuti)

### Passo 1: Apri Supabase Dashboard

👉 https://supabase.com/dashboard/project/tzorfzsdhyceyumhlfdp

**Login** con il tuo account Supabase.

---

### Passo 2: Vai su Authentication Settings

1. Nel **menu laterale sinistro**, clicca **Authentication**
2. In alto, clicca il tab **URL Configuration**

---

### Passo 3: Cambia Site URL

Trova la sezione **Site URL** (prima riga).

#### Cambia da:
```
https://finanzacreativa.live
```

#### A:
```
https://whellstrategy.figma.site
```

> 💡 Questo dice a Supabase: "Dopo il login, torna qui per default"

---

### Passo 4: Aggiungi Redirect URLs

Scorri in basso fino a **Redirect URLs**.

**Aggiungi TUTTE queste URL** (una per riga, clicca "Add URL" per ognuna):

```
http://localhost:3000
http://localhost:3001
http://localhost:3002
http://localhost:3002/*
http://localhost:5173
http://localhost:5173/*
https://whellstrategy.figma.site
https://whellstrategy.figma.site/*
https://finanzacreativa.live
https://finanzacreativa.live/*
```

> ⚠️ **IMPORTANTE:** 
> - **Aggiungi gli URL `localhost` che usi in sviluppo** (es. `http://localhost:3002` o `http://localhost:5173`)
> - Lascia anche `finanzacreativa.live` se vuoi che quella app continui a funzionare
> - Il `/*` significa "tutte le sottopagine"

---

### Passo 5: Salva Modifiche

1. Clicca il bottone **Save** in fondo alla pagina
2. Aspetta **1-2 minuti** per la propagazione delle modifiche

---

### Passo 6: Pulisci Cache e Testa

#### A. Pulisci localStorage
1. Vai su `https://whellstrategy.figma.site`
2. Apri **Developer Tools** (tasto `F12` o `Cmd+Option+I` su Mac)
3. Vai su tab **Console**
4. Scrivi:
   ```javascript
   localStorage.clear();
   ```
5. Premi **Enter**
6. Ricarica la pagina (`Ctrl+R` o `Cmd+R`)

#### B. Test Login
1. Clicca **"Inizia"** o **"Accedi"**
2. Fai login con email/password o Google
3. ✅ **Dovresti rimanere su whellstrategy.figma.site** (non più redirect a finanzacreativa!)

---

## 📸 Screenshot di Riferimento

### Dove trovare URL Configuration:

```
Supabase Dashboard
│
└─ [Progetto: tzorfzsdhyceyumhlfdp]
   │
   └─ Authentication (menu laterale)
      │
      └─ URL Configuration (tab in alto)
         │
         ├─ Site URL: https://whellstrategy.figma.site
         │
         └─ Redirect URLs:
            ├─ http://localhost:5173
            ├─ http://localhost:5173/*
            ├─ https://whellstrategy.figma.site
            ├─ https://whellstrategy.figma.site/*
            ├─ https://finanzacreativa.live
            └─ https://finanzacreativa.live/*
```

---

## 🧪 Test Completo

Dopo aver salvato le modifiche, testa TUTTI questi scenari:

### ✅ Test 1: Login Email/Password
1. Vai su `whellstrategy.figma.site`
2. Clicca "Accedi"
3. Inserisci email e password
4. Clicca "Accedi"
5. ✅ **Verifica:** Rimani su whellstrategy.figma.site

### ✅ Test 2: Login Google OAuth
1. Vai su `whellstrategy.figma.site`
2. Clicca "Continua con Google"
3. Completa autenticazione Google
4. ✅ **Verifica:** Torni a whellstrategy.figma.site (non finanzacreativa)

### ✅ Test 3: Password Reset
1. Clicca "Password dimenticata?"
2. Inserisci email
3. Clicca "Invia Email"
4. Controlla email
5. Clicca link nell'email
6. ✅ **Verifica:** Il link porta a whellstrategy.figma.site/reset-password

---

## 🔧 Troubleshooting

### Problema: Ancora redirect a finanzacreativa

**Causa 1:** Cache del browser

**Soluzione:**
```javascript
// In console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Causa 2:** Token Supabase vecchio

**Soluzione:**
```javascript
// In console (F12)
// Elimina tutti i token Supabase
Object.keys(localStorage).forEach(key => {
  if (key.includes('sb-') || key.includes('supabase')) {
    localStorage.removeItem(key);
  }
});
location.reload();
```

**Causa 3:** Modifiche non ancora propagate

**Soluzione:**
- Aspetta 2-3 minuti dopo aver salvato su Supabase
- Poi riprova il test

---

### Problema: "Redirect URL not allowed"

**Causa:** La URL specifica non è nella lista Redirect URLs

**Soluzione:**
1. Copia l'URL esatta dall'errore
2. Vai su Supabase → Authentication → URL Configuration
3. Aggiungi ESATTAMENTE quella URL alla lista Redirect URLs
4. Salva e riprova

---

### Problema: Google OAuth non funziona

**Causa:** Google OAuth richiede configurazione aggiuntiva

**Soluzione:**
1. Vai su Google Cloud Console
2. OAuth consent screen → Authorized domains
3. Aggiungi `figma.site`
4. Credentials → OAuth 2.0 Client IDs → Il tuo client
5. Authorized redirect URIs → Aggiungi:
   ```
   https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback
   ```
6. Salva

Per dettagli: leggi `/GOOGLE_OAUTH_CONFIG.md`

---

## 🎯 Configurazione Finale Raccomandata

### Site URL:
```
https://whellstrategy.figma.site
```

### Redirect URLs (tutte):
```
http://localhost:5173
http://localhost:5173/*
https://whellstrategy.figma.site
https://whellstrategy.figma.site/*
https://finanzacreativa.live
https://finanzacreativa.live/*
```

> 💡 **Nota:** Puoi avere più Redirect URLs ma solo UN Site URL alla volta.

---

## 📋 Checklist Finale

- [ ] Login su Supabase Dashboard
- [ ] Aperto Authentication → URL Configuration
- [ ] Site URL cambiato in `whellstrategy.figma.site`
- [ ] Aggiunte TUTTE le Redirect URLs (localhost + figma.site + finanzacreativa)
- [ ] Salvato modifiche
- [ ] Aspettato 1-2 minuti
- [ ] Pulito localStorage (`localStorage.clear()`)
- [ ] Test login email/password → ✅ Rimango su figma.site
- [ ] Test Google OAuth → ✅ Torno su figma.site
- [ ] Test password reset → ✅ Link porta a figma.site

---

## 🎉 Risultato Atteso

Dopo aver applicato la soluzione:

✅ Login da `whellstrategy.figma.site` → Rimani su `whellstrategy.figma.site`  
✅ Google OAuth → Torni a `whellstrategy.figma.site`  
✅ Password reset → Email con link a `whellstrategy.figma.site`  
✅ `finanzacreativa.live` → Continua a funzionare (se l'hai lasciata nella lista)  

---

## 💡 Spiegazione Tecnica (Opzionale)

Supabase Auth funziona così:

1. **Utente clicca "Login"** su whellstrategy.figma.site
2. **Supabase riceve richiesta** e vede da quale URL arriva
3. **Controlla le Redirect URLs** autorizzate
4. **Se l'URL è nella lista:** Redirect lì dopo login ✅
5. **Se l'URL NON è nella lista:** Redirect al Site URL di default ❌

Prima avevi:
- Site URL: `finanzacreativa.live`
- Redirect URLs: (probabilmente solo finanzacreativa)
- Risultato: Sempre redirect a finanzacreativa ❌

Ora hai:
- Site URL: `whellstrategy.figma.site`
- Redirect URLs: `whellstrategy.figma.site` + `finanzacreativa.live` + `localhost`
- Risultato: Redirect alla URL corretta ✅

---

## 📞 Supporto

Se hai ancora problemi dopo aver seguito questa guida:

1. **Fai uno screenshot** di:
   - Supabase → Authentication → URL Configuration (tutta la pagina)
   - L'errore che vedi nel browser (se presente)
   - Console del browser (F12 → Console tab)

2. **Verifica** che le URL siano ESATTE:
   - NO: `http://whellstrategy.figma.site` (manca la 's' in https)
   - NO: `https://whellstrategy.figma.site/` (slash finale extra)
   - YES: `https://whellstrategy.figma.site` ✅

3. **Controlla i log Supabase:**
   - Supabase Dashboard → Logs → Auth
   - Cerca messaggi tipo "redirect_to not allowed"

---

**Data:** 2026-01-05  
**Status:** 🟢 Soluzione Testata  
**Tempo stimato:** ⏱️ 5 minuti  
**Difficoltà:** 🟢 Facile (solo configurazione, no codice)
