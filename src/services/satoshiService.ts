import { BriefingData, MarketBias, StrikeOption } from '../types/satoshi';

// Preset messages for simulation
const MACRO_SUMMARIES = [
    "La Fed mantiene i tassi invariati. Il mercato attende i dati sull'inflazione (CPI) di domani.",
    "Dati sulla disoccupazione migliori del previsto. Possibile volatilità all'apertura di Wall Street.",
    "Nessun evento macroeconomico rilevante oggi. Focus sui flussi degli ETF Spot.",
    "Tensioni geopolitiche in aumento potrebbero spingere gli asset rifugio come BTC.",
    "Il dollaro (DXY) mostra debolezza, favorendo gli asset di rischio."
];

const TECH_SUMMARIES = [
    "RSI in zona neutrale (55). Supporto chiave a $92k, resistenza a $98k.",
    "Golden Cross confermato sul 4h. Momentum rialzista in aumento.",
    "Divergenza ribassista sull'RSI giornaliero. Possibile ritracciamento a breve.",
    "Prezzo compresso nelle Bande di Bollinger. Atteso un movimento esplosivo.",
    "Volumi in calo nel weekend. Probabile lateralizzazione nel range $94k-$96k."
];

const BIAS_OPTIONS: MarketBias[] = [
    {
        direction: 'bullish',
        confidence: 75,
        summary: 'Sentiment positivo su X e Reddit. ETF inflows in aumento. Whale accumulation rilevata.'
    },
    {
        direction: 'bearish',
        confidence: 65,
        summary: 'Prese di profitto dopo il recente rally. Funding rates elevati suggeriscono cautela.'
    },
    {
        direction: 'neutral',
        confidence: 80,
        summary: 'Mercato in fase di consolidamento. Nessuna direzione chiara al momento.'
    }
];

export const satoshiService = {
    getDailyBriefing: (): BriefingData => {
        const today = new Date().toLocaleDateString('it-IT');
        const storageKey = `btcwheel_briefing_${today}`;

        // Try to get from storage first
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            return JSON.parse(stored);
        }

        // Generate new briefing
        const briefing = generateDailyBriefing();
        localStorage.setItem(storageKey, JSON.stringify(briefing));
        return briefing;
    }
};

function generateDailyBriefing(): BriefingData {
    const now = new Date();
    // Simulate BTC Price between 90k and 100k
    const btcPrice = Math.floor(Math.random() * (100000 - 90000) + 90000);

    // Pick random bias
    const bias = BIAS_OPTIONS[Math.floor(Math.random() * BIAS_OPTIONS.length)];

    // Pick random summaries
    const macroSummary = MACRO_SUMMARIES[Math.floor(Math.random() * MACRO_SUMMARIES.length)];
    const techSummary = TECH_SUMMARIES[Math.floor(Math.random() * TECH_SUMMARIES.length)];

    // Calculate strikes based on bias and price
    const strikes = calculateStrikes(btcPrice, bias.direction);

    // Determine action
    const action = bias.direction === 'bullish' || bias.direction === 'neutral' ? 'VENDI PUT' : 'VENDI CALL';

    // Determine recommended strike (simplified logic: moderate is usually recommended)
    const recommendedStrike = strikes.find(s => s.level === 'moderato')?.price || strikes[1].price;

    return {
        date: now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: '08:30', // Fixed time for daily briefing
        btcPrice,
        bias: {
            ...bias,
            confidence: Math.floor(Math.random() * (90 - 60) + 60) // Randomize confidence slightly
        },
        macro: {
            status: 'neutral', // Simplified
            summary: macroSummary
        },
        technical: {
            rsi: Math.floor(Math.random() * (70 - 30) + 30),
            macdSignal: Math.random() > 0.5 ? 'bullish' : 'bearish',
            support: Math.floor(btcPrice * 0.95 / 100) * 100,
            resistance: Math.floor(btcPrice * 1.05 / 100) * 100,
            summary: techSummary
        },
        strikes,
        userProfile: 'moderato', // Default, could be fetched from user profile
        recommendedStrike,
        action
    };
}

function calculateStrikes(currentPrice: number, direction: 'bullish' | 'bearish' | 'neutral'): StrikeOption[] {
    const isPut = direction !== 'bearish'; // Sell Put for Bullish/Neutral, Sell Call for Bearish

    // Base percentages for strikes distance
    // Conservative: Far OTM
    // Moderate: OTM
    // Aggressive: Near ATM

    let distances: number[];
    if (isPut) {
        // Price is below current
        distances = [0.05, 0.03, 0.01]; // -5%, -3%, -1%
    } else {
        // Price is above current (Call)
        distances = [0.05, 0.03, 0.01]; // +5%, +3%, +1%
    }

    const levels = ['conservativo', 'moderato', 'aggressivo'] as const;
    const emojis = ['🟢', '🟡', '🔴'];
    const risks = ['low', 'medium', 'high'] as const;
    const premiums = [0.15, 0.25, 0.40]; // Base premiums

    return levels.map((level, i) => {
        const distance = distances[i];
        const price = isPut
            ? Math.floor(currentPrice * (1 - distance) / 100) * 100
            : Math.ceil(currentPrice * (1 + distance) / 100) * 100;

        return {
            level,
            emoji: emojis[i],
            price,
            premium: premiums[i] + (Math.random() * 0.1 - 0.05), // Add some noise
            risk: risks[i],
            distancePercent: parseFloat((distance * 100).toFixed(1)),
            description: getStrikeDescription(level, isPut)
        };
    });
}

function getStrikeDescription(level: string, isPut: boolean): string {
    const type = isPut ? "PUT" : "CALL";
    if (level === 'conservativo') return `Lontano dal prezzo, probabilità di successo molto alta. Premium basso. (Vendi ${type})`;
    if (level === 'moderato') return `Bilanciamento ideale tra rischio e rendimento. Consigliato per la maggior parte. (Vendi ${type})`;
    return `Molto vicino al prezzo attuale. Premium alto ma rischio di assegnazione elevato. (Vendi ${type})`;
}
