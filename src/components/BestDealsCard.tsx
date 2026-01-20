/**
 * BestDealsCard - Premium Feature
 * 
 * Displays the best Dual Investment deals across all exchanges.
 * Shows:
 * - Best overall deal (highest APY)
 * - Comparison across exchanges
 * - Best by duration
 * - Real-time BTC price
 */

import { motion, AnimatePresence } from 'motion/react';
import {
    Trophy,
    RefreshCw,
    ExternalLink,
    Zap,
    AlertCircle,
    ChevronRight,
    Clock,
    Crown
} from 'lucide-react';
import { useState } from 'react';
import { useBestDeals, EXCHANGE_CONFIG, DualInvestmentProduct, Exchange } from '../hooks/useBestDeals';
import { BaseCard } from './ui/cards';

// Exchange logos (simplified inline SVGs or emoji fallbacks)
const ExchangeLogo = ({ exchange, size = 24 }: { exchange: Exchange; size?: number }) => {
    const logos: Record<Exchange, string> = {
        binance: '🟡',
        kucoin: '🟢',
        okx: '⚪',
        pionex: '🔵',
        bybit: '🟠',
        bitget: '🔷',
        bingx: '🟣',
    };

    return (
        <span style={{ fontSize: size * 0.8 }} className="flex items-center justify-center">
            {logos[exchange]}
        </span>
    );
};

// Format APY with color coding
const APYDisplay = ({ apy, size = 'lg' }: { apy: number; size?: 'sm' | 'lg' | 'xl' }) => {
    const sizeClasses = {
        sm: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-4xl',
    };

    const getColor = (apy: number) => {
        if (apy >= 80) return 'text-emerald-400';
        if (apy >= 50) return 'text-green-400';
        if (apy >= 30) return 'text-yellow-400';
        return 'text-orange-400';
    };

    return (
        <span className={`font-black ${sizeClasses[size]} ${getColor(apy)} tracking-tight`}>
            +{apy.toFixed(2)}%
        </span>
    );
};

