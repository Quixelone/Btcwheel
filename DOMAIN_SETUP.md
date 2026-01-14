# 🌐 Configurazione Dominio Btcwheel.io

Visto che possiedi già `btcwheel.io`, ecco come configurarlo per rimuovere "supabase.co" dalla schermata di login di Google.

## ✅ Obiettivo
Sostituire `tzorfzsdhyceyumhlfdp.supabase.co` con `auth.btcwheel.io` (o `login.btcwheel.io`).

---

## 1️⃣ Configurazione Supabase (Custom Domain)

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto `Btcwheel` (tzorfzsdhyceyumhlfdp)
3. Vai su **Settings** (icona ingranaggio) -> **Custom Domains**
4. Inserisci il dominio che vuoi usare per l'auth.  
   Consiglio: `auth.btcwheel.io`
5. Clicca **Configure domain**

Supabase ti fornirà due record DNS da aggiungere. Solitamente sono:
- Un record `CNAME` per `auth` che punta a `tzorfzsdhyceyumhlfdp.supabase.co`
- Un record `TXT` per la verifica (`_supabase.auth` o simile)

---

## 2️⃣ Configurazione DNS (Dove hai comprato il dominio)

Vai nel pannello di gestione DNS del tuo provider (GoDaddy, Namecheap, Aruba, ecc.) e aggiungi i record forniti da Supabase.

Esempio (i valori esatti te li dà Supabase):

| Tipo | Nome (Host) | Valore (Target) |
|------|-------------|-----------------|
| CNAME | `auth` | `tzorfzsdhyceyumhlfdp.supabase.co` |
| TXT | `_cf-custom-hostname.auth` | `(valore-uuid-da-supabase)` |

*Nota: La propagazione può richiedere da 10 minuti a 24 ore.*

---

## 3️⃣ Aggiornamento Google Cloud Console

Una volta che Supabase conferma che il dominio è **Attivo** (pallino verde):

1. Vai su [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Apri il tuo OAuth Client
3. In **Authorized redirect URIs**, aggiungi:
   ```
   https://auth.btcwheel.io/auth/v1/callback
   ```
4. Salva.

---

## 4️⃣ Aggiornamento Supabase URL

1. Torna su Supabase Dashboard -> **Authentication** -> **URL Configuration**
2. Cambia **Site URL** in: `https://btcwheel.io` (o dove risiede la tua app Vercel, es. `https://www.btcwheel.io`)
3. Aggiungi nei **Redirect URLs**:
   ```
   https://btcwheel.io
   https://btcwheel.io/auth/callback
   http://localhost:5174
   ```

---

## 🎉 Risultato Finale

Quando un utente cliccherà "Continua con Google":
1. Vedrà "Accedi a **btcwheel.io**" (invece di supabase.co)
2. L'URL nella barra degli indirizzi sarà `auth.btcwheel.io/...`

---

## 🚀 Deployment su Vercel

Visto che il codice è ora su GitHub (`Quixelone/Btcwheel`), puoi deployare il frontend:

1. Vai su [Vercel](https://vercel.com)
2. "Add New..." -> "Project"
3. Importa `Quixelone/Btcwheel`
4. Nelle **Environment Variables**, aggiungi le chiavi che trovi nel tuo file `.env` (o chiedimeli se non li trovi):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

Una volta deployato, il dominio che Vercel ti dà (es. `btcwheel.vercel.app`) andrà aggiunto ai Redirect URLs di Supabase e Google Console.
Poi potrai collegare `www.btcwheel.io` su Vercel.
