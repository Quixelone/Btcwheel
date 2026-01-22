/**
 * TradingView - BTC Wheel Pro 2.0
 * 
 * Sezione Trading con:
 * - Confronto Premium Multi-Exchange
 * - Posizioni Attive
 * - PAC Tracker
 */

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
    ArrowRight
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader, SectionHeader } from '../components/layout/PageWrapper';
import { BaseCard, StatCard } from '../components/ui/cards';

interface TradingViewProps {
    currentView: View;
    onNavigate: (view: View) => void;
}

export function TradingView({ currentView, onNavigate }: TradingViewProps) {

    // Mock data - da sostituire con dati reali dagli exchange
    const mockExchanges = [
        { name: 'Deribit', connected: true, premium: '1.8%', strike: '$96,000', logo: '🟢' },
        { name: 'OKX', connected: true, premium: '1.6%', strike: '$95,800', logo: '⚪' },
        { name: 'Binance', connected: false, premium: '-', strike: '-', logo: '🟡' },
    ];

    const mockPositions = [
        {
            id: 1,
            type: 'PUT',
            strike: 94000,
            exchange: 'Deribit',
            expiry: 'Oggi 08:00 UTC',
            premium: 450,
            premiumPercent: 1.2,
            status: 'profit' as const,
        },
        {
            id: 2,
            type: 'DUAL',
            strike: 95500,
            exchange: 'Binance',
            expiry: 'Domani',
            premium: 380,
            premiumPercent: 0.9,
            status: 'pending' as const,
        },
    ];

    const mockPAC = {
        thisWeek: true,
        nextDate: 'Lunedì 20 Gen',
        totalYTD: 2100,
        weeklyAmount: 50,
    };

    return (
        <PageWrapper>
            <PageContent>
                {/* Header */}
                <PageHeader
                    title="Trading"
                    subtitle="Gestisci i tuoi exchange, posizioni e PAC settimanale"
                    actions={
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
                        value="2"
                        icon={Clock}
                        color="cyan"
                    />
                    <StatCard
                        label="Exchange"
                        value="2/3"
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
                        title={`Posizioni Attive (${mockPositions.length})`}
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
                        {mockPositions.map((position, index) => (
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
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
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
                                                    ${position.premium} <span className="text-xs text-[#666677]">({position.premiumPercent}%)</span>
                                                </div>
                                                <div className={`text-xs font-medium flex items-center gap-1 justify-end ${position.status === 'profit' ? 'text-green-400' : 'text-yellow-400'
                                                    }`}>
                                                    {position.status === 'profit' ? (
                                                        <>
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            In profitto
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-3 h-3" />
                                                            In attesa
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-[#444455] group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </BaseCard>
                            </motion.div>
                        ))}
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
