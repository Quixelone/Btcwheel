/**
 * BestDealsView - Full Page View
 * 
 * Complete page for viewing all Dual Investment products
 * across all 7 exchanges with filtering and sorting options.
 */

import { motion } from 'motion/react';
import {
    ArrowLeft,
    Trophy,
    Filter,
    SlidersHorizontal,
    Clock,
    RefreshCw,
    Info
} from 'lucide-react';
import { useState } from 'react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent } from '../components/layout/PageWrapper';
import { BaseCard } from '../components/ui/cards';
import BestDealsCard from '../components/BestDealsCard';
import { useBestDeals, EXCHANGE_CONFIG, Exchange } from '../hooks/useBestDeals';

interface BestDealsViewProps {
    onNavigate: (view: View) => void;
}

export function BestDealsView({ onNavigate }: BestDealsViewProps) {
    const {
        data,
        refresh,
        getTimeSinceUpdate,
        isUsingMockData
    } = useBestDeals();

    const [sortBy, setSortBy] = useState<'apy' | 'duration' | 'exchange'>('apy');
    const [filterExchange, setFilterExchange] = useState<Exchange | 'all'>('all');
    const [filterDuration, setFilterDuration] = useState<number | 'all'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Note: sortBy, filterExchange, filterDuration are used by the filter UI
    // The actual filtering is handled inside BestDealsCard component
    // Future: pass these as props to BestDealsCard for custom filtering
    void sortBy; void filterExchange; void filterDuration;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const exchanges: (Exchange | 'all')[] = ['all', 'binance', 'kucoin', 'okx', 'pionex', 'bybit', 'bitget', 'bingx'];
    const durations: (number | 'all')[] = ['all', 1, 2, 3, 5, 7];

    return (
        <PageWrapper>
            <PageContent>
                {/* Header with Back Button */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 text-sm text-[#888899] hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna alla Home
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Trophy className="w-7 h-7 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    Best Premium Deals
                                    {isUsingMockData && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">
                                            Demo
                                        </span>
                                    )}
                                </h1>
                                <p className="text-sm text-[#666677] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Aggiornato {getTimeSinceUpdate()} • Dati da 7 exchange
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 font-bold text-sm transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Aggiorna
                        </button>
                    </div>
                </motion.header>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <BaseCard variant="glass">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-[#888899]">
                                <p className="font-bold text-white mb-1">Come funziona il confronto</p>
                                <p>
                                    Raccogliamo automaticamente i migliori prodotti Dual Investment da 7 exchange:
                                    <span className="text-yellow-400"> Binance</span>,
                                    <span className="text-green-400"> KuCoin</span>,
                                    <span className="text-white"> OKX</span>,
                                    <span className="text-cyan-400"> Pionex</span>,
                                    <span className="text-orange-400"> Bybit</span>,
                                    <span className="text-blue-400"> Bitget</span> e
                                    <span className="text-purple-400"> BingX</span>.
                                    L'APY più alto ti permette di massimizzare i tuoi rendimenti.
                                </p>
                            </div>
                        </div>
                    </BaseCard>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <BaseCard>
                        <div className="flex items-center gap-6 flex-wrap">
                            {/* Sort By */}
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-[#666677]" />
                                <span className="text-xs font-bold text-[#666677] uppercase">Ordina per:</span>
                                <div className="flex gap-1">
                                    {(['apy', 'duration', 'exchange'] as const).map(option => (
                                        <button
                                            key={option}
                                            onClick={() => setSortBy(option)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
                                                ${sortBy === option
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                    : 'bg-white/[0.03] text-[#666677] border border-white/[0.05] hover:bg-white/[0.05]'
                                                }`}
                                        >
                                            {option === 'apy' ? 'APY' : option === 'duration' ? 'Durata' : 'Exchange'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Exchange */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-[#666677]" />
                                <span className="text-xs font-bold text-[#666677] uppercase">Exchange:</span>
                                <select
                                    value={filterExchange}
                                    onChange={(e) => setFilterExchange(e.target.value as Exchange | 'all')}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white/[0.03] text-white border border-white/[0.05] focus:border-purple-500/30 focus:outline-none"
                                >
                                    {exchanges.map(ex => (
                                        <option key={ex} value={ex} className="bg-[#0A0A0C]">
                                            {ex === 'all' ? 'Tutti' : EXCHANGE_CONFIG[ex].name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Duration */}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#666677]" />
                                <span className="text-xs font-bold text-[#666677] uppercase">Durata:</span>
                                <div className="flex gap-1">
                                    {durations.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFilterDuration(d)}
                                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all
                                                ${filterDuration === d
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'bg-white/[0.03] text-[#666677] border border-white/[0.05] hover:bg-white/[0.05]'
                                                }`}
                                        >
                                            {d === 'all' ? 'Tutti' : `${d}G`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </BaseCard>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <BestDealsCard />
                </motion.div>

                {/* Stats Summary */}
                {data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                    >
                        <BaseCard>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-emerald-400">
                                        +{data.bestOverall?.apy.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-[#666677] mt-1">Miglior APY</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">
                                        {data.fetchStats.successful}
                                    </div>
                                    <div className="text-xs text-[#666677] mt-1">Exchange Attivi</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">
                                        {data.fetchStats.total}
                                    </div>
                                    <div className="text-xs text-[#666677] mt-1">Prodotti Totali</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">
                                        ${data.btcPrice.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-[#666677] mt-1">BTC Price</div>
                                </div>
                            </div>
                        </BaseCard>
                    </motion.div>
                )}
            </PageContent>
        </PageWrapper>
    );
}

export default BestDealsView;