// Single deal row
const DealRow = ({
    deal,
    rank,
    showDetails = false
}: {
    deal: DualInvestmentProduct;
    rank?: number;
    showDetails?: boolean;
}) => {
    const config = EXCHANGE_CONFIG[deal.exchange];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
        >
            {/* Rank */}
            {rank && (
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                    ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                            rank === 3 ? 'bg-amber-600/20 text-amber-500' :
                                'bg-white/5 text-[#666677]'}`}>
                    {rank}
                </div>
            )}

            {/* Exchange */}
            <div className="flex items-center gap-2 min-w-[100px]">
                <ExchangeLogo exchange={deal.exchange} />
                <span className={`text-sm font-bold ${config.color}`}>
                    {config.name}
                </span>
            </div>

            {/* APY */}
            <div className="flex-1">
                <APYDisplay apy={deal.apy} size="sm" />
            </div>

            {/* Details */}
            {showDetails && (
                <>
                    <div className="text-right">
                        <div className="text-sm font-bold text-white">
                            ${deal.targetPrice?.toLocaleString() || '-'}
                        </div>
                        <div className={`text-xs font-medium ${(deal.priceDiffPercent || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {deal.priceDiffPercent?.toFixed(2)}%
                        </div>
                    </div>

                    <div className="text-right min-w-[50px]">
                        <div className="text-sm font-bold text-white">{deal.durationDays}G</div>
                        <div className="text-[10px] text-[#666677] uppercase">Durata</div>
                    </div>
                </>
            )}

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-[#444455] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </motion.div>
    );
};

// Best Deal Hero Card
const BestDealHero = ({ deal, btcPrice }: { deal: DualInvestmentProduct; btcPrice: number }) => {
    const config = EXCHANGE_CONFIG[deal.exchange];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-500/20 p-6"
        >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                            🏆 Miglior Premio
                        </div>
                        <div className="text-xs text-[#888899]">
                            BTC ${btcPrice.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Main APY */}
                <div className="mb-4">
                    <APYDisplay apy={deal.apy} size="xl" />
                    <div className="text-sm text-[#888899] mt-1">
                        APY Annualizzato
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677] mb-1">
                            Exchange
                        </div>
                        <div className="flex items-center gap-2">
                            <ExchangeLogo exchange={deal.exchange} size={20} />
                            <span className={`text-sm font-bold ${config.color}`}>
                                {config.name}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677] mb-1">
                            Target Price
                        </div>
                        <div className="text-sm font-bold text-white">
                            ${deal.targetPrice?.toLocaleString()}
                        </div>
                        <div className={`text-xs ${(deal.priceDiffPercent || 0) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {deal.priceDiffPercent?.toFixed(2)}% dal prezzo
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677] mb-1">
                            Durata
                        </div>
                        <div className="text-sm font-bold text-white">
                            {deal.durationDays} {deal.durationDays === 1 ? 'Giorno' : 'Giorni'}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 transition-all group">
                    <span>Vai su {config.name}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

// Duration filter pills
const DurationFilter = ({
    selected,
    onChange
}: {
    selected: number | null;
    onChange: (days: number | null) => void;
}) => {
    const durations = [
        { days: null, label: 'Tutti' },
        { days: 1, label: '1G' },
        { days: 2, label: '2G' },
        { days: 3, label: '3G' },
        { days: 7, label: '7G' },
    ];

    return (
        <div className="flex gap-2">
            {durations.map(({ days, label }) => (
                <button
                    key={label}
                    onClick={() => onChange(days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                        ${selected === days
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/[0.03] text-[#666677] border border-white/[0.05] hover:bg-white/[0.05]'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

// Main Component
interface BestDealsCardProps {
    className?: string;
    compact?: boolean;
    onViewAll?: () => void;
}

export function BestDealsCard({ className = '', compact = false, onViewAll }: BestDealsCardProps) {
    const {
        data,
        loading,
        error,
        refresh,
        getTopDeals,
        getTimeSinceUpdate,
        isUsingMockData
    } = useBestDeals();

    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Get top deals, optionally filtered by duration
    const topDeals = getTopDeals(compact ? 3 : 7).filter(deal =>
        selectedDuration === null || deal.durationDays === selectedDuration
    );

    if (loading && !data) {
        return (
            <BaseCard className={className}>
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            </BaseCard>
        );
    }

    if (error && !data) {
        return (
            <BaseCard className={className}>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm text-[#888899]">Impossibile caricare i dati</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-3 text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                        Riprova
                    </button>
                </div>
            </BaseCard>
        );
    }

    return (
        <BaseCard className={className} noPadding>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Best Premium Deals
                                {isUsingMockData && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                                        Demo
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-[#666677] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Aggiornato {getTimeSinceUpdate()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#666677] ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Best Deal Hero (non-compact only) */}
                {!compact && data?.bestOverall && (
                    <div className="mb-6">
                        <BestDealHero deal={data.bestOverall} btcPrice={data.btcPrice} />
                    </div>
                )}

                {/* Duration Filter */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677]">
                        Confronto Exchange
                    </div>
                    <DurationFilter selected={selectedDuration} onChange={setSelectedDuration} />
                </div>

                {/* Deals List */}
                <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {topDeals.map((deal, index) => (
                            <DealRow
                                key={`${deal.exchange}-${deal.durationDays}`}
                                deal={deal}
                                rank={index + 1}
                                showDetails={!compact}
                            />
                        ))}
                    </AnimatePresence>

                    {topDeals.length === 0 && (
                        <div className="text-center py-8 text-sm text-[#666677]">
                            Nessun prodotto disponibile per questa durata
                        </div>
                    )}
                </div>

                {/* Stats Footer */}
                {!compact && data && (
                    <div className="mt-6 pt-4 border-t border-white/[0.05]">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-lg font-bold text-white">{data.fetchStats.total}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677]">
                                    Prodotti
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-green-400">{data.fetchStats.successful}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677]">
                                    Exchange
                                </div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white">${data.btcPrice.toLocaleString()}</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#666677]">
                                    BTC Price
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View All Button */}
                {(compact || onViewAll) && (
                    <button
                        onClick={onViewAll}
                        className="w-full mt-4 py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] text-sm font-bold text-[#888899] hover:text-white flex items-center justify-center gap-2 transition-all group"
                    >
                        <span>Vedi tutti i prodotti</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* Premium Badge */}
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500/5 to-transparent border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400">
                            Premium Feature
                        </span>
                    </div>
                    <span className="text-[10px] text-[#666677]">
                        Dati da 7 exchange
                    </span>
                </div>
            </div>
        </BaseCard>
    );
}

// Compact version for sidebar or home
export function BestDealsCompact({ onViewAll }: { onViewAll?: () => void }) {
    return <BestDealsCard compact onViewAll={onViewAll} />;
}

export default BestDealsCard;
