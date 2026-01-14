import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

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
      // Update existing trade
      const updatedTrades = trades.map(t => t.id === editingTrade.id ? newTrade : t);
      saveTrades(updatedTrades);
      setEditingTrade(null);
    } else {
      // Add new trade
      saveTrades([newTrade, ...trades]);
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
  };

  const importTrades = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedTrades = JSON.parse(event.target?.result as string);
          saveTrades([...trades, ...importedTrades]);
          alert('Trade importati con successo!');
        } catch (error) {
          alert('Errore durante l\'importazione dei trade');
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate stats
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Trade Journal Manuale</h2>
          <p className="text-sm text-gray-400">
            Registra i tuoi trade giornalieri per tracciare le performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={exportTrades}
            variant="outline"
            size="sm"
            className="border-slate-600 hover:bg-slate-800"
            disabled={trades.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Esporta
          </Button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importTrades}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-white transition-colors">
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
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Trade
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Totale Trade</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Aperti</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.open}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Chiusi</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.closed}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">P&L Totale</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${stats.totalProfit.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">
                {editingTrade ? 'Modifica Trade' : 'Nuovo Trade'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'put' | 'call' })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="put">Put</option>
                      <option value="call">Call</option>
                    </select>
                  </div>

                  {/* Action */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Azione</label>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value as 'sell' | 'buy' })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="sell">Sell (Open)</option>
                      <option value="buy">Buy (Close/Open)</option>
                    </select>
                  </div>

                  {/* Strike */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Strike Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.strike}
                      onChange={(e) => setFormData({ ...formData, strike: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="95000"
                      required
                    />
                  </div>

                  {/* Premium */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Premium
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.premium}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      placeholder="500"
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Quantità</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Scadenza</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Trade['status'] })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="open">Aperto</option>
                      <option value="closed">Chiuso</option>
                      <option value="expired">Scaduto</option>
                      <option value="assigned">Assegnato</option>
                    </select>
                  </div>

                  {/* Closing Premium (if closed) */}
                  {formData.status !== 'open' && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Premium Chiusura</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.closingPremium}
                        onChange={(e) => setFormData({ ...formData, closingPremium: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                        placeholder="200"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Note (opzionale)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    rows={2}
                    placeholder="Es: Strategia wheel, volatilità alta..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                  >
                    {editingTrade ? 'Aggiorna' : 'Aggiungi'} Trade
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTrade(null);
                    }}
                    className="border-slate-600 hover:bg-slate-800"
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
      <div className="space-y-3">
        {trades.length === 0 ? (
          <Card className="p-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">Nessun Trade Registrato</h3>
            <p className="text-gray-400 mb-4">
              Inizia a tracciare i tuoi trade per analizzare le performance
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registra il Primo Trade
            </Button>
          </Card>
        ) : (
          trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Type & Action Badge */}
                      <Badge className={`${
                        trade.type === 'put' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      }`}>
                        {trade.type.toUpperCase()} {trade.action === 'sell' ? '📉' : '📈'}
                      </Badge>

                      {/* Status Badge */}
                      <Badge className={`${
                        trade.status === 'open' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        trade.status === 'closed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        trade.status === 'expired' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      }`}>
                        {trade.status === 'open' ? 'Aperto' :
                         trade.status === 'closed' ? 'Chiuso' :
                         trade.status === 'expired' ? 'Scaduto' : 'Assegnato'}
                      </Badge>

                      {/* Date */}
                      <span className="text-sm text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(trade.date).toLocaleDateString('it-IT')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Strike</p>
                        <p className="text-sm font-semibold text-white">${trade.strike.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Premium</p>
                        <p className="text-sm font-semibold text-white">${trade.premium}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Quantità</p>
                        <p className="text-sm font-semibold text-white">{trade.quantity}</p>
                      </div>
                      {trade.profit !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Profit/Loss</p>
                          <p className={`text-sm font-bold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {trade.notes && (
                      <p className="text-xs text-gray-400 italic">
                        💭 {trade.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(trade)}
                      variant="ghost"
                      size="sm"
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(trade.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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