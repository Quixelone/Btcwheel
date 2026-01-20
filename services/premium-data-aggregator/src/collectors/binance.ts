/**
 * Binance Dual Investment API Collector
 * 
 * Endpoint: GET /sapi/v1/dci/product/list
 * Docs: https://developers.binance.com/docs/dual_investment
 */

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { CollectorInterface, DualInvestmentProduct, FetchResult } from '../types/index.js';
import { EXCHANGES } from '../config.js';

interface BinanceProduct {
    id: string;
    investCoin: string;
    exercisedCoin: string;
    strikePrice: string;
    duration: number;
    settleDate: number;
    purchaseDecimal: number;
    purchaseEndTime: number;
    canPurchase: boolean;
    apr: string;
    orderId: number;
    minAmount: string;
    maxAmount: string;
    createTimestamp: number;
    optionType: 'PUT' | 'CALL';
    isAutoCompoundEnable: boolean;
    autoCompoundPlanList: string[];
}

interface BinanceResponse {
    total: number;
    list: BinanceProduct[];
}

export class BinanceCollector implements CollectorInterface {
    exchange = 'binance' as const;

    private config = EXCHANGES.find(e => e.name === 'binance')!;

    private generateSignature(queryString: string): string {
        const secret = this.config.apiSecret || '';
        return CryptoJS.HmacSHA256(queryString, secret).toString(CryptoJS.enc.Hex);
    }

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const products: DualInvestmentProduct[] = [];

        try {
            if (!this.config.apiKey || !this.config.apiSecret) {
                throw new Error('Binance API credentials not configured');
            }

            // Fetch both PUT and CALL products
            const optionTypes: ('PUT' | 'CALL')[] = ['PUT', 'CALL'];

            for (const optionType of optionTypes) {
                const timestamp = Date.now();
                const params = new URLSearchParams({
                    optionType,
                    exercisedCoin: optionType === 'PUT' ? 'BTC' : 'USDT',
                    investCoin: optionType === 'PUT' ? 'USDT' : 'BTC',
                    pageSize: '100',
                    pageIndex: '1',
                    timestamp: timestamp.toString(),
                });

                const signature = this.generateSignature(params.toString());
                params.append('signature', signature);

                const response = await axios.get<BinanceResponse>(
                    `${this.config.apiBaseUrl}/sapi/v1/dci/product/list?${params.toString()}`,
                    {
                        headers: {
                            'X-MBX-APIKEY': this.config.apiKey,
                        },
                        timeout: 10000,
                    }
                );

                // Transform to our format
                for (const item of response.data.list) {
                    products.push({
                        exchange: 'binance',
                        productId: item.id,
                        investCoin: item.investCoin,
                        exerciseCoin: item.exercisedCoin,
                        optionType: item.optionType,
                        apy: parseFloat(item.apr) * 100, // Convert to percentage
                        targetPrice: parseFloat(item.strikePrice),
                        durationDays: item.duration,
                        settleDate: new Date(item.settleDate),
                        minAmount: parseFloat(item.minAmount),
                        maxAmount: parseFloat(item.maxAmount),
                        fetchedAt: new Date(),
                        dataSource: 'api',
                        rawData: item as unknown as Record<string, unknown>,
                    });
                }
            }

            console.log(`✅ [Binance] Fetched ${products.length} products`);

            return {
                exchange: 'binance',
                success: true,
                products,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [Binance] Error: ${message}`);

            return {
                exchange: 'binance',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        }
    }
}
