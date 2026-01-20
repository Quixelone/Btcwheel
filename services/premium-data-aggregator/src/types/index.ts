/**
 * Type definitions for Dual Investment products
 */

export type Exchange = 'binance' | 'kucoin' | 'okx' | 'pionex' | 'bybit' | 'bitget' | 'bingx';
export type OptionType = 'PUT' | 'CALL'; // PUT = Buy Low, CALL = Sell High
export type DataSource = 'api' | 'scrape';

export interface DualInvestmentProduct {
    // Identification
    id?: string;
    exchange: Exchange;
    productId?: string;

    // Product details
    investCoin: string;        // 'USDT', 'BTC'
    exerciseCoin: string;      // 'BTC', 'USDT'
    optionType: OptionType;

    // Parameters
    apy: number;               // Annual Percentage Yield (e.g., 93.168)
    targetPrice: number;       // Strike price (e.g., 94500)
    currentPrice?: number;     // BTC price at fetch time
    priceDiffPercent?: number; // % difference from current price

    // Duration
    durationDays: number;      // 1, 2, 3, 5, 7
    settleDate?: Date;         // Settlement date

    // Limits
    minAmount?: number;
    maxAmount?: number;

    // Metadata
    fetchedAt: Date;
    dataSource: DataSource;
    rawData?: Record<string, unknown>;
}

export interface ExchangeConfig {
    name: Exchange;
    displayName: string;
    dataSource: DataSource;
    enabled: boolean;

    // API config (for API sources)
    apiBaseUrl?: string;
    apiKey?: string;
    apiSecret?: string;
    passphrase?: string;  // OKX requires this

    // Scrape config (for scrape sources)
    scrapeUrl?: string;
    scrapeSelectors?: {
        table?: string;
        rows?: string;
        apy?: string;
        duration?: string;
        targetPrice?: string;
        priceDiff?: string;
    };
}

export interface FetchResult {
    exchange: Exchange;
    success: boolean;
    products: DualInvestmentProduct[];
    error?: string;
    fetchedAt: Date;
    durationMs: number;
}

export interface BestDealsResponse {
    lastUpdated: Date;
    btcPrice: number;

    // Best deal overall
    bestOverall: DualInvestmentProduct | null;

    // Best by duration
    bestByDuration: {
        '1d'?: DualInvestmentProduct;
        '2d'?: DualInvestmentProduct;
        '3d'?: DualInvestmentProduct;
        '5d'?: DualInvestmentProduct;
        '7d'?: DualInvestmentProduct;
    };

    // Best per exchange
    bestByExchange: Partial<Record<Exchange, DualInvestmentProduct>>;

    // All products sorted by APY
    allProducts: DualInvestmentProduct[];

    // Fetch stats
    fetchStats: {
        total: number;
        successful: number;
        failed: string[];
    };
}

export interface CollectorInterface {
    exchange: Exchange;
    fetch(): Promise<FetchResult>;
}
