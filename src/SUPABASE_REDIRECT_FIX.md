# 🔧 Fix: Supabase Redirect a finanzacreativa.live

## ❌ Problema

Quando faccio login sull'app deployata su Vercel, Supabase mi reindirizza a `finanzacreativa.live` invece di rimanere sull'app btcwheel.

---

## 🔍 Causa

Il **progetto Supabase** (`tzorfzsdhyceyumhlfdp`) è stato configurato originalmente per `finanzacreativa.live` e ha quella URL come **Site URL** principale nelle impostazioni Auth.

Quando fai login con:
- Google OAuth
- Password Reset Email
- Magic Link

Supabase usa le **Redirect URLs** configurate nel progetto, che puntano a `finanzacreativa.live`.

---

## ✅ Soluzione: 2 Opzioni

### **Opzione 1: Aggiorna Configurazione Supabase (Consigliato)** ⚙️

#### Passo 1: Vai su Supabase Dashboard
1. Vai su https://supabase.com/dashboard/project/tzorfzsdhyceyumhlfdp
2. Login con il tuo account Supabase

#### Passo 2: Configura Authentication URLs
1. Nel menu laterale, vai su **Authentication** → **URL Configuration**
2. Trova la sezione **Site URL**
3. **Cambia da:**
   ```
   https://finanzacreativa.live
   ```
   **A (se su Vercel):**
   ```
   https://tuo-app.vercel.app
   ```
   **Oppure (se hai dominio custom):**
   ```
   https://tuodominio.com
   ```

#### Passo 3: Aggiungi Redirect URLs
Nella sezione **Redirect URLs**, aggiungi TUTTE queste URL (una per riga):

```
http://localhost:5173
http://localhost:5173/reset-password
https://tuo-app.vercel.app
https://tuo-app.vercel.app/reset-password
https://finanzacreativa.live
https://finanzacreativa.live/reset-password
```

> ⚠️ **Importante:** Lascia anche `finanzacreativa.live` se vuoi che quella app continui a funzionare!

#### Passo 4: Salva e Testa
1. Clicca **Save**
2. Aspetta 1-2 minuti per la propagazione
3. Fai logout dall'app btcwheel
4. Fai login di nuovo
5. ✅ Dovresti rimanere su btcwheel invece di essere reindirizzato a finanzacreativa

---

### **Opzione 2: Crea Nuovo Progetto Supabase (Più Pulito)** 🆕

Se vuoi **isolare completamente** btcwheel da finanzacreativa:

#### Passo 1: Crea Nuovo Progetto
1. Vai su https://supabase.com/dashboard
2. Clicca **New Project**
3. Nome: `btcwheel-prod`
4. Password Database: (scegli una password sicura)
5. Region: (scegli la più vicina ai tuoi utenti)
6. Clicca **Create new project**

#### Passo 2: Configura Authentication
1. Vai su **Authentication** → **URL Configuration**
2. **Site URL:**
   ```
   https://tuo-app.vercel.app
   ```
3. **Redirect URLs:**
   ```
   http://localhost:5173
   http://localhost:5173/reset-password
   https://tuo-app.vercel.app
   https://tuo-app.vercel.app/reset-password
   ```

#### Passo 3: Copia le Credenziali
1. Vai su **Settings** → **API**
2. Copia:
   - **Project URL** (esempio: `https://abcdefgh.supabase.co`)
   - **anon public** key (inizia con `eyJhbGc...`)
   - **service_role** key (inizia con `eyJhbGc...` - PRIVATA!)

#### Passo 4: Aggiorna Figma Make / Vercel
Nel tuo ambiente Figma Make o Vercel, aggiorna:

**File `/utils/supabase/info.tsx`:**
```typescript
export const projectId = "abcdefgh" // Nuovo project ID
export const publicAnonKey = "eyJhbGc..." // Nuova anon key
```

