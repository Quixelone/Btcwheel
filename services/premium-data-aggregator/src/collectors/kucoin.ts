/**
 * KuCoin Dual Investment API Collector
 * 
 * Endpoint: GET /api/v1/earn/dual/products
 * Docs: https://www.kucoin.com/docs/rest/earn/dual-investment
 */

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { CollectorInterface, DualInvestmentProduct, FetchResult } from '../types/index.js';
import { EXCHANGES } from '../config.js';

interface KuCoinProduct {
    id: string;
    investCurrency: string;
    exerciseCurrency: string;
    strikePrice: string;
    apr: string;
    term: number; // days
    settlementTime: number;
    minInvestAmount: string;
    maxInvestAmount: string;
    status: string;
    productType: 'BUY_LOW' | 'SELL_HIGH';
}

interface KuCoinResponse {
    code: string;
    data: KuCoinProduct[];
}

export class KuCoinCollector implements CollectorInterface {
    exchange = 'kucoin' as const;

    private config = EXCHANGES.find(e => e.name === 'kucoin')!;

    private generateSignature(timestamp: string, method: string, path: string, body: string = ''): string {
        const secret = this.config.apiSecret || '';
        const message = timestamp + method + path + body;
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secret));
    }

    private generatePassphraseSignature(): string {
        const secret = this.config.apiSecret || '';
        const passphrase = this.config.passphrase || '';
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(passphrase, secret));
    }

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const products: DualInvestmentProduct[] = [];

        try {
            if (!this.config.apiKey || !this.config.apiSecret || !this.config.passphrase) {
                throw new Error('KuCoin API credentials not configured');
            }

            const timestamp = Date.now().toString();
            const method = 'GET';
            const path = '/api/v1/earn/dual/products';

            const signature = this.generateSignature(timestamp, method, path);
            const passphraseSign = this.generatePassphraseSignature();

            const response = await axios.get<KuCoinResponse>(
                `${this.config.apiBaseUrl}${path}`,
                {
                    headers: {
                        'KC-API-KEY': this.config.apiKey,
                        'KC-API-SIGN': signature,
                        'KC-API-TIMESTAMP': timestamp,
                        'KC-API-PASSPHRASE': passphraseSign,
                        'KC-API-KEY-VERSION': '2',
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                }
            );

            if (response.data.code !== '200000') {
                throw new Error(`KuCoin API error: ${response.data.code}`);
            }

            // Transform to our format
            for (const item of response.data.data) {
                products.push({
                    exchange: 'kucoin',
                    productId: item.id,
                    investCoin: item.investCurrency,
                    exerciseCoin: item.exerciseCurrency,
                    optionType: item.productType === 'BUY_LOW' ? 'PUT' : 'CALL',
                    apy: parseFloat(item.apr) * 100,
                    targetPrice: parseFloat(item.strikePrice),
                    durationDays: item.term,
                    settleDate: new Date(item.settlementTime),
                    minAmount: parseFloat(item.minInvestAmount),
                    maxAmount: parseFloat(item.maxInvestAmount),
                    fetchedAt: new Date(),
                    dataSource: 'api',
                    rawData: item as unknown as Record<string, unknown>,
                });
            }

            console.log(`✅ [KuCoin] Fetched ${products.length} products`);

            return {
                exchange: 'kucoin',
                success: true,
                products,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [KuCoin] Error: ${message}`);

            return {
                exchange: 'kucoin',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        }
    }
}
