# 🏗️ BTC Wheel Pro - Premium Data Aggregator Architecture

**Versione:** 1.0.0  
**Data:** 18 Gennaio 2026  
**Obiettivo:** Fornire confronto multi-exchange per Dual Investment in tempo reale

---

## 📊 Panoramica

Il sistema raccoglie i dati dei prodotti Dual Investment da **7 exchange** e li presenta all'utente in modo unificato, permettendo di trovare il "Best Deal" in pochi secondi.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PREMIUM DATA AGGREGATOR                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │  n8n / MCP       │────▶│  Supabase DB     │◀────│  BTC Wheel App   │     │
│  │  Data Collector  │     │  (Cache Layer)   │     │  (Frontend)      │     │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     DATA SOURCES                                     │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │   API DIRETTE (Real-time)          BROWSER SCRAPING (Schedulato)    │    │
│  │   ├─ ✅ Binance                     ├─ 🤖 Pionex                     │    │
│  │   ├─ ✅ KuCoin                      ├─ 🤖 Bybit                      │    │
│  │   └─ ✅ OKX                         ├─ 🤖 Bitget                     │    │
│  │                                     └─ 🤖 BingX                      │    │
│  │                                                                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Opzione 1: n8n Self-Hosted (CONSIGLIATA)

### Vantaggi
- ✅ Open source, self-hosted (nessun costo API)
- ✅ Interfaccia visuale per creare workflow
- ✅ Supporta HTTP requests, Puppeteer, cron jobs
- ✅ Facile da mantenere e modificare
- ✅ Community attiva con molti template

### Setup
```bash
# Docker Compose per n8n + browser
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

### Workflow n8n per ogni exchange:

#### 1. Binance (API)
```
[Cron 08:30] → [HTTP Request] → [Transform Data] → [Supabase Insert]
                     │
                     └─ GET /sapi/v1/dci/product/list
                        Headers: X-MBX-APIKEY
```

#### 2. KuCoin (API)
```
[Cron 08:30] → [HTTP Request] → [Transform Data] → [Supabase Insert]
                     │
                     └─ GET /api/v1/earn/dual/products
                        Headers: KC-API-KEY, KC-API-SIGN
```

#### 3. OKX (API)
```
[Cron 08:30] → [HTTP Request] → [Transform Data] → [Supabase Insert]
                     │
                     └─ GET /api/v5/asset/earn/offers
                        Headers: OK-ACCESS-KEY, OK-ACCESS-SIGN
```

#### 4-7. Pionex, Bybit, Bitget, BingX (Browser Scraping)
```
[Cron 08:30] → [Puppeteer Node] → [Extract Table] → [Transform] → [Supabase Insert]
                     │
                     ├─ Navigate to Dual Investment page
                     ├─ Wait for table to load
                     ├─ Extract rows: APY, Target Price, Duration
                     └─ Return JSON
```

---

## 🔧 Opzione 2: MCP Server Custom

### Vantaggi
- ✅ Integrazione diretta con Claude/AI
- ✅ Più controllo sul codice
- ✅ Può essere deployato ovunque

### Struttura MCP Server

```
btcwheel-mcp-server/
├── src/
│   ├── index.ts                 # Entry point MCP
│   ├── tools/
│   │   ├── getBinanceProducts.ts
│   │   ├── getKuCoinProducts.ts
│   │   ├── getOKXProducts.ts
│   │   ├── scrapePionex.ts
│   │   ├── scrapeBybit.ts
│   │   ├── scrapeBitget.ts
│   │   └── scrapeBingX.ts
│   ├── services/
│   │   ├── apiClient.ts         # HTTP client con retry
│   │   ├── browserClient.ts     # Puppeteer wrapper
│   │   └── supabaseClient.ts    # Database
│   └── types/
│       └── dualInvestment.ts    # Type definitions
├── package.json
└── Dockerfile
```

---

## 📦 Schema Database Supabase

```sql
-- Tabella prodotti Dual Investment
CREATE TABLE dual_investment_products (
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
    target_price DECIMAL(20,2) NOT NULL,     -- Es: 94500
    current_price DECIMAL(20,2),             -- Prezzo BTC al momento
    price_diff_percent DECIMAL(10,4),        -- Es: -0.72 (%)
    
    -- Durata
    duration_days INTEGER NOT NULL,          -- 1, 2, 3, 5, 7
    settle_date TIMESTAMP,                   -- Data scadenza
    
    -- Limiti
    min_amount DECIMAL(20,8),
    max_amount DECIMAL(20,8),
    
    -- Metadata
    fetched_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    raw_data JSONB,                          -- Dati originali per debug
    
    -- Indici
    UNIQUE(exchange, product_id, settle_date)
);

