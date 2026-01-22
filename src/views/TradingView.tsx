/**
 * TradingView - BTC Wheel Pro 2.0
 * 
 * Sezione Trading con:
 * - Confronto Premium Multi-Exchange
 * - Posizioni Attive
 * - PAC Tracker
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    TrendingUp,
    Link2,
    Plus,
    Wallet,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Loader2
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from '../components/layout/PageWrapper';
import { BaseCard, StatCard } from '../components/ui/cards';
import {
    DeribitClient,
    getDeribitCredentials,
    hasDeribitCredentials,
    type DeribitPosition
} from '../services/deribit';

interface TradingViewProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

interface ParsedPosition {
    id: string;
    type: 'PUT' | 'CALL' | 'FUTURE' | 'DUAL';
    strike: number;
    exchange: string;
    expiry: string;
    premium: number;
    premiumPercent: number;
    status: 'profit' | 'loss' | 'pending';
    raw: DeribitPosition;
}

export function TradingView({ onNavigate }: TradingViewProps) {
    const [positions, setPositions] = useState<ParsedPosition[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [btcPrice, setBtcPrice] = useState(0);
    const [deribitConnected, setDeribitConnected] = useState(false);

    // Mock data for exchanges (still static for now except connection status)
    const mockExchanges = [
        { name: 'Deribit', connected: deribitConnected, premium: '1.8%', strike: '$96,000', logo: '🟢' },
        { name: 'OKX', connected: false, premium: '1.6%', strike: '$95,800', logo: '⚪' },
        { name: 'Binance', connected: false, premium: '-', strike: '-', logo: '🟡' },
    ];

    const mockPAC = {
        thisWeek: true,
        nextDate: 'Lunedì 20 Gen',
        totalYTD: 2100,
        weeklyAmount: 50,
    };

    useEffect(() => {
        checkConnectionsAndLoad();
    }, []);

    const checkConnectionsAndLoad = async () => {
        const hasDeribit = hasDeribitCredentials();
        setDeribitConnected(hasDeribit);

        if (hasDeribit) {
            loadDeribitData();
        }
    };

    const loadDeribitData = async () => {
        setIsLoading(true);
        try {
            const creds = getDeribitCredentials();
            if (!creds) return;

            const client = new DeribitClient(creds);

            // 1. Get BTC Price
            const priceData = await client.getIndexPrice('btc_usd');
            const currentBtcPrice = priceData.index_price;
            setBtcPrice(currentBtcPrice);

            // 2. Get Positions
            const rawPositions = await client.getPositions('BTC');

            // 3. Parse Positions
            const parsed: ParsedPosition[] = rawPositions.map(pos => {
                // Format: BTC-29MAR24-60000-P
                const parts = pos.instrument_name.split('-');
                let type: ParsedPosition['type'] = 'FUTURE';
                let strike = 0;
                let expiry = parts[1] || '';

                if (parts.length >= 4) {
                    type = parts[3] === 'P' ? 'PUT' : 'CALL';
                    strike = parseInt(parts[2]);
                } else {
                    type = 'FUTURE';
                }

                // Calculate P&L status
                const isProfit = pos.floating_profit_loss >= 0;

                // Premium value in USD
                let premiumUsd = 0;
                if (pos.kind === 'option') {
                    // Options: average_price is in BTC
                    premiumUsd = pos.average_price * currentBtcPrice * Math.abs(pos.size);
                } else {
                    // Futures: just show 0 or maybe P&L? 
                    premiumUsd = 0;
                }

                const premiumPercent = strike > 0 ? (premiumUsd / (strike * Math.abs(pos.size))) * 100 : 0;

                return {
                    id: pos.instrument_name,
                    type,
                    strike,
                    exchange: 'Deribit',
                    expiry,
                    premium: premiumUsd,
                    premiumPercent: isNaN(premiumPercent) ? 0 : parseFloat(premiumPercent.toFixed(2)),
                    status: isProfit ? 'profit' : 'loss',
                    raw: pos
                };
            });

            setPositions(parsed);

        } catch (error) {
            console.error('Failed to load Deribit data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageWrapper>
            <PageContent>
                {/* Header */}
                <PageHeader
                    title="Trading"
                    subtitle="Gestisci i tuoi exchange, posizioni e PAC settimanale"
                    actions={
                        <div className="flex items-center gap-4">
                            {btcPrice > 0 && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                    <span className="text-xs text-orange-400 font-bold">BTC</span>
                                    <span className="text-sm text-white font-bold">${btcPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onNavigate('trade-journal')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Trade Journal
                                </button>
                                <button
                                    onClick={() => onNavigate('compound-tracker')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all border border-white/10"
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    Compound Tracker
                                </button>
                            </div>
                        </div>
                    }
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Capitale Totale"
                        value="€4,230"
                        icon={Wallet}
                        color="purple"
                    />
                    <StatCard
                        label="P&L Settimana"
                        value="+€127"
                        icon={TrendingUp}
                        color="green"
                        trend={{ value: 3.1, positive: true }}
                    />
                    <StatCard
                        label="Posizioni Attive"
                        value={positions.length.toString()}
                        icon={Clock}
                        color="cyan"
                    />
                    <StatCard
                        label="Exchange"
                        value={`${deribitConnected ? 1 : 0}/3`}
                        icon={Link2}
                        color="yellow"
                    />
                </div>

                {/* Premium Comparison */}
                <section>
                    <SectionHeader
                        title="Confronto Premium Oggi"
                        actions={
                            <button
                                onClick={() => onNavigate('exchange-connect')}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Collega Exchange
                            </button>
                        }
                    />

                    <div className="grid gap-3 mt-6">
                        {mockExchanges.map((exchange, index) => (
                            <motion.div
                                key={exchange.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <BaseCard className={!exchange.connected ? 'opacity-50' : ''}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">{exchange.logo}</div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white">{exchange.name}</h3>
                                                    {index === 0 && exchange.connected && (
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                                                            Best
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[#666677]">
                                                    {exchange.connected ? 'Collegato' : 'Non collegato'}
                                                </p>
                                            </div>
                                        </div>

                                        {exchange.connected ? (
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-white">{exchange.premium}</div>
                                                <div className="text-xs text-[#888899]">Strike {exchange.strike}</div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onNavigate('exchange-connect')}
                                                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-bold rounded-xl transition-all"
                                            >
                                                Collega
                                            </button>
                                        )}
                                    </div>
                                </BaseCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Active Positions */}
                <section>
                    <SectionHeader
                        title={`Posizioni Attive (${positions.length})`}
                        actions={
                            <button
                                onClick={() => onNavigate('positions')}
                                className="text-xs font-bold uppercase tracking-wider text-[#888899] hover:text-white transition-colors"
                            >
                                Vedi tutte
                            </button>
                        }
                    />

                    <div className="space-y-3 mt-6">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : positions.length === 0 ? (
                            <div className="text-center py-8 text-[#666677] bg-white/[0.02] rounded-xl border border-white/[0.05]">
                                <p>Nessuna posizione attiva rilevata.</p>
                                {!deribitConnected && (
                                    <button
                                        onClick={() => onNavigate('exchange-connect')}
                                        className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-bold"
                                    >
                                        Collega Deribit per vedere le tue posizioni
                                    </button>
                                )}
                            </div>
                        ) : (
                            positions.map((position, index) => (
                                <motion.div
                                    key={position.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                >
                                    <BaseCard onClick={() => onNavigate('position-detail')} className="group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm
                        ${position.type === 'PUT'
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        : position.type === 'CALL'
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    }
                      `}>
                                                    {position.type}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white">
                                                            ${position.strike.toLocaleString()}
                                                        </h3>
                                                        <span className="text-xs text-[#666677]">| {position.exchange}</span>
                                                    </div>
                                                    <p className="text-xs text-[#888899]">Scade: {position.expiry}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-base font-bold text-white">
                                                        ${position.premium.toFixed(2)} <span className="text-xs text-[#666677]">({position.premiumPercent}%)</span>
                                                    </div>
                                                    <div className={`text-xs font-medium flex items-center gap-1 justify-end ${position.status === 'profit' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {position.status === 'profit' ? (
                                                            <>
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                In profitto
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle className="w-3 h-3" />
                                                                In perdita
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </BaseCard>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>

                {/* PAC Tracker */}
                <section>
                    <SectionHeader title="PAC Settimanale" />

                    <BaseCard className="mt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center
                  ${mockPAC.thisWeek
                                        ? 'bg-green-500/10 border border-green-500/20'
                                        : 'bg-yellow-500/10 border border-yellow-500/20'
                                    }
                `}>
                                    {mockPAC.thisWeek ? (
                                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                                    ) : (
                                        <AlertCircle className="w-7 h-7 text-yellow-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        {mockPAC.thisWeek ? 'PAC completato ✓' : 'PAC in attesa'}
                                    </h3>
                                    <p className="text-sm text-[#888899]">
                                        Prossimo versamento: {mockPAC.nextDate}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    €{mockPAC.totalYTD.toLocaleString()}
                                </div>
                                <div className="text-xs text-[#666677]">
                                    Totale 2026 (€{mockPAC.weeklyAmount}/sett)
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/[0.05]">
                            <button
                                onClick={() => onNavigate('pac-tracker')}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl text-sm font-medium text-[#888899] hover:text-white transition-all"
                            >
                                <Calendar className="w-4 h-4" />
                                Vedi storico PAC
                            </button>
                        </div>
                    </BaseCard>
                </section>
            </PageContent>
        </PageWrapper>
    );
}

export default TradingView;
