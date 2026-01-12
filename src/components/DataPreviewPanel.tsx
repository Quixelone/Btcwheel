import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Eye, RefreshCw, TrendingUp, Database, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export function DataPreviewPanel() {
  const [data, setData] = useState<any>(null);

  const loadData = () => {
    const strategies = JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]');
    const plans = JSON.parse(localStorage.getItem('btcwheel_longterm_plans') || '[]');
    const activePlan = localStorage.getItem('btcwheel_active_plan')
      ? JSON.parse(localStorage.getItem('btcwheel_active_plan')!)
      : null;
    const userProgress = localStorage.getItem('btcwheel_user_progress')
      ? JSON.parse(localStorage.getItem('btcwheel_user_progress')!)
      : null;

    // Get all trade keys
    const allKeys = Object.keys(localStorage);
    const tradeKeys = allKeys.filter(key => key.startsWith('btcwheel_trades_'));
    const totalTrades = tradeKeys.reduce((sum, key) => {
      const trades = JSON.parse(localStorage.getItem(key) || '[]');
      return sum + trades.length;
    }, 0);

    setData({
      strategies,
      plans,
      activePlan,
      userProgress,
      totalTrades,
      tradeKeys: tradeKeys.length
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          Dati Attualmente Salvati
        </h3>
        <motion.button
          onClick={loadData}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Strategie</p>
          </div>
          <p className="text-2xl font-bold text-white">{data.strategies.length}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-gray-400">Trade Totali</p>
          </div>
          <p className="text-2xl font-bold text-white">{data.totalTrades}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Piani LT</p>
          </div>
          <p className="text-2xl font-bold text-white">{data.plans.length}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            {data.activePlan ? (
              <CheckCircle2 className="w-4 h-4 text-orange-400" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-500" />
            )}
            <p className="text-xs text-gray-400">Piano Attivo</p>
          </div>
          <p className="text-2xl font-bold text-white">{data.activePlan ? 'Sì' : 'No'}</p>
        </Card>
      </div>

      {/* Detailed Lists */}
      {data.strategies.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Strategie ({data.strategies.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.strategies.map((strategy: any, idx: number) => (
              <div
                key={strategy.id || idx}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{strategy.name || 'Strategia Senza Nome'}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {strategy.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-sm text-emerald-400 font-medium">${strategy.budget || 0}</p>
                  </div>
                </div>
                {strategy.strikePrice && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>Strike: ${strategy.strikePrice}</span>
                    <span>Premium: ${strategy.premium}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {data.plans.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            Piani Long-Term ({data.plans.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.plans.map((plan: any, idx: number) => (
              <div
                key={plan.id || idx}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{plan.name || 'Piano Senza Nome'}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">ID: {plan.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Capitale Iniziale</p>
                    <p className="text-sm text-emerald-400 font-medium">${plan.initialCapital || 0}</p>
                  </div>
                </div>
                {plan.targetMonths && (
                  <div className="mt-2 text-xs text-gray-400">
                    Durata: {plan.targetMonths} mesi
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {data.strategies.length === 0 && data.plans.length === 0 && (
        <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10 text-center">
          <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nessun dato trovato in localStorage</p>
          <p className="text-gray-500 text-xs mt-1">
            Importa un file JSON o migra i dati da un'altra app per iniziare
          </p>
        </Card>
      )}

      {/* Where to find data */}
      {(data.strategies.length > 0 || data.plans.length > 0) && (
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300 space-y-1">
              <p className="text-emerald-400 font-medium">📍 Dove trovare i tuoi dati:</p>
              <ul className="space-y-1 text-xs">
                {data.strategies.length > 0 && (
                  <li>• <strong>Strategie Wheel:</strong> Vai nella Dashboard → sezione "Wheel Strategy"</li>
                )}
                {data.plans.length > 0 && (
                  <li>• <strong>Piani Long-Term:</strong> Vai nella Dashboard → sezione "Long Term Simulator"</li>
                )}
                {data.activePlan && (
                  <li>• <strong>Piano Attivo:</strong> Visibile nella Dashboard principale con tracking real-time</li>
                )}
                {data.totalTrades > 0 && (
                  <li>• <strong>Trade:</strong> Seleziona una strategia nella Dashboard per vedere i suoi trade</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
