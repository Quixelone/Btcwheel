-- ============================================
-- CLEANUP + INSTALL USER MANAGEMENT SCHEMA
-- ============================================
-- Questo script RIMUOVE tutto e ricrea da zero
-- Esegui nel SQL Editor di Supabase
-- ============================================

-- ============================================
-- PARTE 1: CLEANUP COMPLETO
-- ============================================

-- Drop VIEW (potrebbe riferirsi a colonne che non esistono)
DROP VIEW IF EXISTS admin_users_overview CASCADE;

-- Drop TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;

-- Drop FUNCTIONS
DROP FUNCTION IF EXISTS create_user_profile_on_signup() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop POLICIES (tutte)
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view own backups" ON user_backups;

-- Drop TABLES (CASCADE per eliminare tutte le dipendenze)
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS user_backups CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;


-- ============================================
-- PARTE 2: INSTALLAZIONE DA ZERO
-- ============================================

-- 1️⃣ USER PROFILES
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
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Trading preferences
  preferred_exchange TEXT,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  trading_experience TEXT CHECK (trading_experience IN ('beginner', 'intermediate', 'advanced')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);


-- 2️⃣ SUBSCRIPTION PLANS
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


-- 3️⃣ USER SUBSCRIPTIONS
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


-- 4️⃣ USER BACKUPS
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


-- 5️⃣ ADMIN AUDIT LOG
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


-- ============================================
-- PARTE 3: DATI INIZIALI
-- ============================================

INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, max_strategies, max_active_trades, ai_chat_limit_daily, sort_order)
VALUES 
  (
    'free',
    'Free',
    'Perfetto per iniziare a imparare la Bitcoin Wheel Strategy',
    0.00,
    0.00,
    '{"max_strategies": 1, "max_active_trades": 5, "ai_chat_messages_per_day": 10, "historical_data_days": 30, "priority_support": false, "advanced_analytics": false, "custom_indicators": false, "community_access": true, "basic_lessons": true}'::jsonb,
    1,
    5,
    10,
    1
  ),
  (
    'pro',
    'Pro',
    'Per trader seri che vogliono massimizzare i risultati',
    29.99,
    299.00,
    '{"max_strategies": 10, "max_active_trades": 100, "ai_chat_messages_per_day": 200, "historical_data_days": 365, "priority_support": true, "advanced_analytics": true, "custom_indicators": true, "community_access": true, "basic_lessons": true, "advanced_lessons": true, "personalized_coaching": false, "api_access": false}'::jsonb,
    10,
    100,
    200,
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'Soluzione completa per trader professionisti e team',
    99.99,
    999.00,
    '{"max_strategies": 999, "max_active_trades": 999, "ai_chat_messages_per_day": 999, "historical_data_days": 999, "priority_support": true, "advanced_analytics": true, "custom_indicators": true, "community_access": true, "basic_lessons": true, "advanced_lessons": true, "personalized_coaching": true, "api_access": true, "white_label": true, "dedicated_account_manager": true, "custom_integrations": true}'::jsonb,
    999,
    999,
    999,
    3
  );


-- ============================================
-- PARTE 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SUBSCRIPTION PLANS POLICIES
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- USER SUBSCRIPTIONS POLICIES
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- USER BACKUPS POLICIES
CREATE POLICY "Users can view own backups"
  ON user_backups FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================
-- PARTE 5: TRIGGERS
-- ============================================

-- Funzione per updated_at
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- PARTE 6: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE FUNCTION create_user_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  -- Get Free plan ID
  SELECT id INTO free_plan_id
  FROM subscription_plans
  WHERE name = 'free'
  LIMIT 1;
  
  -- Create user profile
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Assign Free plan
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, free_plan_id, 'active')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_on_signup();


-- ============================================
-- PARTE 7: ADMIN VIEW
-- ============================================

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


-- ============================================
-- ✅ INSTALLAZIONE COMPLETATA!
-- ============================================
-- 
-- Verifica che tutto sia OK con:
-- SELECT * FROM subscription_plans;
-- SELECT * FROM admin_users_overview;
-- ============================================
