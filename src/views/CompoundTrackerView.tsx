import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    Settings,
    Save,
    TrendingUp,
    Calendar,
    DollarSign,
    Edit2,
    Check,
    X,
    Link2
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader } from '../components/layout/PageWrapper';
import { BaseCard } from '../components/ui/cards';
import { useAuth } from '../hooks/useAuth';
import { PersistenceService } from '../services/PersistenceService';
import { Toaster, toast } from 'sonner';

interface TrackerSettings {
    startCapital: number;
    dailyTargetPercent: number;
    startDate: string;
}

interface DailyEntry {
    deposit: number; // PAC
    realProfit: number | null; // Null if not entered yet
    note?: string;
}

// Trade Interface (Shared with TradeJournalView)
interface Trade {
    id: string;
    date: string; // ISO date
    type: 'PUT' | 'CALL';
    strike: number;
    premium: number;
    outcome: 'OTM' | 'ITM' | 'PENDING' | 'CLOSED';
    btcAssigned?: number;
    buybackPrice?: number;
    realizedPnl?: number;
    exchange: string;
}

interface TrackerData {
    settings: TrackerSettings;
    entries: Record<string, DailyEntry>; // Key: YYYY-MM-DD
}

interface CompoundTrackerViewProps {
    onNavigate: (view: View) => void;
}

