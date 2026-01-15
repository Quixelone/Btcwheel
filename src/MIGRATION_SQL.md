# 📊 Wheel Strategy Database Migration

## Istruzioni per eseguire la migration su Supabase:

1. Apri **Supabase Dashboard** → https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (nel menu a sinistra)
4. Clicca **"New Query"**
5. Copia e incolla il codice SQL qui sotto
6. Clicca **"RUN"** (o premi `Cmd+Enter` / `Ctrl+Enter`)

---

## 🚀 SQL Migration Code (VERSIONE IDEMPOTENTE - Sicura da ri-eseguire):

```sql
-- ========================================
-- WHEEL STRATEGY TABLES MIGRATION
-- Versione idempotente: può essere eseguita più volte senza errori
-- ========================================

-- 📊 Tabella: wheel_strategies
-- Contiene le strategie wheel create dagli utenti
CREATE TABLE IF NOT EXISTS wheel_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  total_capital NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 📈 Tabella: wheel_trades
-- Contiene tutti i trade associati alle strategie
CREATE TABLE IF NOT EXISTS wheel_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES wheel_strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('put', 'call')),
  action TEXT NOT NULL CHECK (action IN ('sell', 'buy', 'assigned', 'expired')),
  strike NUMERIC NOT NULL,
  premium NUMERIC NOT NULL,
  capital NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  ticker TEXT NOT NULL,
  expiry DATE NOT NULL,
  pnl NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- AGGIORNAMENTO SCHEMA PER COSTO MEDIO BTC (Wheel Dashboard v2)
-- ========================================
ALTER TABLE wheel_strategies
ADD COLUMN IF NOT EXISTS total_btc_accumulated DECIMAL(18,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_btc_cost_basis DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_btc_price DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_accumulation_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accumulation_history JSONB DEFAULT '[]'::jsonb;

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Abilita RLS sulle tabelle
ALTER TABLE wheel_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE wheel_trades ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- POLICIES per wheel_strategies
-- ----------------------------------------

-- Rimuovi policy esistenti e ricreale (approccio idempotente)
DROP POLICY IF EXISTS "Users can view their own strategies" ON wheel_strategies;
DROP POLICY IF EXISTS "Users can insert their own strategies" ON wheel_strategies;
DROP POLICY IF EXISTS "Users can update their own strategies" ON wheel_strategies;
DROP POLICY IF EXISTS "Users can delete their own strategies" ON wheel_strategies;

-- Policy: Gli utenti possono vedere solo le proprie strategie
CREATE POLICY "Users can view their own strategies"
  ON wheel_strategies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo strategie proprie
CREATE POLICY "Users can insert their own strategies"
  ON wheel_strategies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo le proprie strategie
CREATE POLICY "Users can update their own strategies"
  ON wheel_strategies
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo le proprie strategie
CREATE POLICY "Users can delete their own strategies"
  ON wheel_strategies
  FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------
-- POLICIES per wheel_trades
-- ----------------------------------------

-- Rimuovi policy esistenti e ricreale (approccio idempotente)
DROP POLICY IF EXISTS "Users can view their own trades" ON wheel_trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON wheel_trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON wheel_trades;
DROP POLICY IF EXISTS "Users can delete their own trades" ON wheel_trades;

-- Policy: Gli utenti possono vedere solo i propri trade
CREATE POLICY "Users can view their own trades"
  ON wheel_trades
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo trade propri
CREATE POLICY "Users can insert their own trades"
  ON wheel_trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo i propri trade
CREATE POLICY "Users can update their own trades"
  ON wheel_trades
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo i propri trade
CREATE POLICY "Users can delete their own trades"
  ON wheel_trades
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- INDEXES per performance ottimali
-- ========================================

-- Index per query veloci su user_id
CREATE INDEX IF NOT EXISTS idx_wheel_strategies_user_id ON wheel_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_wheel_trades_user_id ON wheel_trades(user_id);

-- Index per query veloci su strategy_id
CREATE INDEX IF NOT EXISTS idx_wheel_trades_strategy_id ON wheel_trades(strategy_id);

-- Index per query veloci su status (per filtrare trade aperti/chiusi)
CREATE INDEX IF NOT EXISTS idx_wheel_trades_status ON wheel_trades(status);

-- Index composito per query comuni (user + strategy)
CREATE INDEX IF NOT EXISTS idx_wheel_trades_user_strategy ON wheel_trades(user_id, strategy_id);

-- ========================================
-- ✅ MIGRATION COMPLETATA!
-- ========================================

-- Verifica che le tabelle siano state create correttamente:
SELECT 
  'wheel_strategies' AS table_name,
  COUNT(*) AS row_count
FROM wheel_strategies
UNION ALL
SELECT 
  'wheel_trades' AS table_name,
  COUNT(*) AS row_count
FROM wheel_trades;

-- Se vedi "0 rows" per entrambe le tabelle, la migration è riuscita! ✅
```

---

## ✅ Dopo aver eseguito la migration:

1. Verifica che non ci siano errori nella console SQL
2. Controlla che le tabelle siano create:
   - Vai su **Table Editor** nel menu di Supabase
   - Dovresti vedere `wheel_strategies` e `wheel_trades`
3. Torna qui e dimmi "Migration completata!" così posso procedere con il frontend

---

## 🔍 Struttura Database:

### `wheel_strategies`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | ID univoco strategia |
| user_id | UUID | ID utente (FK auth.users) |
| name | TEXT | Nome strategia (es. "BTC 0DTE") |
| ticker | TEXT | Ticker (es. "BTC") |
| total_capital | NUMERIC | Capitale iniziale |
| created_at | TIMESTAMP | Data creazione |

### `wheel_trades`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | ID univoco trade |
| strategy_id | UUID | ID strategia (FK wheel_strategies) |
| user_id | UUID | ID utente (FK auth.users) |
| type | TEXT | 'put' o 'call' |
| action | TEXT | 'sell', 'buy', 'assigned', 'expired' |
| strike | NUMERIC | Prezzo strike |
| premium | NUMERIC | Premio ricevuto/pagato |
| capital | NUMERIC | Capitale impegnato |
| quantity | INTEGER | Numero contratti |
| ticker | TEXT | Ticker (es. "BTC") |
| expiry | DATE | Data scadenza |
| pnl | NUMERIC | Profitto/perdita |
| status | TEXT | 'open' o 'closed' |
| created_at | TIMESTAMP | Data creazione |

---

## 🚨 In caso di errori:

Se ricevi un errore tipo "relation already exists", significa che le tabelle esistono già.
Puoi eliminarle con:

```sql
DROP TABLE IF EXISTS wheel_trades CASCADE;
DROP TABLE IF EXISTS wheel_strategies CASCADE;
```

Poi ri-esegui la migration completa.