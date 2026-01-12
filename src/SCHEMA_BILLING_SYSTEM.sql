-- ============================================
-- BILLING & PROFIT SHARING SYSTEM
-- ============================================
-- Esegui questo dopo aver installato SCHEMA_ULTRA_SAFE.sql
-- ============================================

-- 1️⃣ Aggiungi campi per tracking capitale e modello pagamento
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_capital DECIMAL(12,2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_capital_update TIMESTAMPTZ;

ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS payment_model TEXT DEFAULT 'fixed_fee' CHECK (payment_model IN ('fixed_fee', 'profit_share'));
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS capital_threshold DECIMAL(12,2) DEFAULT 2500.00;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS profit_share_percentage DECIMAL(5,2) DEFAULT 15.00;

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_capital ON user_profiles(total_capital);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_model ON user_subscriptions(payment_model);


-- 2️⃣ Tabella MONTHLY_INVOICES (fatture mensili)
CREATE TABLE IF NOT EXISTS monthly_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  
  -- Periodo fatturazione
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Tipo fattura
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('fixed_fee', 'profit_share', 'manual')),
  
  -- Calcolo importo
  total_capital DECIMAL(12,2),
  monthly_profit DECIMAL(12,2) DEFAULT 0,
  profit_share_percentage DECIMAL(5,2),
  fixed_fee_amount DECIMAL(10,2),
  
  -- Importo finale
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_invoices_user_id ON monthly_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_invoices_status ON monthly_invoices(status);
CREATE INDEX IF NOT EXISTS idx_monthly_invoices_billing_period ON monthly_invoices(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_monthly_invoices_invoice_date ON monthly_invoices(invoice_date DESC);

-- Constraint: no overlapping invoices per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_invoices_unique_period 
  ON monthly_invoices(user_id, billing_period_start, billing_period_end) 
  WHERE status != 'cancelled';


-- 3️⃣ Tabella TRADING_MONTHLY_STATS (stats mensili pre-calcolate)
CREATE TABLE IF NOT EXISTS trading_monthly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Periodo
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  
  -- Capitale
  starting_capital DECIMAL(12,2) DEFAULT 0,
  ending_capital DECIMAL(12,2) DEFAULT 0,
  average_capital DECIMAL(12,2) DEFAULT 0,
  
  -- Trading stats
  total_strategies INTEGER DEFAULT 0,
  active_strategies INTEGER DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  
  -- P&L
  gross_profit DECIMAL(12,2) DEFAULT 0,
  gross_loss DECIMAL(12,2) DEFAULT 0,
  net_profit DECIMAL(12,2) DEFAULT 0,
  total_fees DECIMAL(12,2) DEFAULT 0,
  total_premium_collected DECIMAL(12,2) DEFAULT 0,
  
  -- Performance
  win_rate DECIMAL(5,2),
  profit_factor DECIMAL(8,2),
  roi_percentage DECIMAL(8,2),
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, year, month)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trading_monthly_stats_user_id ON trading_monthly_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_monthly_stats_period ON trading_monthly_stats(year DESC, month DESC);


-- 4️⃣ Tabella PAYMENT_HISTORY (storico pagamenti ricevuti)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES monthly_invoices(id) ON DELETE SET NULL,
  
  -- Dettagli pagamento
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
  
  -- Stripe/Payment Gateway
  stripe_payment_intent_id TEXT,
  gateway_response JSONB,
  
  -- Metadata
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_invoice_id ON payment_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_paid_at ON payment_history(paid_at DESC);


-- 5️⃣ ROW LEVEL SECURITY
ALTER TABLE monthly_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" 
  ON monthly_invoices FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can view their own stats
CREATE POLICY "Users can view own stats" 
  ON trading_monthly_stats FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" 
  ON payment_history FOR SELECT 
  USING (auth.uid() = user_id);


-- 6️⃣ TRIGGERS
CREATE TRIGGER update_monthly_invoices_updated_at 
  BEFORE UPDATE ON monthly_invoices 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_monthly_stats_updated_at 
  BEFORE UPDATE ON trading_monthly_stats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();


