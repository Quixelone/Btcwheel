/**
 * Aggregator Service
 * 
 * Orchestrates data collection from all exchanges and stores in Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import {
    DualInvestmentProduct,
    FetchResult,
    BestDealsResponse,
    Exchange
} from '../types/index.js';
import { SUPABASE, BTC_PRICE_SOURCES, EXCHANGES } from '../config.js';

// Import collectors
import { BinanceCollector } from '../collectors/binance.js';
import { KuCoinCollector } from '../collectors/kucoin.js';
import { OKXCollector } from '../collectors/okx.js';
import { scrapers } from '../collectors/scrapers.js';

export class AggregatorService {
    private supabase: SupabaseClient;
    private collectors = {
        api: [
            new BinanceCollector(),
            new KuCoinCollector(),
            new OKXCollector(),
        ],
        scrape: [
            scrapers.pionex,
            scrapers.bybit,
            scrapers.bitget,
            scrapers.bingx,
        ],
    };

    constructor() {
        this.supabase = createClient(SUPABASE.url, SUPABASE.serviceKey);
    }

    /**
     * Fetch current BTC price
     */
    async getBTCPrice(): Promise<number> {
        for (const url of BTC_PRICE_SOURCES) {
            try {
                const response = await axios.get(url, { timeout: 5000 });

                if (url.includes('binance')) {
                    return parseFloat(response.data.price);
                } else if (url.includes('coinbase')) {
                    return parseFloat(response.data.data.amount);
                }
            } catch {
                continue;
            }
        }

        throw new Error('Could not fetch BTC price from any source');
    }

    /**
     * Fetch data from API-based exchanges only (fast)
     */
    async fetchApiOnly(): Promise<FetchResult[]> {
        console.log('🚀 Starting API-only fetch...');

        const results = await Promise.all(
            this.collectors.api.map(collector => collector.fetch())
        );

        return results;
    }

    /**
     * Fetch data from scrape-based exchanges only
     */
    async fetchScrapeOnly(): Promise<FetchResult[]> {
        console.log('🕷️ Starting scrape-only fetch...');

        // Run scrapers sequentially to avoid too many browser instances
        const results: FetchResult[] = [];

        for (const scraper of this.collectors.scrape) {
            const result = await scraper.fetch();
            results.push(result);
        }

        return results;
    }

    /**
     * Fetch data from ALL exchanges
     */
    async fetchAll(): Promise<FetchResult[]> {
        console.log('🔄 Starting full fetch from all exchanges...');

        // Run API collectors in parallel, scrapers sequentially
        const [apiResults, scrapeResults] = await Promise.all([
            this.fetchApiOnly(),
            this.fetchScrapeOnly(),
        ]);

        return [...apiResults, ...scrapeResults];
    }

    /**
     * Save products to Supabase
     */
    async saveToDatabase(results: FetchResult[]): Promise<void> {
        console.log('💾 Saving to database...');

        const btcPrice = await this.getBTCPrice();

        // Flatten all products
        const allProducts: DualInvestmentProduct[] = [];

        for (const result of results) {
            if (result.success) {
                for (const product of result.products) {
                    // Add current BTC price and calculate diff if not present
                    product.currentPrice = btcPrice;

                    if (product.targetPrice && !product.priceDiffPercent) {
                        product.priceDiffPercent =
                            ((product.targetPrice - btcPrice) / btcPrice) * 100;
                    }

                    allProducts.push(product);
                }
            }
        }

        if (allProducts.length === 0) {
            console.log('⚠️ No products to save');
            return;
        }

        // Mark old products as inactive
        await this.supabase
            .from(SUPABASE.tableName)
            .update({ is_active: false })
            .lt('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        // Insert new products
        const { error } = await this.supabase
            .from(SUPABASE.tableName)
            .upsert(
                allProducts.map(p => ({
                    exchange: p.exchange,
                    product_id: p.productId,
                    invest_coin: p.investCoin,
                    exercise_coin: p.exerciseCoin,
                    option_type: p.optionType,
                    apy: p.apy,
                    target_price: p.targetPrice,
                    current_price: p.currentPrice,
                    price_diff_percent: p.priceDiffPercent,
                    duration_days: p.durationDays,
                    settle_date: p.settleDate?.toISOString(),
                    min_amount: p.minAmount,
                    max_amount: p.maxAmount,
                    fetched_at: p.fetchedAt.toISOString(),
                    is_active: true,
                    raw_data: p.rawData,
                })),
                { onConflict: 'exchange,product_id,settle_date' }
            );

        if (error) {
            console.error('❌ Database error:', error);
            throw error;
        }

        console.log(`✅ Saved ${allProducts.length} products to database`);
    }

    /**
     * Get best deals from database
     */
    async getBestDeals(): Promise<BestDealsResponse> {
        const btcPrice = await this.getBTCPrice();

        // Fetch all active products
        const { data: products, error } = await this.supabase
            .from(SUPABASE.tableName)
            .select('*')
            .eq('is_active', true)
            .gt('fetched_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
            .order('apy', { ascending: false });

        if (error) {
            throw error;
        }

        // Transform database records to our type
        const allProducts: DualInvestmentProduct[] = (products || []).map(p => ({
            exchange: p.exchange as Exchange,
            productId: p.product_id,
            investCoin: p.invest_coin,
            exerciseCoin: p.exercise_coin,
            optionType: p.option_type,
            apy: p.apy,
            targetPrice: p.target_price,
            currentPrice: p.current_price,
            priceDiffPercent: p.price_diff_percent,
            durationDays: p.duration_days,
            settleDate: p.settle_date ? new Date(p.settle_date) : undefined,
            minAmount: p.min_amount,
            maxAmount: p.max_amount,
            fetchedAt: new Date(p.fetched_at),
            dataSource: p.exchange === 'binance' || p.exchange === 'kucoin' || p.exchange === 'okx'
                ? 'api' as const
                : 'scrape' as const,
        }));

        // Calculate best deals
        const bestByDuration: BestDealsResponse['bestByDuration'] = {};
        const bestByExchange: BestDealsResponse['bestByExchange'] = {};

        for (const product of allProducts) {
            // Best by duration
            const durationKey = `${product.durationDays}d` as keyof typeof bestByDuration;
            if (!bestByDuration[durationKey] || product.apy > bestByDuration[durationKey]!.apy) {
                bestByDuration[durationKey] = product;
            }

            // Best by exchange
            if (!bestByExchange[product.exchange] || product.apy > bestByExchange[product.exchange]!.apy) {
                bestByExchange[product.exchange] = product;
            }
        }

        // Get fetch stats
        const successfulExchanges = [...new Set(allProducts.map(p => p.exchange))];
        const allExchanges = EXCHANGES.filter(e => e.enabled).map(e => e.name);
        const failedExchanges = allExchanges.filter(e => !successfulExchanges.includes(e));

        return {
            lastUpdated: allProducts[0]?.fetchedAt || new Date(),
            btcPrice,
            bestOverall: allProducts[0] || null,
            bestByDuration,
            bestByExchange,
            allProducts,
            fetchStats: {
                total: allProducts.length,
                successful: successfulExchanges.length,
                failed: failedExchanges,
            },
        };
    }

    /**
     * Full pipeline: fetch, save, return best deals
     */
    async runFullPipeline(): Promise<BestDealsResponse> {
        console.log('🚀 Running full pipeline...');
        console.log('=====================================');

        const startTime = Date.now();

        // Fetch from all exchanges
        const results = await this.fetchAll();

        // Log results
        for (const result of results) {
            if (result.success) {
                console.log(`  ✅ ${result.exchange}: ${result.products.length} products (${result.durationMs}ms)`);
            } else {
                console.log(`  ❌ ${result.exchange}: ${result.error}`);
            }
        }

        // Save to database
        await this.saveToDatabase(results);

        // Get best deals
        const bestDeals = await this.getBestDeals();

        console.log('=====================================');
        console.log(`✅ Pipeline completed in ${Date.now() - startTime}ms`);
        console.log(`📊 Total products: ${bestDeals.fetchStats.total}`);
        console.log(`🏆 Best overall: ${bestDeals.bestOverall?.exchange} - ${bestDeals.bestOverall?.apy.toFixed(2)}%`);

        return bestDeals;
    }
}

// Export singleton instance
export const aggregator = new AggregatorService();
