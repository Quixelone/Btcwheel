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

import {
    DeribitClient,
    saveDeribitCredentials,
    getDeribitCredentials,
    clearDeribitCredentials,
    hasDeribitCredentials
} from '../services/deribit';

interface ExchangeConnectionViewProps {
    onNavigate: (view: View) => void;
}

export function ExchangeConnectionView({ onNavigate }: ExchangeConnectionViewProps) {
    // Exchange selection
    const [activeExchange, setActiveExchange] = useState<'pionex' | 'deribit'>('pionex');

    // Deribit state
    const [deribitClientId, setDeribitClientId] = useState('');
    const [deribitClientSecret, setDeribitClientSecret] = useState('');
    const [isDeribitConnected, setIsDeribitConnected] = useState(false);
    const [deribitBalance, setDeribitBalance] = useState<number>(0);
    const [deribitEquity, setDeribitEquity] = useState<number>(0);

    // Pionex State
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balances, setBalances] = useState<PionexBalance[]>([]);
    const [btcBalance, setBtcBalance] = useState<number>(0);
    const [usdtBalance, setUsdtBalance] = useState<number>(0);
    const [btcPrice, setBtcPrice] = useState<number>(0);
    const [btcChange24h, setBtcChange24h] = useState<number>(0);

    // Import Deribit service
    // Note: You need to add these imports at the top of the file:
    // import { DeribitClient, saveDeribitCredentials, getDeribitCredentials, clearDeribitCredentials, hasDeribitCredentials } from '../services/deribit';

    // Check existing connections
    useEffect(() => {
        if (hasPionexCredentials()) {
            setIsConnected(true);
            loadBalances();
        }
        if (hasDeribitCredentials()) {
            setIsDeribitConnected(true);
            loadDeribitBalances();
        }
    }, []);

    // --- PIONEX LOGIC ---
    const loadBalances = async () => {
        const credentials = getPionexCredentials();
        if (!credentials) return;

        setIsLoading(true);
        setError(null);

        try {
            const client = new PionexClient(credentials);
            const allBalances = await client.getBalances();
            const nonZeroBalances = allBalances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.frozen) > 0);
            setBalances(nonZeroBalances);

            const btc = await client.getBTCBalance();
            const usdt = await client.getUSDTBalance();
            setBtcBalance(btc.total);
            setUsdtBalance(usdt.total);

            try {
                const priceData = await client.getBTCPrice();
                setBtcPrice(priceData.price);
                setBtcChange24h(priceData.change24h);
            } catch (priceErr) { console.error(priceErr); }

        } catch (err) {
            console.error(err);
            setError('Impossibile caricare i bilanci.');
        } finally {
            setIsLoading(false);
        }
    };

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
                savePionexCredentials({ apiKey, apiSecret });
                setIsConnected(true);
                setApiKey('');
                setApiSecret('');
                await loadBalances();
            } else {
                setError('Connessione fallita. Verifica le tue API key.');
            }
        } catch (err) {
            console.error(err);
            setError('Errore di connessione.');
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        clearPionexCredentials();
        setIsConnected(false);
        setBalances([]);
        setBtcBalance(0);
        setUsdtBalance(0);
    };

    // --- DERIBIT LOGIC ---
    const loadDeribitBalances = async () => {
        const creds = getDeribitCredentials();
        if (!creds) return;
        try {
            const client = new DeribitClient(creds);
            const summary = await client.getAccountSummary('BTC');
            setDeribitBalance(summary.balance);
            setDeribitEquity(summary.equity);
        } catch (e) {
            console.error('Failed to load Deribit balances', e);
        }
    };

    const handleConnectDeribit = async () => {
        if (!deribitClientId.trim() || !deribitClientSecret.trim()) return;

        try {
            const client = new DeribitClient({ clientId: deribitClientId, clientSecret: deribitClientSecret });
            const isValid = await client.testConnection();

            if (isValid) {
                saveDeribitCredentials({ clientId: deribitClientId, clientSecret: deribitClientSecret });
                setIsDeribitConnected(true);
                setDeribitClientId('');
                setDeribitClientSecret('');
                await loadDeribitBalances();
            } else {
                alert('Connessione Deribit fallita. Controlla le credenziali.');
            }
        } catch (e) {
            console.error(e);
            alert('Errore durante la connessione a Deribit.');
        }
    };

    const handleDisconnectDeribit = () => {
        clearDeribitCredentials();
        setIsDeribitConnected(false);
        setDeribitBalance(0);
        setDeribitEquity(0);
    };

    return (
        <PageWrapper>
            <PageContent>
                <PageHeader
                    title="Collega Exchange"
                    subtitle="Connetti il tuo exchange per importare automaticamente i dati"
                />

                {/* Exchange Selector */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveExchange('pionex')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all min-w-[200px] ${activeExchange === 'pionex'
                            ? 'bg-blue-500/10 border-blue-500 text-white'
                            : 'bg-white/[0.03] border-white/[0.05] text-[#888899] hover:bg-white/[0.05]'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">P</div>
                        <div className="text-left">
                            <div className="font-bold">Pionex</div>
                            <div className="text-xs opacity-70">{isConnected ? 'Connesso' : 'Non connesso'}</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveExchange('deribit')}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all min-w-[200px] ${activeExchange === 'deribit'
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-white/[0.03] border-white/[0.05] text-[#888899] hover:bg-white/[0.05]'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">D</div>
                        <div className="text-left">
                            <div className="font-bold">Deribit</div>
                            <div className="text-xs opacity-70">{isDeribitConnected ? 'Connesso' : 'Non connesso'}</div>
                        </div>
                    </button>
                </div>

                {/* Active Exchange Content */}
                {activeExchange === 'pionex' ? (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key="pionex"
                    >
                        {/* Existing Pionex Card Content */}
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
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key="deribit"
                    >
                        <BaseCard>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">D</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Deribit</h3>
                                        <p className="text-sm text-[#888899]">Opzioni Bitcoin & Futures</p>
                                    </div>
                                </div>
                                {isDeribitConnected && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl text-sm font-bold">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Connesso
                                    </div>
                                )}
                            </div>

                            {!isDeribitConnected ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-sm text-emerald-200 mb-4">
                                        Per connettere Deribit, crea una API Key con permessi "account:read" e "trade:read".
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#888899] mb-2">Client ID</label>
                                        <input
                                            type="text"
                                            value={deribitClientId}
                                            onChange={(e) => setDeribitClientId(e.target.value)}
                                            placeholder="Es. 8V_xxxx"
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#888899] mb-2">Client Secret</label>
                                        <input
                                            type="password"
                                            value={deribitClientSecret}
                                            onChange={(e) => setDeribitClientSecret(e.target.value)}
                                            placeholder="Es. H7xxxx..."
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                        />
                                    </div>
                                    <button
                                        onClick={handleConnectDeribit}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
                                    >
                                        Connetti Deribit
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    {/* Deribit Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/[0.03] rounded-xl p-4">
                                            <div className="text-sm text-[#888899] mb-1">Equity (BTC)</div>
                                            <div className="text-2xl font-bold text-white">{deribitEquity.toFixed(8)}</div>
                                        </div>
                                        <div className="bg-white/[0.03] rounded-xl p-4">
                                            <div className="text-sm text-[#888899] mb-1">Balance (BTC)</div>
                                            <div className="text-2xl font-bold text-white">{deribitBalance.toFixed(8)}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDisconnectDeribit}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors"
                                    >
                                        <Unlink className="w-4 h-4" />
                                        Disconnetti
                                    </button>
                                </div>
                            )}
                        </BaseCard>
                    </motion.div>
                )}
            </PageContent>
        </PageWrapper>
    );

}

export default ExchangeConnectionView;
