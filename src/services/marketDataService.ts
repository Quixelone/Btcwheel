/**
 * Market Data Service
 * 
 * Fetches real-time market data to feed Prof Satoshi AI.
 * - Fear & Greed Index
 * - BTC Candles (for RSI/MACD)
 * - Volatility (implied or historical)
 */

interface MarketData {
    price: number;
    fearAndGreed: {
        value: number;
        classification: string;
    };
    rsi: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    volatility: number; // 24h change % absolute
}

export const marketDataService = {

    async getFearAndGreed(): Promise<{ value: number; classification: string }> {
        try {
            const baseUrl = import.meta.env.DEV ? '/api/alternative' : 'https://api.alternative.me';
            const res = await fetch(`${baseUrl}/fng/`);
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                return {
                    value: parseInt(data.data[0].value),
                    classification: data.data[0].value_classification
                };
            }
        } catch (e) {
            console.warn('Failed to fetch Fear & Greed:', e);
        }
        return { value: 50, classification: 'Neutral' };
    },

    async getBTCPriceAndCandles(): Promise<{ price: number; candles: any[] }> {
        try {
            // Fetch last 30 days daily candles
            const baseUrl = import.meta.env.DEV ? '/api/binance' : 'https://api.binance.com';
            const res = await fetch(`${baseUrl}/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30`);
            const data = await res.json();

            // Binance kline format: [time, open, high, low, close, volume, ...]
            const candles = data.map((c: any[]) => ({
                time: c[0],
                open: parseFloat(c[1]),
                high: parseFloat(c[2]),
                low: parseFloat(c[3]),
                close: parseFloat(c[4]),
                volume: parseFloat(c[5])
            }));

            const currentPrice = candles[candles.length - 1].close;
            return { price: currentPrice, candles };
        } catch (e) {
            console.warn('Failed to fetch Binance candles:', e);
            return { price: 95000, candles: [] };
        }
    },

    calculateRSI(closes: number[], period: number = 14): number {
        if (closes.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = closes[closes.length - period - 1 + i] - closes[closes.length - period - 1 + i - 1];
            if (change > 0) gains += change;
            else losses += Math.abs(change);
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        // Simple RSI calculation (not smoothed for simplicity, but good enough for AI context)
        // For better accuracy we should use smoothed moving average
        if (avgLoss === 0) return 100;

        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    },

    async getFullMarketOverview(): Promise<MarketData> {
        const [fng, market] = await Promise.all([
            this.getFearAndGreed(),
            this.getBTCPriceAndCandles()
        ]);

        const closes = market.candles.map(c => c.close);
        const rsi = this.calculateRSI(closes);

        // Simple trend detection (SMA 7 vs SMA 25)
        let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (closes.length >= 25) {
            const sma7 = closes.slice(-7).reduce((a, b) => a + b, 0) / 7;
            const sma25 = closes.slice(-25).reduce((a, b) => a + b, 0) / 25;
            trend = sma7 > sma25 ? 'bullish' : 'bearish';
        }

        // Volatility (last candle range %)
        const lastCandle = market.candles[market.candles.length - 1];
        const volatility = lastCandle ? ((lastCandle.high - lastCandle.low) / lastCandle.low) * 100 : 0;

        return {
            price: market.price,
            fearAndGreed: fng,
            rsi: Math.round(rsi),
            trend,
            volatility
        };
    }
};