-- Indice per ricerche veloci
CREATE INDEX idx_dual_products_exchange ON dual_investment_products(exchange);
CREATE INDEX idx_dual_products_apy ON dual_investment_products(apy DESC);
CREATE INDEX idx_dual_products_fetched ON dual_investment_products(fetched_at DESC);

-- Vista per "Best Deals"
CREATE VIEW best_dual_investment_deals AS
SELECT 
    *,
    RANK() OVER (PARTITION BY duration_days ORDER BY apy DESC) as rank_by_duration,
    RANK() OVER (ORDER BY apy DESC) as rank_overall
FROM dual_investment_products
WHERE is_active = true
  AND fetched_at > NOW() - INTERVAL '2 hours';

-- Funzione per pulizia dati vecchi
CREATE OR REPLACE FUNCTION cleanup_old_products()
RETURNS void AS $$
BEGIN
    UPDATE dual_investment_products 
    SET is_active = false 
    WHERE fetched_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

---

## 🕷️ Scraping Scripts per ogni Exchange

### Pionex Scraper

```javascript
// Puppeteer script per Pionex
async function scrapePionex(browser) {
    const page = await browser.newPage();
    
    try {
        // Naviga alla pagina Dual Investment
        await page.goto('https://www.pionex.com/en/invest/btc', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Aspetta che la tabella sia caricata
        await page.waitForSelector('[class*="invest-table"]', { timeout: 10000 });
        
        // Estrai i dati dalla tabella
        const products = await page.evaluate(() => {
            const rows = document.querySelectorAll('[class*="invest-table"] tr');
            const data = [];
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) {
                    data.push({
                        apy: parseFloat(cells[0].textContent.replace('%', '').replace('+', '')),
                        duration_days: parseInt(cells[1].textContent.replace('G', '')),
                        target_price: parseFloat(cells[2].textContent.replace(',', '')),
                        price_diff_percent: parseFloat(cells[3].textContent.replace('%', ''))
                    });
                }
            });
            
            return data;
        });
        
        return products.map(p => ({
            exchange: 'pionex',
            invest_coin: 'USDT',
            exercise_coin: 'BTC',
            option_type: 'PUT',
            ...p
        }));
        
    } finally {
        await page.close();
    }
}
```

### Bybit Scraper

```javascript
async function scrapeBybit(browser) {
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.bybit.com/en/earn/dual-asset', {
            waitUntil: 'networkidle2'
        });
        
        // Seleziona BTC
        await page.click('[data-coin="BTC"]');
        await page.waitForTimeout(2000);
        
        // Estrai dati dalla tabella
        const products = await page.evaluate(() => {
            // ... estrazione specifica per Bybit
        });
        
        return products;
    } finally {
        await page.close();
    }
}
```

### Bitget Scraper

```javascript
async function scrapeBitget(browser) {
    const page = await browser.newPage();
    
    try {
        await page.goto('https://www.bitget.com/earn/dual-investment', {
            waitUntil: 'networkidle2'
        });
        
        // Estrai dati
        const products = await page.evaluate(() => {
            // ... estrazione specifica per Bitget
        });
        
        return products;
    } finally {
        await page.close();
    }
}
```

### BingX Scraper

```javascript
async function scrapeBingX(browser) {
    const page = await browser.newPage();
    
    try {
        await page.goto('https://bingx.com/en-us/wealth/dual-investment/', {
            waitUntil: 'networkidle2'
        });
        
        // Estrai dati
        const products = await page.evaluate(() => {
            // ... estrazione specifica per BingX
        });
        
        return products;
    } finally {
        await page.close();
    }
}
```

---

## ⏰ Scheduling

### Orari di Esecuzione (CET)

