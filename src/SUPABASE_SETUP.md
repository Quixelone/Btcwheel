# 🗄️ Guida Supabase per btcwheel

## 📊 Stato Attuale

✅ **Supabase è già configurato e connesso!**

- **Project ID:** `rsmvjsokqolxgczclqjv`
- **URL:** `https://rsmvjsokqolxgczclqjv.supabase.co`
- **Stato:** Credenziali configurate e funzionanti

---

## 🚀 Quick Start

### 1. Verifica lo Stato della Connessione

Apri l'app con questo URL per vedere la dashboard di stato:

```
?status=supabase
```

**Esempio:**
```
https://tua-app.com/?status=supabase
```

La dashboard ti mostrerà:
- ✅ Stato connessione a Supabase
- 📊 Tabelle esistenti e conteggio righe
- 👤 Stato autenticazione
- 🔗 Link rapidi alla dashboard Supabase

---

## 🗂️ Database Schema

### Tabelle Disponibili

L'app utilizza queste tabelle (alcune potrebbero non esistere ancora):

#### 1. **kv_store_7c0f82ca** ✅ (Obbligatoria)
Tabella chiave-valore per dati generici
```sql
CREATE TABLE kv_store_7c0f82ca (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. **user_progress** (Opzionale)
Progressione utenti (XP, livello, badge)
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 1000,
  streak INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 15,
  current_lesson INTEGER DEFAULT 1,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index per performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_xp ON user_progress(xp DESC);
```

#### 3. **user_activities** (Opzionale)
Log attività utenti
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per performance
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
```

#### 4. **leaderboard_entries** (Opzionale)
Classifica globale
```sql
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  badges_count INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index per performance
CREATE INDEX idx_leaderboard_total_xp ON leaderboard_entries(total_xp DESC);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank);
```

#### 5. **trading_simulations** (Opzionale)
Simulazioni trading paper
```sql
CREATE TABLE trading_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_data JSONB NOT NULL,
  profit_loss NUMERIC(10, 2),
  btc_price_at_start NUMERIC(10, 2) NOT NULL,
  btc_price_at_end NUMERIC(10, 2),
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index per performance
CREATE INDEX idx_trading_simulations_user_id ON trading_simulations(user_id);
CREATE INDEX idx_trading_simulations_status ON trading_simulations(status);
CREATE INDEX idx_trading_simulations_created_at ON trading_simulations(created_at DESC);
```

---

## 🛠️ Come Creare le Tabelle

### Metodo 1: SQL Editor (Consigliato)

1. Vai alla **Dashboard Supabase**:
   ```
   https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv
   ```

2. Clicca su **"SQL Editor"** nella sidebar sinistra

3. Copia e incolla le query SQL sopra (una tabella alla volta)

4. Clicca **"Run"** per eseguire

---

### Metodo 2: Table Editor (UI)

1. Vai a **"Table Editor"** nella dashboard

2. Clicca **"New Table"**

3. Compila i campi:
   - Nome tabella
   - Colonne (nome, tipo, constraints)
   - Primary key
   - Foreign keys

4. Clicca **"Save"**

---

## 🔐 Autenticazione

### Configurazione Email Auth

L'app supporta:
- ✅ Email/Password signup & login
- ✅ Google OAuth (richiede setup aggiuntivo)

#### Setup Google OAuth (Opzionale)

1. Vai a **Authentication** > **Providers** nella dashboard Supabase

2. Abilita **Google** provider

3. Segui la guida:
   ```
   https://supabase.com/docs/guides/auth/social-login/auth-google
   ```

4. Configurazione richiesta:
   - Google Cloud Console
   - OAuth 2.0 Client ID
   - Authorized redirect URIs

⚠️ **Importante:** Senza questa configurazione, Google login mostrerà errore "provider is not enabled"

---

### Email Confirmation

Per default, l'app **auto-conferma** le email perché non hai configurato un email server.

Se vuoi abilitare email di conferma:

1. Vai a **Authentication** > **Email Templates**

2. Configura SMTP settings o usa il servizio email di Supabase

3. Modifica `/supabase/functions/server/index.tsx` e rimuovi:
   ```typescript
   email_confirm: true  // ← Rimuovi questa linea
   ```

---

## 🎯 Modalità Operativa Doppia

L'app funziona in **2 modalità**:

### 1️⃣ **Modalità Cloud** (Supabase connesso)

✅ Quando:
- Credenziali Supabase configurate
- Connessione attiva

✅ Funzionalità:
- Dati salvati su database cloud
- Sync cross-device
- Leaderboard globale
- User activities tracking
- Autenticazione cloud

---

### 2️⃣ **Modalità Locale** (Fallback)

✅ Quando:
- Supabase non configurato
- Errore di connessione
- Tabelle mancanti

✅ Funzionalità:
- Dati salvati su localStorage
- Funziona offline
- No sync cross-device
- No leaderboard
- No auth (modalità demo)

**L'app degrada gracefully!** Se una tabella non esiste, quella funzionalità viene disabilitata silenziosamente.

---

## 📊 Verifica Funzionamento

### Test 1: Connessione

```typescript
// Apri console browser e esegui:
import { isSupabaseConfigured } from './lib/supabase'
console.log('Supabase configurato:', isSupabaseConfigured)
```

Dovrebbe stampare: `true`

---

### Test 2: Autenticazione

Usa la dashboard status (`?status=supabase`):

1. Inserisci email e password di test
2. Clicca "Test Signup"
3. Verifica se crea l'utente
4. Clicca "Test Login"
5. Verifica se effettua login

---

### Test 3: Database Write

```typescript
// Apri console browser:
import { supabase } from './lib/supabase'

