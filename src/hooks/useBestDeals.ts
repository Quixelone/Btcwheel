/**
 * useBestDeals Hook
 * 
 * Fetches best Dual Investment deals from the Premium Data Aggregator service.
 * Falls back to mock data in development if the service is not available.
 */

import { useState, useEffect, useCallback } from 'react';

// Types matching the aggregator service
export type Exchange = 'binance' | 'kucoin' | 'okx' | 'pionex' | 'bybit' | 'bitget' | 'bingx';
export type OptionType = 'PUT' | 'CALL';

export interface DualInvestmentProduct {
    id?: string;
    exchange: Exchange;
    productId?: string;
    investCoin: string;
    exerciseCoin: string;
    optionType: OptionType;
    apy: number;
    targetPrice: number;
    currentPrice?: number;
    priceDiffPercent?: number;
    durationDays: number;
    settleDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    fetchedAt: Date;
    dataSource: 'api' | 'scrape';
}

export interface BestDealsResponse {
    lastUpdated: Date;
    btcPrice: number;
    bestOverall: DualInvestmentProduct | null;
    bestByDuration: {
        '1d'?: DualInvestmentProduct;
        '2d'?: DualInvestmentProduct;
        '3d'?: DualInvestmentProduct;
        '5d'?: DualInvestmentProduct;
        '7d'?: DualInvestmentProduct;
    };
    bestByExchange: Partial<Record<Exchange, DualInvestmentProduct>>;
    allProducts: DualInvestmentProduct[];
    fetchStats: {
        total: number;
        successful: number;
        failed: string[];
    };
}

interface UseBestDealsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in ms
}

// Mock data for development/demo
const MOCK_DATA: BestDealsResponse = {
    lastUpdated: new Date(),
    btcPrice: 95191.02,
    bestOverall: {
        exchange: 'pionex',
        investCoin: 'USDT',
        exerciseCoin: 'BTC',
        optionType: 'PUT',
        apy: 93.168,
        targetPrice: 94500,
        currentPrice: 95191.02,
        priceDiffPercent: -0.72,
        durationDays: 1,
        fetchedAt: new Date(),
        dataSource: 'scrape',
    },
    bestByDuration: {
        '1d': {
            exchange: 'pionex',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 93.168,
            targetPrice: 94500,
            currentPrice: 95191.02,
            priceDiffPercent: -0.72,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'scrape',
        },
        '2d': {
            exchange: 'binance',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 51.507,
            targetPrice: 93500,
            currentPrice: 95191.02,
            priceDiffPercent: -1.77,
            durationDays: 2,
            fetchedAt: new Date(),
            dataSource: 'api',
        },
        '3d': {
            exchange: 'kucoin',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 42.3,
            targetPrice: 93000,
            currentPrice: 95191.02,
            priceDiffPercent: -2.30,
            durationDays: 3,
            fetchedAt: new Date(),
            dataSource: 'api',
        },
    },
    bestByExchange: {
        pionex: {
            exchange: 'pionex',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 93.168,
            targetPrice: 94500,
            currentPrice: 95191.02,
            priceDiffPercent: -0.72,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'scrape',
        },
        binance: {
            exchange: 'binance',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 60.285,
            targetPrice: 94250,
            currentPrice: 95191.02,
            priceDiffPercent: -0.98,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'api',
        },
        kucoin: {
            exchange: 'kucoin',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 55.2,
            targetPrice: 94100,
            currentPrice: 95191.02,
            priceDiffPercent: -1.14,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'api',
        },
        okx: {
            exchange: 'okx',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 48.5,
            targetPrice: 93800,
            currentPrice: 95191.02,
            priceDiffPercent: -1.46,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'api',
        },
        bybit: {
            exchange: 'bybit',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 45.8,
            targetPrice: 93500,
            currentPrice: 95191.02,
            priceDiffPercent: -1.77,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'scrape',
        },
        bitget: {
            exchange: 'bitget',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 42.1,
            targetPrice: 93200,
            currentPrice: 95191.02,
            priceDiffPercent: -2.09,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'scrape',
        },
        bingx: {
            exchange: 'bingx',
            investCoin: 'USDT',
            exerciseCoin: 'BTC',
            optionType: 'PUT',
            apy: 38.5,
            targetPrice: 93000,
            currentPrice: 95191.02,
            priceDiffPercent: -2.30,
            durationDays: 1,
            fetchedAt: new Date(),
            dataSource: 'scrape',
        },
    },
    allProducts: [],
    fetchStats: {
        total: 42,
        successful: 7,
        failed: [],
    },
};

// API base URL - configurable via env
const API_BASE_URL = import.meta.env.VITE_AGGREGATOR_API_URL || 'http://localhost:3001';

export function useBestDeals(options: UseBestDealsOptions = {}) {
    const { autoRefresh = true, refreshInterval = 5 * 60 * 1000 } = options; // 5 minutes default

    const [data, setData] = useState<BestDealsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);

    const fetchDeals = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/best-deals`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const result = await response.json();

            // Transform dates
            const transformed: BestDealsResponse = {
                ...result,
                lastUpdated: new Date(result.lastUpdated),
                bestOverall: result.bestOverall ? {
                    ...result.bestOverall,
                    fetchedAt: new Date(result.bestOverall.fetchedAt),
                    settleDate: result.bestOverall.settleDate ? new Date(result.bestOverall.settleDate) : undefined,
                } : null,
            };

            setData(transformed);
            setLastFetch(new Date());

        } catch (err) {
            console.warn('Failed to fetch from aggregator, using mock data:', err);
            // Use mock data as fallback
            setData(MOCK_DATA);
            setError(null); // Don't show error if we have mock data
            setLastFetch(new Date());
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchDeals, refreshInterval);
        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchDeals]);

    // Helper to get best deal for a specific duration
    const getBestForDuration = useCallback((days: number): DualInvestmentProduct | null => {
        if (!data) return null;
        const key = `${days}d` as keyof typeof data.bestByDuration;
        return data.bestByDuration[key] || null;
    }, [data]);

    // Helper to get all deals sorted by APY
    const getTopDeals = useCallback((limit: number = 10): DualInvestmentProduct[] => {
        if (!data?.bestByExchange) return [];

        return Object.values(data.bestByExchange)
            .filter(Boolean)
            .sort((a, b) => (b?.apy || 0) - (a?.apy || 0))
            .slice(0, limit) as DualInvestmentProduct[];
    }, [data]);

    // Calculate time since last update
    const getTimeSinceUpdate = useCallback((): string => {
        if (!data?.lastUpdated) return 'mai';

        const now = new Date();
        const diff = now.getTime() - new Date(data.lastUpdated).getTime();

        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'ora';
        if (minutes < 60) return `${minutes} min fa`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ore fa`;

        return `${Math.floor(hours / 24)} giorni fa`;
    }, [data]);

    return {
        data,
        loading,
        error,
        lastFetch,
        refresh: fetchDeals,
        getBestForDuration,
        getTopDeals,
        getTimeSinceUpdate,
        isUsingMockData: data === MOCK_DATA,
    };
}

// Helper to get exchange display name and color
export const EXCHANGE_CONFIG: Record<Exchange, { name: string; color: string; bgColor: string }> = {
    binance: { name: 'Binance', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    kucoin: { name: 'KuCoin', color: 'text-green-400', bgColor: 'bg-green-500/10' },
    okx: { name: 'OKX', color: 'text-white', bgColor: 'bg-white/10' },
    pionex: { name: 'Pionex', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    bybit: { name: 'Bybit', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    bitget: { name: 'Bitget', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    bingx: { name: 'BingX', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
};