-- 7️⃣ FUNCTION: Calcola capitale totale utente dalle strategie
CREATE OR REPLACE FUNCTION calculate_user_total_capital(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  -- Somma il capitale allocato di tutte le strategie attive
  SELECT COALESCE(SUM(
    CASE 
      WHEN status = 'active' THEN allocated_capital
      ELSE 0
    END
  ), 0)
  INTO v_total
  FROM wheel_strategies
  WHERE user_id = p_user_id;
  
  -- Aggiorna user_profiles
  UPDATE user_profiles
  SET 
    total_capital = v_total,
    last_capital_update = NOW()
  WHERE user_id = p_user_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8️⃣ FUNCTION: Determina modello pagamento utente
CREATE OR REPLACE FUNCTION determine_payment_model(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_capital DECIMAL;
  v_threshold DECIMAL;
  v_current_model TEXT;
BEGIN
  -- Get current capital
  SELECT total_capital INTO v_capital
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Get threshold from subscription
  SELECT capital_threshold, payment_model
  INTO v_threshold, v_current_model
  FROM user_subscriptions
  WHERE user_id = p_user_id;
  
  -- Default threshold if not set
  v_threshold := COALESCE(v_threshold, 2500.00);
  v_capital := COALESCE(v_capital, 0);
  
  -- Determine model
  IF v_capital >= v_threshold THEN
    -- Update to profit share if needed
    IF v_current_model != 'profit_share' THEN
      UPDATE user_subscriptions
      SET payment_model = 'profit_share', updated_at = NOW()
      WHERE user_id = p_user_id;
      
      RAISE NOTICE 'User % switched to profit_share model (capital: %)', p_user_id, v_capital;
    END IF;
    RETURN 'profit_share';
  ELSE
    RETURN 'fixed_fee';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 9️⃣ FUNCTION: Calcola profitto mensile utente
CREATE OR REPLACE FUNCTION calculate_monthly_profit(
  p_user_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_profit DECIMAL;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Calculate period dates
  v_start_date := DATE(p_year || '-' || p_month || '-01');
  v_end_date := (v_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  -- Calculate net profit from trades
  SELECT COALESCE(SUM(
    CASE 
      WHEN trade_type = 'put_open' OR trade_type = 'call_open' THEN premium - fees
      WHEN trade_type = 'put_close' OR trade_type = 'call_close' THEN -premium - fees
      WHEN trade_type = 'assignment' THEN 0
      ELSE 0
    END
  ), 0)
  INTO v_profit
  FROM wheel_trades
  WHERE user_id = p_user_id
    AND DATE(opened_at) >= v_start_date
    AND DATE(opened_at) <= v_end_date;
  
  RETURN v_profit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 🔟 VIEW: Dashboard fatturazione admin
CREATE OR REPLACE VIEW admin_billing_overview AS
SELECT 
  u.id,
  u.email,
  up.full_name,
  up.total_capital,
  up.last_capital_update,
  us.payment_model,
  us.capital_threshold,
  us.profit_share_percentage,
  sp.display_name as plan_name,
  sp.price_monthly as plan_price,
  
  -- Fatture stats
  (SELECT COUNT(*) FROM monthly_invoices WHERE user_id = u.id AND status = 'pending') as pending_invoices,
  (SELECT COUNT(*) FROM monthly_invoices WHERE user_id = u.id AND status = 'overdue') as overdue_invoices,
  (SELECT SUM(amount) FROM monthly_invoices WHERE user_id = u.id AND status = 'paid') as total_paid,
  (SELECT SUM(amount) FROM monthly_invoices WHERE user_id = u.id AND status = 'pending') as total_pending,
  
  -- Last invoice
  (SELECT invoice_date FROM monthly_invoices WHERE user_id = u.id ORDER BY invoice_date DESC LIMIT 1) as last_invoice_date,
  (SELECT amount FROM monthly_invoices WHERE user_id = u.id ORDER BY invoice_date DESC LIMIT 1) as last_invoice_amount
  
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY up.total_capital DESC NULLS LAST;


-- ============================================
-- ✅ INSTALLAZIONE COMPLETATA!
-- ============================================
-- 
-- Verifica con:
-- SELECT * FROM admin_billing_overview;
-- SELECT calculate_user_total_capital('USER_ID');
-- SELECT determine_payment_model('USER_ID');
-- ============================================
