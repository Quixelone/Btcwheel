-- ============================================
-- Dual Investment Products Table
-- Schema per Supabase
-- ============================================

-- Crea la tabella principale
CREATE TABLE IF NOT EXISTS dual_investment_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificazione
    exchange VARCHAR(50) NOT NULL,           -- 'binance', 'pionex', etc.
    product_id VARCHAR(100),                 -- ID originale dell'exchange
    
    -- Dati prodotto
    invest_coin VARCHAR(20) NOT NULL,        -- 'USDT', 'BTC'
    exercise_coin VARCHAR(20) NOT NULL,      -- 'BTC', 'USDT'
    option_type VARCHAR(10) NOT NULL,        -- 'PUT' (Buy Low), 'CALL' (Sell High)
    
    -- Parametri
    apy DECIMAL(10,4) NOT NULL,              -- Es: 93.168 (%)
    target_price DECIMAL(20,2),              -- Es: 94500
    current_price DECIMAL(20,2),             -- Prezzo BTC al momento
    price_diff_percent DECIMAL(10,4),        -- Es: -0.72 (%)
    
    -- Durata
    duration_days INTEGER NOT NULL,          -- 1, 2, 3, 5, 7
    settle_date TIMESTAMP WITH TIME ZONE,   -- Data scadenza
    
    -- Limiti
    min_amount DECIMAL(20,8),
    max_amount DECIMAL(20,8),
    
    -- Metadata
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    raw_data JSONB,                          -- Dati originali per debug
    
    -- Constraints
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice univoco per evitare duplicati
CREATE UNIQUE INDEX IF NOT EXISTS idx_dual_products_unique 
    ON dual_investment_products(exchange, product_id, settle_date)
    WHERE product_id IS NOT NULL;

-- Indici per ricerche veloci
CREATE INDEX IF NOT EXISTS idx_dual_products_exchange 
    ON dual_investment_products(exchange);

CREATE INDEX IF NOT EXISTS idx_dual_products_apy 
    ON dual_investment_products(apy DESC);

CREATE INDEX IF NOT EXISTS idx_dual_products_fetched 
    ON dual_investment_products(fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_dual_products_active 
    ON dual_investment_products(is_active) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_dual_products_duration 
    ON dual_investment_products(duration_days);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_dual_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_dual_products_updated_at ON dual_investment_products;
CREATE TRIGGER trigger_dual_products_updated_at
    BEFORE UPDATE ON dual_investment_products
    FOR EACH ROW
    EXECUTE FUNCTION update_dual_products_updated_at();

-- ============================================
-- Views for Best Deals
-- ============================================

-- Vista per i "Best Deals" - prodotti migliori per ogni categoria
CREATE OR REPLACE VIEW best_dual_investment_deals AS
WITH ranked_products AS (
    SELECT 
        *,
        RANK() OVER (PARTITION BY duration_days ORDER BY apy DESC) as rank_by_duration,
        RANK() OVER (PARTITION BY exchange ORDER BY apy DESC) as rank_by_exchange,
        RANK() OVER (ORDER BY apy DESC) as rank_overall
    FROM dual_investment_products
    WHERE is_active = true
      AND fetched_at > NOW() - INTERVAL '2 hours'
)
SELECT * FROM ranked_products;

-- Vista per il miglior deal assoluto
CREATE OR REPLACE VIEW best_deal_overall AS
SELECT * FROM dual_investment_products
WHERE is_active = true
  AND fetched_at > NOW() - INTERVAL '2 hours'
ORDER BY apy DESC
LIMIT 1;

-- Vista per il miglior deal per ogni exchange
CREATE OR REPLACE VIEW best_deal_by_exchange AS
SELECT DISTINCT ON (exchange) *
FROM dual_investment_products
WHERE is_active = true
  AND fetched_at > NOW() - INTERVAL '2 hours'
ORDER BY exchange, apy DESC;

-- Vista per il miglior deal per ogni durata
CREATE OR REPLACE VIEW best_deal_by_duration AS
SELECT DISTINCT ON (duration_days) *
FROM dual_investment_products
WHERE is_active = true
  AND fetched_at > NOW() - INTERVAL '2 hours'
ORDER BY duration_days, apy DESC;

-- ============================================
-- Functions
-- ============================================

-- Funzione per pulizia dati vecchi
CREATE OR REPLACE FUNCTION cleanup_old_dual_products()
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE dual_investment_products 
    SET is_active = false 
    WHERE fetched_at < NOW() - INTERVAL '24 hours'
      AND is_active = true;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere statistiche
CREATE OR REPLACE FUNCTION get_dual_investment_stats()
RETURNS TABLE (
    total_products INTEGER,
    active_products INTEGER,
    exchanges_count INTEGER,
    avg_apy DECIMAL,
    max_apy DECIMAL,
    last_fetch TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_products,
        COUNT(*) FILTER (WHERE is_active = true)::INTEGER as active_products,
        COUNT(DISTINCT exchange)::INTEGER as exchanges_count,
        AVG(apy) as avg_apy,
        MAX(apy) as max_apy,
        MAX(fetched_at) as last_fetch
    FROM dual_investment_products
    WHERE fetched_at > NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Abilita RLS
ALTER TABLE dual_investment_products ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica (tutti possono leggere i prodotti attivi)
CREATE POLICY "Allow public read access" ON dual_investment_products
    FOR SELECT
    USING (is_active = true);

-- Policy per inserimento/update solo da service role
CREATE POLICY "Allow service role full access" ON dual_investment_products
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Scheduled cleanup (opzionale - se usi pg_cron)
-- ============================================

-- Se hai pg_cron abilitato in Supabase, puoi aggiungere:
-- SELECT cron.schedule('cleanup-old-products', '0 3 * * *', 'SELECT cleanup_old_dual_products()');

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE dual_investment_products IS 'Stores Dual Investment products from multiple exchanges for BTCWheel Pro';
COMMENT ON COLUMN dual_investment_products.exchange IS 'Exchange name: binance, kucoin, okx, pionex, bybit, bitget, bingx';
COMMENT ON COLUMN dual_investment_products.option_type IS 'PUT = Buy Low, CALL = Sell High';
COMMENT ON COLUMN dual_investment_products.apy IS 'Annual Percentage Yield in percentage (e.g., 93.168 = 93.168%)';
COMMENT ON COLUMN dual_investment_products.price_diff_percent IS 'Difference between target price and current price in percentage';
