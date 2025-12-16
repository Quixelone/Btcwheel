# 🔧 Setup Supabase - Guida Completa

Questa guida ti aiuta a configurare il database Supabase per l'app.

**Tempo:** 10-15 minuti  
**Prerequisiti:** Account Supabase (gratuito)

---

## 📋 Indice

1. [Crea Progetto Supabase](#1-crea-progetto-supabase)
2. [Setup Database Schema](#2-setup-database-schema)
3. [Configura Row Level Security](#3-configura-row-level-security)
4. [Setup Authentication](#4-setup-authentication)
5. [Ottieni Credenziali](#5-ottieni-credenziali)
6. [Verifica Setup](#6-verifica-setup)

---

## 1. Crea Progetto Supabase

### Step 1.1: Registrati

1. Vai su https://supabase.com
2. Click "Start your project"
3. Sign up con GitHub (consigliato) o email

### Step 1.2: Crea Nuovo Progetto

1. Click "New project"
2. **Organization:** Crea o seleziona esistente
3. **Project name:** `btc-wheel-academy`
4. **Database Password:** Genera una sicura (salvala!)
5. **Region:** Scegli la più vicina ai tuoi utenti
6. Click "Create new project"

**Attendi 2-3 minuti** per il provisioning del database.

✅ **Completato!** Progetto Supabase creato.

---

## 2. Setup Database Schema

### Step 2.1: Apri SQL Editor

1. Nel dashboard Supabase, vai su **SQL Editor** (sidebar sinistra)
2. Click "+ New query"

### Step 2.2: Crea Tabelle

Copia e incolla questo SQL completo:

```sql
-- ========================================
-- BTC WHEEL ACADEMY - DATABASE SCHEMA
-- ========================================

-- 1. Tabella Progressi Utente
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 1000,
  streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 15,
  current_lesson INTEGER DEFAULT 1,
  completed_lessons INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  perfect_quizzes INTEGER DEFAULT 0,
  profitable_simulations INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Tabella Attività Recenti
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabella Simulazioni Trading
CREATE TABLE trading_simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_data JSONB NOT NULL,
  profit_loss DECIMAL(10, 2) DEFAULT 0,
  btc_price_at_start DECIMAL(10, 2),
  btc_price_at_end DECIMAL(10, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Tabella Leaderboard
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

-- 5. Indici per Performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_trading_simulations_user_id ON trading_simulations(user_id);
CREATE INDEX idx_trading_simulations_status ON trading_simulations(status);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX idx_leaderboard_entries_total_xp ON leaderboard_entries(total_xp DESC);

-- 6. Trigger per update_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at
  BEFORE UPDATE ON leaderboard_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Funzione per aggiornare ranking leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  UPDATE leaderboard_entries
  SET rank = subquery.new_rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_xp DESC, level DESC, streak DESC) as new_rank
    FROM leaderboard_entries
  ) AS subquery
  WHERE leaderboard_entries.id = subquery.id;
END;
$$ LANGUAGE plpgsql;
```

### Step 2.3: Esegui Query

1. Click **"Run"** (o `Cmd/Ctrl + Enter`)
2. Verifica successo: "Success. No rows returned"

✅ **Completato!** Schema database creato.

---

## 3. Configura Row Level Security

### Step 3.1: Abilita RLS

Già abilitato dalle query precedenti. Verifica:

```sql
-- Verifica RLS attivo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_progress', 'user_activities', 'trading_simulations', 'leaderboard_entries');
```

Tutte le tabelle devono avere `rowsecurity = true` ✅

### Step 3.2: Crea Policies

Copia e incolla:

```sql
-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- ===== USER_PROGRESS POLICIES =====

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== USER_ACTIVITIES POLICIES =====

CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===== TRADING_SIMULATIONS POLICIES =====

CREATE POLICY "Users can view own simulations"
  ON trading_simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON trading_simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON trading_simulations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== LEADERBOARD_ENTRIES POLICIES =====

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own leaderboard entry"
  ON leaderboard_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON leaderboard_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Click **"Run"**

✅ **Completato!** RLS configurato con successo.

---

## 4. Setup Authentication

### Step 4.1: Abilita Provider Email

1. Vai su **Authentication** → **Providers** (sidebar)
2. **Email** dovrebbe essere già abilitato ✅

### Step 4.2: Configura Email Settings

1. Vai su **Authentication** → **Email Templates**
2. Personalizza i template (opzionale):
   - **Confirm signup**
   - **Magic Link**
   - **Reset Password**

### Step 4.3: Abilita Google OAuth (Opzionale)

Vedi la guida separata: [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)

✅ **Completato!** Authentication configurato.

---

## 5. Ottieni Credenziali

### Step 5.1: Trova le Tue Credenziali

1. Vai su **Settings** → **API** (sidebar)
2. Troverai:

**Project URL:**
```
https://[your-project-id].supabase.co
```

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5.2: Copia Credenziali

**IMPORTANTE:** Avrai bisogno di queste per il deployment!

Salvale in un file temporaneo o in un password manager.

✅ **Completato!** Credenziali salvate.

---

## 6. Verifica Setup

### Step 6.1: Test Tabelle

Nel SQL Editor, esegui:

```sql
-- Verifica esistenza tabelle
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Dovresti vedere:
- ✅ `leaderboard_entries`
- ✅ `trading_simulations`
- ✅ `user_activities`
- ✅ `user_progress`

### Step 6.2: Test RLS

```sql
-- Verifica policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Dovresti vedere tutte le policies create.

### Step 6.3: Test Funzioni

```sql
-- Verifica funzioni
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Dovresti vedere:
- ✅ `update_leaderboard_ranks`
- ✅ `update_updated_at_column`

✅ **Completato!** Setup verificato con successo! 🎉

---

## 🔐 Environment Variables

Usa queste credenziali nel tuo progetto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:**
- Le variabili devono iniziare con `VITE_` per essere accessibili nel client
- La `ANON_KEY` è sicura da usare nel frontend
- **MAI** esporre la `SERVICE_ROLE_KEY` nel client!

---

## 🐛 Troubleshooting

### Errore: "permission denied for schema public"

**Soluzione:**
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

### Errore: "new row violates row-level security policy"

**Causa:** RLS troppo restrittivo

**Soluzione:** Verifica che le policies permettano INSERT/UPDATE per gli utenti autenticati.

### Tabelle non visibili in Table Editor

**Causa:** Refresh necessario

**Soluzione:** Ricarica la pagina o vai su **Table Editor** e click refresh.

---

## 📚 Next Steps

- **[Configura Google OAuth](./GOOGLE_OAUTH_SETUP.md)** - Login con Google
- **[Deploy l'App](../deployment/DEPLOYMENT_GUIDE.md)** - Metti l'app online
- **[Environment Variables](./ENV_VARIABLES.md)** - Configurazione completa

---

<div align="center">

**Setup Supabase Completato!** 🎉

[⬆ Back to top](#-setup-supabase---guida-completa)

</div>
