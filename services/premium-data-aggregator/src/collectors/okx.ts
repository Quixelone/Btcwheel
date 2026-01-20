/**
 * OKX Dual Investment API Collector
 * 
 * Endpoint: GET /api/v5/asset/earn/offers
 * Docs: https://www.okx.com/docs-v5/en/#financial-product
 */

import axios from 'axios';
import CryptoJS from 'crypto-js';
import { CollectorInterface, DualInvestmentProduct, FetchResult } from '../types/index.js';
import { EXCHANGES } from '../config.js';

interface OKXProduct {
    ccy: string;
    productId: string;
    protocol: string;
    protocolType: string;
    term: string;
    apy: string;
    earlyRedeem: boolean;
    state: string;
    investData: Array<{
        bal: string;
        ccy: string;
        maxAmt: string;
        minAmt: string;
    }>;
    earningData: Array<{
        ccy: string;
        earningType: string;
    }>;
}

interface OKXResponse {
    code: string;
    data: OKXProduct[];
    msg: string;
}

export class OKXCollector implements CollectorInterface {
    exchange = 'okx' as const;

    private config = EXCHANGES.find(e => e.name === 'okx')!;

    private generateSignature(timestamp: string, method: string, path: string, body: string = ''): string {
        const secret = this.config.apiSecret || '';
        const message = timestamp + method + path + body;
        return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, secret));
    }

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const products: DualInvestmentProduct[] = [];

        try {
            if (!this.config.apiKey || !this.config.apiSecret || !this.config.passphrase) {
                throw new Error('OKX API credentials not configured');
            }

            // OKX uses ISO timestamp
            const timestamp = new Date().toISOString();
            const method = 'GET';
            const path = '/api/v5/finance/staking-defi/offers';

            const signature = this.generateSignature(timestamp, method, path);

            const response = await axios.get<OKXResponse>(
                `${this.config.apiBaseUrl}${path}`,
                {
                    headers: {
                        'OK-ACCESS-KEY': this.config.apiKey,
                        'OK-ACCESS-SIGN': signature,
                        'OK-ACCESS-TIMESTAMP': timestamp,
                        'OK-ACCESS-PASSPHRASE': this.config.passphrase,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                }
            );

            if (response.data.code !== '0') {
                throw new Error(`OKX API error: ${response.data.msg}`);
            }

            // Filter for Dual Investment products (if identifiable)
            // OKX groups all financial products together
            for (const item of response.data.data) {
                // Parse term (e.g., "1D", "2D", "7D")
                const termMatch = item.term.match(/^(\d+)/);
                const durationDays = termMatch ? parseInt(termMatch[1]) : 1;

                const investData = item.investData[0];

                products.push({
                    exchange: 'okx',
                    productId: item.productId,
                    investCoin: investData?.ccy || item.ccy,
                    exerciseCoin: 'BTC', // OKX doesn't always specify
                    optionType: 'PUT', // Default, OKX doesn't clearly distinguish
                    apy: parseFloat(item.apy) * 100,
                    targetPrice: 0, // OKX earn doesn't have strike price
                    durationDays,
                    minAmount: investData ? parseFloat(investData.minAmt) : undefined,
                    maxAmount: investData ? parseFloat(investData.maxAmt) : undefined,
                    fetchedAt: new Date(),
                    dataSource: 'api',
                    rawData: item as unknown as Record<string, unknown>,
                });
            }

            console.log(`✅ [OKX] Fetched ${products.length} products`);

            return {
                exchange: 'okx',
                success: true,
                products,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [OKX] Error: ${message}`);

            return {
                exchange: 'okx',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        }
    }
}
