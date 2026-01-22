/**
 * PACTrackerCard - Tracker per i versamenti PAC settimanali
 * 
 * Permette di:
 * - Registrare manualmente i depositi/PAC
 * - Visualizzare lo storico dei versamenti
 * - Calcolare totale investito
 * - Monitorare la costanza del PAC
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    PiggyBank,
    Plus,


    CheckCircle2,
    AlertTriangle,
    Trash2,
    DollarSign,
} from 'lucide-react';
import { BaseCard } from './ui/cards';

interface PACDeposit {
    id: string;
    date: string; // ISO date
    amount: number;
    currency: 'USD' | 'EUR' | 'BTC';
    exchange: string;
    notes?: string;
}

// Storage key
const PAC_DEPOSITS_KEY = 'btcwheel_pac_deposits';

// Load deposits
function loadDeposits(): PACDeposit[] {
    const stored = localStorage.getItem(PAC_DEPOSITS_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Save deposits
function saveDeposits(deposits: PACDeposit[]): void {
    localStorage.setItem(PAC_DEPOSITS_KEY, JSON.stringify(deposits));
}

interface PACTrackerCardProps {
    weeklyTarget?: number; // Target settimanale in EUR/USD
    className?: string;
}

export function PACTrackerCard({ weeklyTarget = 100, className }: PACTrackerCardProps) {
    const [deposits, setDeposits] = useState<PACDeposit[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Form state
    const [formAmount, setFormAmount] = useState('');
    const [formCurrency, setFormCurrency] = useState<'USD' | 'EUR' | 'BTC'>('EUR');
    const [formExchange, setFormExchange] = useState('Pionex');
    const [formNotes, setFormNotes] = useState('');

    // Load deposits on mount
    useEffect(() => {
        setDeposits(loadDeposits());
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // This week deposits
        const thisWeekDeposits = deposits.filter(d => new Date(d.date) >= oneWeekAgo);
        const thisWeekTotal = thisWeekDeposits.reduce((sum, d) => sum + d.amount, 0);

        // This month deposits
        const thisMonthDeposits = deposits.filter(d => new Date(d.date) >= oneMonthAgo);
        const thisMonthTotal = thisMonthDeposits.reduce((sum, d) => sum + d.amount, 0);

        // Total all time
        const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);

        // Streak calculation (consecutive weeks with PAC)
        let streak = 0;
        let checkDate = new Date();
        for (let week = 0; week < 52; week++) {
            const weekStart = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            const hasDeposit = deposits.some(d => {
                const depositDate = new Date(d.date);
                return depositDate >= weekStart && depositDate <= checkDate;
            });
            if (hasDeposit) {
                streak++;
                checkDate = weekStart;
            } else {
                break;
            }
        }

        // PAC done this week?
        const pacDoneThisWeek = thisWeekTotal >= weeklyTarget;

        return {
            thisWeekTotal,
            thisMonthTotal,
            totalDeposits,
            totalCount: deposits.length,
            streak,
            pacDoneThisWeek,
            weeklyProgress: Math.min((thisWeekTotal / weeklyTarget) * 100, 100),
        };
    }, [deposits, weeklyTarget]);

    // Add new deposit
    const handleAddDeposit = () => {
        if (!formAmount || parseFloat(formAmount) <= 0) return;

        const newDeposit: PACDeposit = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            amount: parseFloat(formAmount),
            currency: formCurrency,
            exchange: formExchange,
            notes: formNotes || undefined,
        };

        const updatedDeposits = [newDeposit, ...deposits];
        setDeposits(updatedDeposits);
        saveDeposits(updatedDeposits);

        // Reset form
        setShowAddForm(false);
        setFormAmount('');
        setFormNotes('');
    };

    // Delete deposit
    const handleDeleteDeposit = (id: string) => {
        const updatedDeposits = deposits.filter(d => d.id !== id);
        setDeposits(updatedDeposits);
        saveDeposits(updatedDeposits);
    };

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <BaseCard>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <PiggyBank className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">PAC Tracker</h3>
                            <p className="text-sm text-[#888899]">Versamenti settimanali</p>
                        </div>
                    </div>

                    {/* PAC Status Badge */}
                    {stats.pacDoneThisWeek ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl text-sm font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            Fatto ✓
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-xl text-sm font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            Da fare
                        </div>
                    )}
                </div>

                {/* Weekly Progress Bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#888899]">Progresso settimana</span>
                        <span className="text-sm font-bold text-white">
                            €{stats.thisWeekTotal.toFixed(0)} / €{weeklyTarget}
                        </span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.weeklyProgress}%` }}
                            className={`h-full rounded-full ${stats.pacDoneThisWeek
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <div className="text-xs text-[#666677] uppercase tracking-wider mb-1">Mese</div>
                        <div className="text-lg font-bold text-white">€{stats.thisMonthTotal.toFixed(0)}</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <div className="text-xs text-[#666677] uppercase tracking-wider mb-1">Totale</div>
                        <div className="text-lg font-bold text-emerald-400">€{stats.totalDeposits.toFixed(0)}</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <div className="text-xs text-[#666677] uppercase tracking-wider mb-1">Streak</div>
                        <div className="text-lg font-bold text-orange-400">{stats.streak} 🔥</div>
                    </div>
                </div>

                {/* Add Deposit Button */}
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all mb-4"
                >
                    <Plus className="w-5 h-5" />
                    Registra Versamento
                </button>

                {/* Add Form */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 mb-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-[#888899] mb-2">Importo</label>
                                    <input
                                        type="number"
                                        value={formAmount}
                                        onChange={(e) => setFormAmount(e.target.value)}
                                        placeholder="100"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#444455]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#888899] mb-2">Valuta</label>
                                    <select
                                        value={formCurrency}
                                        onChange={(e) => setFormCurrency(e.target.value as 'USD' | 'EUR' | 'BTC')}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    >
                                        <option value="EUR">EUR €</option>
                                        <option value="USD">USD $</option>
                                        <option value="BTC">BTC ₿</option>
                                    </select>
                                </div>
                            </div>

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
                                    <option value="Altro">Altro</option>
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-3 bg-white/5 text-white rounded-xl font-medium"
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleAddDeposit}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold"
                                >
                                    Salva
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Toggle */}
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full text-sm text-[#888899] hover:text-white transition-colors"
                >
                    {showHistory ? 'Nascondi storico' : `Mostra storico (${stats.totalCount} versamenti)`}
                </button>

                {/* History */}
                <AnimatePresence>
                    {showHistory && deposits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-2 max-h-48 overflow-y-auto"
                        >
                            {deposits.slice(0, 10).map((deposit) => (
                                <div
                                    key={deposit.id}
                                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <DollarSign className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">
                                                {deposit.currency === 'EUR' && '€'}
                                                {deposit.currency === 'USD' && '$'}
                                                {deposit.currency === 'BTC' && '₿'}
                                                {deposit.amount}
                                            </div>
                                            <div className="text-xs text-[#666677]">
                                                {formatDate(deposit.date)} • {deposit.exchange}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDeposit(deposit.id)}
                                        className="p-2 text-[#666677] hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </BaseCard>
        </motion.div>
    );
}

export default PACTrackerCard;
