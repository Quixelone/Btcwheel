# Configurazione Supabase per il Deploy su Vercel

Se dopo il login su Vercel vieni reindirizzato a `localhost`, significa che Supabase non è configurato correttamente per accettare l'URL di produzione.

Segui questi passaggi per risolvere:

## 1. Configurazione URL in Supabase

1.  Vai sul [Supabase Dashboard](https://supabase.com/dashboard).
2.  Seleziona il tuo progetto (`btcwheel`).
3.  Vai su **Authentication** (icona utenti) -> **URL Configuration** (nel menu laterale).
4.  **Site URL**: Imposta questo valore con l'URL del tuo sito su Vercel (es. `https://btcwheel.vercel.app`).
    *   *Nota: Questo è l'URL di default se nessun altro redirect è specificato.*
5.  **Redirect URLs**: Aggiungi i seguenti URL alla lista:
    *   `http://localhost:5173/**` (per lo sviluppo locale)
    *   `https://btcwheel.vercel.app/**` (per la produzione - sostituisci con il tuo URL reale)
    *   `https://btcwheel-*.vercel.app/**` (opzionale, per le preview deployments)
6.  Clicca su **Save**.

## 2. Configurazione Google Auth (Se usi Google)

1.  Vai su **Authentication** -> **Providers** -> **Google**.
2.  Assicurati che "Authorized redirect URIs" nella tua Google Cloud Console includa l'URL di callback di Supabase (es. `https://<project-ref>.supabase.co/auth/v1/callback`).
    *   *Nota: Questo di solito è già configurato se il login funziona in locale.*

## 3. Variabili d'Ambiente su Vercel

Assicurati di aver aggiunto le variabili d'ambiente nel progetto su Vercel:

1.  Vai sul tuo progetto in Vercel.
2.  Vai su **Settings** -> **Environment Variables**.
3.  Aggiungi:
    *   `VITE_SUPABASE_URL`: (Il tuo URL Supabase, es. `https://xyz.supabase.co`)
    *   `VITE_SUPABASE_ANON_KEY`: (La tua chiave pubblica anonima)

## 4. Redeploy (Opzionale)

Di solito non serve un redeploy per le modifiche su Supabase, ma se hai cambiato le variabili d'ambiente su Vercel, devi fare un **Redeploy** (o pushare un nuovo commit) affinché abbiano effetto.

---

Dopo aver fatto questo, il login dovrebbe reindirizzarti correttamente all'app su Vercel invece che a localhost.