export function CompoundTrackerView({ onNavigate }: CompoundTrackerViewProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Data State
    const [settings, setSettings] = useState<TrackerSettings>({
        startCapital: 1000,
        dailyTargetPercent: 0.2,
        startDate: new Date().toISOString().split('T')[0]
    });
    const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
    const [trades, setTrades] = useState<Trade[]>([]);

    // Editing State
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ profit: '', deposit: '', note: '' });

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            try {
                // Load Tracker Data
                const trackerData = await PersistenceService.load(user.id, 'compound_tracker');
                if (trackerData) {
                    if (trackerData.settings) setSettings(trackerData.settings);
                    if (trackerData.entries) setEntries(trackerData.entries);
                }

                // Load Trades Data
                const tradesData = await PersistenceService.load(user.id, 'trades');
                if (tradesData && Array.isArray(tradesData.trades)) {
                    setTrades(tradesData.trades);
                }
            } catch (e) {
                console.error('Failed to load tracker data', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    // Save Data Helper
    const saveData = async (newSettings: TrackerSettings, newEntries: Record<string, DailyEntry>) => {
        if (!user) return;
        await PersistenceService.save(user.id, 'compound_tracker', {
            settings: newSettings,
            entries: newEntries
        });
    };

    // Generate Table Rows
    const tableRows = useMemo(() => {
        const rows = [];
        let currentCapital = settings.startCapital;
        let projectedCapital = settings.startCapital;

        // Generate 60 days
        const daysToGenerate = 60;
        const start = new Date(settings.startDate);

        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const entry = entries[dateKey] || { deposit: 0, realProfit: null };

            // Projected Calculation
            const targetProfit = projectedCapital * (settings.dailyTargetPercent / 100);
            const projectedEnd = projectedCapital + targetProfit;

            // Calculate Daily Profit from Journal
            const journalProfit = trades
                .filter(t => t.date.startsWith(dateKey))
                .reduce((sum, t) => sum + (t.realizedPnl ?? t.premium), 0);

            // Logic: Manual Entry overrides Journal Profit
            const hasManualEntry = entry.realProfit !== null;
            // If manual entry exists, use it. If not, use journal profit (if > 0).
            const finalRealProfit = hasManualEntry ? entry.realProfit! : (journalProfit !== 0 ? journalProfit : null);
            const isAuto = !hasManualEntry && journalProfit !== 0;

            const realEnd = currentCapital + (finalRealProfit || 0) + entry.deposit;

            rows.push({
                day: i,
                date: dateKey,
                startCapital: currentCapital,
                projectedStart: projectedCapital,
                targetProfit,
                projectedEnd,
                deposit: entry.deposit,
                realProfit: finalRealProfit,
                isAuto,
                realEnd: finalRealProfit !== null ? realEnd : null,
                diff: finalRealProfit !== null ? realEnd - projectedEnd : null,
                isToday: dateKey === new Date().toISOString().split('T')[0]
            });

            // Update capitals for next iteration
            projectedCapital = projectedEnd;

            if (finalRealProfit !== null) {
                currentCapital = realEnd;
            }
        }
        return rows;
    }, [settings, entries, trades]);

    const handleSaveEntry = () => {
        if (!editingDate) return;

        const newEntries = {
            ...entries,
            [editingDate]: {
                deposit: parseFloat(editForm.deposit) || 0,
                realProfit: editForm.profit === '' ? null : parseFloat(editForm.profit),
                note: editForm.note
            }
        };

        setEntries(newEntries);
        saveData(settings, newEntries);
        setEditingDate(null);
        toast.success('Dati aggiornati');
    };

    const startEditing = (date: string, entry: DailyEntry | undefined) => {
        setEditingDate(date);
        setEditForm({
            profit: entry?.realProfit?.toString() || '',
            deposit: entry?.deposit?.toString() || '',
            note: entry?.note || ''
        });
    };

    return (
        <PageWrapper>
            <PageContent>
                <Toaster position="top-center" theme="dark" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => onNavigate('trading')}
                        className="flex items-center gap-2 text-sm text-[#888899] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Torna al Trading
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#888899] hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                <PageHeader
                    title="Compound Tracker"
                    subtitle="Monitora la crescita del tuo capitale giorno per giorno"
                />

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8"
                        >
                            <BaseCard>
                                <h3 className="text-lg font-bold text-white mb-4">Impostazioni Tracker</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Capitale Iniziale ($)</label>
                                        <input
                                            type="number"
                                            value={settings.startCapital}
                                            onChange={(e) => setSettings({ ...settings, startCapital: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Target Giornaliero (%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.dailyTargetPercent}
                                            onChange={(e) => setSettings({ ...settings, dailyTargetPercent: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[#888899] mb-2">Data Inizio</label>
                                        <input
                                            type="date"
                                            value={settings.startDate}
                                            onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => {
                                            saveData(settings, entries);
                                            setShowSettings(false);
                                            toast.success('Impostazioni salvate');
                                        }}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg"
                                    >
                                        Salva Configurazione
                                    </button>
                                </div>
                            </BaseCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Table */}
                <BaseCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#888899] uppercase bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-4 py-3">Giorno</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3 text-right">Capitale Iniziale</th>
                                    <th className="px-4 py-3 text-right">PAC (Deposito)</th>
                                    <th className="px-4 py-3 text-right text-purple-400">Target ({settings.dailyTargetPercent}%)</th>
                                    <th className="px-4 py-3 text-right">Profitto Reale</th>
                                    <th className="px-4 py-3 text-right">Capitale Finale</th>
                                    <th className="px-4 py-3 text-right">Differenza</th>
                                    <th className="px-4 py-3 text-center">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tableRows.map((row) => (
                                    <tr
                                        key={row.date}
                                        className={`hover:bg-white/5 transition-colors ${row.isToday ? 'bg-purple-500/10' : ''}`}
                                    >
                                        <td className="px-4 py-3 font-medium text-[#888899]">{row.day}</td>
                                        <td className="px-4 py-3 text-white">
                                            {new Date(row.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            {row.isToday && <span className="ml-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">OGGI</span>}
                                        </td>

                                        {/* Start Capital (Real vs Projected) */}
                                        <td className="px-4 py-3 text-right font-mono text-[#888899]">
                                            ${row.startCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>

                                        {/* PAC / Deposit */}
                                        <td className="px-4 py-3 text-right font-mono text-blue-400">
                                            {editingDate === row.date ? (
                                                <input
                                                    type="number"
                                                    value={editForm.deposit}
                                                    onChange={(e) => setEditForm({ ...editForm, deposit: e.target.value })}
                                                    className="w-20 bg-black/50 border border-white/20 rounded px-2 py-1 text-right text-sm"
                                                    placeholder="0"
                                                />
                                            ) : (
                                                row.deposit > 0 ? `+$${row.deposit}` : '-'
                                            )}
                                        </td>

                                        {/* Target Profit */}
                                        <td className="px-4 py-3 text-right font-mono text-purple-400/70">
                                            +${row.targetProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>

                                        {/* Real Profit */}
                                        <td className="px-4 py-3 text-right font-mono">
                                            {editingDate === row.date ? (
                                                <input
                                                    type="number"
                                                    value={editForm.profit}
                                                    onChange={(e) => setEditForm({ ...editForm, profit: e.target.value })}
                                                    className="w-24 bg-black/50 border border-white/20 rounded px-2 py-1 text-right text-sm text-white"
                                                    placeholder="Profitto"
                                                    autoFocus
                                                />
                                            ) : (
                                                row.realProfit !== null ? (
                                                    <span className={`flex items-center justify-end gap-1 ${row.realProfit >= row.targetProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                        {row.isAuto && <Link2 className="w-3 h-3 text-blue-400" title="Auto-calcolato dal Journal" />}
                                                        {row.realProfit >= 0 ? '+' : ''}${row.realProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#444455]">-</span>
                                                )
                                            )}
                                        </td>

                                        {/* End Capital */}
                                        <td className="px-4 py-3 text-right font-mono font-bold text-white">
                                            {row.realEnd !== null
                                                ? `$${row.realEnd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                                : <span className="text-[#444455] font-normal">${row.projectedEnd.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Est.)</span>
                                            }
                                        </td>

                                        {/* Difference */}
                                        <td className="px-4 py-3 text-right font-mono">
                                            {row.diff !== null ? (
                                                <span className={`text-xs px-2 py-1 rounded ${row.diff >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {row.diff >= 0 ? '+' : ''}${row.diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            ) : '-'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            {editingDate === row.date ? (
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={handleSaveEntry} className="p-1 text-green-400 hover:bg-green-500/10 rounded">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingDate(null)} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(row.date, entries[row.date])}
                                                    className="p-1 text-[#888899] hover:text-white hover:bg-white/10 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </BaseCard>
            </PageContent>
        </PageWrapper>
    );
}
