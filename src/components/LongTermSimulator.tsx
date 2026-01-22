import { useState, useMemo } from 'react';
// Navigation now uses MainNavigation internally
import { Navigation } from './Navigation';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  PiggyBank,
  Save,
  Sparkles,
  BarChart3,
  Target,
  Zap,
  Loader2
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
import type { View } from '../App';
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { projectId } from '../utils/supabase/info';

interface LongTermSimulatorProps {
  onNavigate: (view: View) => void;
  mascotVisible?: boolean;
  onMascotToggle?: () => void;
}

interface SimulationResult {
  month: number;
  year: number;
  totalCapital: number;
  invested: number;
  profit: number;
  label: string;
}

interface SavedPlan {
  id: string;
  name: string;
  initialCapital: number;
  pacAmount: number;
  pacFrequency: 'weekly' | 'monthly';
  dailyInterest: number;
  years: number;
  finalCapital: number;
  totalProfit: number;
  roi: number;
  createdAt: Date;
}

export function LongTermSimulator({ onNavigate, mascotVisible, onMascotToggle }: LongTermSimulatorProps) {
  // Input states
  const [initialCapital, setInitialCapital] = useState(1000);
  const [pacAmount, setPacAmount] = useState(100);
  const [pacFrequency, setPacFrequency] = useState<'weekly' | 'monthly'>('monthly');
  const [dailyInterest, setDailyInterest] = useState(0.5);
  const [years, setYears] = useState(5);

  // UI states
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('btcwheel_longterm_plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState('');

  // Calculate simulation data
  const simulationData = useMemo(() => {
    const results: SimulationResult[] = [];
    const totalDays = years * 365;
    const dailyRate = dailyInterest / 100;

    let currentCapital = initialCapital;
    let totalInvested = initialCapital;
    let dayCounter = 0;

    // Store data points periodically for chart (every month)
    const dataPointInterval = 30; // Store every 30 days

    for (let day = 0; day <= totalDays; day++) {
      // Add PAC contribution at the right frequency
      if (day > 0) {
        if (pacFrequency === 'weekly' && day % 7 === 0) {
          // Weekly contribution every 7 days
          currentCapital += pacAmount;
          totalInvested += pacAmount;
        } else if (pacFrequency === 'monthly' && day % 30 === 0) {
          // Monthly contribution every 30 days
          currentCapital += pacAmount;
          totalInvested += pacAmount;
        }
      }

      // Apply daily compound interest
      currentCapital = currentCapital * (1 + dailyRate);

      // Store data point every month (30 days) or at the end
      if (day % dataPointInterval === 0 || day === totalDays) {
        const month = Math.floor(day / 30);
        const profit = currentCapital - totalInvested;

        results.push({
          month,
          year: Math.floor(day / 365),
          totalCapital: Math.round(currentCapital * 100) / 100,
          invested: Math.round(totalInvested * 100) / 100,
          profit: Math.round(profit * 100) / 100,
          label: day === 0 ? 'Inizio' : `M${month}`
        });
      }

      dayCounter++;
    }

    return results;
  }, [initialCapital, pacAmount, pacFrequency, dailyInterest, years]);

  // Calculate summary metrics
  const finalResult = simulationData[simulationData.length - 1];
  const totalInvested = finalResult?.invested || 0;
  const finalCapital = finalResult?.totalCapital || 0;
  const totalProfit = finalResult?.profit || 0;
  const roi = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  // Monthly profit estimation
  const monthlyProfit = totalProfit / (years * 12);

  // Save plan function
  const handleSavePlan = () => {
    setShowSaveDialog(true);
  };

  const confirmSavePlan = async () => {
    if (!planName.trim()) {
      toast.error('Inserisci un nome per il piano');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const newPlan: SavedPlan = {
        id: Date.now().toString(),
        name: planName.trim(),
        initialCapital,
        pacAmount,
        pacFrequency,
        dailyInterest,
        years,
        finalCapital,
        totalProfit,
        roi,
        createdAt: new Date()
      };

      const updatedPlans = [...savedPlans, newPlan];
      setSavedPlans(updatedPlans);
      localStorage.setItem('btcwheel_longterm_plans', JSON.stringify(updatedPlans));

      // 📊 Calcola il ritorno mensile corretto dall'interesse GIORNALIERO composto
      // Formula: (1 + dailyRate)^30 - 1
      const totalMonths = years * 12;
      const dailyRate = dailyInterest / 100;
      const monthlyReturnRate = (Math.pow(1 + dailyRate, 30) - 1) * 100; // Interesse mensile equivalente

      const wheelStrategy = {
        id: newPlan.id,
        name: planName.trim(),
        ticker: 'BTC',
        total_capital: initialCapital,
        // Store plan data in JSON format (matching database schema)
        plan: {
          duration_months: totalMonths,
          target_monthly_return: parseFloat(monthlyReturnRate.toFixed(2)),
        },
        // Legacy fields for backward compatibility
        plan_duration_months: totalMonths,
        target_monthly_return: parseFloat(monthlyReturnRate.toFixed(2)),
        created_at: new Date().toISOString(),
      };

      // 🎯 SALVA IN LOCALSTORAGE (sempre)
      const existingStrategies = JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]');
      existingStrategies.push(wheelStrategy);
      localStorage.setItem('btcwheel_strategies', JSON.stringify(existingStrategies));

      // ☁️ SALVA ANCHE NEL DATABASE CLOUD (se loggato)
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.access_token) {
            console.log('☁️ [LongTermSimulator] User logged in - saving strategy to cloud...');

            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/wheel/strategies`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  name: wheelStrategy.name,
                  ticker: wheelStrategy.ticker,
                  totalCapital: wheelStrategy.total_capital,
                  planDurationMonths: wheelStrategy.plan_duration_months,
                  targetMonthlyReturn: wheelStrategy.target_monthly_return,
                }),
              }
            );

            if (!response.ok) {
              console.error('❌ [LongTermSimulator] Failed to save to cloud:', await response.text());
              toast.warning('Piano salvato localmente', {
                description: 'Impossibile sincronizzare con il cloud, ma è salvato sul tuo dispositivo',
              });
            } else {
              console.log('✅ [LongTermSimulator] Strategy saved to cloud successfully!');
              toast.success('Piano salvato con successo!', {
                description: `${planName.trim()} sincronizzato con il cloud e disponibile nella dashboard`,
              });
            }
          } else {
            console.log('⚠️ [LongTermSimulator] No session - saving locally only');
            toast.success('Piano salvato con successo!', {
              description: `${planName.trim()} aggiunto ai tuoi piani locali`,
            });
          }
        } else {
          console.log('📦 [LongTermSimulator] Supabase not configured - local mode only');
          toast.success('Piano salvato con successo!', {
            description: `${planName.trim()} aggiunto ai tuoi piani`,
          });
        }
      } catch (error) {
        console.error('❌ [LongTermSimulator] Error saving to cloud:', error);
        toast.warning('Piano salvato localmente', {
          description: 'Errore nella sincronizzazione cloud, ma il piano è salvato sul dispositivo',
        });
      }

      // Reset dialog
      setShowSaveDialog(false);
      setPlanName('');

      // 🔔 Notify other components that strategies have been updated
      window.dispatchEvent(new CustomEvent('btcwheel-strategies-updated'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetAsActive = () => {
    const activePlan = {
      id: Date.now().toString(),
      name: `Piano di Accumulo BTC`,
      initialCapital,
      pacAmount,
      pacFrequency,
      dailyInterest,
      years,
      startDate: new Date(), // Use current date when creating new plan
      targetCapital: finalCapital
    };

    localStorage.setItem('btcwheel_active_plan', JSON.stringify(activePlan));

    // 🎯 SALVA ANCHE COME STRATEGIA WHEEL per la Dashboard
    const existingStrategies = JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]');

    // 📊 Calcola il ritorno mensile corretto dall'interesse GIORNALIERO composto
    // Formula: (1 + dailyRate)^30 - 1
    const totalMonths = years * 12;
    const dailyRate = dailyInterest / 100;
    const monthlyReturnRate = (Math.pow(1 + dailyRate, 30) - 1) * 100; // Interesse mensile equivalente

    const wheelStrategy = {
      id: activePlan.id,
      name: activePlan.name,
      ticker: 'BTC',
      total_capital: initialCapital,
      // Store plan data in JSON format (matching database schema)
      plan: {
        duration_months: totalMonths,
        target_monthly_return: parseFloat(monthlyReturnRate.toFixed(2)),
      },
      // Legacy fields for backward compatibility
      plan_duration_months: totalMonths,
      target_monthly_return: parseFloat(monthlyReturnRate.toFixed(2)),
      created_at: new Date().toISOString(),
    };

    // Check if already exists, otherwise add
    const existingIndex = existingStrategies.findIndex((s: any) => s.name === activePlan.name);
    if (existingIndex >= 0) {
      existingStrategies[existingIndex] = wheelStrategy;
    } else {
      existingStrategies.push(wheelStrategy);
    }
    localStorage.setItem('btcwheel_strategies', JSON.stringify(existingStrategies));

    toast.success('Piano impostato come attivo!', {
      description: 'Visibile nella Dashboard con tracking in tempo reale',
    });
  };

  const handleDeletePlan = (id: string) => {
    const updatedPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updatedPlans);
    localStorage.setItem('btcwheel_longterm_plans', JSON.stringify(updatedPlans));

    // 🎯 ELIMINA ANCHE DALLA STRATEGIA WHEEL
    const existingStrategies = JSON.parse(localStorage.getItem('btcwheel_strategies') || '[]');
    const filteredStrategies = existingStrategies.filter((s: any) => s.id !== id);
    localStorage.setItem('btcwheel_strategies', JSON.stringify(filteredStrategies));

    toast.success('Piano eliminato');
  };

  const handleLoadPlan = (plan: SavedPlan) => {
    setInitialCapital(plan.initialCapital);
    setPacAmount(plan.pacAmount);
    setPacFrequency(plan.pacFrequency);
    setDailyInterest(plan.dailyInterest);
    setYears(plan.years);
    toast.success('Piano caricato!');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#030305] text-white relative">

      {/* Background effects */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Navigation
        currentView="simulation"
        onNavigate={onNavigate}
        mascotVisible={mascotVisible}
        onMascotToggle={onMascotToggle}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-8 md:px-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-8 h-8 text-white drop-shadow-sm" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Simulatore Lungo Termine
              </h1>
              <motion.div
                animate={{
                  rotate: [0, 14, -14, 14, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </motion.div>
            </div>
            <p className="text-gray-400 mt-1">
              Pianifica la tua strategia di investimento con interesse composto <Badge className="ml-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Giornaliero</Badge>
            </p>
          </div>
        </div>
      </motion.header>

      <main className="relative max-w-7xl mx-auto px-4 py-6 md:px-6 space-y-6">

        {/* Input Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
            <h2 className="text-xl text-white mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              Parametri di Simulazione
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Initial Capital */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-3">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Capitale Iniziale: <span className="font-bold text-white">${initialCapital}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-emerald"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* PAC Amount */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-3">
                  <PiggyBank className="w-5 h-5 text-purple-400" />
                  PAC {pacFrequency === 'monthly' ? 'Mensile' : 'Settimanale'}:
                  <span className="font-bold text-white">${pacAmount}</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={pacAmount}
                  onChange={(e) => setPacAmount(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$20</span>
                  <span>$1,000</span>
                </div>
              </div>

              {/* PAC Frequency */}
              <div>
                <label className="text-gray-300 mb-3 block">
                  Frequenza PAC
                </label>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setPacFrequency('weekly')}
                    className={`flex-1 ${pacFrequency === 'weekly'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                  >
                    Settimanale
                  </Button>
                  <Button
                    onClick={() => setPacFrequency('monthly')}
                    className={`flex-1 ${pacFrequency === 'monthly'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                  >
                    Mensile
                  </Button>
                </div>
              </div>

              {/* Daily Interest */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-3">
                  <Percent className="w-5 h-5 text-amber-400" />
                  Interesse Giornaliero: <span className="font-bold text-white">{dailyInterest.toFixed(2)}%</span>
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="3"
                  step="0.01"
                  value={dailyInterest}
                  onChange={(e) => setDailyInterest(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-amber"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.01%</span>
                  <span>3%</span>
                </div>
              </div>

              {/* Time Period */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-gray-300 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Periodo di Investimento: <span className="font-bold text-white">{years} {years === 1 ? 'anno' : 'anni'}</span>
                  <span className="text-gray-500">({years * 12} mesi)</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-blue"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6 mesi</span>
                  <span>15 anni</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-3">⚡ Preset Rapidi:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setInitialCapital(1000);
                    setPacAmount(100);
                    setPacFrequency('monthly');
                    setDailyInterest(0.5);
                    setYears(5);
                  }}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300"
                >
                  Conservativo 5Y
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setInitialCapital(2000);
                    setPacAmount(200);
                    setPacFrequency('monthly');
                    setDailyInterest(1);
                    setYears(10);
                  }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300"
                >
                  Moderato 10Y
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setInitialCapital(5000);
                    setPacAmount(500);
                    setPacFrequency('monthly');
                    setDailyInterest(1.5);
                    setYears(15);
                  }}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300"
                >
                  Aggressivo 15Y
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-emerald-300 text-sm">Capitale Finale</p>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">${finalCapital.toLocaleString()}</p>
            <p className="text-emerald-400 text-xs mt-1">Dopo {years} anni</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-300 text-sm">Profitto Totale</p>
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">${totalProfit.toLocaleString()}</p>
            <p className="text-purple-400 text-xs mt-1">+{roi.toFixed(1)}% ROI</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-300 text-sm">Investito</p>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">${totalInvested.toLocaleString()}</p>
            <p className="text-blue-400 text-xs mt-1">Capitale + PAC</p>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-300 text-sm">Profitto Mensile</p>
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">${monthlyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-amber-400 text-xs mt-1">Media stimata</p>
          </Card>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                Crescita del Capitale
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleSetAsActive}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Imposta come Attivo
                </Button>
                <Button
                  onClick={handleSavePlan}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salva Piano
                </Button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={simulationData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="label"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
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
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInvested)"
                  name="Capitale Investito"
                />
                <Area
                  type="monotone"
                  dataKey="totalCapital"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Capitale Totale"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Saved Plans */}
        {savedPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-white/10">
              <h3 className="text-xl text-white mb-4 flex items-center gap-2">
                <Save className="w-6 h-6 text-blue-400" />
                Piani Salvati ({savedPlans.length})
              </h3>

              <div className="space-y-3">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{plan.name}</h4>
                        <p className="text-gray-400 text-sm">
                          Creato: {new Date(plan.createdAt).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadPlan(plan)}
                          className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300"
                        >
                          Carica
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300"
                        >
                          Elimina
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Capitale Iniziale</p>
                        <p className="text-white font-medium">${plan.initialCapital}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">PAC {plan.pacFrequency === 'monthly' ? 'Mensile' : 'Settimanale'}</p>
                        <p className="text-white font-medium">${plan.pacAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Interesse/Giorno</p>
                        <p className="text-white font-medium">{plan.dailyInterest}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Durata</p>
                        <p className="text-white font-medium">{plan.years} anni</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Capitale Finale</p>
                        <p className="text-emerald-400 font-bold">${plan.finalCapital.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Profitto</p>
                        <p className="text-purple-400 font-bold">${plan.totalProfit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ROI</p>
                        <p className="text-amber-400 font-bold">+{plan.roi.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">💡 Come Funziona il Simulatore</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>Interesse Composto:</strong> Gli interessi vengono reinvestiti automaticamente ogni giorno</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>PAC (Piano di Accumulo):</strong> Aggiungi capitale regolarmente per massimizzare i rendimenti</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>Interesse Giornaliero:</strong> Basato sui rendimenti della Wheel Strategy (0.5-1% realistico)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span><strong>Salva i Piani:</strong> Crea e confronta diverse strategie di investimento a lungo termine</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Save Plan Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Save className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-white">Salva Piano</h3>
                <p className="text-sm text-gray-400">Dai un nome al tuo piano di investimento</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-gray-300 text-sm mb-2 block">
                Nome del Piano
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="es. Piano Accumulo Conservativo"
                className="w-full px-4 py-3 bg-gray-700/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmSavePlan();
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                    setPlanName('');
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Suggerimenti: "Piano 5 anni BTC", "Accumulo Mensile 2026", "Strategia Conservativa"
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSaveDialog(false);
                  setPlanName('');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
              >
                Annulla
              </Button>
              <Button
                onClick={confirmSavePlan}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .slider-emerald::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #10b981, #14b8a6);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        
        .slider-amber::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
        
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}