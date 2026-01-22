/**
 * Deribit API Service
 * 
 * Handles authentication and data fetching from Deribit exchange.
 * READ-ONLY: We only fetch data, never execute orders.
 * 
 * API Documentation: https://docs.deribit.com/
 */

const DERIBIT_API_BASE = 'https://www.deribit.com/api/v2';
// const TESTNET_API_BASE = 'https://test.deribit.com/api/v2'; // Use for testing if needed

export interface DeribitCredentials {
    clientId: string;
    clientSecret: string;
}

export interface DeribitPosition {
    instrument_name: string;
    size: number;
    average_price: number;
    mark_price: number;
    floating_profit_loss: number;
    kind: 'future' | 'option';
}

export interface DeribitAccountSummary {
    equity: number;
    balance: number;
    options_gamma: number;
    options_theta: number;
    options_vega: number;
    currency: string;
}

/**
 * Deribit API Client
 */
export class DeribitClient {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor(credentials: DeribitCredentials) {
        this.clientId = credentials.clientId;
        this.clientSecret = credentials.clientSecret;
    }

    /**
     * Authenticate and get Access Token
     */
    private async authenticate(): Promise<string> {
        // Return existing token if valid (with 60s buffer)
        if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
            return this.accessToken;
        }

        const url = `${DERIBIT_API_BASE}/public/auth?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(`Deribit Auth Error: ${data.error.message}`);
            }

            this.accessToken = data.result.access_token;
            // expires_in is in seconds
            this.tokenExpiresAt = Date.now() + (data.result.expires_in * 1000);

            return this.accessToken!;
        } catch (error) {
            console.error('Deribit Authentication Failed:', error);
            throw error;
        }
    }

    /**
     * Make authenticated request
     */
    private async request<T>(method: string, endpoint: string, params: Record<string, any> = {}): Promise<T> {
        const token = await this.authenticate();

        // Build query string
        const queryParams = new URLSearchParams(params).toString();
        const url = `${DERIBIT_API_BASE}${endpoint}?${queryParams}`;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Deribit API Error [${endpoint}]: ${data.error.message}`);
        }

        return data.result;
    }

    /**
     * Get Account Summary (Balance, Equity)
     */
    async getAccountSummary(currency: 'BTC' | 'ETH' | 'USDC' = 'BTC'): Promise<DeribitAccountSummary> {
        return this.request<DeribitAccountSummary>('GET', '/private/get_account_summary', { currency });
    }

    /**
     * Get Open Positions
     */
    async getPositions(currency: 'BTC' | 'ETH' | 'USDC' = 'BTC'): Promise<DeribitPosition[]> {
        return this.request<DeribitPosition[]>('GET', '/private/get_positions', { currency });
    }

    /**
     * Test Connection
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.authenticate();
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Storage Helpers
 */
const DERIBIT_STORAGE_KEY = 'btcwheel_deribit_credentials';

export function saveDeribitCredentials(credentials: DeribitCredentials): void {
    const encrypted = btoa(JSON.stringify(credentials));
    localStorage.setItem(DERIBIT_STORAGE_KEY, encrypted);
}

export function getDeribitCredentials(): DeribitCredentials | null {
    const stored = localStorage.getItem(DERIBIT_STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(atob(stored));
    } catch {
        return null;
    }
}

export function clearDeribitCredentials(): void {
    localStorage.removeItem(DERIBIT_STORAGE_KEY);
}

export function hasDeribitCredentials(): boolean {
    return localStorage.getItem(DERIBIT_STORAGE_KEY) !== null;
}
