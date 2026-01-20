/**
 * BTCAccumulatorCard - Tracking dell'accumulo BTC e prezzo medio
 * 
 * Mostra:
 * - BTC totali accumulati (da PUT assegnate)
 * - Prezzo medio di carico
 * - Profitto/Perdita latente
 * - Confronto con prezzo attuale
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Bitcoin, TrendingUp, TrendingDown, DollarSign, Target, RefreshCw } from 'lucide-react';
import { BaseCard } from './ui/cards';
import { PionexClient, getPionexCredentials, hasPionexCredentials } from '../services/pionex';

interface BTCAccumulation {
    btcAmount: number;
    purchasePrice: number; // Price at which BTC was bought (strike price)
    date: string;
}

// Storage key for BTC accumulation data
const BTC_ACCUMULATION_KEY = 'btcwheel_btc_accumulation';

// Load accumulation data
function loadAccumulations(): BTCAccumulation[] {
    const stored = localStorage.getItem(BTC_ACCUMULATION_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

// Save accumulation data
export function saveAccumulation(accumulation: BTCAccumulation): void {
    const existing = loadAccumulations();
    existing.push(accumulation);
    localStorage.setItem(BTC_ACCUMULATION_KEY, JSON.stringify(existing));
}

// Get all accumulations
export function getAccumulations(): BTCAccumulation[] {
    return loadAccumulations();
}

interface BTCAccumulatorCardProps {
    className?: string;
}

export function BTCAccumulatorCard({ className }: BTCAccumulatorCardProps) {
    const [accumulations, setAccumulations] = useState<BTCAccumulation[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [priceChange24h, setPriceChange24h] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // Load data on mount
    useEffect(() => {
        setAccumulations(loadAccumulations());
        loadCurrentPrice();
    }, []);

    // Load current BTC price
    const loadCurrentPrice = async () => {
        if (!hasPionexCredentials()) return;

        setIsLoading(true);
        try {
            const credentials = getPionexCredentials();
            if (credentials) {
                const client = new PionexClient(credentials);
                const priceData = await client.getBTCPrice();
                setCurrentPrice(priceData.price);
                setPriceChange24h(priceData.change24h);
            }
        } catch (error) {
            console.error('Failed to load BTC price:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        if (accumulations.length === 0) {
            return {
                totalBTC: 0,
                avgPrice: 0,
                totalCost: 0,
                currentValue: 0,
                profitLoss: 0,
                profitLossPercent: 0,
            };
        }

        const totalBTC = accumulations.reduce((sum, a) => sum + a.btcAmount, 0);
        const totalCost = accumulations.reduce((sum, a) => sum + (a.btcAmount * a.purchasePrice), 0);
        const avgPrice = totalCost / totalBTC;
        const currentValue = totalBTC * currentPrice;
        const profitLoss = currentValue - totalCost;
        const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

        return {
            totalBTC,
            avgPrice,
            totalCost,
            currentValue,
            profitLoss,
            profitLossPercent,
        };
    }, [accumulations, currentPrice]);

    const isProfit = stats.profitLoss >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <BaseCard className="overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                            <Bitcoin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Accumulo BTC</h3>
                            <p className="text-sm text-[#888899]">Prezzo medio di carico</p>
                        </div>
                    </div>

                    <button
                        onClick={loadCurrentPrice}
                        disabled={isLoading}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#888899] ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {accumulations.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">₿</div>
                        <h4 className="text-white font-bold mb-2">Nessun BTC accumulato</h4>
                        <p className="text-sm text-[#888899]">
                            Quando una PUT viene assegnata (ITM), i BTC acquistati verranno tracciati qui.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Main Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Total BTC */}
                            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
                                <div className="text-sm text-[#888899] mb-1">BTC Totali</div>
                                <div className="text-2xl font-bold text-orange-400">
                                    ₿ {stats.totalBTC.toFixed(8)}
                                </div>
                            </div>

                            {/* Average Price */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <div className="text-sm text-[#888899] mb-1">Prezzo Medio</div>
                                <div className="text-2xl font-bold text-white">
                                    ${stats.avgPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        {/* Current Price vs Average */}
                        {currentPrice > 0 && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-[#888899]">Prezzo BTC Attuale</div>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {priceChange24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    ${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs text-[#666677]">
                                    vs Prezzo Medio: {currentPrice > stats.avgPrice ? '+' : ''}{((currentPrice - stats.avgPrice) / stats.avgPrice * 100).toFixed(1)}%
                                </div>
                            </div>
                        )}

                        {/* Profit/Loss */}
                        <div className={`rounded-xl p-4 ${isProfit ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-[#888899] mb-1">
                                        {isProfit ? 'Profitto Latente' : 'Perdita Latente'}
                                    </div>
                                    <div className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                        {isProfit ? '+' : ''}${stats.profitLoss.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className={`text-3xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                    {isProfit ? '+' : ''}{stats.profitLossPercent.toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center">
                                <div className="text-xs text-[#666677] uppercase tracking-wider mb-1">Investito</div>
                                <div className="text-lg font-bold text-white">
                                    ${stats.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-[#666677] uppercase tracking-wider mb-1">Valore Attuale</div>
                                <div className={`text-lg font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                    ${stats.currentValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </BaseCard>
        </motion.div>
    );
}

export default BTCAccumulatorCard;
