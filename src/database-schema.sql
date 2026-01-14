-- ============================================
-- BTCWHEEL DATABASE SCHEMA
-- Schema SQL completo per l'applicazione
-- ============================================

-- ============================================
-- 1. USER PROGRESS & GAMIFICATION
-- ============================================

-- Tabella per tracking progressione utente (XP, livelli, streak)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level ON user_progress(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_xp ON user_progress(total_xp DESC);

-- RLS (Row Level Security)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. USER ACTIVITIES LOG
-- ============================================

-- Tabella per logging attività utente (lezioni completate, trade eseguiti, etc.)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'lesson_completed', 'trade_executed', 'mission_completed', etc.
  activity_data JSONB DEFAULT '{}'::jsonb,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON user_activities(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON user_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON user_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. FUNCTION: Calculate user level from XP
-- ============================================

CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Formula: level = floor(sqrt(xp / 100)) + 1
  -- 100 XP = Level 2, 400 XP = Level 3, 900 XP = Level 4, etc.
  RETURN FLOOR(SQRT(xp::numeric / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 5. FUNCTION: Add XP to user
-- ============================================

CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_activity_type VARCHAR DEFAULT 'manual',
  p_activity_data JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_current_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
BEGIN
  -- Get current progress or create if not exists
  INSERT INTO user_progress (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current values
  SELECT total_xp, level INTO v_current_xp, v_current_level
  FROM user_progress
  WHERE user_id = p_user_id;

  -- Calculate new values
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_level := calculate_level_from_xp(v_new_xp);
  
  IF v_new_level > v_current_level THEN
    v_level_up := true;
  END IF;

  -- Update progress
  UPDATE user_progress
  SET 
    total_xp = v_new_xp,
    level = v_new_level,
    last_activity_date = CURRENT_DATE
  WHERE user_id = p_user_id;

  -- Log activity
  INSERT INTO user_activities (user_id, activity_type, activity_data, xp_earned)
  VALUES (p_user_id, p_activity_type, p_activity_data, p_xp_amount);

  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, v_level_up;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCTION: Update streak
-- ============================================

CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Get current streak and last activity
  SELECT last_activity_date, streak_days INTO v_last_activity, v_current_streak
  FROM user_progress
  WHERE user_id = p_user_id;

  -- If no previous activity, start streak at 1
  IF v_last_activity IS NULL THEN
    v_new_streak := 1;
  -- If last activity was yesterday, increment streak
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_current_streak + 1;
  -- If last activity was today, keep streak
  ELSIF v_last_activity = CURRENT_DATE THEN
    v_new_streak := v_current_streak;
  -- If gap > 1 day, reset streak
  ELSE
    v_new_streak := 1;
  END IF;

  -- Update progress
  UPDATE user_progress
  SET 
    streak_days = v_new_streak,
    last_activity_date = CURRENT_DATE
  WHERE user_id = p_user_id;

  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. INITIAL DATA: Create progress for existing users
-- ============================================

-- Create progress record for all existing users who don't have one
INSERT INTO user_progress (user_id, total_xp, level, streak_days)
SELECT 
  id,
  0, -- Starting XP
  1, -- Starting level
  0  -- Starting streak
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_progress)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_progress IS 'Tracks user progression: XP, level, streak, badges';
COMMENT ON TABLE user_activities IS 'Logs all user activities with XP rewards';
COMMENT ON FUNCTION add_user_xp IS 'Add XP to user and return new level (handles level-up detection)';
COMMENT ON FUNCTION update_user_streak IS 'Update user streak based on daily activity';
COMMENT ON FUNCTION calculate_level_from_xp IS 'Calculate user level from total XP using quadratic formula';
