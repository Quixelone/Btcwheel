/**
 * Pionex API Service
 * 
 * Handles authentication and data fetching from Pionex exchange.
 * READ-ONLY: We only fetch data, never execute orders.
 * 
 * API Documentation: https://pionex-doc.gitbook.io/apidocs/
 */

import CryptoJS from 'crypto-js';

// Pionex API Base URL
// In sviluppo usa il proxy locale (/api/pionex) per evitare CORS
// In produzione useremo una Supabase Edge Function
const PIONEX_API_BASE = import.meta.env.DEV ? '/api/pionex' : 'https://api.pionex.com';

// Legge le credenziali da .env.local se disponibili
const ENV_API_KEY = import.meta.env.VITE_PIONEX_API_KEY;
const ENV_API_SECRET = import.meta.env.VITE_PIONEX_API_SECRET;

export interface PionexCredentials {
    apiKey: string;
    apiSecret: string;
}

export interface PionexBalance {
    coin: string;
    free: string;
    frozen: string;
}

export interface PionexBalanceResponse {
    result: boolean;
    data: {
        balances: PionexBalance[];
    };
}

export interface PionexTrade {
    symbol: string;
    orderId: string;
    side: 'BUY' | 'SELL';
    price: string;
    amount: string;
    filledAmount: string;
    timestamp: number;
    status: string;
}

/**
 * Generate HMAC-SHA256 signature for Pionex API
 */
function generateSignature(
    method: string,
    path: string,
    queryString: string,
    apiSecret: string,
    body?: string
): string {
    // Construct the message to sign
    let message = `${method}${path}`;

    if (queryString) {
        message += `?${queryString}`;
    }

    if (body) {
        message += body;
    }

    // Generate HMAC-SHA256
    const signature = CryptoJS.HmacSHA256(message, apiSecret);
    return signature.toString(CryptoJS.enc.Hex);
}

/**
 * Build sorted query string with timestamp
 */
function buildQueryString(params: Record<string, string | number>): string {
    // Add timestamp
    const allParams: Record<string, string | number> = {
        ...params,
        timestamp: Date.now(),
    };

    // Sort by key in ASCII order
    const sortedKeys = Object.keys(allParams).sort();

    // Build query string
    return sortedKeys
        .map(key => `${key}=${allParams[key]}`)
        .join('&');
}

/**
 * Pionex API Client
 */
export class PionexClient {
    private apiKey: string;
    private apiSecret: string;

    constructor(credentials: PionexCredentials) {
        this.apiKey = credentials.apiKey;
        this.apiSecret = credentials.apiSecret;
    }

