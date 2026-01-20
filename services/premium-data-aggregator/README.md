# Premium Data Aggregator

Multi-exchange Dual Investment data aggregator for BTC Wheel Pro.

## 📊 Supported Exchanges

| Exchange | Method | Status |
|----------|--------|--------|
| Binance | API | ✅ Ready |
| KuCoin | API | ✅ Ready |
| OKX | API | ✅ Ready |
| Pionex | Scraping | ✅ Ready |
| Bybit | Scraping | ✅ Ready |
| Bitget | Scraping | ✅ Ready |
| BingX | Scraping | ✅ Ready |

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys and Supabase credentials
```

### 3. Setup Supabase database
```bash
# Run the schema.sql in your Supabase SQL editor
cat supabase/schema.sql
```

### 4. Run locally
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start

# CLI mode (run once and exit)
npm run dev -- --cli
```

## 🐳 Docker Deployment

### With Docker Compose (recommended)
```bash
# Copy env file
cp .env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f aggregator
```

### Deploy to VPS
```bash
# SSH into your VPS
ssh user@your-vps

# Clone and setup
git clone <repo> btcwheel-aggregator
cd btcwheel-aggregator/services/premium-data-aggregator

# Configure
cp .env.example .env
nano .env

# Start
docker-compose up -d
```

## 📡 API Endpoints

### GET /health
Health check endpoint.

### GET /api/best-deals
Returns the best Dual Investment deals from all exchanges.

**Response:**
```json
{
  "lastUpdated": "2026-01-18T08:35:00Z",
  "btcPrice": 95191.02,
  "bestOverall": {
    "exchange": "pionex",
    "apy": 93.168,
    "targetPrice": 94500,
    "durationDays": 1
  },
  "bestByDuration": {
    "1d": { ... },
    "2d": { ... }
  },
  "bestByExchange": {
    "binance": { ... },
    "pionex": { ... }
  },
  "allProducts": [ ... ],
  "fetchStats": {
    "total": 150,
    "successful": 7,
    "failed": []
  }
}
```

### POST /api/refresh
Trigger a manual data refresh (requires `ADMIN_TOKEN`).

```bash
curl -X POST http://localhost:3001/api/refresh \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### POST /api/refresh/api-only
Trigger API-only refresh (faster, no scraping).

## ⏰ Scheduled Refresh

The service automatically refreshes data:

| Time (CET) | Type | Description |
|------------|------|-------------|
| 08:30 | Full | All exchanges + scraping |
| 12:00 | API only | Fast refresh |
| 16:00 | API only | Fast refresh |
| 20:00 | Full | All exchanges + scraping |

## 🔧 Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `BINANCE_API_KEY` | Binance API key |
| `BINANCE_API_SECRET` | Binance API secret |
| `KUCOIN_API_KEY` | KuCoin API key |
| `KUCOIN_API_SECRET` | KuCoin API secret |
| `KUCOIN_PASSPHRASE` | KuCoin API passphrase |
| `OKX_API_KEY` | OKX API key |
| `OKX_API_SECRET` | OKX API secret |
| `OKX_PASSPHRASE` | OKX API passphrase |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `ADMIN_TOKEN` | - | Token for protected endpoints |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Premium Data Aggregator                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Express   │  │    Cron     │  │  Puppeteer  │         │
│  │    API      │  │  Scheduler  │  │   Browser   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │               │               │                   │
│         └───────────────┴───────────────┘                   │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │    Aggregator       │                        │
│              │     Service         │                        │
│              └─────────────────────┘                        │
│                         │                                   │
│         ┌───────────────┴───────────────┐                   │
│         ▼                               ▼                   │
│  ┌─────────────┐                ┌─────────────┐             │
│  │    API      │                │   Browser   │             │
│  │ Collectors  │                │  Scrapers   │             │
│  ├─────────────┤                ├─────────────┤             │
│  │ • Binance   │                │ • Pionex    │             │
│  │ • KuCoin    │                │ • Bybit     │             │
│  │ • OKX       │                │ • Bitget    │             │
│  └─────────────┘                │ • BingX     │             │
│                                 └─────────────┘             │
│                                                             │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │     Supabase        │                        │
│              │     Database        │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 📄 License

Proprietary - BTC Wheel Pro
