import { useMemo } from 'react';
import { Target, Calendar, TrendingUp, Trophy } from 'lucide-react';

interface StrategyTargetPlanProps {
  strategy: {
    created_at: string;
    total_capital: number;
    plan_duration_months?: number;
    target_monthly_return?: number;
    plan?: {
      duration_months?: number;
      targetMonthlyReturn?: number;
    };
  };
  currentCapital: number;
  stats?: {
    totalPnL: number;
    currentCapital: number;
  } | null;
}

export function StrategyTargetPlan({ strategy, stats }: StrategyTargetPlanProps) {
  const calculations = useMemo(() => {
    const planMonths = strategy.plan_duration_months || strategy.plan?.duration_months || 12;
    const monthlyReturn = strategy.target_monthly_return || strategy.plan?.targetMonthlyReturn || 5;

    const startDate = new Date(strategy.created_at);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + planMonths);

    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);

    const monthlyRate = monthlyReturn / 100;
    const targetFinalCapital = strategy.total_capital * Math.pow(1 + monthlyRate, planMonths);
    const targetTotalInterest = targetFinalCapital - strategy.total_capital;

    const currentProgress = stats ? (stats.currentCapital / targetFinalCapital) * 100 : 0;

    return {
      planMonths,
      monthlyReturn,
      endDate,
      totalDays,
      elapsedDays,
      remainingDays,
      targetFinalCapital,
      targetTotalInterest,
      currentProgress
    };
  }, [strategy, stats]);

  const {
    planMonths,
    monthlyReturn,
    endDate,
    totalDays,
    elapsedDays,
    remainingDays,
    targetFinalCapital,
    targetTotalInterest,
    currentProgress
  } = calculations;

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
            <Target className="w-8 h-8 text-blue-500" />
            Piano Target
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Obiettivo {planMonths} mesi ({monthlyReturn}% mensile)
          </p>
        </div>
        <div className="bg-slate-950/50 border border-white/5 px-4 py-2 rounded-xl">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Scadenza</p>
          <p className="text-xs text-slate-300 font-black uppercase">{endDate.toLocaleDateString('it-IT')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo Rimasto</h4>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-white">
            {remainingDays} <span className="text-xs text-slate-600 uppercase">Giorni</span>
          </div>
          <div className="text-[8px] font-black text-slate-600 uppercase mt-2 tracking-widest">
            {elapsedDays} trascorsi su {totalDays}
          </div>
        </div>

        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interesse Target</h4>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-white">
            +${targetTotalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[8px] font-black text-slate-600 uppercase mt-2 tracking-widest">
            Basato su {monthlyReturn}% mensile
          </div>
        </div>

        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capitale Finale</h4>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-white">
            ${targetFinalCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[8px] font-black text-slate-600 uppercase mt-2 tracking-widest">
            Obiettivo finale stimato
          </div>
        </div>
      </div>

      {stats && (
        <div className="relative z-10">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">
            <span>Progressione verso obiettivo</span>
            <span className="text-white text-sm">{currentProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${currentProgress >= 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                }`}
              style={{ width: `${Math.min(100, currentProgress)}%` }}
            />
          </div>
          {currentProgress >= 100 && (
            <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-black text-emerald-400 text-center uppercase tracking-widest animate-in fade-in zoom-in-95">
              🎉 Obiettivo raggiunto! Sei sopra il target pianificato!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
