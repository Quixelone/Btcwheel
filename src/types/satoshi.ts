export interface MarketBias {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    summary: string;
}

export interface MacroData {
    status: 'bullish' | 'bearish' | 'neutral';
    summary: string;
}

export interface TechnicalData {
    rsi: number;
    macdSignal: string;
    support: number;
    resistance: number;
    summary: string;
}

export interface StrikeOption {
    level: 'conservativo' | 'moderato' | 'aggressivo';
    emoji: string;
    price: number;
    premium: number;
    risk: 'low' | 'medium' | 'high';
    distancePercent: number;
    description: string;
}

export interface BriefingData {
    date: string;
    time: string;
    btcPrice: number;
    bias: MarketBias;
    macro: MacroData;
    technical: TechnicalData;
    strikes: StrikeOption[];
    userProfile: string;
    recommendedStrike: number;
    action: 'VENDI PUT' | 'VENDI CALL';
}
export interface ChatMessage {
    id: string;
    sender: 'user' | 'satoshi';
    text: string;
    timestamp: number;
}
