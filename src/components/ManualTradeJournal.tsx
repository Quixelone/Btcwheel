import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  TrendingUp,
  Calendar,

  Target,
  CheckCircle2,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Trade {
  id: string;
  date: string;
  type: 'put' | 'call';
  action: 'sell' | 'buy';
  strike: number;
  premium: number;
  quantity: number;
  expiryDate: string;
  status: 'open' | 'closed' | 'expired' | 'assigned';
  closingPremium?: number;
  profit?: number;
  notes?: string;
}

export function ManualTradeJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'put' as 'put' | 'call',
    action: 'sell' as 'sell' | 'buy',
    strike: '',
    premium: '',
    quantity: '1',
    expiryDate: '',
    status: 'open' as Trade['status'],
    closingPremium: '',
    notes: ''
  });

  // Load trades from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem('manual_trades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Save trades to localStorage
  const saveTrades = (newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem('manual_trades', JSON.stringify(newTrades));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const premium = parseFloat(formData.premium);
    const closingPremium = formData.closingPremium ? parseFloat(formData.closingPremium) : undefined;
    const quantity = parseInt(formData.quantity);

    let profit = undefined;
    if (formData.status !== 'open' && closingPremium !== undefined) {
      if (formData.action === 'sell') {
        profit = (premium - closingPremium) * quantity * 100; // Per opzione su BTC
      } else {
        profit = (closingPremium - premium) * quantity * 100;
      }
    }

    const newTrade: Trade = {
      id: editingTrade?.id || Date.now().toString(),
      date: formData.date,
      type: formData.type,
      action: formData.action,
      strike: parseFloat(formData.strike),
      premium,
      quantity,
      expiryDate: formData.expiryDate,
      status: formData.status,
      closingPremium,
      profit,
      notes: formData.notes
    };

    if (editingTrade) {
      const updatedTrades = trades.map(t => t.id === editingTrade.id ? newTrade : t);
      saveTrades(updatedTrades);
      setEditingTrade(null);
      toast.success('Trade aggiornato!');
    } else {
      saveTrades([newTrade, ...trades]);
      toast.success('Trade aggiunto!');
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'put',
      action: 'sell',
      strike: '',
      premium: '',
      quantity: '1',
      expiryDate: '',
      status: 'open',
      closingPremium: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormData({
      date: trade.date,
      type: trade.type,
      action: trade.action,
      strike: trade.strike.toString(),
      premium: trade.premium.toString(),
      quantity: trade.quantity.toString(),
      expiryDate: trade.expiryDate,
      status: trade.status,
      closingPremium: trade.closingPremium?.toString() || '',
      notes: trade.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo trade?')) {
      saveTrades(trades.filter(t => t.id !== id));
      toast.success('Trade eliminato');
    }
  };

  const exportTrades = () => {
    const dataStr = JSON.stringify(trades, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trades_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Trade esportati!');
  };

  const importTrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedTrades = JSON.parse(event.target?.result as string);
          saveTrades([...trades, ...importedTrades]);
          toast.success('Trade importati con successo!');
        } catch (error) {
          toast.error('Errore durante l\'importazione');
        }
      };
      reader.readAsText(file);
    }
  };

  const stats = {
    total: trades.length,
    open: trades.filter(t => t.status === 'open').length,
    closed: trades.filter(t => t.status === 'closed').length,
    totalProfit: trades
      .filter(t => t.profit !== undefined)
      .reduce((sum, t) => sum + (t.profit || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Trade Journal Manuale</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Registra i tuoi trade giornalieri per tracciare le performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={exportTrades}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-xl"
            disabled={trades.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>

          <label className="cursor-pointer">
            <input type="file" accept=".json" onChange={importTrades} className="hidden" />
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
              <Upload className="w-4 h-4" />
              Importa
            </span>
          </label>

          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingTrade(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                type: 'put',
                action: 'sell',
                strike: '',
                premium: '',
                quantity: '1',
                expiryDate: '',
                status: 'open',
                closingPremium: '',
                notes: ''
              });
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-6 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Trade
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Totale Trade</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-white">{stats.total}</p>
        </Card>

        <Card className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aperti</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-white">{stats.open}</p>
        </Card>

        <Card className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chiusi</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-white">{stats.closed}</p>
        </Card>

        <Card className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">P&L Totale</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-8 bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">
                {editingTrade ? 'Modifica Trade' : 'Registra Nuovo Trade'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo Opzione</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'put' | 'call' })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="put">PUT</option>
                      <option value="call">CALL</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Azione</label>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value as 'sell' | 'buy' })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="sell">SELL (Open)</option>
                      <option value="buy">BUY (Close/Open)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Strike Price</label>
                    <input
                      type="number" step="0.01" value={formData.strike}
                      onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                      placeholder="95000" required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premium</label>
                    <input
                      type="number" step="0.01" value={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                      placeholder="500" required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantità</label>
                    <input
                      type="number" min="1" value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Scadenza</label>
                    <input
                      type="date" value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Trade['status'] })}
                      className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                    >
                      <option value="open">APERTO</option>
                      <option value="closed">CHIUSO</option>
                      <option value="expired">SCADUTO</option>
                      <option value="assigned">ASSEGNATO</option>
                    </select>
                  </div>

                  {formData.status !== 'open' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Premium Chiusura</label>
                      <input
                        type="number" step="0.01" value={formData.closingPremium}
                        onChange={(e) => setFormData({ ...formData, closingPremium: e.target.value })}
                        className="w-full h-12 bg-slate-800 border border-white/10 rounded-xl px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                        placeholder="200"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Note (opzionale)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    rows={2}
                    placeholder="Es: Strategia wheel, volatilità alta..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-emerald-600/20"
                  >
                    {editingTrade ? 'Aggiorna Trade' : 'Aggiungi Trade'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTrade(null);
                    }}
                    className="h-14 px-8 text-slate-400 hover:text-white hover:bg-white/5 font-bold rounded-2xl"
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trades List */}
      <div className="space-y-4">
        {trades.length === 0 ? (
          <Card className="p-16 bg-slate-900/50 border border-white/5 rounded-3xl text-center">
            <Target className="w-16 h-16 mx-auto mb-6 text-slate-700" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Nessun Trade Registrato</h3>
            <p className="text-slate-500 font-medium mb-8">
              Inizia a tracciare i tuoi trade per analizzare le performance
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl h-12 px-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registra il Primo Trade
            </Button>
          </Card>
        ) : (
          trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className={`font-black text-[10px] uppercase px-2 py-0.5 ${trade.type === 'put'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {trade.type} {trade.action === 'sell' ? 'SELL' : 'BUY'}
                      </Badge>

                      <Badge className={`font-black text-[10px] uppercase px-2 py-0.5 ${trade.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        trade.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          trade.status === 'expired' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                        {trade.status}
                      </Badge>

                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(trade.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Strike</p>
                        <p className="text-lg font-black text-white">${trade.strike.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Premium</p>
                        <p className="text-lg font-black text-white">${trade.premium}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Quantità</p>
                        <p className="text-lg font-black text-white">{trade.quantity}</p>
                      </div>
                      {trade.profit !== undefined && (
                        <div>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">P&L</p>
                          <p className={`text-lg font-black ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.profit >= 0 ? '+' : ''}${trade.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>

                    {trade.notes && (
                      <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-white/5">
                        <p className="text-xs text-slate-400 font-medium italic">
                          "{trade.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleEdit(trade)}
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(trade.id)}
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}