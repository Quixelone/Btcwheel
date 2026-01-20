import { useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useBitcoinHistory } from '../hooks/useBitcoinHistory';
import type { View } from '../App';

interface ActivePlan {
  id: string;
  name: string;
  initialCapital: number;
  pacAmount: number;
  pacFrequency: 'weekly' | 'monthly';
  dailyInterest: number;
  years: number;
  startDate: Date;
  targetCapital: number;
}

interface ActivePlanProgressProps {
  onNavigate: (view: View) => void;
}

export function ActivePlanProgress({ onNavigate }: ActivePlanProgressProps) {
  // Get active plan from localStorage
  const activePlan = useMemo<ActivePlan>(() => {
    const stored = localStorage.getItem('btcwheel_active_plan');
    if (stored) {
      const plan = JSON.parse(stored);
      return {
        ...plan,
        startDate: new Date(plan.startDate)
      };
    }

    // Default plan if none exists
    return {
      id: 'default',
      name: 'Piano di Accumulo BTC',
      initialCapital: 1000,
      pacAmount: 200,
      pacFrequency: 'monthly',
      dailyInterest: 0.5,
      years: 5,
      startDate: new Date('2024-08-10'),
      targetCapital: 150000
    };
  }, []);

  // Fetch Bitcoin historical data
  const { prices, currentPrice, loading } = useBitcoinHistory(activePlan.startDate);

  // Calculate actual portfolio value based on real BTC prices
  const actualPortfolio = useMemo(() => {
    if (prices.length === 0) return { value: 0, invested: 0, btcAmount: 0, profit: 0, roi: 0 };

    const daysSinceStart = Math.floor(
      (Date.now() - activePlan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalBTC = 0;
    let totalInvested = activePlan.initialCapital;

    // Initial investment
    const startPrice = prices[0]?.price || 60000;
    totalBTC = activePlan.initialCapital / startPrice;

    // Add PAC contributions
    for (let day = 1; day <= daysSinceStart; day++) {
      const shouldAddPAC =
        (activePlan.pacFrequency === 'weekly' && day % 7 === 0) ||
        (activePlan.pacFrequency === 'monthly' && day % 30 === 0);

      if (shouldAddPAC && day < prices.length) {
        const priceOnDay = prices[day]?.price || currentPrice;
        totalBTC += activePlan.pacAmount / priceOnDay;
        totalInvested += activePlan.pacAmount;
      }
    }

    const currentValue = totalBTC * currentPrice;

    return {
      value: currentValue,
      invested: totalInvested,
      btcAmount: totalBTC,
      profit: currentValue - totalInvested,
      roi: ((currentValue - totalInvested) / totalInvested) * 100
    };
  }, [prices, currentPrice, activePlan]);

  // Calculate expected progress based on plan
  const expectedProgress = useMemo(() => {
    const daysSinceStart = Math.floor(
      (Date.now() - activePlan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalDays = activePlan.years * 365;
    const progressPercentage = Math.min(100, (daysSinceStart / totalDays) * 100);

    const dailyRate = activePlan.dailyInterest / 100;
    let expectedCapital = activePlan.initialCapital;
    let totalInvested = activePlan.initialCapital;

    for (let day = 1; day <= daysSinceStart; day++) {
      // Add PAC
      if (
        (activePlan.pacFrequency === 'weekly' && day % 7 === 0) ||
        (activePlan.pacFrequency === 'monthly' && day % 30 === 0)
      ) {
        expectedCapital += activePlan.pacAmount;
        totalInvested += activePlan.pacAmount;
      }

      // Apply daily compound interest
      expectedCapital *= (1 + dailyRate);
    }

    return {
      capital: expectedCapital,
      invested: totalInvested,
      progressPercentage,
      daysElapsed: daysSinceStart,
      daysRemaining: Math.max(0, totalDays - daysSinceStart)
    };
  }, [activePlan]);

  // Chart data combining actual vs expected
  const chartData = useMemo(() => {
    if (prices.length === 0) return [];

    const data = [];
    const daysSinceStart = Math.floor(
      (Date.now() - activePlan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let expectedCapital = activePlan.initialCapital;
    let totalBTC = activePlan.initialCapital / (prices[0]?.price || 60000);
    let totalInvested = activePlan.initialCapital;
    const dailyRate = activePlan.dailyInterest / 100;

    // Sample every week for performance
    const sampleInterval = 7;

    for (let day = 0; day <= daysSinceStart; day += sampleInterval) {
      if (day >= prices.length) break;

      // Calculate expected value with compound interest
      for (let d = Math.max(0, day - sampleInterval); d < day; d++) {
        if (
          (activePlan.pacFrequency === 'weekly' && d % 7 === 0) ||
          (activePlan.pacFrequency === 'monthly' && d % 30 === 0)
        ) {
          expectedCapital += activePlan.pacAmount;
          totalInvested += activePlan.pacAmount;

          if (d < prices.length) {
            totalBTC += activePlan.pacAmount / (prices[d]?.price || currentPrice);
          }
        }
        expectedCapital *= (1 + dailyRate);
      }

      const actualValue = totalBTC * (prices[day]?.price || currentPrice);
      const date = prices[day]?.date;

      data.push({
        date: date?.toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }),
        actual: Math.round(actualValue),
        expected: Math.round(expectedCapital),
        invested: Math.round(totalInvested)
      });
    }

    return data;
  }, [prices, currentPrice, activePlan]);

  const isAheadOfPlan = actualPortfolio.value > expectedProgress.capital;
  const variance = actualPortfolio.value - expectedProgress.capital;
  const variancePercentage = (variance / expectedProgress.capital) * 100;

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Plan Header */}
      <Card className="p-8 bg-slate-900/50 border border-emerald-500/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{activePlan.name}</h3>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] uppercase px-2">
                  Attivo
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Iniziato il {activePlan.startDate.toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate('longterm')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl"
          >
            Modifica Piano
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-500">Progresso Temporale</span>
            <span className="text-emerald-400">
              {expectedProgress.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${expectedProgress.progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <span>{expectedProgress.daysElapsed} giorni trascorsi</span>
            <span>{expectedProgress.daysRemaining} giorni rimanenti</span>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Valore Attuale</p>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-white">
            ${actualPortfolio.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-slate-500 text-[10px] font-black uppercase mt-2">
            {actualPortfolio.btcAmount.toFixed(6)} BTC
          </p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Profitto Reale</p>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-white">
            ${actualPortfolio.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-[10px] font-black uppercase mt-2 ${actualPortfolio.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {actualPortfolio.roi >= 0 ? '+' : ''}{actualPortfolio.roi.toFixed(1)}% ROI
          </p>
        </Card>

        <Card className={`p-6 bg-slate-900/50 border rounded-3xl ${isAheadOfPlan ? 'border-emerald-500/20' : 'border-orange-500/20'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isAheadOfPlan ? 'text-emerald-400' : 'text-orange-400'}`}>
              vs Piano
            </p>
            {isAheadOfPlan ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-500" />
            )}
          </div>
          <p className="text-3xl font-black text-white">
            {variance >= 0 ? '+' : ''}${variance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-[10px] font-black uppercase mt-2 ${isAheadOfPlan ? 'text-emerald-400' : 'text-orange-400'}`}>
            {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}% diff
          </p>
        </Card>

        <Card className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Investito</p>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-3xl font-black text-white">
            ${actualPortfolio.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-slate-500 text-[10px] font-black uppercase mt-2">
            Capitale + PAC
          </p>
        </Card>
      </div>

      {/* Performance Status */}
      <Card className={`p-6 border rounded-3xl ${isAheadOfPlan
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-orange-500/5 border-orange-500/20'
        }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${isAheadOfPlan ? 'bg-emerald-500/10' : 'bg-orange-500/10'}`}>
            {isAheadOfPlan ? (
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-400" />
            )}
          </div>
          <div className="flex-1">
            <h4 className={`text-lg font-black uppercase tracking-tight mb-1 ${isAheadOfPlan ? 'text-emerald-400' : 'text-orange-400'}`}>
              {isAheadOfPlan ? '🎉 In Anticipo sul Piano!' : '⚠️ Sotto le Aspettative'}
            </h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {isAheadOfPlan ? (
                <>
                  Il tuo portafoglio sta performando meglio delle aspettative!
                  Sei <strong className="text-white">${Math.abs(variance).toLocaleString()}</strong> sopra l'obiettivo previsto.
                  Il mercato Bitcoin sta favorendo la tua strategia.
                </>
              ) : (
                <>
                  Il tuo portafoglio è <strong className="text-white">${Math.abs(variance).toLocaleString()}</strong> sotto l'obiettivo previsto.
                  Questo è normale con la volatilità di Bitcoin. Continua con il PAC per mediare i prezzi.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Chart: Actual vs Expected */}
      <Card className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              Performance: Reale vs Previsto
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Confronto tra crescita pianificata e andamento reale di BTC</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] uppercase px-3 py-1">
              BTC @ ${currentPrice.toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#475569"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#475569"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #ffffff10',
                  borderRadius: '16px',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="5 5"
                fillOpacity={0}
                name="Capitale Investito"
              />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpected)"
                name="Valore Previsto"
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
                name="Valore Reale (BTC)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
          <div className="text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Valore Previsto</p>
            <p className="text-xl font-black text-slate-300">
              ${expectedProgress.capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Valore Reale</p>
            <p className="text-xl font-black text-emerald-400">
              ${actualPortfolio.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Differenza</p>
            <p className={`text-xl font-black ${isAheadOfPlan ? 'text-emerald-400' : 'text-orange-400'}`}>
              {variance >= 0 ? '+' : ''}${variance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}