| Orario | Azione | Note |
|--------|--------|------|
| **08:30** | Full refresh tutti gli exchange | Prima dell'operatività |
| **12:00** | Refresh API (Binance, KuCoin, OKX) | Aggiornamento mezzogiorno |
| **16:00** | Refresh API | Aggiornamento pomeriggio |
| **20:00** | Full refresh | Preparazione per Asia session |

### Cron Expression (n8n)
```
# Full refresh (tutti gli exchange incluso scraping)
30 8,20 * * * /full-refresh

# Solo API (veloce)
0 12,16 * * * /api-refresh
```

---

## 🖥️ Deployment Options

### Opzione A: VPS Self-Hosted (Consigliata per controllo)

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    restart: always

  browserless:
    image: browserless/chrome:latest
    ports:
      - "3000:3000"
    environment:
      - MAX_CONCURRENT_SESSIONS=5
      - CONNECTION_TIMEOUT=60000
    restart: always

volumes:
  n8n_data:
```

**Costo stimato:** €10-20/mese (Hetzner, DigitalOcean)

### Opzione B: Railway/Render (Managed)

- **Railway:** $5/mese + usage
- **Render:** $7/mese per background worker

### Opzione C: Vercel + Browserless.io

- Vercel Edge Functions per API
- Browserless.io per scraping ($50/mese per 10k sessioni)

---

## 📡 API Endpoint per l'App

### GET /api/premium/dual-investments

```typescript
interface DualInvestmentProduct {
    id: string;
    exchange: 'binance' | 'kucoin' | 'okx' | 'pionex' | 'bybit' | 'bitget' | 'bingx';
    
    // Prodotto
    investCoin: string;      // 'USDT'
    exerciseCoin: string;    // 'BTC'
    optionType: 'PUT' | 'CALL';
    
    // Parametri
    apy: number;             // 93.168
    targetPrice: number;     // 94500
    currentPrice: number;    // 95191.02
    priceDiffPercent: number; // -0.72
    
    // Durata
    durationDays: number;    // 1
    settleDate: string;      // ISO date
    
    // Limiti
    minAmount: number;
    maxAmount: number;
    
    // Metadata
    fetchedAt: string;
}

interface BestDealsResponse {
    lastUpdated: string;
    btcPrice: number;
    
    // Best deal assoluto
    bestOverall: DualInvestmentProduct;
    
    // Best per durata
    bestByDuration: {
        '1d': DualInvestmentProduct;
        '2d': DualInvestmentProduct;
        '3d': DualInvestmentProduct;
        '7d': DualInvestmentProduct;
    };
    
    // Best per exchange
    bestByExchange: Record<string, DualInvestmentProduct>;
    
    // Lista completa ordinata per APY
    allProducts: DualInvestmentProduct[];
}
```

### Esempio Response

```json
{
    "lastUpdated": "2026-01-18T08:35:00Z",
    "btcPrice": 95191.02,
    
    "bestOverall": {
        "id": "prod_123",
        "exchange": "pionex",
        "investCoin": "USDT",
        "exerciseCoin": "BTC",
        "optionType": "PUT",
        "apy": 93.168,
        "targetPrice": 94500,
        "currentPrice": 95191.02,
        "priceDiffPercent": -0.72,
        "durationDays": 1,
        "settleDate": "2026-01-19T00:00:00Z"
    },
    
    "bestByDuration": {
        "1d": { "exchange": "pionex", "apy": 93.168, "targetPrice": 94500 },
        "2d": { "exchange": "binance", "apy": 51.507, "targetPrice": 93500 }
    }
}
```

---

## 🎯 Next Steps

1. **Setup VPS** con Docker (Hetzner €5/mese)
2. **Deploy n8n** + Browserless
3. **Creare workflow** per ogni exchange
4. **Schema Supabase** per i dati
5. **API endpoint** in Supabase Edge Function
6. **UI Component** in BTC Wheel per visualizzare i dati

---

## 📄 Note Legali

- Il web scraping è legale per dati pubblici
- Non violiamo termini di servizio (solo lettura dati pubblici)
- Non impersoniamo utenti (no login richiesto)
- I dati sono già visualizzabili pubblicamente

---

**Ultimo aggiornamento:** 18 Gennaio 2026
