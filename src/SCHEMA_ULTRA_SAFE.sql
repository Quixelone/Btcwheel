-- ============================================
-- USER MANAGEMENT - ULTRA SAFE INSTALLATION
-- ============================================
-- IMPORTANTE: Copia TUTTO e esegui in UN COLPO SOLO
-- NON eseguire riga per riga o step by step
-- ============================================

-- STEP 1: Cleanup totale
DO $$ 
BEGIN
  DROP VIEW IF EXISTS admin_users_overview CASCADE;
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  DROP FUNCTION IF EXISTS create_user_profile_on_signup() CASCADE;
  DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
  DROP TABLE IF EXISTS admin_audit_log CASCADE;
  DROP TABLE IF EXISTS user_backups CASCADE;
  DROP TABLE IF EXISTS user_subscriptions CASCADE;
  DROP TABLE IF EXISTS subscription_plans CASCADE;
  DROP TABLE IF EXISTS user_profiles CASCADE;
  RAISE NOTICE '✓ Cleanup completato';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Cleanup: % (ignorato)', SQLERRM;
END $$;

-- STEP 2: Tabella user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  country TEXT,
  language TEXT DEFAULT 'it',
  timezone TEXT DEFAULT 'Europe/Rome',
  avatar_url TEXT,
  bio TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  preferred_exchange TEXT,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  trading_experience TEXT CHECK (trading_experience IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);

-- Verifica creazione
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    RAISE NOTICE '✓ user_profiles creata';
  ELSE
    RAISE EXCEPTION 'ERRORE: user_profiles NON creata';
  END IF;
END $$;

-- STEP 3: Tabella subscription_plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  features JSONB DEFAULT '{}'::jsonb,
  max_strategies INTEGER DEFAULT 3,
  max_active_trades INTEGER DEFAULT 10,
  ai_chat_limit_daily INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Verifica creazione
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
    RAISE NOTICE '✓ subscription_plans creata';
  ELSE
    RAISE EXCEPTION 'ERRORE: subscription_plans NON creata';
  END IF;
END $$;

-- STEP 4: Tabella user_subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'suspended')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

-- Verifica creazione
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
    RAISE NOTICE '✓ user_subscriptions creata';
  ELSE
    RAISE EXCEPTION 'ERRORE: user_subscriptions NON creata';
  END IF;
END $$;

-- STEP 5: Tabelle user_backups e admin_audit_log
CREATE TABLE user_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  backup_type TEXT DEFAULT 'manual' CHECK (backup_type IN ('manual', 'automatic', 'export')),
  backup_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  restored_at TIMESTAMPTZ,
  restored_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_user_backups_user_id ON user_backups(user_id);
CREATE INDEX idx_user_backups_created_at ON user_backups(created_at DESC);

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_target_user_id ON admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- Verifica creazione
DO $$ BEGIN
  RAISE NOTICE '✓ user_backups e admin_audit_log create';
END $$;

-- STEP 6: Inserimento dati
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, max_strategies, max_active_trades, ai_chat_limit_daily, sort_order)
VALUES 
  ('free', 'Free', 'Perfetto per iniziare a imparare la Bitcoin Wheel Strategy', 0.00, 0.00,
   '{"max_strategies": 1, "max_active_trades": 5, "ai_chat_messages_per_day": 10, "historical_data_days": 30, "priority_support": false, "advanced_analytics": false, "custom_indicators": false, "community_access": true, "basic_lessons": true}'::jsonb,
   1, 5, 10, 1),
  ('pro', 'Pro', 'Per trader seri che vogliono massimizzare i risultati', 29.99, 299.00,
   '{"max_strategies": 10, "max_active_trades": 100, "ai_chat_messages_per_day": 200, "historical_data_days": 365, "priority_support": true, "advanced_analytics": true, "custom_indicators": true, "community_access": true, "basic_lessons": true, "advanced_lessons": true, "personalized_coaching": false, "api_access": false}'::jsonb,
   10, 100, 200, 2),
  ('enterprise', 'Enterprise', 'Soluzione completa per trader professionisti e team', 99.99, 999.00,
   '{"max_strategies": 999, "max_active_trades": 999, "ai_chat_messages_per_day": 999, "historical_data_days": 999, "priority_support": true, "advanced_analytics": true, "custom_indicators": true, "community_access": true, "basic_lessons": true, "advanced_lessons": true, "personalized_coaching": true, "api_access": true, "white_label": true, "dedicated_account_manager": true, "custom_integrations": true}'::jsonb,
   999, 999, 999, 3)
ON CONFLICT (name) DO NOTHING;

-- Verifica inserimento
DO $$ 
DECLARE
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plan_count FROM subscription_plans;
  IF plan_count = 3 THEN
    RAISE NOTICE '✓ 3 piani inseriti (Free, Pro, Enterprise)';
  ELSE
    RAISE EXCEPTION 'ERRORE: Solo % piani inseriti invece di 3', plan_count;
  END IF;
END $$;

-- STEP 7: Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own backups" ON user_backups FOR SELECT USING (auth.uid() = user_id);

DO $$ BEGIN
  RAISE NOTICE '✓ RLS e policies configurate';
END $$;

-- STEP 8: Functions e Triggers
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  INSERT INTO user_profiles (user_id, full_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)) ON CONFLICT (user_id) DO NOTHING;
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status) VALUES (NEW.id, free_plan_id, 'active') ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_user_profile_on_signup();

DO $$ BEGIN
  RAISE NOTICE '✓ Functions e triggers creati';
END $$;

-- STEP 9: View admin
CREATE VIEW admin_users_overview AS
SELECT 
  u.id,
  u.email,
  u.created_at as signup_date,
  u.last_sign_in_at,
  up.full_name,
  up.total_xp,
  up.level,
  up.streak_days,
  sp.display_name as plan_name,
  us.status as subscription_status,
  us.expires_at as subscription_expires
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
ORDER BY u.created_at DESC;

DO $$ BEGIN
  RAISE NOTICE '✓ View admin_users_overview creata';
END $$;

-- VERIFICA FINALE
DO $$ 
DECLARE
  table_count INTEGER;
  plan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_name IN ('user_profiles', 'subscription_plans', 'user_subscriptions', 'user_backups', 'admin_audit_log');
  
  SELECT COUNT(*) INTO plan_count FROM subscription_plans;
  
  IF table_count = 5 AND plan_count = 3 THEN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ INSTALLAZIONE COMPLETATA CON SUCCESSO! ║';
    RAISE NOTICE '╚════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Riepilogo:';
    RAISE NOTICE '  • 5 tabelle create';
    RAISE NOTICE '  • 3 piani inseriti (Free, Pro, Enterprise)';
    RAISE NOTICE '  • RLS policies attive';
    RAISE NOTICE '  • Triggers configurati';
    RAISE NOTICE '  • View admin_users_overview pronta';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Prossimo passo: Testa registrando un nuovo utente!';
  ELSE
    RAISE EXCEPTION 'ERRORE: Installazione incompleta (% tabelle, % piani)', table_count, plan_count;
  END IF;
END $$;

-- Mostra i piani creati
SELECT name, display_name, price_monthly, price_yearly FROM subscription_plans ORDER BY sort_order;
