/**
 * DualInvestmentTracker - Tracker per i Dual Investment
 * 
 * Permette di:
 * - Registrare Dual Investment attivi
 * - Calcolare premi guadagnati
 * - Monitorare scadenze
 * - Tracciare rendimenti
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Layers,
    Plus,

    TrendingUp,
    TrendingDown,
    CheckCircle2,

    Trash2,
    DollarSign,

    AlertTriangle,
} from 'lucide-react';
import { BaseCard, StatCard } from './ui/cards';

interface DualInvestment {
    id: string;
    createdAt: string;
    expiryDate: string;
    type: 'BUY_LOW' | 'SELL_HIGH'; // Buy Low = BTC purchase, Sell High = USDT target
    asset: 'BTC' | 'ETH' | 'USDT';
    settlementAsset: 'BTC' | 'USDT';
    investedAmount: number;
    targetPrice: number;
    apy: number; // Annual Percentage Yield
    premium: number; // Premium earned
    status: 'ACTIVE' | 'SETTLED_TARGET' | 'SETTLED_ALTERNATIVE';
    exchange: string;
    notes?: string;
}

// Storage key
const DUAL_INVESTMENTS_KEY = 'btcwheel_dual_investments';

// Load investments
function loadInvestments(): DualInvestment[] {
    const stored = localStorage.getItem(DUAL_INVESTMENTS_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Save investments
function saveInvestments(investments: DualInvestment[]): void {
    localStorage.setItem(DUAL_INVESTMENTS_KEY, JSON.stringify(investments));
}

interface DualInvestmentTrackerProps {
    className?: string;
}

export function DualInvestmentTracker({ className }: DualInvestmentTrackerProps) {
    const [investments, setInvestments] = useState<DualInvestment[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'settled'>('all');

    // Form state
    const [formType, setFormType] = useState<'BUY_LOW' | 'SELL_HIGH'>('BUY_LOW');
    const [formAsset, setFormAsset] = useState<'BTC' | 'USDT'>('USDT');
    const [formAmount, setFormAmount] = useState('');
    const [formTargetPrice, setFormTargetPrice] = useState('');
    const [formAPY, setFormAPY] = useState('');
    const [formDays, setFormDays] = useState('1');
    const [formExchange, setFormExchange] = useState('Pionex');

    // Load on mount
    useEffect(() => {
        setInvestments(loadInvestments());
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
        const settledInvestments = investments.filter(i => i.status !== 'ACTIVE');

        const totalPremiumEarned = investments.reduce((sum, i) => sum + i.premium, 0);
        const totalInvested = activeInvestments.reduce((sum, i) => sum + i.investedAmount, 0);

        // Average APY of active
        const avgAPY = activeInvestments.length > 0
            ? activeInvestments.reduce((sum, i) => sum + i.apy, 0) / activeInvestments.length
            : 0;

        // Settled at target (win) vs alternative
        const settledAtTarget = settledInvestments.filter(i => i.status === 'SETTLED_TARGET').length;
        const settledAlternative = settledInvestments.filter(i => i.status === 'SETTLED_ALTERNATIVE').length;

        return {
            activeCount: activeInvestments.length,
            totalInvested,
            totalPremiumEarned,
            avgAPY,
            settledAtTarget,
            settledAlternative,
            winRate: settledInvestments.length > 0
                ? (settledAtTarget / settledInvestments.length) * 100
                : 0,
        };
    }, [investments]);

    // Add new investment
    const handleAddInvestment = () => {
        if (!formAmount || !formTargetPrice || !formAPY) return;

        const amount = parseFloat(formAmount);
        const apy = parseFloat(formAPY);
        const days = parseInt(formDays);

        // Calculate premium based on APY and duration
        const premium = (amount * (apy / 100) * days) / 365;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        const newInvestment: DualInvestment = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            type: formType,
            asset: formAsset,
            settlementAsset: formType === 'BUY_LOW' ? 'BTC' : 'USDT',
            investedAmount: amount,
            targetPrice: parseFloat(formTargetPrice),
            apy,
            premium,
            status: 'ACTIVE',
            exchange: formExchange,
        };

        const updated = [newInvestment, ...investments];
        setInvestments(updated);
        saveInvestments(updated);

        // Reset form
        setShowAddForm(false);
        setFormAmount('');
        setFormTargetPrice('');
        setFormAPY('');
    };

    // Settle investment
    const handleSettle = (id: string, status: 'SETTLED_TARGET' | 'SETTLED_ALTERNATIVE') => {
        const updated = investments.map(i =>
            i.id === id ? { ...i, status } : i
        );
        setInvestments(updated);
        saveInvestments(updated);
    };

    // Delete investment
    const handleDelete = (id: string) => {
        const updated = investments.filter(i => i.id !== id);
        setInvestments(updated);
        saveInvestments(updated);
    };

    // Filter investments
    const filteredInvestments = useMemo(() => {
        switch (filter) {
            case 'active': return investments.filter(i => i.status === 'ACTIVE');
            case 'settled': return investments.filter(i => i.status !== 'ACTIVE');
            default: return investments;
        }
    }, [investments, filter]);



    // Days until expiry
    const daysUntilExpiry = (expiryStr: string) => {
        const now = new Date();
        const expiry = new Date(expiryStr);
        const diff = expiry.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}g`;
    };

    return (
        <div className={className}>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Attivi"
                    value={stats.activeCount.toString()}
                    icon={Layers}
                    color="purple"
                />
                <StatCard
                    label="Investiti"
                    value={`$${stats.totalInvested.toLocaleString()}`}
                    icon={DollarSign}
                    color="cyan"
                />
                <StatCard
                    label="Premi Totali"
                    value={`+$${stats.totalPremiumEarned.toFixed(2)}`}
                    icon={TrendingUp}
                    color="green"
                />
                <StatCard
                    label="APY Medio"
                    value={`${stats.avgAPY.toFixed(1)}%`}
                    icon={TrendingUp}
                    color="yellow"
                />
            </div>

            {/* Add Button */}
            <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all mb-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Plus className="w-5 h-5" />
                Aggiungi Dual Investment
            </motion.button>

            {/* Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <BaseCard className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-4">Nuovo Dual Investment</h3>

                            <div className="space-y-4">
                                {/* Type */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setFormType('BUY_LOW'); setFormAsset('USDT'); }}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formType === 'BUY_LOW'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                            : 'bg-white/5 text-[#888899] border border-white/10'
                                            }`}
                                    >
                                        <TrendingDown className="w-4 h-4 inline mr-2" />
                                        Buy Low
                                    </button>
                                    <button
                                        onClick={() => { setFormType('SELL_HIGH'); setFormAsset('BTC'); }}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${formType === 'SELL_HIGH'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                            : 'bg-white/5 text-[#888899] border border-white/10'
                                            }`}
                                    >
                                        <TrendingUp className="w-4 h-4 inline mr-2" />
                                        Sell High
                                    </button>
                                </div>

                                {/* Amount & Target */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">
                                            Importo ({formAsset})
                                        </label>
                                        <input
                                            type="number"
                                            value={formAmount}
                                            onChange={(e) => setFormAmount(e.target.value)}
                                            placeholder={formAsset === 'USDT' ? '1000' : '0.01'}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Target Price ($)</label>
                                        <input
                                            type="number"
                                            value={formTargetPrice}
                                            onChange={(e) => setFormTargetPrice(e.target.value)}
                                            placeholder="95000"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                </div>

                                {/* APY & Days */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">APY (%)</label>
                                        <input
                                            type="number"
                                            value={formAPY}
                                            onChange={(e) => setFormAPY(e.target.value)}
                                            placeholder="50"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Durata (giorni)</label>
                                        <select
                                            value={formDays}
                                            onChange={(e) => setFormDays(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        >
                                            <option value="1">1 giorno</option>
                                            <option value="3">3 giorni</option>
                                            <option value="7">7 giorni</option>
                                            <option value="14">14 giorni</option>
                                            <option value="30">30 giorni</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Exchange */}
                                <div>
                                    <label className="block text-sm text-[#888899] mb-2">Exchange</label>
                                    <select
                                        value={formExchange}
                                        onChange={(e) => setFormExchange(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="Pionex">Pionex</option>
                                        <option value="OKX">OKX</option>
                                        <option value="Binance">Binance</option>
                                        <option value="Bybit">Bybit</option>
                                    </select>
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
                                        onClick={handleAddInvestment}
                                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold"
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
            <div className="flex gap-2 mb-4">
                {(['all', 'active', 'settled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-white/5 text-[#888899]'
                            }`}
                    >
                        {f === 'all' ? 'Tutti' : f === 'active' ? 'Attivi' : 'Conclusi'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredInvestments.length === 0 ? (
                    <BaseCard className="text-center py-12">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-bold text-white mb-2">Nessun Dual Investment</h3>
                        <p className="text-[#888899]">Aggiungi il tuo primo Dual Investment</p>
                    </BaseCard>
                ) : (
                    filteredInvestments.map((inv) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <BaseCard>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.type === 'BUY_LOW'
                                            ? 'bg-green-500/20'
                                            : 'bg-red-500/20'
                                            }`}>
                                            {inv.type === 'BUY_LOW'
                                                ? <TrendingDown className="w-6 h-6 text-green-400" />
                                                : <TrendingUp className="w-6 h-6 text-red-400" />
                                            }
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">
                                                    {inv.type === 'BUY_LOW' ? 'Buy Low' : 'Sell High'}
                                                </span>
                                                <span className="text-[#888899]">@${inv.targetPrice.toLocaleString()}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${inv.status === 'ACTIVE'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : inv.status === 'SETTLED_TARGET'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                    {inv.status === 'ACTIVE' ? `⏳ ${daysUntilExpiry(inv.expiryDate)}` :
                                                        inv.status === 'SETTLED_TARGET' ? '✓ Target' : '⚡ Alt'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-[#888899]">
                                                {inv.asset === 'USDT' ? '$' : '₿'}{inv.investedAmount} • {inv.apy}% APY • {inv.exchange}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="font-bold text-emerald-400">+${inv.premium.toFixed(2)}</div>
                                            <div className="text-xs text-[#666677]">Premio</div>
                                        </div>

                                        {inv.status === 'ACTIVE' && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleSettle(inv.id, 'SETTLED_TARGET')}
                                                    title="Concluso al Target"
                                                    className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleSettle(inv.id, 'SETTLED_ALTERNATIVE')}
                                                    title="Concluso Alternativo"
                                                    className="p-2 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleDelete(inv.id)}
                                            className="p-2 text-[#666677] hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </BaseCard>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DualInvestmentTracker;
