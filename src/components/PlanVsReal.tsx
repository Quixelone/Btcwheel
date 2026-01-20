import { Target, Activity, TrendingUp, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

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

  // Piano target
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
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <Activity className="w-8 h-8 text-emerald-500" />
            Piano vs Reale
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Confronta le performance reali con gli obiettivi pianificati
          </p>
        </div>
        <div className="bg-slate-950/50 border border-white/5 px-4 py-2 rounded-xl">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Periodo analizzato</p>
          <p className="text-xs text-slate-300 font-black uppercase">{daysDiff} giorni ({monthsDiff.toFixed(1)} mesi)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        {/* Premio Medio */}
        <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Premio Medio</h4>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Piano</span>
              <span className="text-xs text-slate-400 font-black">{plan.targetPremiumPercent.toFixed(2)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Reale</span>
              <span className="text-2xl text-white font-black">{avgPremiumPercent.toFixed(2)}%</span>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase">Differenza</span>
              <div className={`flex items-center gap-1 text-sm font-black ${premiumDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {premiumDiff >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{Math.abs(premiumDiff).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequenza Trade */}
        <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade / Mese</h4>
            <Activity className="w-4 h-4 text-purple-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Piano</span>
              <span className="text-xs text-slate-400 font-black">{plan.tradesPerMonth}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Reale</span>
              <span className="text-2xl text-white font-black">{actualTradesPerMonth.toFixed(1)}</span>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase">Differenza</span>
              <div className={`flex items-center gap-1 text-sm font-black ${tradesDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tradesDiff >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{Math.abs(tradesDiff).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Mensile */}
        <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ROI Mensile</h4>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Piano</span>
              <span className="text-xs text-slate-400 font-black">{plan.targetMonthlyReturn.toFixed(2)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-black uppercase">Reale</span>
              <span className="text-2xl text-white font-black">{actualMonthlyReturn.toFixed(2)}%</span>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-600 uppercase">Differenza</span>
              <div className={`flex items-center gap-1 text-sm font-black ${returnDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {returnDiff >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{Math.abs(returnDiff).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 relative z-10">
        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Analisi Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${premiumDiff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {premiumDiff >= 0 ? '✅' : '⚠️'}
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Premio medio <strong className="text-white">{premiumDiff >= 0 ? 'superiore' : 'inferiore'}</strong> al piano di{' '}
                <strong className={premiumDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {Math.abs(premiumDiff).toFixed(2)}%
                </strong>
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                {tradesDiff >= -2 ? '✅' : '📉'}
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Frequenza trade: <strong className="text-white">{actualTradesPerMonth.toFixed(1)}</strong> vs piano <strong className="text-white">{plan.tradesPerMonth}</strong>/mese
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${returnDiff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {returnDiff >= 0 ? '🎯' : '⚠️'}
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                ROI mensile {returnDiff >= 0 ? 'raggiunto' : 'sotto piano'}:
                <strong className={returnDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {' '}{actualMonthlyReturn.toFixed(2)}%
                </strong> vs <strong className="text-white">{plan.targetMonthlyReturn}%</strong>
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                📈
              </div>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Win rate: <strong className="text-white">{stats.winRate.toFixed(1)}%</strong> ({stats.winningTrades}W / {stats.losingTrades}L)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
