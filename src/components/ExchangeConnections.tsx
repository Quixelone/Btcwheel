import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity,
  X,
  Zap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { ExchangeLogo } from './ExchangeLogos';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Exchange {
  id: string;
  name: string;
  exchange?: string;
  supportsOptions: boolean;
  connected?: boolean;
  verified?: boolean;
  createdAt?: string;
}

interface TradeStats {
  totalTrades: number;
  wheelTrades: number;
  optionTrades: number;
  totalPremium: number;
  totalFees: number;
}

interface Trade {
  id: string;
  exchange: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'option' | 'spot' | 'future';
  optionType?: 'call' | 'put';
  price: number;
  quantity: number;
  premium?: number;
  strike?: number;
  expiry?: string;
  timestamp: number;
  fee?: number;
}

export function ExchangeConnections() {
  const { user, session } = useAuth();
  const accessToken = session?.access_token || publicAnonKey;

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [connectedExchanges, setConnectedExchanges] = useState<Exchange[]>([]);
  const [_loading, setLoading] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [showApiForm, setShowApiForm] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [_loadingTrades, setLoadingTrades] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);

  // Load exchanges on mount
  useEffect(() => {
    loadExchanges();
    if (user?.id) {
      loadConnectedExchanges();
    }
  }, [user]);

  const loadExchanges = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExchanges(data.exchanges);
      }
    } catch (error) {
      console.error('Error loading exchanges:', error);
      toast.error('Errore caricamento exchange');
    }
  };

  const loadConnectedExchanges = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/user/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConnectedExchanges(data.exchanges);
      }
    } catch (error) {
      console.error('Error loading connected exchanges:', error);
    }
  };

  const testConnection = async () => {
    if (!selectedExchange || !apiKey || !apiSecret) {
      toast.error('Completa tutti i campi obbligatori');
      return;
    }

    setTesting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/test-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            exchange: selectedExchange,
            apiKey,
            apiSecret
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`✅ Connessione a ${data.exchange} verificata!`);
        await saveCredentials();
      } else {
        toast.error(`❌ Credenziali non valide per ${selectedExchange}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Errore durante il test della connessione');
    } finally {
      setTesting(false);
    }
  };

  const saveCredentials = async () => {
    if (!user?.id || !selectedExchange || !apiKey || !apiSecret) return;

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/save-credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            userId: user.id,
            exchange: selectedExchange,
            apiKey,
            apiSecret,
            passphrase: passphrase || undefined
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowApiForm(false);
        resetForm();
        await loadConnectedExchanges();
      } else {
        toast.error(data.error || 'Errore salvataggio credenziali');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
  };

  const loadTrades = async (exchangeId: string) => {
    if (!user?.id) return;

    setLoadingTrades(true);

    try {
      const connectedExchange = connectedExchanges.find(e => e.id === exchangeId);
      if (!connectedExchange) {
        toast.error('Exchange non connesso');
        return;
      }

      toast.info('Caricamento trade in corso...');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/get-trades`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            exchange: exchangeId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        }
      );

      const data = await response.json();

      if (data.trades) {
        setTrades(data.trades);
        setStats(data.stats);
        toast.success(`${data.stats.wheelTrades} trade caricati da ${data.exchange}`);
      } else {
        toast.error(data.error || 'Errore caricamento trade');
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      toast.error('Errore durante il caricamento dei trade');
    } finally {
      setLoadingTrades(false);
    }
  };

  const resetForm = () => {
    setApiKey('');
    setApiSecret('');
    setPassphrase('');
    setSelectedExchange(null);
  };

  const isExchangeConnected = (exchangeId: string) => {
    return connectedExchanges.some(e => e.exchange === exchangeId);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchanges.map((exchange) => (
          <motion.div
            key={exchange.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`p-6 bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden group ${selectedExchange === exchange.id ? 'ring-2 ring-emerald-500/50 border-emerald-500/30' : ''
                }`}
              onClick={() => {
                setSelectedExchange(exchange.id);
                if (!isExchangeConnected(exchange.id)) {
                  setShowApiForm(true);
                } else {
                  loadTrades(exchange.id);
                }
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-950 rounded-xl border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                    <ExchangeLogo exchangeId={exchange.id} className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-tight">{exchange.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {exchange.supportsOptions && (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[8px] font-black uppercase px-1.5 py-0">Options</Badge>
                      )}
                      <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[8px] font-black uppercase px-1.5 py-0">Spot</Badge>
                    </div>
                  </div>
                </div>
                {isExchangeConnected(exchange.id) ? (
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-white/5 group-hover:border-emerald-500/20 transition-colors flex items-center justify-center">
                    <Zap className="w-4 h-4 text-slate-700 group-hover:text-emerald-500/50 transition-colors" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">
                <span>Status</span>
                <span className={isExchangeConnected(exchange.id) ? 'text-emerald-500' : 'text-slate-700'}>
                  {isExchangeConnected(exchange.id) ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showApiForm && selectedExchange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-40"
          >
            <Card className="p-10 bg-slate-900/90 border border-emerald-500/30 backdrop-blur-2xl rounded-[2rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                <Button variant="ghost" size="sm" onClick={() => setShowApiForm(false)} className="w-10 h-10 rounded-full text-slate-500 hover:text-white hover:bg-white/5">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="w-20 h-20 bg-slate-950 rounded-3xl border border-white/10 flex items-center justify-center shadow-xl">
                  <ExchangeLogo exchangeId={selectedExchange} className="w-12 h-12" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3 justify-center md:justify-start">
                    Connetti {exchanges.find(e => e.id === selectedExchange)?.name}
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </h2>
                  <p className="text-slate-400 font-medium mt-2 flex items-center gap-2 justify-center md:justify-start">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Le tue chiavi API sono criptate e memorizzate in modo sicuro
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-3">
                  <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-1">API Key</Label>
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Inserisci la tua API Key"
                    className="bg-slate-950 border-white/10 text-white h-14 rounded-2xl focus:border-emerald-500 px-6 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-1">API Secret</Label>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Inserisci il tuo API Secret"
                      className="bg-slate-950 border-white/10 text-white h-14 rounded-2xl focus:border-emerald-500 px-6 pr-14 font-medium"
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {(selectedExchange === 'okx' || selectedExchange === 'kucoin') && (
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-1">Passphrase</Label>
                    <Input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Passphrase dell'API"
                      className="bg-slate-950 border-white/10 text-white h-14 rounded-2xl focus:border-emerald-500 px-6 font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={testConnection}
                  disabled={testing || !apiKey || !apiSecret}
                  className="flex-1 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 transition-all"
                >
                  {testing ? <RefreshCw className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
                  {testing ? 'Verifica in corso...' : 'Verifica e Connetti Exchange'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowApiForm(false)}
                  className="h-16 px-10 text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest rounded-2xl"
                >
                  Annulla
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade Totali</span>
            </div>
            <p className="text-3xl font-black text-white">{stats.totalTrades}</p>
          </Card>
          <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl -mr-8 -mt-8" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wheel Trades</span>
            </div>
            <p className="text-3xl font-black text-white">{stats.wheelTrades}</p>
          </Card>
          <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premium Totale</span>
            </div>
            <p className="text-3xl font-black text-emerald-400">${stats.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </Card>
          <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl -mr-8 -mt-8" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Commissioni</span>
            </div>
            <p className="text-3xl font-black text-orange-400">${stats.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </Card>
        </motion.div>
      )}

      {trades.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-slate-900/50 border border-white/5 overflow-hidden rounded-[2rem]">
            <div className="p-8 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
              <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-500" />
                Cronologia Trade Importati
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black uppercase text-[10px] px-3 py-1">
                {trades.length} Operazioni
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/5 bg-slate-950/20">
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Data</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Simbolo</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lato</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Prezzo</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Quantità</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6 text-sm text-slate-400 font-bold">
                        {new Date(trade.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="p-6 text-sm text-white font-black tracking-tight">{trade.symbol}</td>
                      <td className="p-6">
                        <Badge className={`text-[9px] font-black uppercase px-2 py-0.5 ${trade.type === 'option' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                          {trade.type} {trade.optionType?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-6">
                        <Badge className={`text-[9px] font-black uppercase px-2 py-0.5 ${trade.side === 'sell' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                          {trade.side}
                        </Badge>
                      </td>
                      <td className="p-6 text-sm text-white font-black text-right group-hover:text-emerald-400 transition-colors">${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-6 text-sm text-white font-black text-right">{trade.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}