**Variabili d'ambiente Vercel:**
```bash
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### Passo 5: Deploy
1. Commit e push le modifiche
2. Vercel rebuilderà automaticamente
3. Testa login → Dovrebbe funzionare senza redirect

---

## 🧪 Test della Soluzione

### Test 1: Login Email/Password
1. Vai all'app deployata
2. Clicca "Accedi"
3. Inserisci email e password
4. ✅ Dovresti rimanere sull'app (no redirect a finanzacreativa)

### Test 2: Google OAuth
1. Vai all'app deployata
2. Clicca "Continua con Google"
3. Completa il login Google
4. ✅ Dovresti tornare all'app (no redirect a finanzacreativa)

### Test 3: Password Reset
1. Clicca "Password dimenticata?"
2. Inserisci email
3. Ricevi email con link
4. Clicca link nell'email
5. ✅ Dovresti arrivare su `tuo-app.vercel.app/reset-password` (no redirect a finanzacreativa)

---

## 🎯 Quale Opzione Scegliere?

| Criterio | Opzione 1: Aggiorna Config | Opzione 2: Nuovo Progetto |
|----------|---------------------------|---------------------------|
| **Velocità** | ⚡ 5 minuti | ⏱️ 15 minuti |
| **Complessità** | 🟢 Facile | 🟡 Media |
| **Isolamento** | ⚠️ Progetti condividono DB | ✅ Isolamento totale |
| **Costo** | 💰 Gratis | 💰 Gratis (se sotto limiti) |
| **Dati Utenti** | ✅ Mantenuti | ❌ Reset (nuovi utenti) |
| **Consigliato per** | Test / MVP rapido | Produzione / Lungo termine |

### 📊 **Raccomandazione:**

- **Se stai testando/MVP:** Usa **Opzione 1** (più veloce)
- **Se vai in produzione:** Usa **Opzione 2** (più pulito e professionale)

---

## 🚨 Troubleshooting

### Problema: Ancora reindirizzato dopo aver cambiato Site URL

**Causa:** Cache del browser o token vecchio

**Soluzione:**
1. Fai **logout completo**
2. Apri DevTools → Application → localStorage
3. **Elimina tutte le chiavi** `sb-tzorfzsdhyceyumhlfdp-auth-*`
4. Ricarica pagina (Ctrl+Shift+R)
5. Fai login di nuovo

### Problema: "Redirect URL not allowed"

**Causa:** La URL non è nella whitelist Redirect URLs

**Soluzione:**
1. Vai su Supabase Dashboard → Authentication → URL Configuration
2. Aggiungi ESATTAMENTE la URL che vedi nell'errore alla lista Redirect URLs
3. Salva e riprova dopo 1 minuto

### Problema: Google OAuth non funziona

**Causa:** Google OAuth richiede configurazione separata

**Soluzione:**
1. Segui la guida in `/GOOGLE_OAUTH_CONFIG.md`
2. Configura Google Cloud Console con le nuove Redirect URIs
3. Aggiungi `https://tzorfzsdhyceyumhlfdp.supabase.co/auth/v1/callback` alle Authorized redirect URIs

---

## 📝 Checklist

### Opzione 1: Aggiorna Config
- [ ] Login su Supabase Dashboard
- [ ] Cambia Site URL da finanzacreativa.live a tuo-app.vercel.app
- [ ] Aggiungi tutte le Redirect URLs (localhost + vercel + finanzacreativa)
- [ ] Salva configurazione
- [ ] Aspetta 1-2 minuti
- [ ] Logout dall'app
- [ ] Test login → Verifica no redirect
- [ ] Test Google OAuth → Verifica no redirect
- [ ] Test password reset → Verifica no redirect

### Opzione 2: Nuovo Progetto
- [ ] Crea nuovo progetto Supabase
- [ ] Configura Site URL
- [ ] Configura Redirect URLs
- [ ] Copia Project ID e Keys
- [ ] Aggiorna `/utils/supabase/info.tsx`
- [ ] Aggiorna variabili ambiente Vercel (se usate)
- [ ] Deploy su Vercel
- [ ] Test completo (login, OAuth, password reset)

---

## 📸 Screenshot di Riferimento

### Dove trovare URL Configuration in Supabase:
```
Supabase Dashboard
└── [Tuo Progetto: tzorfzsdhyceyumhlfdp]
    └── Authentication (nella sidebar)
        └── URL Configuration (tab in alto)
            ├── Site URL: [Cambia qui]
            └── Redirect URLs: [Aggiungi qui]
```

### Esempio Redirect URLs Corrette:
```
http://localhost:5173
http://localhost:5173/*
https://tuo-app.vercel.app
https://tuo-app.vercel.app/*
https://finanzacreativa.live
https://finanzacreativa.live/*
```

---

## ✅ Risultato Atteso

Dopo aver applicato una delle soluzioni:

✅ Login email/password → Rimani su btcwheel  
✅ Google OAuth → Torni a btcwheel dopo auth  
✅ Password reset → Email con link a btcwheel  
✅ Magic link → Redirect a btcwheel  
✅ finanzacreativa.live → Continua a funzionare (se Opzione 1)  

---

**Data:** 2026-01-05  
**Status:** 🔴 Da Applicare  
**Priorità:** 🔥 Alta (blocca login in produzione)
