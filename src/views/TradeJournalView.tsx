/**
 * TradeJournalView - Trade Journal per registrare le operazioni
 * 
 * Permette all'utente di:
 * - Registrare manualmente PUT/CALL eseguite
 * - Visualizzare storico operazioni
 * - Vedere statistiche (Win Rate, Premium Totali, ROI)
 * - Tracciare BTC accumulati per assignment
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign,
    Target,
    CheckCircle2,
    Clock,
    Percent,
    Bitcoin,
    Trash2,
    Filter,
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader } from '../components/layout/PageWrapper';
import { BaseCard, StatCard } from '../components/ui/cards';
import { saveAccumulation } from '../components/BTCAccumulatorCard';

// Trade types
interface Trade {
    id: string;
    date: string; // ISO date
    type: 'PUT' | 'CALL';
    strike: number;
    premium: number;
    outcome: 'OTM' | 'ITM' | 'PENDING';
    btcAssigned?: number; // If ITM, how much BTC was assigned
    notes?: string;
    exchange: string;
}

interface TradeJournalViewProps {
    onNavigate: (view: View) => void;
    initialData?: {
        type: 'PUT' | 'CALL';
        strike: number;
        premium?: number;
        action?: string;
    };
}

// Storage key
const TRADES_STORAGE_KEY = 'btcwheel_trades';

// Load trades from localStorage
function loadTrades(): Trade[] {
    const stored = localStorage.getItem(TRADES_STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Save trades to localStorage
function saveTrades(trades: Trade[]): void {
    localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
}

export function TradeJournalView({ onNavigate, initialData }: TradeJournalViewProps) {
    // State
    const [trades, setTrades] = useState<Trade[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'PUT' | 'CALL'>('all');

    // Form state
    const [formType, setFormType] = useState<'PUT' | 'CALL'>('PUT');
    const [formStrike, setFormStrike] = useState('');
    const [formPremium, setFormPremium] = useState('');
    const [formOutcome, setFormOutcome] = useState<'OTM' | 'ITM' | 'PENDING'>('PENDING');
    const [formBtcAssigned, setFormBtcAssigned] = useState('');
    const [formExchange, setFormExchange] = useState('Pionex');
    const [formNotes, setFormNotes] = useState('');

    // Load trades on mount
    useEffect(() => {
        setTrades(loadTrades());
    }, []);

    // Pre-fill form if initialData is present
    useEffect(() => {
        if (initialData) {
            setFormType(initialData.type);
            setFormStrike(initialData.strike.toString());
            if (initialData.premium) setFormPremium(initialData.premium.toString());
            setShowAddForm(true);
            // Scroll to top to see the form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [initialData]);

    // Calculate statistics
    const stats = useMemo(() => {
        const completedTrades = trades.filter(t => t.outcome !== 'PENDING');
        const winningTrades = completedTrades.filter(t => t.outcome === 'OTM');
        const totalPremium = trades.reduce((sum, t) => sum + t.premium, 0);
        const btcAccumulated = trades
            .filter(t => t.outcome === 'ITM' && t.btcAssigned)
            .reduce((sum, t) => sum + (t.btcAssigned || 0), 0);

        const winRate = completedTrades.length > 0
            ? (winningTrades.length / completedTrades.length) * 100
            : 0;

        // Calculate this week's premium
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyPremium = trades
            .filter(t => new Date(t.date) >= oneWeekAgo)
            .reduce((sum, t) => sum + t.premium, 0);

        return {
            totalTrades: trades.length,
            winRate,
            totalPremium,
            weeklyPremium,
            btcAccumulated,
            avgPremium: trades.length > 0 ? totalPremium / trades.length : 0,
        };
    }, [trades]);

    // Add new trade
    const handleAddTrade = () => {
        if (!formStrike || !formPremium) return;

        const newTrade: Trade = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: formType,
            strike: parseFloat(formStrike),
            premium: parseFloat(formPremium),
            outcome: formOutcome,
            btcAssigned: formOutcome === 'ITM' && formBtcAssigned ? parseFloat(formBtcAssigned) : undefined,
            exchange: formExchange,
            notes: formNotes || undefined,
        };

        const updatedTrades = [newTrade, ...trades];
        setTrades(updatedTrades);
        saveTrades(updatedTrades);

        // If ITM with BTC assigned, save to BTC accumulation tracker
        if (newTrade.outcome === 'ITM' && newTrade.btcAssigned && newTrade.btcAssigned > 0) {
            saveAccumulation({
                btcAmount: newTrade.btcAssigned,
                purchasePrice: newTrade.strike,
                date: newTrade.date,
            });
        }

        // Reset form
        setShowAddForm(false);
        setFormStrike('');
        setFormPremium('');
        setFormOutcome('PENDING');
        setFormBtcAssigned('');
        setFormNotes('');
    };

    // Delete trade
    const handleDeleteTrade = (id: string) => {
        const updatedTrades = trades.filter(t => t.id !== id);
        setTrades(updatedTrades);
        saveTrades(updatedTrades);
    };

    // Update trade outcome
    const handleUpdateOutcome = (id: string, outcome: 'OTM' | 'ITM') => {
        const updatedTrades = trades.map(t =>
            t.id === id ? { ...t, outcome } : t
        );
        setTrades(updatedTrades);
        saveTrades(updatedTrades);
    };

    // Filter trades
    const filteredTrades = useMemo(() => {
        if (filter === 'all') return trades;
        return trades.filter(t => t.type === filter);
    }, [trades, filter]);

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <PageWrapper>
            <PageContent>
                <PageHeader
                    title="Trade Journal"
                    subtitle="Registra e monitora tutte le tue operazioni"
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Win Rate"
                        value={`${stats.winRate.toFixed(0)}%`}
                        icon={Percent}
                        color="green"
                        trend={stats.winRate >= 50 ? { value: stats.winRate, positive: true } : { value: stats.winRate, positive: false }}
                    />
                    <StatCard
                        label="Premium Totali"
                        value={`$${stats.totalPremium.toLocaleString()}`}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard
                        label="Settimana"
                        value={`+$${stats.weeklyPremium.toLocaleString()}`}
                        icon={Calendar}
                        color="cyan"
                    />
                    <StatCard
                        label="BTC Accumulati"
                        value={`₿ ${stats.btcAccumulated.toFixed(6)}`}
                        icon={Bitcoin}
                        color="orange"
                    />
                </div>

                {/* Add Trade Button */}
                <motion.button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="w-5 h-5" />
                    Registra Nuova Operazione
                </motion.button>

                {/* Add Trade Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <BaseCard>
                                <h3 className="text-lg font-bold text-white mb-4">Nuova Operazione</h3>

                                <div className="space-y-4">
                                    {/* Type selector */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setFormType('PUT')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${formType === 'PUT'
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                                : 'bg-white/5 text-[#888899] border border-white/10'
                                                }`}
                                        >
                                            <TrendingDown className="w-4 h-4 inline mr-2" />
                                            PUT
                                        </button>
                                        <button
                                            onClick={() => setFormType('CALL')}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${formType === 'CALL'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                                : 'bg-white/5 text-[#888899] border border-white/10'
                                                }`}
                                        >
                                            <TrendingUp className="w-4 h-4 inline mr-2" />
                                            CALL
                                        </button>
                                    </div>

                                    {/* Strike and Premium */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-[#888899] mb-2">Strike Price ($)</label>
                                            <input
                                                type="number"
                                                value={formStrike}
                                                onChange={(e) => setFormStrike(e.target.value)}
                                                placeholder="95000"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#444455]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-[#888899] mb-2">Premium ($)</label>
                                            <input
                                                type="number"
                                                value={formPremium}
                                                onChange={(e) => setFormPremium(e.target.value)}
                                                placeholder="150"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#444455]"
                                            />
                                        </div>
                                    </div>

                                    {/* Outcome */}
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Esito</label>
                                        <div className="flex gap-2">
                                            {(['PENDING', 'OTM', 'ITM'] as const).map((outcome) => (
                                                <button
                                                    key={outcome}
                                                    onClick={() => setFormOutcome(outcome)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formOutcome === outcome
                                                        ? outcome === 'OTM'
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                                            : outcome === 'ITM'
                                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                                        : 'bg-white/5 text-[#888899] border border-white/10'
                                                        }`}
                                                >
                                                    {outcome === 'PENDING' && <Clock className="w-3 h-3 inline mr-1" />}
                                                    {outcome === 'OTM' && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                                    {outcome === 'ITM' && <Target className="w-3 h-3 inline mr-1" />}
                                                    {outcome}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BTC Assigned (if ITM) */}
                                    {formOutcome === 'ITM' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <label className="block text-sm text-[#888899] mb-2">BTC Assegnati</label>
                                            <input
                                                type="number"
                                                value={formBtcAssigned}
                                                onChange={(e) => setFormBtcAssigned(e.target.value)}
                                                placeholder="0.01"
                                                step="0.0001"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#444455]"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Exchange */}
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Exchange</label>
                                        <select
                                            value={formExchange}
                                            onChange={(e) => setFormExchange(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        >
                                            <option value="Pionex">Pionex</option>
                                            <option value="Deribit">Deribit</option>
                                            <option value="OKX">OKX</option>
                                            <option value="Binance">Binance</option>
                                            <option value="Bybit">Bybit</option>
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Note (opzionale)</label>
                                        <textarea
                                            value={formNotes}
                                            onChange={(e) => setFormNotes(e.target.value)}
                                            placeholder="Aggiungi note..."
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#444455] resize-none"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium"
                                        >
                                            Annulla
                                        </button>
                                        <button
                                            onClick={handleAddTrade}
                                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold"
                                        >
                                            Salva
                                        </button>
                                    </div>
                                </div>
                            </BaseCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#888899]" />
                    <div className="flex gap-2">
                        {(['all', 'PUT', 'CALL'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-white/5 text-[#888899]'
                                    }`}
                            >
                                {f === 'all' ? 'Tutti' : f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trades List */}
                <div className="space-y-3">
                    {filteredTrades.length === 0 ? (
                        <BaseCard className="text-center py-12">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-lg font-bold text-white mb-2">Nessuna operazione registrata</h3>
                            <p className="text-[#888899]">Clicca su "Registra Nuova Operazione" per iniziare</p>
                        </BaseCard>
                    ) : (
                        filteredTrades.map((trade) => (
                            <motion.div
                                key={trade.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <BaseCard>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Type badge */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trade.type === 'PUT'
                                                ? 'bg-red-500/20'
                                                : 'bg-green-500/20'
                                                }`}>
                                                {trade.type === 'PUT'
                                                    ? <TrendingDown className="w-6 h-6 text-red-400" />
                                                    : <TrendingUp className="w-6 h-6 text-green-400" />
                                                }
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">
                                                        {trade.type} ${trade.strike.toLocaleString()}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.outcome === 'OTM'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : trade.outcome === 'ITM'
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {trade.outcome}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-[#888899]">
                                                    {formatDate(trade.date)} • {trade.exchange}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-bold text-emerald-400">+${trade.premium}</div>
                                                {trade.btcAssigned && (
                                                    <div className="text-xs text-orange-400">+{trade.btcAssigned} BTC</div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {trade.outcome === 'PENDING' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleUpdateOutcome(trade.id, 'OTM')}
                                                        title="Scaduta OTM (Profitto)"
                                                        className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateOutcome(trade.id, 'ITM')}
                                                        title="Assegnata (ITM)"
                                                        className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20"
                                                    >
                                                        <Target className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleDeleteTrade(trade.id)}
                                                className="p-2 text-[#666677] hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {trade.notes && (
                                        <div className="mt-3 pt-3 border-t border-white/5 text-sm text-[#888899]">
                                            {trade.notes}
                                        </div>
                                    )}
                                </BaseCard>
                            </motion.div>
                        ))
                    )}
                </div>
            </PageContent>
        </PageWrapper>
    );
}

export default TradeJournalView;
