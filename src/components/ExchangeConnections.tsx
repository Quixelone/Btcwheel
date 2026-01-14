import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Link as LinkIcon, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { ExchangeLogo, ExchangeCardLogo } from './ExchangeLogos';

interface Exchange {
  id: string;
  name: string;
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
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [connectedExchanges, setConnectedExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [showApiForm, setShowApiForm] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loadingTrades, setLoadingTrades] = useState(false);
  
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
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
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
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/user/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
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
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/test-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
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
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/save-credentials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
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
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Get stored credentials
      const connectedExchange = connectedExchanges.find(e => e.id === exchangeId);
      if (!connectedExchange) {
        toast.error('Exchange non connesso');
        return;
      }

      // For demo purposes, we'll need to implement secure credential retrieval
      // In a real app, credentials would be encrypted and fetched securely
      toast.info('Caricamento trade in corso...');
      
      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/exchanges/get-trades`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            exchange: exchangeId,
            apiKey: 'stored_key', // Would come from secure storage
            apiSecret: 'stored_secret', // Would come from secure storage
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
    setShowSecret(false);
    setSelectedExchange(null);
  };

  const isExchangeConnected = (exchangeId: string) => {
    return connectedExchanges.some(e => e.exchange === exchangeId);
  };

  return (
    <div className="space-y-6">
      {/* Connected Exchanges */}
      {connectedExchanges.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <h3 className="text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Exchange Connessi
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {connectedExchanges.map((exchange) => (
              <motion.div
                key={exchange.exchange}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ExchangeLogo exchangeId={exchange.exchange} size={40} />
                    <div>
                      <p className="text-white font-semibold">{exchange.name}</p>
                      <p className="text-xs text-gray-400">
                        Connesso {new Date(exchange.createdAt || '').toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Attivo</Badge>
                </div>
                <Button
                  onClick={() => loadTrades(exchange.exchange)}
                  disabled={loadingTrades}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-0 shadow-lg"
                  size="sm"
                >
                  {loadingTrades ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 mr-2" />
                      Carica Trade
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Trade Statistics */}
      {stats && (
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20">
          <h3 className="text-white mb-4 flex items-center gap-2">
            📊 Statistiche Trade (Ultimi 7 giorni)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Trade Totali</p>
              <p className="text-white text-2xl font-bold">{stats.totalTrades}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Trade Wheel</p>
              <p className="text-emerald-400 text-2xl font-bold">{stats.wheelTrades}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Premium Totale</p>
              <p className="text-green-400 text-2xl font-bold">${stats.totalPremium.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Fee Pagate</p>
              <p className="text-orange-400 text-2xl font-bold">${stats.totalFees.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Available Exchanges */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
        <h3 className="text-white mb-4">Exchange Disponibili</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {exchanges.map((exchange) => {
            const connected = isExchangeConnected(exchange.id);
            
            return (
              <motion.button
                key={exchange.id}
                onClick={() => {
                  if (!connected) {
                    setSelectedExchange(exchange.id);
                    setShowApiForm(true);
                  }
                }}
                disabled={connected}
                whileHover={!connected ? { scale: 1.02, y: -2 } : {}}
                whileTap={!connected ? { scale: 0.98 } : {}}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  connected
                    ? 'bg-gray-800/30 border-white/5 opacity-50 cursor-not-allowed'
                    : selectedExchange === exchange.id
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/40 shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 hover:border-purple-500/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <ExchangeLogo exchangeId={exchange.id} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{exchange.name}</p>
                  </div>
                  {connected && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                {exchange.supportsOptions && (
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">Opzioni ⚡</Badge>
                )}
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* API Form */}
      <AnimatePresence>
        {showApiForm && selectedExchange && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border-2 border-purple-500/40 shadow-lg shadow-purple-500/20">
              <h3 className="text-white mb-6 flex items-center gap-2 text-xl">
                🔐 Configura API per {exchanges.find(e => e.id === selectedExchange)?.name}
              </h3>
              
              <div className="space-y-5">
                <div>
                  <Label className="text-gray-300 mb-2">API Key *</Label>
                  <Input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Inserisci la tua API key"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2">API Secret *</Label>
                  <div className="relative">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Inserisci il tuo API secret"
                      className="h-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {(selectedExchange === 'kucoin' || selectedExchange === 'okx' || selectedExchange === 'bitget') && (
                  <div>
                    <Label className="text-gray-300 mb-2">Passphrase {selectedExchange === 'kucoin' ? '*' : '(opzionale)'}</Label>
                    <Input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      placeholder="Inserisci la passphrase"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                    />
                  </div>
                )}

                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-amber-200 leading-relaxed">
                    ⚠️ <strong className="text-amber-100">Importante:</strong> Assicurati che le tue API keys abbiano solo permessi di lettura (read-only). 
                    Non condividere mai le tue credenziali API.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={testConnection}
                    disabled={testing || !apiKey || !apiSecret}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg h-12"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Testa e Salva
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowApiForm(false);
                      resetForm();
                    }}
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-12"
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trades List */}
      {trades.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <h3 className="text-white mb-4">📋 Trade Importati ({trades.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {trades.slice(0, 20).map((trade) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    trade.type === 'option' 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                      : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                  }`}>
                    {trade.type === 'option' ? (
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {trade.symbol}
                      {trade.optionType && (
                        <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-none">
                          {trade.optionType.toUpperCase()}
                        </Badge>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {trade.side === 'buy' ? '🟢 Acquisto' : '🔴 Vendita'} 
                      {trade.strike && ` • Strike $${trade.strike}`}
                      {' • '}{new Date(trade.timestamp).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    ${(trade.premium || trade.price * trade.quantity).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm">{trade.quantity} qty</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}