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
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
  const activePlan = useMemo<ActivePlan | null>(() => {
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
  const { prices, currentPrice, loading, error } = useBitcoinHistory(activePlan.startDate);

  // Calculate actual portfolio value based on real BTC prices
  const actualPortfolio = useMemo(() => {
    if (prices.length === 0) return { value: 0, invested: 0, btcAmount: 0 };

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
    const progressPercentage = (daysSinceStart / totalDays) * 100;

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
      daysRemaining: totalDays - daysSinceStart
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
      <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </Card>
    );
  }

  // Don't block rendering on error - we always have fallback data
  const isUsingSimulation = error === 'simulated';

  return (
    <div className="space-y-4">
      {/* Active Plan Header */}
      <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{activePlan.name}</h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Attivo
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                Iniziato il {activePlan.startDate.toLocaleDateString('it-IT')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate('longterm')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            Modifica Piano
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progresso Temporale</span>
            <span className="text-white font-medium">
              {expectedProgress.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${expectedProgress.progressPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{expectedProgress.daysElapsed} giorni trascorsi</span>
            <span>{expectedProgress.daysRemaining} giorni rimanenti</span>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-300 text-sm">Valore Attuale</p>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${actualPortfolio.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-blue-400 text-xs mt-1">
            {actualPortfolio.btcAmount.toFixed(6)} BTC
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-300 text-sm">Profitto Reale</p>
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${actualPortfolio.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-xs mt-1 ${actualPortfolio.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {actualPortfolio.roi >= 0 ? '+' : ''}{actualPortfolio.roi.toFixed(1)}% ROI
          </p>
        </Card>

        <Card className={`p-4 bg-gradient-to-br backdrop-blur-xl border ${
          isAheadOfPlan 
            ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/30' 
            : 'from-amber-500/10 to-orange-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm ${isAheadOfPlan ? 'text-emerald-300' : 'text-amber-300'}`}>
              vs Piano
            </p>
            {isAheadOfPlan ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {variance >= 0 ? '+' : ''}${variance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className={`text-xs mt-1 ${isAheadOfPlan ? 'text-emerald-400' : 'text-amber-400'}`}>
            {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}% differenza
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-xl border border-gray-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-300 text-sm">Investito</p>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${actualPortfolio.invested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Capitale + PAC
          </p>
        </Card>
      </div>

      {/* Performance Status */}
      <Card className={`p-4 bg-gradient-to-br backdrop-blur-xl border ${
        isAheadOfPlan 
          ? 'from-emerald-500/10 to-green-500/10 border-emerald-500/20' 
          : 'from-amber-500/10 to-orange-500/10 border-amber-500/20'
      }`}>
        <div className="flex items-start gap-3">
          {isAheadOfPlan ? (
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${isAheadOfPlan ? 'text-emerald-300' : 'text-amber-300'}`}>
              {isAheadOfPlan ? '🎉 In Anticipo sul Piano!' : '⚠️ Sotto le Aspettative'}
            </h4>
            <p className="text-gray-300 text-sm">
              {isAheadOfPlan ? (
                <>
                  Il tuo portafoglio sta performando meglio delle aspettative! 
                  Sei <strong>${Math.abs(variance).toLocaleString()}</strong> sopra l'obiettivo previsto.
                  Il mercato Bitcoin sta favorendo la tua strategia.
                </>
              ) : (
                <>
                  Il tuo portafoglio è <strong>${Math.abs(variance).toLocaleString()}</strong> sotto l'obiettivo previsto.
                  Questo è normale con la volatilità di Bitcoin. Continua con il PAC per mediare i prezzi.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Chart: Actual vs Expected */}
      <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Performance: Reale vs Previsto
          </h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              BTC @ ${currentPrice.toLocaleString()}
            </Badge>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#6b7280"
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

        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Valore Previsto</p>
            <p className="text-blue-400 font-semibold">
              ${expectedProgress.capital.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Valore Reale</p>
            <p className="text-emerald-400 font-semibold">
              ${actualPortfolio.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-1">Differenza</p>
            <p className={`font-semibold ${isAheadOfPlan ? 'text-emerald-400' : 'text-amber-400'}`}>
              {variance >= 0 ? '+' : ''}${variance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}