import { Target, Activity, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

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

interface StrategyPlan {
  targetPremiumPercent: number;
  tradesPerMonth: number;
  targetMonthlyReturn: number;
  riskPerTrade: number;
  strategy: 'wheel' | 'covered-call' | 'cash-secured-put';
}

interface PlanVsRealProps {
  trades: Trade[];
  stats: Stats;
  plan?: StrategyPlan;
}

export function PlanVsReal({ trades, stats, plan: customPlan }: PlanVsRealProps) {
  if (trades.length === 0) return null;

  // Calcola metriche reali dai trade
  const closedTrades = trades.filter(t => t.status === 'closed');
  const avgPremiumPercent = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + ((t.premium * t.quantity) / t.capital * 100), 0) / closedTrades.length
    : 0;
  
  // Calcola giorni di trading
  const firstTradeDate = trades.length > 0 ? new Date(trades[trades.length - 1].date) : new Date();
  const lastTradeDate = trades.length > 0 ? new Date(trades[0].date) : new Date();
  const daysDiff = Math.max(1, Math.ceil((lastTradeDate.getTime() - firstTradeDate.getTime()) / (1000 * 60 * 60 * 24)));
  const monthsDiff = daysDiff / 30;
  
  const actualTradesPerMonth = monthsDiff > 0 ? trades.length / monthsDiff : 0;
  const actualMonthlyReturn = monthsDiff > 0 ? (stats.returnOnCapital / monthsDiff) : stats.returnOnCapital;
  
  // Piano target (esempio - in futuro sarà configurabile)
  const plan = customPlan || {
    targetPremiumPercent: 2,
    tradesPerMonth: 8,
    targetMonthlyReturn: 5,
    riskPerTrade: 10,
    strategy: 'wheel' as const
  };
  
  // Calcola scostamenti
  const premiumDiff = avgPremiumPercent - plan.targetPremiumPercent;
  const tradesDiff = actualTradesPerMonth - plan.tradesPerMonth;
  const returnDiff = actualMonthlyReturn - plan.targetMonthlyReturn;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl text-gray-800 flex items-center gap-2">
            📊 Piano vs Reale
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Confronta le performance reali con gli obiettivi pianificati
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Periodo analizzato</p>
          <p className="text-sm text-gray-700">{daysDiff} giorni ({monthsDiff.toFixed(1)} mesi)</p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* Premio Medio */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-gray-700">Premio Medio per Trade</h4>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Piano</span>
              <span className="text-sm text-gray-600">{plan.targetPremiumPercent.toFixed(2)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Reale</span>
              <span className="text-lg text-gray-900">{avgPremiumPercent.toFixed(2)}%</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-600">Differenza</span>
              <div className={`flex items-center gap-1 text-sm ${
                premiumDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {premiumDiff >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(premiumDiff).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequenza Trade */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-gray-700">Trade al Mese</h4>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Piano</span>
              <span className="text-sm text-gray-600">{plan.tradesPerMonth}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Reale</span>
              <span className="text-lg text-gray-900">{actualTradesPerMonth.toFixed(1)}</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-600">Differenza</span>
              <div className={`flex items-center gap-1 text-sm ${
                tradesDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {tradesDiff >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(tradesDiff).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Mensile */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm text-gray-700">ROI Mensile</h4>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Piano</span>
              <span className="text-sm text-gray-600">{plan.targetMonthlyReturn.toFixed(2)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Reale</span>
              <span className="text-lg text-gray-900">{actualMonthlyReturn.toFixed(2)}%</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-600">Differenza</span>
              <div className={`flex items-center gap-1 text-sm ${
                returnDiff >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {returnDiff >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(returnDiff).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-5 border-2 border-emerald-200">
        <h4 className="text-sm text-gray-800 mb-3">💡 Analisi Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{premiumDiff >= 0 ? '✅' : '⚠️'}</span>
              <p>
                Premio medio <strong>{premiumDiff >= 0 ? 'superiore' : 'inferiore'}</strong> al piano di{' '}
                <strong className={premiumDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {Math.abs(premiumDiff).toFixed(2)}%
                </strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{tradesDiff >= -2 ? '✅' : '📉'}</span>
              <p>
                Frequenza trade: <strong>{actualTradesPerMonth.toFixed(1)}</strong> vs piano <strong>{plan.tradesPerMonth}</strong>/mese
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{returnDiff >= 0 ? '🎯' : '⚠️'}</span>
              <p>
                ROI mensile {returnDiff >= 0 ? 'raggiunto' : 'sotto piano'}: 
                <strong className={returnDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {' '}{actualMonthlyReturn.toFixed(2)}%
                </strong> vs <strong>{plan.targetMonthlyReturn}%</strong>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5">📈</span>
              <p>
                Win rate: <strong>{stats.winRate.toFixed(1)}%</strong> ({stats.winningTrades}W / {stats.losingTrades}L)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
