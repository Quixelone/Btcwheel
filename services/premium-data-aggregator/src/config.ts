/**
 * Configuration for all exchanges
 */

import { ExchangeConfig } from './types/index.js';

export const EXCHANGES: ExchangeConfig[] = [
    // === API-Based Exchanges ===
    {
        name: 'binance',
        displayName: 'Binance',
        dataSource: 'api',
        enabled: true,
        apiBaseUrl: 'https://api.binance.com',
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET,
    },
    {
        name: 'kucoin',
        displayName: 'KuCoin',
        dataSource: 'api',
        enabled: true,
        apiBaseUrl: 'https://api.kucoin.com',
        apiKey: process.env.KUCOIN_API_KEY,
        apiSecret: process.env.KUCOIN_API_SECRET,
        passphrase: process.env.KUCOIN_PASSPHRASE,
    },
    {
        name: 'okx',
        displayName: 'OKX',
        dataSource: 'api',
        enabled: true,
        apiBaseUrl: 'https://www.okx.com',
        apiKey: process.env.OKX_API_KEY,
        apiSecret: process.env.OKX_API_SECRET,
        passphrase: process.env.OKX_PASSPHRASE,
    },

    // === Scrape-Based Exchanges ===
    {
        name: 'pionex',
        displayName: 'Pionex',
        dataSource: 'scrape',
        enabled: true,
        scrapeUrl: 'https://www.pionex.com/en/invest/btc',
        scrapeSelectors: {
            table: '[class*="invest-table"], table',
            rows: 'tbody tr',
            apy: 'td:nth-child(1)',
            duration: 'td:nth-child(2)',
            targetPrice: 'td:nth-child(3)',
            priceDiff: 'td:nth-child(4)',
        },
    },
    {
        name: 'bybit',
        displayName: 'Bybit',
        dataSource: 'scrape',
        enabled: true,
        scrapeUrl: 'https://www.bybit.com/en/earn/dual-asset',
        scrapeSelectors: {
            table: '[class*="dual-asset-table"], table',
            rows: 'tbody tr',
        },
    },
    {
        name: 'bitget',
        displayName: 'Bitget',
        dataSource: 'scrape',
        enabled: true,
        scrapeUrl: 'https://www.bitget.com/earn/dual-investment',
        scrapeSelectors: {
            table: '[class*="dual-investment"], table',
            rows: 'tbody tr',
        },
    },
    {
        name: 'bingx',
        displayName: 'BingX',
        dataSource: 'scrape',
        enabled: true,
        scrapeUrl: 'https://bingx.com/en-us/wealth/dual-investment/',
        scrapeSelectors: {
            table: '[class*="dual-investment"], table',
            rows: 'tbody tr',
        },
    },
];

// Schedule configuration
export const SCHEDULE = {
    // Full refresh (all exchanges including scrape)
    fullRefresh: ['30 8 * * *', '0 20 * * *'], // 08:30 and 20:00 CET

    // API only refresh (faster)
    apiRefresh: ['0 12 * * *', '0 16 * * *'], // 12:00 and 16:00 CET
};

// Supabase configuration
export const SUPABASE = {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
    tableName: 'dual_investment_products',
};

// Browser configuration for scraping
export const BROWSER_CONFIG = {
    headless: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
};

// Get current BTC price (fallback sources)
export const BTC_PRICE_SOURCES = [
    'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
    'https://api.coinbase.com/v2/prices/BTC-USD/spot',
];
