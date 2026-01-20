import { useState, useEffect, useRef } from 'react';
import type { View } from '../App';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { ArrowLeft, Target, Plus, X, RefreshCw, Loader, TrendingUp, DollarSign, Activity, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { projectId } from '../utils/supabase/info';
import { toast } from "sonner";
import { PlanVsReal } from './PlanVsReal';
import { StrategyTargetPlan } from './StrategyTargetPlan';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { motion, AnimatePresence } from 'motion/react';

interface WheelStrategyViewProps {
  onNavigate: (view: View) => void;
  onMascotToggle?: () => void;
  mascotVisible?: boolean;
  standalone?: boolean; // Se true, nasconde la navigation (usato nel nuovo layout)
}

interface Trade {
  id: string;
  date: string;
  type: 'put' | 'call';
  action: 'sell' | 'buy' | 'assigned' | 'expired';
  strike: number;
  premium: number;
  quantity: number;
  ticker: string;
  expiry: string;
  pnl: number;
  status: 'open' | 'closed';
  capital: number;
}

interface Strategy {
  id: string;
  name: string;
  ticker: string;
  total_capital: number;
  created_at: string;
  total_btc_accumulated?: number;
  total_btc_cost_basis?: number;
  average_btc_price?: number;
}

interface Stats {
  totalPnL: number;
  activeTrades: number;
  closedTrades: number;
  totalTrades: number;
  winRate: number;
  totalPremiumCollected: number;
  returnOnCapital: number;
  winningTrades: number;
  losingTrades: number;
  initialCapital: number;
  currentCapital: number;
}

export function WheelStrategyView({ onNavigate, mascotVisible, onMascotToggle, standalone = false }: WheelStrategyViewProps) {
  const hasAutoSelectedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);

  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    name: '',
    ticker: 'BTC',
    totalCapital: '',
  });

  const [showAddTrade, setShowAddTrade] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [formData, setFormData] = useState({
    ticker: 'BTC',
    type: 'put' as 'put' | 'call',
    action: 'sell' as Trade['action'],
    strike: '',
    premium: '',
    quantity: '1',
    expiry: '',
    capital: '',
  });

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAccessToken(session.access_token);
        setIsCloudMode(true);
        await fetchStrategies(session.access_token);
      } else {
        setIsCloudMode(false);
        loadLocalStrategies();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async (token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const strategiesList = data.strategies || [];
        setStrategies(strategiesList);
        if (strategiesList.length > 0 && !hasAutoSelectedRef.current) {
          selectStrategy(strategiesList[0]);
          hasAutoSelectedRef.current = true;
        }
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const loadLocalStrategies = () => {
    const local = localStorage.getItem('btcwheel_strategies');
    if (local) {
      const data = JSON.parse(local);
      setStrategies(data);
      if (data.length > 0 && !hasAutoSelectedRef.current) {
        selectLocalStrategy(data[0]);
        hasAutoSelectedRef.current = true;
      }
    }
  };

  const selectStrategy = async (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    await fetchTrades(strategy.id);
    await fetchStats(strategy.id);
  };

  const selectLocalStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    const localTrades = localStorage.getItem(`btcwheel_trades_${strategy.id}`);
    const tradesList = localTrades ? JSON.parse(localTrades) : [];
    setTrades(tradesList);
    calculateLocalStats(strategy, tradesList);
  };

  const fetchTrades = async (strategyId: string) => {
    if (!accessToken) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades/${strategyId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchStats = async (strategyId: string) => {
    if (!accessToken) return;
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies/${strategyId}/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const calculateLocalStats = (strategy: Strategy, tradesList: Trade[]) => {
    const activeTrades = tradesList.filter(t => t.status === 'open').length;
    const closedTrades = tradesList.filter(t => t.status === 'closed');
    const totalPnL = tradesList.reduce((sum, t) => sum + t.pnl, 0);
    const totalPremiumCollected = tradesList.reduce((sum, t) => sum + (t.premium * t.quantity), 0);
    const winningTrades = closedTrades.filter(t => t.pnl > 0).length;
    const losingTrades = closedTrades.filter(t => t.pnl < 0).length;
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
    const returnOnCapital = strategy.total_capital > 0 ? (totalPnL / strategy.total_capital) * 100 : 0;

    setStats({
      totalPnL,
      activeTrades,
      closedTrades: closedTrades.length,
      totalTrades: tradesList.length,
      winRate,
      totalPremiumCollected,
      returnOnCapital,
      winningTrades,
      losingTrades,
      initialCapital: strategy.total_capital,
      currentCapital: strategy.total_capital + totalPnL
    });
  };

  const handleCreateStrategy = async () => {
    if (!strategyForm.name || !strategyForm.totalCapital) {
      toast.error('Inserisci nome e capitale');
      return;
    }
    setSaving(true);
    const newStrategy: Strategy = {
      id: crypto.randomUUID(),
      name: strategyForm.name,
      ticker: strategyForm.ticker,
      total_capital: parseFloat(strategyForm.totalCapital),
      created_at: new Date().toISOString(),
    };

    if (accessToken) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newStrategy)
        });
        if (response.ok) {
          await fetchStrategies(accessToken);
          setShowCreateStrategy(false);
          toast.success('Strategia creata!');
        }
      } catch (error) {
        console.error('Error creating strategy:', error);
        toast.error('Errore durante la creazione');
      }
    } else {
      const updatedStrategies = [...strategies, newStrategy];
      setStrategies(updatedStrategies);
      localStorage.setItem('btcwheel_strategies', JSON.stringify(updatedStrategies));
      setShowCreateStrategy(false);
      toast.success('Strategia creata localmente!');
    }
    setSaving(false);
  };

  const handleAddTrade = async () => {
    if (!selectedStrategy) return;
    if (!formData.strike || !formData.premium || !formData.expiry) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }
    setSaving(true);
    const newTrade: Trade = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      action: formData.action,
      strike: parseFloat(formData.strike),
      premium: parseFloat(formData.premium),
      quantity: parseInt(formData.quantity),
      ticker: formData.ticker,
      expiry: formData.expiry,
      pnl: formData.action === 'sell' ? parseFloat(formData.premium) * parseInt(formData.quantity) : -parseFloat(formData.premium) * parseInt(formData.quantity),
      status: 'open',
      capital: parseFloat(formData.capital) || selectedStrategy.total_capital
    };

    if (accessToken) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...newTrade, strategyId: selectedStrategy.id })
        });
        if (response.ok) {
          await fetchTrades(selectedStrategy.id);
          await fetchStats(selectedStrategy.id);
          setShowAddTrade(false);
          toast.success('Trade aggiunto!');
        }
      } catch (error) {
        console.error('Error adding trade:', error);
        toast.error('Errore durante il salvataggio');
      }
    } else {
      const updatedTrades = [newTrade, ...trades];
      setTrades(updatedTrades);
      localStorage.setItem(`btcwheel_trades_${selectedStrategy.id}`, JSON.stringify(updatedTrades));
      calculateLocalStats(selectedStrategy, updatedTrades);
      setShowAddTrade(false);
      toast.success('Trade aggiunto localmente!');
    }
    setSaving(false);
  };

  const handleCloseTrade = async (tradeId: string) => {
    if (!selectedStrategy) return;
    setSaving(true);
    if (accessToken) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/trades/${tradeId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'closed' })
        });
        if (response.ok) {
          await fetchTrades(selectedStrategy.id);
          await fetchStats(selectedStrategy.id);
          toast.success('Trade chiuso!');
        }
      } catch (error) {
        console.error('Error closing trade:', error);
        toast.error('Errore durante la chiusura');
      }
    } else {
      const updatedTrades = trades.map(t => t.id === tradeId ? { ...t, status: 'closed' as const } : t);
      setTrades(updatedTrades);
      localStorage.setItem(`btcwheel_trades_${selectedStrategy.id}`, JSON.stringify(updatedTrades));
      calculateLocalStats(selectedStrategy, updatedTrades);
      toast.success('Trade chiuso localmente!');
    }
    setSaving(false);
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa strategia e tutti i suoi trade?')) return;

    setSaving(true);
    if (accessToken) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies/${strategyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (response.ok) {
          toast.success('Strategia eliminata!');
          await fetchStrategies(accessToken);
          setSelectedStrategy(null);
        }
      } catch (error) {
        console.error('Error deleting strategy:', error);
        toast.error('Errore durante l\'eliminazione');
      }
    } else {
      const updatedStrategies = strategies.filter(s => s.id !== strategyId);
      setStrategies(updatedStrategies);
      localStorage.setItem('btcwheel_strategies', JSON.stringify(updatedStrategies));
      localStorage.removeItem(`btcwheel_trades_${strategyId}`);
      setSelectedStrategy(null);
      toast.success('Strategia eliminata localmente!');
    }
    setSaving(false);
  };

  const testAndReloadConnection = async () => {
    toast.loading('Controllo connessione...', { id: 'test-connection' });
    if (!isSupabaseConfigured) {
      toast.error('Supabase non configurato!', { id: 'test-connection' });
      return;
    }
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      toast.error(`Errore: ${error.message}`, { id: 'test-connection' });
      return;
    }
    if (session) {
      setAccessToken(session.access_token);
      setIsCloudMode(true);
      await fetchStrategies(session.access_token);
      toast.success('Connesso al Cloud', { id: 'test-connection' });
    } else {
      setIsCloudMode(false);
      toast.info('Modalità Locale', { id: 'test-connection' });
    }
  };

  return (
    <div className={`min-h-screen ${standalone ? '' : 'md:pl-20'} bg-slate-950 text-white relative overflow-x-hidden pb-24 md:pb-0`}>
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {!standalone && (
        <Navigation
          currentView="wheel-strategy"
          onNavigate={onNavigate}
          mascotVisible={mascotVisible}
          onMascotToggle={onMascotToggle}
        />
      )}

      <header className="relative z-30 px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('home')}
            className="w-14 h-14 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </motion.div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Wheel Dashboard</h1>
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              {isCloudMode ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5">Cloud Sync Active</Badge>
              ) : (
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] font-black uppercase px-2 py-0.5">Local Mode</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={testAndReloadConnection} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <UserMenu onNavigate={onNavigate} />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-8 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full animate-pulse" />
              <Loader className="w-16 h-16 text-emerald-500 animate-spin absolute inset-0" />
            </div>
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Sincronizzazione dati...</p>
          </div>
        ) : (
          <>
            <Card className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
                    <Target className="w-6 h-6 text-emerald-500" />
                    Strategia Attiva
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Gestisci i tuoi piani di trading e accumulo</p>
                </div>
                <Button
                  onClick={() => setShowCreateStrategy(!showCreateStrategy)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12 px-8 shadow-lg shadow-emerald-600/20"
                >
                  {showCreateStrategy ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {showCreateStrategy ? 'Annulla' : 'Nuova Strategia'}
                </Button>
              </div>

              <AnimatePresence>
                {showCreateStrategy && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid md:grid-cols-3 gap-6 p-8 bg-slate-950/50 rounded-2xl border border-white/5 mb-8">
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-1">Nome Strategia</Label>
                        <Input
                          value={strategyForm.name}
                          onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })}
                          placeholder="es. BTC Wheel 2024"
                          className="bg-slate-900 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-500 font-black text-[10px] uppercase tracking-widest ml-1">Capitale ($)</Label>
                        <Input
                          type="number"
                          value={strategyForm.totalCapital}
                          onChange={(e) => setStrategyForm({ ...strategyForm, totalCapital: e.target.value })}
                          placeholder="50000"
                          className="bg-slate-900 border-white/10 text-white h-12 rounded-xl focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleCreateStrategy}
                          disabled={saving}
                          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl"
                        >
                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : 'Crea Strategia'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={selectedStrategy?.id || ''}
                    onChange={(e) => {
                      const strategy = strategies.find(s => s.id === e.target.value);
                      if (strategy) {
                        if (accessToken) selectStrategy(strategy);
                        else selectLocalStrategy(strategy);
                      }
                    }}
                    className="w-full h-14 bg-slate-950/50 border border-white/10 text-white rounded-2xl px-6 focus:ring-2 focus:ring-emerald-500 outline-none font-black uppercase text-xs tracking-widest appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Seleziona una strategia...</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ${s.total_capital.toLocaleString()}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Activity className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
                {selectedStrategy && (
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteStrategy(selectedStrategy.id)}
                    className="h-14 w-14 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {selectedStrategy && (
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Capitale Iniziale</p>
                    <p className="text-2xl font-black text-white">${selectedStrategy.total_capital.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Profitto Totale</p>
                    <p className={`text-2xl font-black ${stats && stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stats ? (stats.totalPnL >= 0 ? '+' : '') + '$' + stats.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '$0.00'}
                    </p>
                  </div>
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-widest mb-2">Capitale Attuale</p>
                    <p className="text-2xl font-black text-emerald-400">
                      ${stats ? stats.currentCapital.toLocaleString(undefined, { minimumFractionDigits: 2 }) : selectedStrategy.total_capital.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {selectedStrategy && stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Win Rate</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats.winRate.toFixed(1)}%</p>
                </Card>
                <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade Attivi</span>
                    <Activity className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats.activeTrades}</p>
                </Card>
                <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premi Totali</span>
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-white">${stats.totalPremiumCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </Card>
                <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ROI Totale</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-white">{stats.returnOnCapital.toFixed(2)}%</p>
                </Card>
              </div>
            )}

            {selectedStrategy && stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PlanVsReal trades={trades} stats={stats} />
                <StrategyTargetPlan strategy={selectedStrategy} currentCapital={stats.currentCapital} stats={stats} />
              </div>
            )}

            {selectedStrategy && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Trade Journal</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Cronologia completa delle operazioni</p>
                  </div>
                  <Button
                    onClick={() => setShowAddTrade(!showAddTrade)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12 px-8 shadow-lg shadow-blue-600/20"
                  >
                    {showAddTrade ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Nuovo Trade
                  </Button>
                </div>

                <AnimatePresence>
                  {showAddTrade && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="p-8 bg-slate-900/80 border border-blue-500/30 backdrop-blur-xl rounded-3xl space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo</Label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'put' | 'call' })}
                              className="w-full h-12 bg-slate-950 border border-white/10 text-white rounded-xl px-4 outline-none font-black uppercase text-xs focus:border-blue-500"
                            >
                              <option value="put">PUT</option>
                              <option value="call">CALL</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Strike ($)</Label>
                            <Input
                              type="number"
                              value={formData.strike}
                              onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                              className="bg-slate-950 border-white/10 text-white h-12 rounded-xl focus:border-blue-500"
                              placeholder="95000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premio ($)</Label>
                            <Input
                              type="number"
                              value={formData.premium}
                              onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                              className="bg-slate-950 border-white/10 text-white h-12 rounded-xl focus:border-blue-500"
                              placeholder="500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scadenza</Label>
                            <Input
                              type="date"
                              value={formData.expiry}
                              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                              className="bg-slate-950 border-white/10 text-white h-12 rounded-xl focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleAddTrade}
                          disabled={saving}
                          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-blue-600/20"
                        >
                          {saving ? <Loader className="w-5 h-5 animate-spin" /> : 'Registra Operazione'}
                        </Button>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {trades.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-white/10">
                      <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Nessun trade registrato</p>
                    </div>
                  ) : (
                    trades.map(trade => (
                      <motion.div
                        key={trade.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-between gap-6 hover:border-emerald-500/20 transition-all group">
                          <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${trade.type === 'put' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                              {trade.type.toUpperCase()[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-black text-white">${trade.strike.toLocaleString()}</p>
                                <Badge className={`text-[8px] font-black uppercase px-1.5 py-0 ${trade.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                  {trade.status}
                                </Badge>
                              </div>
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{trade.date} • EXP: {trade.expiry}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className={`text-lg font-black ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">P&L Realizzato</p>
                            </div>
                            {trade.status === 'open' && (
                              <Button
                                onClick={() => handleCloseTrade(trade.id)}
                                disabled={saving}
                                className="h-10 px-6 bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 font-black uppercase text-[10px] tracking-widest rounded-xl border border-white/5"
                              >
                                Chiudi
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
