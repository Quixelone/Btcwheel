/**
 * ExchangeConnectionView - Connect and manage exchange API connections
 * 
 * Allows users to securely store their API keys and view connected exchanges.
 * READ-ONLY: We only read data, never execute orders.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Link2,
    Unlink,
    CheckCircle2,
    AlertTriangle,
    Eye,
    EyeOff,
    RefreshCw,
    Wallet,
    TrendingUp,
    Shield,
    Loader2,
} from 'lucide-react';
import type { View } from '../types/navigation';
import { PageWrapper, PageContent, PageHeader } from '../components/layout/PageWrapper';
import { BaseCard } from '../components/ui/cards';
import {
    PionexClient,
    savePionexCredentials,
    getPionexCredentials,
    clearPionexCredentials,
    hasPionexCredentials,
    type PionexBalance,
} from '../services/pionex';

interface ExchangeConnectionViewProps {
    onNavigate: (view: View) => void;
}

export function ExchangeConnectionView({ onNavigate }: ExchangeConnectionViewProps) {
    // Form state
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Balance state
    const [balances, setBalances] = useState<PionexBalance[]>([]);
    const [btcBalance, setBtcBalance] = useState<number>(0);
    const [usdtBalance, setUsdtBalance] = useState<number>(0);

    // BTC Price state
    const [btcPrice, setBtcPrice] = useState<number>(0);
    const [btcChange24h, setBtcChange24h] = useState<number>(0);

    // Check existing connection on mount
    useEffect(() => {
        if (hasPionexCredentials()) {
            setIsConnected(true);
            loadBalances();
        }
    }, []);

    // Load balances from Pionex
    const loadBalances = async () => {
        const credentials = getPionexCredentials();
        if (!credentials) return;

        setIsLoading(true);
        setError(null);

        try {
            const client = new PionexClient(credentials);
            const allBalances = await client.getBalances();

            // Filter to show only non-zero balances
            const nonZeroBalances = allBalances.filter(
                b => parseFloat(b.free) > 0 || parseFloat(b.frozen) > 0
            );
            setBalances(nonZeroBalances);

            // Get specific balances
            const btc = await client.getBTCBalance();
            const usdt = await client.getUSDTBalance();
            setBtcBalance(btc.total);
            setUsdtBalance(usdt.total);

            // Get BTC price
            try {
                const priceData = await client.getBTCPrice();
                setBtcPrice(priceData.price);
                setBtcChange24h(priceData.change24h);
            } catch (priceErr) {
                console.error('Failed to load BTC price:', priceErr);
            }

        } catch (err) {
            console.error('Failed to load balances:', err);
            setError('Impossibile caricare i bilanci. Verifica le tue API key.');
        } finally {
            setIsLoading(false);
        }
    };

    // Connect to Pionex
    const handleConnect = async () => {
        if (!apiKey.trim() || !apiSecret.trim()) {
            setError('Inserisci API Key e API Secret');
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const client = new PionexClient({ apiKey, apiSecret });
            const isValid = await client.testConnection();

            if (isValid) {
                // Save credentials
                savePionexCredentials({ apiKey, apiSecret });
                setIsConnected(true);

                // Clear form
                setApiKey('');
                setApiSecret('');

                // Load balances
                await loadBalances();
            } else {
                setError('Connessione fallita. Verifica le tue API key.');
            }
        } catch (err) {
            console.error('Connection error:', err);
            setError('Errore di connessione. Verifica le API key e riprova.');
        } finally {
            setIsConnecting(false);
        }
    };

    // Disconnect from Pionex
    const handleDisconnect = () => {
        clearPionexCredentials();
        setIsConnected(false);
        setBalances([]);
        setBtcBalance(0);
        setUsdtBalance(0);
    };

    return (
        <PageWrapper>
            <PageContent>
                <PageHeader
                    title="Collega Exchange"
                    subtitle="Connetti il tuo exchange per importare automaticamente i dati"
                />

                {/* Security Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <BaseCard className="border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">🔒 Sicurezza delle tue API</h4>
                                <ul className="space-y-1 text-sm text-[#888899]">
                                    <li>• Le tue API key sono salvate <strong>localmente</strong> sul tuo dispositivo</li>
                                    <li>• Usa sempre API key con permessi <strong>READ-ONLY</strong> (solo lettura)</li>
                                    <li>• <strong>MAI</strong> condividere le tue API key con nessuno</li>
                                    <li>• Su Pionex, abilita il whitelist IP per maggiore sicurezza</li>
                                </ul>
                            </div>
                        </div>
                    </BaseCard>
                </motion.div>

                {/* Pionex Connection Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <BaseCard>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">P</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Pionex</h3>
                                    <p className="text-sm text-[#888899]">Trading automatico e Grid Bot</p>
                                </div>
                            </div>

                            {isConnected ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Connesso
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-xl text-sm font-bold">
                                    <Unlink className="w-4 h-4" />
                                    Non connesso
                                </div>
                            )}
                        </div>

                        {!isConnected ? (
                            // Connection Form
                            <div className="space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-[#888899] mb-2">
                                        API Key
                                    </label>
                                    <input
                                        type="text"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Inserisci la tua API Key"
                                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-[#444455] focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#888899] mb-2">
                                        API Secret
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? 'text' : 'password'}
                                            value={apiSecret}
                                            onChange={(e) => setApiSecret(e.target.value)}
                                            placeholder="Inserisci il tuo API Secret"
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-white placeholder:text-[#444455] focus:outline-none focus:border-blue-500/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666677] hover:text-white transition-colors"
                                        >
                                            {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConnect}
                                    disabled={isConnecting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Connessione in corso...
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="w-5 h-5" />
                                            Connetti Pionex
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-center text-[#666677]">
                                    Vai su Pionex → Impostazioni → API Management per creare le tue API key
                                </p>
                            </div>
                        ) : (
                            // Connected State - Show Balances
                            <div className="space-y-6">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-[#888899] text-sm mb-2">
                                            <Wallet className="w-4 h-4" />
                                            BTC Balance
                                        </div>
                                        <div className="text-2xl font-bold text-orange-400">
                                            {isLoading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                `₿ ${btcBalance.toFixed(8)}`
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/[0.03] rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-[#888899] text-sm mb-2">
                                            <TrendingUp className="w-4 h-4" />
                                            USDT Balance
                                        </div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {isLoading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                `$ ${usdtBalance.toFixed(2)}`
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* BTC Live Price */}
                                {btcPrice > 0 && (
                                    <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm text-[#888899] mb-1">Prezzo BTC Live</div>
                                                <div className="text-3xl font-bold text-white">
                                                    ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                            <div className={`text-lg font-bold ${btcChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {btcChange24h >= 0 ? '▲' : '▼'} {Math.abs(btcChange24h).toFixed(2)}%
                                            </div>
                                        </div>
                                        <div className="text-xs text-[#666677] mt-2">Dati da Pionex • Aggiornato in tempo reale</div>
                                    </div>
                                )}

                                {/* All Balances */}
                                {balances.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-[#888899] uppercase tracking-wider mb-3">
                                            Tutti i bilanci
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {balances.map((balance) => (
                                                <div
                                                    key={balance.coin}
                                                    className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg"
                                                >
                                                    <span className="font-medium text-white">{balance.coin}</span>
                                                    <div className="text-right">
                                                        <div className="text-white">{parseFloat(balance.free).toFixed(8)}</div>
                                                        {parseFloat(balance.frozen) > 0 && (
                                                            <div className="text-xs text-[#666677]">
                                                                Frozen: {parseFloat(balance.frozen).toFixed(8)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={loadBalances}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white font-medium rounded-xl transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Aggiorna
                                    </button>

                                    <button
                                        onClick={handleDisconnect}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors"
                                    >
                                        <Unlink className="w-4 h-4" />
                                        Disconnetti
                                    </button>
                                </div>
                            </div>
                        )}
                    </BaseCard>
                </motion.div>

                {/* Coming Soon - Other Exchanges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-lg font-bold text-[#888899] mb-4">Prossimamente</h3>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { name: 'Deribit', desc: 'Opzioni BTC 0DTE', color: 'from-emerald-500 to-teal-500' },
                            { name: 'OKX', desc: 'Opzioni & Dual Investment', color: 'from-purple-500 to-pink-500' },
                            { name: 'Binance', desc: 'Dual Investment', color: 'from-yellow-500 to-orange-500' },
                        ].map((exchange) => (
                            <BaseCard key={exchange.name} className="opacity-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exchange.color} flex items-center justify-center`}>
                                        <span className="text-lg font-bold text-white">{exchange.name[0]}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{exchange.name}</h4>
                                        <p className="text-xs text-[#666677]">{exchange.desc}</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-[#666677] italic">
                                    Coming soon...
                                </div>
                            </BaseCard>
                        ))}
                    </div>
                </motion.div>
            </PageContent>
        </PageWrapper>
    );
}

export default ExchangeConnectionView;