// Test write
await supabase.from('kv_store_7c0f82ca').insert({
  key: 'test',
  value: { hello: 'world' }
})

// Test read
const { data } = await supabase.from('kv_store_7c0f82ca')
  .select('*')
  .eq('key', 'test')

console.log(data)
```

---

## 🔍 Debugging

### Logs

Vai a **Logs** nella dashboard Supabase per vedere:
- Query SQL eseguite
- Errori di autenticazione
- API calls
- Performance metrics

---

### Common Issues

#### 1. "relation does not exist"
**Problema:** Tabella non creata  
**Soluzione:** Crea la tabella usando SQL Editor

#### 2. "permission denied"
**Problema:** RLS (Row Level Security) bloccante  
**Soluzione:** Configura RLS policies o disabilita RLS per test:
```sql
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

#### 3. "provider is not enabled"
**Problema:** Google OAuth non configurato  
**Soluzione:** Segui setup Google OAuth sopra

---

## 🎨 Features Implementate

### ✅ Già Funzionanti

1. **KV Store** - Storage chiave-valore generico
2. **Auth System** - Email/password + Google OAuth
3. **Graceful Degradation** - Fallback a localStorage
4. **Silent Error Handling** - Nessun errore bloccante
5. **Session Persistence** - Login persistente

---

### 🔜 Da Implementare (Opzionale)

Se crei le tabelle opzionali:

1. **User Progress** - XP, livelli, badge cloud
2. **Leaderboard** - Classifica globale real-time
3. **User Activities** - Tracking attività dettagliato
4. **Trading Simulations** - Salvataggio simulazioni cloud

**Senza queste tabelle, l'app funziona lo stesso in modalità locale!**

---

## 🚀 Link Utili

- **Dashboard:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv
- **Table Editor:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/editor
- **Auth Users:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/auth/users
- **SQL Editor:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/sql
- **Logs:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/logs/postgres-logs
- **API Settings:** https://supabase.com/dashboard/project/rsmvjsokqolxgczclqjv/settings/api

---

## 📞 Supporto

**Status Dashboard App:**
```
?status=supabase
```

Questo ti mostrerà:
- ✅ Stato connessione
- 📊 Tabelle esistenti
- 👤 Utente corrente
- 🔗 Quick actions

---

**L'app è pronta per usare Supabase!** 🎉

Puoi iniziare creando le tabelle opzionali per abilitare le funzionalità cloud, oppure lasciare tutto com'è e l'app continuerà a funzionare perfettamente in modalità locale.
