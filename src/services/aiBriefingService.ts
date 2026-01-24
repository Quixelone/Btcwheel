import { BriefingData } from '../types/satoshi';
import { supabase } from '../lib/supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Fallback mock data in case of API failure
const FALLBACK_DATA: BriefingData = {
    date: new Date().toLocaleDateString('it-IT'),
    time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    btcPrice: 95000,
    bias: {
        direction: 'neutral',
        confidence: 50,
        summary: "Impossibile connettersi all'IA. Dati simulati.",
    },
    macro: {
        status: 'neutral',
        summary: "Nessun dato macro disponibile al momento.",
    },
    technical: {
        rsi: 50,
        macdSignal: 'Neutral',
        support: 90000,
        resistance: 100000,
        summary: "Analisi tecnica non disponibile.",
    },
    strikes: [
        {
            level: 'conservativo',
            emoji: '🟢',
            price: 90000,
            premium: 0.8,
            risk: 'low',
            distancePercent: 5.2,
            description: "Strike molto sicuro, lontano dal prezzo attuale.",
        },
        {
            level: 'moderato',
            emoji: '🟡',
            price: 92000,
            premium: 1.2,
            risk: 'medium',
            distancePercent: 3.1,
            description: "Buon bilanciamento rischio/rendimento.",
        },
        {
            level: 'aggressivo',
            emoji: '🔴',
            price: 94000,
            premium: 1.8,
            risk: 'high',
            distancePercent: 1.0,
            description: "Strike vicino al prezzo, alto premio ma alto rischio.",
        },
    ],
    userProfile: 'Moderato',
    recommendedStrike: 92000,
    action: 'VENDI PUT',
};

import { marketDataService } from './marketDataService';

// ... (imports)

export const aiBriefingService = {
    async generateBriefing(): Promise<BriefingData> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const cacheKey = `daily_briefing_${today}`;

        // 1. Check Cache (KV Store)
        try {
            const { data } = await supabase
                .from('kv_store_7c0f82ca')
                .select('value')
                .eq('key', cacheKey)
                .maybeSingle();

            if (data?.value) {
                console.log('✅ Briefing loaded from cache');
                return data.value as BriefingData;
            }
        } catch (err) {
            console.warn('Cache check failed:', err);
        }

        if (!OPENAI_API_KEY) {
            console.warn('OpenAI API Key missing, using fallback data');
            return FALLBACK_DATA;
        }

        try {
            // 2. Get Real Market Data
            const marketData = await marketDataService.getFullMarketOverview();
            console.log('📊 Market Data for AI:', marketData);

            // 3. Call OpenAI
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // Fast and cheap
                    messages: [
                        {
                            role: 'system',
                            content: `Sei Prof Satoshi, un esperto trader di Bitcoin specializzato nella "Wheel Strategy" (vendita di PUT e CALL).
                            Analizza il mercato attuale e genera un briefing giornaliero in formato JSON.
                            
                            DATI DI MERCATO ATTUALI:
                            - Prezzo Bitcoin: $${marketData.price}
                            - Fear & Greed Index: ${marketData.fearAndGreed.value} (${marketData.fearAndGreed.classification})
                            - RSI (14): ${marketData.rsi}
                            - Trend (SMA): ${marketData.trend}
                            - Volatilità 24h: ${marketData.volatility.toFixed(2)}%
                            
                            Devi fornire:
                            1. Bias di mercato (bullish/bearish/neutral) basato sui dati sopra.
                            2. Analisi Macro sintetica (inventa news plausibili se non hai dati specifici, ma basati sul sentiment).
                            3. Analisi Tecnica basata su RSI e Trend forniti.
                            4. 3 Strike consigliati per vendere PUT (Conservativo, Moderato, Aggressivo).
                               - Conservativo: Delta basso (~0.15), lontano dal prezzo.
                               - Moderato: Delta medio (~0.30).
                               - Aggressivo: Delta alto (~0.45), vicino al prezzo (ATM).
                            
                            Rispondi ESCLUSIVAMENTE con un oggetto JSON valido che rispetta questa struttura, senza markdown:
                            {
                                "date": "DD/MM/YYYY",
                                "time": "HH:MM",
                                "btcPrice": number,
                                "bias": { "direction": "bullish"|"bearish"|"neutral", "confidence": number (0-100), "summary": "string" },
                                "macro": { "status": "bullish"|"bearish"|"neutral", "summary": "string" },
                                "technical": { "rsi": number, "macdSignal": "string", "support": number, "resistance": number, "summary": "string" },
                                "strikes": [
                                    { "level": "conservativo", "emoji": "🟢", "price": number, "premium": number (stima %), "risk": "low", "distancePercent": number, "description": "string" },
                                    { "level": "moderato", "emoji": "🟡", "price": number, "premium": number, "risk": "medium", "distancePercent": number, "description": "string" },
                                    { "level": "aggressivo", "emoji": "🔴", "price": number, "premium": number, "risk": "high", "distancePercent": number, "description": "string" }
                                ],
                                "userProfile": "Moderato",
                                "recommendedStrike": number (uno dei prezzi sopra),
                                "action": "VENDI PUT"
                            }`
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Clean markdown if present
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(jsonStr);

            const finalData = {
                ...parsedData,
                btcPrice: marketData.price // Ensure we use the real fetched price
            };

            // 4. Save to Cache (KV Store)
            try {
                await supabase.from('kv_store_7c0f82ca').upsert({
                    key: cacheKey,
                    value: finalData,
                    updated_at: new Date().toISOString()
                });
                console.log('✅ Briefing saved to cache');
            } catch (err) {
                console.warn('Failed to save briefing to cache:', err);
            }

            return finalData;

        } catch (error: any) {
            console.error('AI Briefing Generation failed:', error);
            return {
                ...FALLBACK_DATA,
                bias: {
                    ...FALLBACK_DATA.bias,
                    summary: `Errore AI: ${error.message || 'Errore sconosciuto'}.`
                }
            };
        }
    }
};
