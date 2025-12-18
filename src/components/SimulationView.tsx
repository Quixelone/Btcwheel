import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useUserProgress } from '../hooks/useUserProgress';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Lock, CheckCircle2, HelpCircle, Wallet, Calendar, Percent, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { SimulationTutorial } from './SimulationTutorial';
import type { View } from '../App';

interface SimulationViewProps {
  onNavigate: (view: View) => void;
}

interface Position {
  id: string;
  type: 'put' | 'call';
  strike: number;
  premium: number;
  quantity: number;
  openDate: Date;
  status: 'open' | 'closed';
  assignmentPrice?: number;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  objectives: {
    type: 'sell_option' | 'collect_premium' | 'close_position' | 'handle_assignment' | 'complete_wheel';
    target: number;
    current: number;
    description: string;
  }[];
  reward: {
    xp: number;
    badgeId?: string;
  };
  tutorial: {
    step: number;
    title: string;
    content: string;
    mascotEmotion?: 'excited' | 'normal' | 'teaching' | 'explaining' | 'celebrating' | 'happy';
  }[];
  status: 'locked' | 'active' | 'completed';
  unlockRequirement?: string;
}

const MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    title: 'Il Tuo Primo Premium',
    description: 'Impara a vendere la tua prima opzione put e raccogliere premium',
    difficulty: 'easy',
    objectives: [
      {
        type: 'sell_option',
        target: 1,
        current: 0,
        description: 'Vendi 1 opzione put'
      }
    ],
    reward: { xp: 200, badgeId: 'first-premium' },
    tutorial: [
      {
        step: 1,
        title: 'Cos\'è una Put?',
        content: 'Vendere una put significa che accetti di comprare Bitcoin a un prezzo fisso (strike) se il prezzo scende. In cambio, ricevi subito un pagamento (premium).',
        mascotEmotion: 'teaching'
      },
      {
        step: 2,
        title: 'Scegli lo Strike',
        content: 'Seleziona uno strike price SOTTO il prezzo corrente di Bitcoin. Consiglio: inizia con 5-10% sotto il prezzo attuale per maggiore sicurezza.',
        mascotEmotion: 'explaining'
      },
      {
        step: 3,
        title: 'Raccogli il Premium',
        content: 'Il premium è il tuo guadagno immediato! Più basso è lo strike, più basso è il premium ma più sicura è la posizione.',
        mascotEmotion: 'excited'
      }
    ],
    status: 'active',
  },
  {
    id: 'mission-2',
    title: 'Collezionista di Premium',
    description: 'Raccogli $1,000 totali in premium vendendo multiple opzioni',
    difficulty: 'medium',
    objectives: [
      {
        type: 'collect_premium',
        target: 1000,
        current: 0,
        description: 'Raccogli $1,000 in premium totale'
      }
    ],
    reward: { xp: 350, badgeId: 'premium-collector' },
    tutorial: [
      {
        step: 1,
        title: 'Diversifica le Posizioni',
        content: 'Invece di vendere tutto in una volta, distribuisci le tue put in diversi strike price per gestire meglio il rischio.',
        mascotEmotion: 'teaching'
      },
      {
        step: 2,
        title: 'Timing del Mercato',
        content: 'Il premium è più alto quando il mercato è volatile. Osserva il grafico e vendi quando vedi movimenti ampi.',
        mascotEmotion: 'normal'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa "Il Tuo Primo Premium"',
  },
  {
    id: 'mission-3',
    title: 'Gestisci l\'Assegnazione',
    description: 'Impara cosa succede quando la put va in-the-money e vieni assegnato',
    difficulty: 'medium',
    objectives: [
      {
        type: 'handle_assignment',
        target: 1,
        current: 0,
        description: 'Ricevi 1 assegnazione e gestiscila'
      }
    ],
    reward: { xp: 400, badgeId: 'assignment-master' },
    tutorial: [
      {
        step: 1,
        title: 'Cosa è l\'Assegnazione?',
        content: 'Se Bitcoin scende sotto il tuo strike, devi comprare BTC al prezzo dello strike. Non è una perdita - hai già guadagnato il premium!',
        mascotEmotion: 'explaining'
      },
      {
        step: 2,
        title: 'Prezzo di Carico',
        content: 'Il tuo prezzo effettivo è: Strike - Premium ricevuto. Esempio: Strike $40k, Premium $500 = Prezzo reale $39,500.',
        mascotEmotion: 'teaching'
      },
      {
        step: 3,
        title: 'Prossimo Step',
        content: 'Ora che possiedi BTC, puoi vendere covered calls per generare più reddito. Questo è il cuore della Wheel Strategy!',
        mascotEmotion: 'excited'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa "Collezionista di Premium"',
  },
  {
    id: 'mission-4',
    title: 'Il Primo Covered Call',
    description: 'Vendi una call coperta sul tuo Bitcoin assegnato',
    difficulty: 'hard',
    objectives: [
      {
        type: 'sell_option',
        target: 1,
        current: 0,
        description: 'Vendi 1 covered call'
      }
    ],
    reward: { xp: 500, badgeId: 'covered-call-pro' },
    tutorial: [
      {
        step: 1,
        title: 'Covered Call',
        content: 'Vendere una call significa che accetti di vendere il tuo BTC a un prezzo più alto (strike) se il prezzo sale. Ricevi premium anche qui!',
        mascotEmotion: 'teaching'
      },
      {
        step: 2,
        title: 'Strike Sopra il Prezzo',
        content: 'Scegli uno strike SOPRA il prezzo corrente. Se BTC sale sopra, vendi con profitto. Se no, tieni il premium e il BTC.',
        mascotEmotion: 'explaining'
      },
      {
        step: 3,
        title: 'Doppio Guadagno',
        content: 'Hai già guadagnato dalla put, ora guadagni anche dalla call. È così che la Wheel genera rendimento costante!',
        mascotEmotion: 'celebrating'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa "Gestisci l\'Assegnazione"',
  },
  {
    id: 'mission-5',
    title: 'Wheel Strategy Master',
    description: 'Completa un ciclo completo: Put → Assegnazione → Call → Profitto',
    difficulty: 'expert',
    objectives: [
      {
        type: 'complete_wheel',
        target: 1,
        current: 0,
        description: 'Completa 1 ciclo completo della Wheel'
      }
    ],
    reward: { xp: 1000, badgeId: 'wheel-master' },
    tutorial: [
      {
        step: 1,
        title: 'Il Ciclo Completo',
        content: 'Vendi put → Vieni assegnato → Vendi call → Bitcoin chiamato via → Ricomincia. Questo è come i professionisti generano reddito passivo.',
        mascotEmotion: 'normal'
      },
      {
        step: 2,
        title: 'Optimization',
        content: 'Ogni ciclo genera profitto. Più cicli completi, più guadagni. L\'obiettivo è ripetere questo processo indefinitamente.',
        mascotEmotion: 'explaining'
      },
      {
        step: 3,
        title: 'Congratulazioni!',
        content: 'Hai padroneggiato la Wheel Strategy! Ora sei pronto per applicarla nel mondo reale con capitale vero.',
        mascotEmotion: 'celebrating'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa "Il Primo Covered Call"',
  }
];

export function SimulationView({ onNavigate }: SimulationViewProps) {
  const { user } = useAuth();
  const { addXP } = useUserProgress();
  const { gamification, journalStats } = useDashboardData();
  const [btcPrice, setBtcPrice] = useState(96000); // 🎯 Prezzo reale dicembre 2024
  const [cashBalance, setCashBalance] = useState(10000); // 🎯 Renamed from portfolioValue to track actual cash
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string; price: number }>>([]);
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [activeMission, setActiveMission] = useState<Mission | null>(MISSIONS[0]);
  const [showMainTutorial, setShowMainTutorial] = useState(false);
  const [btcOwned, setBtcOwned] = useState(0);

  // 🎯 GENERATE MOCK HISTORICAL DATA (2 Months)
  useEffect(() => {
    // 1. Generate Price History (Last 60 days)
    const history = [];
    let currentPrice = 82000;
    const volatility = 0.02; 
    const trend = 0.002; 
    const now = new Date();

    for (let i = 60; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.45) * volatility; 
      currentPrice = currentPrice * (1 + change + trend);
      
      history.push({
        time: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        price: Math.round(currentPrice)
      });
    }
    
    setPriceHistory(history);
    setBtcPrice(Math.round(currentPrice));

    // 2. Generate Historical Trades
    const mockPositions: Position[] = [
      {
        id: 'pos-1',
        type: 'put',
        strike: 78000,
        premium: 450,
        quantity: 1,
        openDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), 
        status: 'closed',
        assignmentPrice: undefined // Expired
      },
      {
        id: 'pos-2',
        type: 'put',
        strike: 84000,
        premium: 600,
        quantity: 1,
        openDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), 
        status: 'closed',
        assignmentPrice: 84000 // Assigned
      },
      {
        id: 'pos-3',
        type: 'call',
        strike: 98000,
        premium: 300,
        quantity: 1,
        openDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), 
        status: 'open'
      },
      {
        id: 'pos-4',
        type: 'put',
        strike: 92000,
        premium: 550,
        quantity: 1,
        openDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), 
        status: 'open'
      }
    ];

    setPositions(mockPositions);
    setBtcOwned(1); // Result of pos-2 assignment
    setCashBalance(15000); // Simulate some cash
  }, []);

  // 🎯 FORCE TUTORIAL OFF - Temporary fix for HMR state preservation
  useEffect(() => {
    setShowMainTutorial(false);
  }, []);
  
  // Calculate Total Equity (Cash + BTC Value)
  const totalEquity = cashBalance + (btcOwned * btcPrice);
  const portfolioPnL = totalEquity - 10000;

  // 🎯 Strategy & Break-even Calculations
  const strategy = {
    initialCapital: 10000,
    recurringDeposit: 500,
    dailyTarget: 0.15,
    duration: 12 // months
  };

  const totalPremiums = positions.reduce((acc, p) => acc + (p.premium * p.quantity), 0);
  
  // Calculate Average Entry Price (Cost Basis) for owned BTC
  // Logic: Sum of strikes for assigned puts (where we bought BTC) divided by total assigned BTC
  // Then subtract total premiums collected per BTC to get Break-even
  const assignedPuts = positions.filter(p => p.type === 'put' && p.status === 'closed' && p.assignmentPrice !== undefined);
  const totalAssignedBTC = assignedPuts.reduce((acc, p) => acc + p.quantity, 0);
  const totalAssignmentCost = assignedPuts.reduce((acc, p) => acc + (p.strike * p.quantity), 0);
  
  const averageEntryPrice = totalAssignedBTC > 0 ? totalAssignmentCost / totalAssignedBTC : 0;
  const breakEvenPrice = btcOwned > 0 ? averageEntryPrice - (totalPremiums / btcOwned) : 0;

  // Sync missions with Supabase data
  useEffect(() => {
    if (gamification || journalStats) {
      setMissions(prevMissions => prevMissions.map(mission => {
        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.type === 'sell_option' && journalStats.totalTrades) {
            return { ...obj, current: Math.max(obj.current, journalStats.totalTrades) };
          }
          if (obj.type === 'collect_premium' && gamification?.trading_volume) {
            return { ...obj, current: Math.max(obj.current, gamification.trading_volume) };
          }
          return obj;
        });

        // Check completion
        const allCompleted = updatedObjectives.every(obj => obj.current >= obj.target);
        const status = allCompleted ? 'completed' : mission.status;

        return { ...mission, objectives: updatedObjectives, status };
      }));
    }
  }, [gamification, journalStats]);

  // Form states
  const [optionType, setOptionType] = useState<'put' | 'call'>('put');
  const [strikePrice, setStrikePrice] = useState('90000');
  const [premium, setPremium] = useState('800');
  const [quantity, setQuantity] = useState('1');

  // 🎯 Calcolo automatico strike e premium intelligenti
  useEffect(() => {
    if (optionType === 'put') {
      // Suggerisci strike 5-7% sotto prezzo corrente
      const suggestedStrike = Math.round(btcPrice * 0.93);
      setStrikePrice(suggestedStrike.toString());
      
      // Calcola premium realistico: ~1-2% del valore strike
      const distancePercentage = ((btcPrice - suggestedStrike) / btcPrice) * 100;
      const premiumPercentage = 0.008 + (distancePercentage * 0.001); // 0.8% base + proporzionale
      const suggestedPremium = Math.round(suggestedStrike * premiumPercentage);
      setPremium(suggestedPremium.toString());
    } else if (optionType === 'call') {
      // Suggerisci strike 5-7% sopra prezzo corrente
      const suggestedStrike = Math.round(btcPrice * 1.07);
      setStrikePrice(suggestedStrike.toString());
      
      // Premium per call leggermente più basso
      const distancePercentage = ((suggestedStrike - btcPrice) / btcPrice) * 100;
      const premiumPercentage = 0.006 + (distancePercentage * 0.0008);
      const suggestedPremium = Math.round(suggestedStrike * premiumPercentage);
      setPremium(suggestedPremium.toString());
    }
  }, [optionType, btcPrice]);

  // Simulate BTC price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => {
        const change = (Math.random() - 0.5) * 2000; // Volatilità maggiore
        const newPrice = Math.max(85000, Math.min(105000, prev + change)); // Range $85k-$105k
        return Math.round(newPrice);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update price history
  useEffect(() => {
    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setPriceHistory(prev => {
      const newHistory = [...prev, { time: timeString, price: btcPrice }];
      return newHistory.slice(-100); // Keep 100 points
    });
  }, [btcPrice]);

  // Check for assignments when price changes
  useEffect(() => {
    positions.forEach(position => {
      if (position.status === 'open' && !position.assignmentPrice) {
        // Handle Put Assignment (Buy BTC)
        if (position.type === 'put' && btcPrice < position.strike) {
          handleAssignment(position.id);
        }
        // Handle Call Assignment (Sell BTC)
        else if (position.type === 'call' && btcPrice > position.strike) {
          handleCallAssignment(position.id);
        }
      }
    });
  }, [btcPrice, positions]);

  const handleAssignment = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const btcQuantity = position.quantity;
    const cost = position.strike * btcQuantity;

    setBtcOwned(prev => prev + btcQuantity);
    setCashBalance(prev => prev - cost); // Pay for BTC
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'closed' as const, assignmentPrice: btcPrice } : p
    ));

    // Update mission progress
    updateMissionProgress('handle_assignment', 1);

    toast.success('⚡ Assegnazione Put (Acquisto)!', {
      description: `Hai acquistato ${btcQuantity} BTC a $${position.strike}. Cash utilizzato: $${cost.toLocaleString()}`
    });

    addXP(300);
  };

  const handleCallAssignment = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const btcQuantity = position.quantity;
    const revenue = position.strike * btcQuantity;

    setBtcOwned(prev => prev - btcQuantity);
    setCashBalance(prev => prev + revenue); // Receive cash from sale
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'closed' as const, assignmentPrice: btcPrice } : p
    ));

    // Update mission progress
    updateMissionProgress('complete_wheel', 1);

    toast.success('⚡ Assegnazione Call (Vendita)!', {
      description: `Hai venduto ${btcQuantity} BTC a $${position.strike}. Incasso: $${revenue.toLocaleString()}`
    });

    addXP(500);
  };

  const handleSellOption = async () => {
    const strike = parseFloat(strikePrice);
    const prem = parseFloat(premium);
    const qty = parseInt(quantity);

    if (isNaN(strike) || isNaN(prem) || isNaN(qty) || qty <= 0) {
      toast.error('Inserisci valori validi');
      return;
    }

    // Validation for mission 1
    if (activeMission?.id === 'mission-1' && optionType === 'call') {
      toast.error('Per questa missione devi vendere una PUT!');
      return;
    }

    // Validation for covered calls
    if (optionType === 'call' && btcOwned < qty) {
      toast.error(`Non hai abbastanza BTC! (Possiedi: ${btcOwned}, Richiesto: ${qty})`);
      return;
    }

    // Validation for cash-secured puts (optional warning)
    if (optionType === 'put') {
      const requiredCollateral = strike * qty;
      if (cashBalance < requiredCollateral) {
        toast.warning('Attenzione: Cash insufficiente per coprire l\'assegnazione', {
          description: `Hai $${cashBalance.toLocaleString()}, servono $${requiredCollateral.toLocaleString()}`
        });
        // We allow it in simulation but warn
      }
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      type: optionType,
      strike,
      premium: prem,
      quantity: qty,
      openDate: new Date(),
      status: 'open'
    };

    setPositions([...positions, newPosition]);
    setCashBalance(prev => prev + (prem * qty)); // Add premium to cash
    
    // Update mission progress
    updateMissionProgress('sell_option', 1);
    updateMissionProgress('collect_premium', prem * qty);

    const xpReward = optionType === 'call' ? 150 : 100;
    addXP(xpReward);
    
    // Log to Supabase
    if (user) {
      try {
        const { error } = await supabase.from('daily_journal').insert({
          user_id: user.id,
          trade_type: optionType === 'put' ? 'sell_put' : 'sell_call',
          asset: 'BTC',
          strike_price: strike,
          premium: prem,
          quantity: qty,
          entry_price: btcPrice,
          status: 'OPEN',
          notes: `Sold ${qty} ${optionType.toUpperCase()} @ $${strike} for $${prem} premium`
        });
        
        if (error) {
          console.error('Error logging trade to Supabase:', error);
          // Don't show error to user as it's a background sync
        }
      } catch (err) {
        console.error('Error logging trade:', err);
      }
    }

    toast.success(`✅ ${optionType === 'put' ? 'Put' : 'Call'} venduta!`, {
      description: `+$${prem * qty} premium raccolto | +${xpReward} XP`
    });
  };

  const handleClosePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const currentValue = position.type === 'put' 
      ? Math.max(0, position.strike - btcPrice) * position.quantity
      : Math.max(0, btcPrice - position.strike) * position.quantity;

    const premiumCollected = position.premium * position.quantity;
    const profit = premiumCollected - currentValue;

    setCashBalance(prev => prev - currentValue); // Pay to close
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'closed' as const } : p
    ));

    // Update mission progress
    updateMissionProgress('close_position', 1);

    if (profit > 0) {
      const profitPercentage = (profit / premiumCollected) * 100;
      const bonusXP = profitPercentage > 80 ? 100 : 0;
      const totalXP = 150 + bonusXP;
      
      addXP(totalXP);
      
      toast.success(`✅ Posizione chiusa in profitto!`, {
        description: bonusXP > 0 
          ? `Profitto eccellente: $${profit.toFixed(2)} | +${totalXP} XP (bonus +${bonusXP}!)`
          : `Profitto: $${profit.toFixed(2)} | +${totalXP} XP`
      });
    } else {
      toast.error(`Posizione chiusa in perdita`, {
        description: `Perdita: $${Math.abs(profit).toFixed(2)}`
      });
    }
  };

  const updateMissionProgress = (objectiveType: Mission['objectives'][0]['type'], increment: number) => {
    if (!activeMission) return;

    const updatedMissions = missions.map(mission => {
      if (mission.id === activeMission.id) {
        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.type === objectiveType) {
            const newCurrent = Math.min(obj.current + increment, obj.target);
            return { ...obj, current: newCurrent };
          }
          return obj;
        });

        const allCompleted = updatedObjectives.every(obj => obj.current >= obj.target);
        
        if (allCompleted && mission.status === 'active') {
          // Mission completed!
          completeMission(mission);
          return { ...mission, objectives: updatedObjectives, status: 'completed' as const };
        }

        return { ...mission, objectives: updatedObjectives };
      }
      return mission;
    });

    setMissions(updatedMissions);
    
    // 🎯 FIX: Update active mission with latest progress
    const updatedActiveMission = updatedMissions.find(m => m.id === activeMission.id);
    if (updatedActiveMission) {
      setActiveMission(updatedActiveMission);
    }
  };

  const completeMission = (mission: Mission) => {
    addXP(mission.reward.xp);
    
    toast.success('🏆 Missione Completata!', {
      description: `${mission.title} - +${mission.reward.xp} XP`,
      duration: 5000
    });

    // 🎯 FIX: Unlock and activate next mission
    const currentIndex = MISSIONS.findIndex(m => m.id === mission.id);
    if (currentIndex < MISSIONS.length - 1) {
      const nextMission = MISSIONS[currentIndex + 1];
      
      // Update missions state with next mission unlocked
      setMissions(prev => prev.map(m => 
        m.id === nextMission.id ? { ...m, status: 'active' as const } : m
      ));
      
      // 🎯 IMPORTANT: Automatically select the next mission
      setTimeout(() => {
        const nextMissionWithProgress = {
          ...nextMission,
          status: 'active' as const
        };
        setActiveMission(nextMissionWithProgress);
        
        toast.success('🔓 Nuova Missione Attivata!', {
          description: nextMission.title,
          duration: 4000
        });
      }, 2000);
    } else {
      // All missions completed!
      setTimeout(() => {
        toast.success('🎉 Tutte le Missioni Completate!', {
          description: 'Sei un maestro della Wheel Strategy!',
          duration: 5000
        });
      }, 2000);
    }
  };

  const selectMission = (mission: Mission) => {
    if (mission.status === 'locked') {
      toast.error('Missione bloccata', {
        description: mission.unlockRequirement
      });
      return;
    }
    setActiveMission(mission);
  };

  const openPositions = positions.filter(p => p.status === 'open');

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#050505] text-white max-w-full overflow-x-hidden relative">
      <Navigation currentView="simulation" onNavigate={onNavigate} />
      
      <header className="bg-zinc-900/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-white truncate font-bold text-xl">🎯 Trading Journal</h1>
            <p className="text-gray-400 hidden md:block text-sm">Monitora le tue performance e gestisci il rischio</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex border-white/10 text-gray-300 hover:text-white hover:bg-white/10">
              <HelpCircle className="w-4 h-4 mr-2" />
              Guida
            </Button>
            <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-emerald-400">Market Open</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-8">
        {/* Stats Cards - New Glassmorphism & Dynamic Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* 1. BTC Price Live */}
          <Card className="relative overflow-hidden p-4 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">BTC Price Live</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">${btcPrice.toLocaleString()}</span>
                  <span className="flex items-center text-xs text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                    Live
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                <span>Aggiornato in tempo reale</span>
              </div>
            </div>
          </Card>

          {/* 2. Active Strategy Widget */}
          <Card className="relative overflow-hidden p-4 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-16 h-16 text-blue-500" />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Strategia Attiva</p>
                <Badge variant="outline" className="text-[10px] h-5 border-blue-500/30 text-blue-400 bg-blue-500/10">
                  {strategy.duration} Mesi
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-1">
                <div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3" /> Capitale</div>
                  <div className="font-bold text-sm">${strategy.initialCapital.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Ricorrente</div>
                  <div className="font-bold text-sm">+${strategy.recurringDeposit}/mo</div>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/5 mt-1">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] text-gray-500 flex items-center gap-1"><Percent className="w-3 h-3" /> Target Giornaliero</span>
                     <span className="font-bold text-emerald-400 text-sm">{strategy.dailyTarget}%</span>
                   </div>
                   <Progress value={65} className="h-1 mt-1.5 bg-zinc-800" indicatorClassName="bg-emerald-500" />
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Break-even Price (Average Cost) */}
          <Card className="relative overflow-hidden p-4 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-16 h-16 text-orange-500" />
            </div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Prezzo di Carico (BEP)</p>
                {btcOwned > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-white">
                      ${breakEvenPrice > 0 ? breakEvenPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Avg. Entry: <span className="text-gray-300">${averageEntryPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 italic mt-2">Nessun BTC in portafoglio</div>
                )}
              </div>
              <div className="mt-3">
                 {btcOwned > 0 && (
                   <div className={`text-xs font-medium flex items-center gap-1 ${btcPrice > breakEvenPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                     {btcPrice > breakEvenPrice ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                     {btcPrice > breakEvenPrice ? 'In Profitto' : 'Sotto BEP'}
                     <span className="opacity-50 ml-1">
                       ({((btcPrice - breakEvenPrice) / breakEvenPrice * 100).toFixed(2)}%)
                     </span>
                   </div>
                 )}
              </div>
            </div>
          </Card>

          {/* 4. Total Equity & PnL (Merged) */}
          <Card className="relative overflow-hidden p-4 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-purple-500" />
            </div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Equity</p>
                <div className="text-2xl font-bold">${totalEquity.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                  <span className="text-gray-500">Cash Available</span>
                  <span className="text-white font-medium">${cashBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500">Total PnL</span>
                   <span className={`font-bold ${portfolioPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                     {portfolioPnL >= 0 ? '+' : ''}{portfolioPnL.toFixed(0)}
                   </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3-Column Layout for Professional Dashboard Look */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Missions / Goals (3 cols) */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Trading Goals</h3>
            </div>
            
            <div className="space-y-3">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  onClick={() => selectMission(mission)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeMission?.id === mission.id 
                      ? 'bg-blue-500/10 border-blue-500/50' 
                      : mission.status === 'locked'
                        ? 'bg-zinc-900/30 border-white/5 opacity-50'
                        : 'bg-zinc-900/30 border-white/5 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${
                      activeMission?.id === mission.id ? 'text-blue-400' : 'text-gray-300'
                    }`}>
                      {mission.title}
                    </span>
                    {mission.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {mission.status === 'locked' && <Lock className="w-3 h-3 text-gray-600" />}
                  </div>
                  {mission.status === 'active' && (
                    <Progress value={(mission.objectives[0].current / mission.objectives[0].target) * 100} className="h-1 bg-zinc-800" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Column: Chart (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* BTC Chart */}
            <Card className="p-4 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  BTC/USD Live Chart
                </h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-zinc-800 text-xs border-white/5">1H</Badge>
                  <Badge variant="outline" className="bg-zinc-800 text-xs border-white/5">4H</Badge>
                  <Badge variant="default" className="bg-blue-600 text-xs">1D</Badge>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 10, fill: '#666' }} 
                      stroke="rgba(255,255,255,0.1)" 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{ fontSize: 10, fill: '#666' }} 
                      stroke="rgba(255,255,255,0.1)" 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      width={60}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#a855f7" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{ r: 4, fill: '#a855f7', stroke: '#fff' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Trade History (Closed Positions) */}
            <Card className="mt-6 bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-bold text-sm">Trade History</h2>
                <Badge variant="outline" className="border-white/10 text-gray-400 text-xs">
                  {positions.filter(p => p.status === 'closed').length} Closed
                </Badge>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Strike</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Premium</th>
                      <th className="px-4 py-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {positions.filter(p => p.status === 'closed').map(position => {
                      const isAssigned = position.assignmentPrice !== undefined;
                      const resultText = isAssigned ? 'ASSIGNED' : 'EXPIRED';
                      const resultColor = isAssigned ? 'text-yellow-400' : 'text-emerald-400';
                      
                      return (
                        <tr key={position.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              position.type === 'put' 
                                ? 'bg-orange-500/10 text-orange-400' 
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {position.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            ${position.strike.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {position.openDate.toLocaleDateString('it-IT')}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            +${(position.premium * position.quantity).toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 font-bold ${resultColor}`}>
                            {resultText}
                          </td>
                        </tr>
                      );
                    })}
                    {positions.filter(p => p.status === 'closed').length === 0 && (
                       <tr>
                         <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-xs">
                           No closed positions history yet.
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Order Entry (3 cols) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Trading Panel */}
            <Card className="bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white sticky top-24 overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  Order Entry
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOptionType('put')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      optionType === 'put' 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    Sell Put
                  </button>
                  <button
                    onClick={() => setOptionType('call')}
                    disabled={btcOwned === 0}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      optionType === 'call' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    } ${btcOwned === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Sell Call
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-gray-500 text-xs font-medium uppercase mb-1 block">Strike Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input 
                        type="number" 
                        value={strikePrice}
                        onChange={(e) => setStrikePrice(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 text-xs font-medium uppercase mb-1 block">Premium</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input 
                        type="number" 
                        value={premium}
                        onChange={(e) => setPremium(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-7 pr-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 text-xs font-medium uppercase mb-1 block">Quantity</label>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="bg-zinc-800/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Total Premium</span>
                      <span className="text-emerald-400 font-bold">+${(parseFloat(premium || '0') * parseInt(quantity || '1')).toLocaleString()}</span>
                    </div>
                    {optionType === 'put' && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Collateral</span>
                        <span className="text-gray-300">${(parseFloat(strikePrice || '0') * parseInt(quantity || '1')).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleSellOption}
                    className={`w-full py-2.5 text-sm font-bold shadow-lg transition-all ${
                      optionType === 'put' 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    SUBMIT ORDER
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Journal / Open Positions Table (Full Width Bottom) */}
          <div className="col-span-1 lg:col-span-12">
            <Card className="bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-white font-bold text-sm">Open Positions</h2>
                <Badge variant="outline" className="border-white/10 text-gray-400 text-xs">
                  {openPositions.length} Active
                </Badge>
              </div>
              
              {openPositions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No open positions.</p>
                  <p className="text-gray-600 text-xs mt-1">Use the trading panel to open a new trade.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-white/5">
                      <tr>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Strike</th>
                        <th className="px-4 py-3 font-medium">Qty</th>
                        <th className="px-4 py-3 font-medium">Premium</th>
                        <th className="px-4 py-3 font-medium">P&L</th>
                        <th className="px-4 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {openPositions.map(position => {
                        const currentValue = position.type === 'put' 
                          ? Math.max(0, position.strike - btcPrice) * position.quantity
                          : Math.max(0, btcPrice - position.strike) * position.quantity;
                        const premiumCollected = position.premium * position.quantity;
                        const pnl = premiumCollected - currentValue;

                        return (
                          <tr key={position.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                position.type === 'put' 
                                  ? 'bg-orange-500/10 text-orange-400' 
                                  : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {position.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-white">
                              ${position.strike.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              {position.quantity}
                            </td>
                            <td className="px-4 py-3 text-gray-300">
                              ${premiumCollected.toLocaleString()}
                            </td>
                            <td className={`px-4 py-3 font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button 
                                onClick={() => handleClosePosition(position.id)}
                                className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/10 transition-colors"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* 🎯 Main Tutorial Modal with Prof Satoshi */}
      {showMainTutorial && (
        <SimulationTutorial
          onComplete={() => {
            setShowMainTutorial(false);
            toast.success('Ottimo! Ora inizia con la prima missione 🚀');
          }}
          onSkip={() => {
            setShowMainTutorial(false);
            toast.info('Tutorial saltato. Puoi riaprirlo dal pulsante "?"');
          }}
        />
      )}
    </div>
  );
}