    /**
     * Make authenticated request to Pionex API
     */
    private async request<T>(
        method: 'GET' | 'POST',
        path: string,
        params: Record<string, string | number> = {}
    ): Promise<T> {
        const queryString = buildQueryString(params);
        const signature = generateSignature(method, path, queryString, this.apiSecret);

        const url = `${PIONEX_API_BASE}${path}?${queryString}`;

        console.log('🔗 [Pionex] Making request:', {
            method,
            path,
            url: url.substring(0, 100) + '...',
        });

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'PIONEX-KEY': this.apiKey,
                    'PIONEX-SIGNATURE': signature,
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            });

            console.log('📡 [Pionex] Response status:', response.status);

            if (!response.ok) {
                const error = await response.text();
                console.error('❌ [Pionex] API Error:', error);
                throw new Error(`Pionex API Error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            console.log('✅ [Pionex] Response data:', data);
            return data;
        } catch (error) {
            // Check if it's a CORS error
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('🚫 [Pionex] CORS Error - Le API non permettono chiamate dal browser');
                throw new Error('CORS: Le API Pionex non permettono chiamate dirette dal browser. Necessario un server proxy.');
            }
            throw error;
        }
    }

    /**
     * Get account balances
     */
    async getBalances(): Promise<PionexBalance[]> {
        const response = await this.request<PionexBalanceResponse>('GET', '/api/v1/account/balances');

        if (!response.result) {
            throw new Error('Failed to fetch balances from Pionex');
        }

        return response.data.balances;
    }

    /**
     * Get BTC balance specifically
     */
    async getBTCBalance(): Promise<{ free: number; frozen: number; total: number }> {
        const balances = await this.getBalances();
        const btcBalance = balances.find(b => b.coin === 'BTC');

        if (!btcBalance) {
            return { free: 0, frozen: 0, total: 0 };
        }

        const free = parseFloat(btcBalance.free);
        const frozen = parseFloat(btcBalance.frozen);

        return {
            free,
            frozen,
            total: free + frozen,
        };
    }

    /**
     * Get USDT balance specifically
     */
    async getUSDTBalance(): Promise<{ free: number; frozen: number; total: number }> {
        const balances = await this.getBalances();
        const usdtBalance = balances.find(b => b.coin === 'USDT');

        if (!usdtBalance) {
            return { free: 0, frozen: 0, total: 0 };
        }

        const free = parseFloat(usdtBalance.free);
        const frozen = parseFloat(usdtBalance.frozen);

        return {
            free,
            frozen,
            total: free + frozen,
        };
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.getBalances();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get BTC price in real-time (public endpoint, no auth needed)
     */
    async getBTCPrice(): Promise<{ price: number; change24h: number }> {
        try {
            // Public endpoint - doesn't need authentication
            const url = `${PIONEX_API_BASE}/api/v1/market/tickers?symbol=BTC_USDT`;

            console.log('📊 [Pionex] Fetching BTC price...');

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch BTC price: ${response.status}`);
            }

            const data = await response.json();

            if (data.result && data.data && data.data.tickers && data.data.tickers.length > 0) {
                const ticker = data.data.tickers[0];
                const price = parseFloat(ticker.close || ticker.last || '0');
                const open24h = parseFloat(ticker.open || '0');
                const change24h = open24h > 0 ? ((price - open24h) / open24h) * 100 : 0;

                console.log('💰 [Pionex] BTC Price:', price, 'USDT, 24h:', change24h.toFixed(2) + '%');

                return { price, change24h };
            }

            throw new Error('Invalid response format from Pionex');
        } catch (error) {
            console.error('❌ [Pionex] Error fetching BTC price:', error);
            throw error;
        }
    }
}

/**
 * Store and retrieve Pionex credentials securely
 * In production, these should be encrypted or stored server-side
 */
const PIONEX_STORAGE_KEY = 'btcwheel_pionex_credentials';

export function savePionexCredentials(credentials: PionexCredentials): void {
    // In a real app, encrypt these before storing
    const encrypted = btoa(JSON.stringify(credentials));
    localStorage.setItem(PIONEX_STORAGE_KEY, encrypted);
}

export function getPionexCredentials(): PionexCredentials | null {
    // Prima prova le variabili d'ambiente (.env.local)
    if (ENV_API_KEY && ENV_API_SECRET &&
        ENV_API_KEY !== 'INSERISCI_LA_TUA_API_KEY' &&
        ENV_API_SECRET !== 'INSERISCI_IL_TUO_API_SECRET') {
        console.log('🔐 [Pionex] Using credentials from .env.local');
        return {
            apiKey: ENV_API_KEY,
            apiSecret: ENV_API_SECRET,
        };
    }

    // Fallback a localStorage
    const stored = localStorage.getItem(PIONEX_STORAGE_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(atob(stored));
    } catch {
        return null;
    }
}

export function clearPionexCredentials(): void {
    localStorage.removeItem(PIONEX_STORAGE_KEY);
}

export function hasPionexCredentials(): boolean {
    // Controlla sia env che localStorage
    const hasEnv = ENV_API_KEY && ENV_API_SECRET &&
        ENV_API_KEY !== 'INSERISCI_LA_TUA_API_KEY' &&
        ENV_API_SECRET !== 'INSERISCI_IL_TUO_API_SECRET';
    return hasEnv || localStorage.getItem(PIONEX_STORAGE_KEY) !== null;
}

export function isUsingEnvCredentials(): boolean {
    return ENV_API_KEY && ENV_API_SECRET &&
        ENV_API_KEY !== 'INSERISCI_LA_TUA_API_KEY' &&
        ENV_API_SECRET !== 'INSERISCI_IL_TUO_API_SECRET';
}
