import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useUserProgress } from '../hooks/useUserProgress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ArrowLeft, Target, Trophy, Lock, CheckCircle2, Lightbulb, Rocket, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
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
        content: 'Vendere una put significa che accetti di comprare Bitcoin a un prezzo fisso (strike) se il prezzo scende. In cambio, ricevi subito un pagamento (premium).'
      },
      {
        step: 2,
        title: 'Scegli lo Strike',
        content: 'Seleziona uno strike price SOTTO il prezzo corrente di Bitcoin. Consiglio: inizia con 5-10% sotto il prezzo attuale per maggiore sicurezza.'
      },
      {
        step: 3,
        title: 'Raccogli il Premium',
        content: 'Il premium è il tuo guadagno immediato! Più basso è lo strike, più basso è il premium ma più sicura è la posizione.'
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
        content: 'Invece di vendere tutto in una volta, distribuisci le tue put in diversi strike price per gestire meglio il rischio.'
      },
      {
        step: 2,
        title: 'Timing del Mercato',
        content: 'Il premium è più alto quando il mercato è volatile. Osserva il grafico e vendi quando vedi movimenti ampi.'
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
        content: 'Se Bitcoin scende sotto il tuo strike, devi comprare BTC al prezzo dello strike. Non è una perdita - hai già guadagnato il premium!'
      },
      {
        step: 2,
        title: 'Prezzo di Carico',
        content: 'Il tuo prezzo effettivo è: Strike - Premium ricevuto. Esempio: Strike $40k, Premium $500 = Prezzo reale $39,500.'
      },
      {
        step: 3,
        title: 'Prossimo Step',
        content: 'Ora che possiedi BTC, puoi vendere covered calls per generare più reddito. Questo è il cuore della Wheel Strategy!'
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
        content: 'Vendere una call significa che accetti di vendere il tuo BTC a un prezzo più alto (strike) se il prezzo sale. Ricevi premium anche qui!'
      },
      {
        step: 2,
        title: 'Strike Sopra il Prezzo',
        content: 'Scegli uno strike SOPRA il prezzo corrente. Se BTC sale sopra, vendi con profitto. Se no, tieni il premium e il BTC.'
      },
      {
        step: 3,
        title: 'Doppio Guadagno',
        content: 'Hai già guadagnato dalla put, ora guadagni anche dalla call. È così che la Wheel genera rendimento costante!'
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
        content: 'Vendi put → Vieni assegnato → Vendi call → Bitcoin chiamato via → Ricomincia. Questo è come i professionisti generano reddito passivo.'
      },
      {
        step: 2,
        title: 'Optimization',
        content: 'Ogni ciclo genera profitto. Più cicli completi, più guadagni. L\'obiettivo è ripetere questo processo indefinitamente.'
      },
      {
        step: 3,
        title: 'Congratulazioni!',
        content: 'Hai padroneggiato la Wheel Strategy! Ora sei pronto per applicarla nel mondo reale con capitale vero.'
      }
    ],
    status: 'locked',
    unlockRequirement: 'Completa "Il Primo Covered Call"',
  }
];

export function SimulationView({ onNavigate }: SimulationViewProps) {
  const { progress: userProgress, addXP } = useUserProgress();
  const [btcPrice, setBtcPrice] = useState(96000); // 🎯 Prezzo reale dicembre 2024
  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: string; price: number }>>([]);
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [activeMission, setActiveMission] = useState<Mission | null>(MISSIONS[0]);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showMainTutorial, setShowMainTutorial] = useState(true); // 🎯 NEW: Main tutorial modal
  const [btcOwned, setBtcOwned] = useState(0);
  
  // Form states
  const [optionType, setOptionType] = useState<'put' | 'call'>('put');
  const [strikePrice, setStrikePrice] = useState('90000'); // 🎯 Aggiornato
  const [premium, setPremium] = useState('800'); // 🎯 Più realistico
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

  // Simulate BTC price changes (range più realistico per 2024)
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
      return newHistory.slice(-20);
    });
  }, [btcPrice]);

  // Check for assignments when price changes
  useEffect(() => {
    positions.forEach(position => {
      if (position.status === 'open' && position.type === 'put' && !position.assignmentPrice) {
        if (btcPrice < position.strike) {
          // Simulate assignment
          handleAssignment(position.id);
        }
      }
    });
  }, [btcPrice]);

  const handleAssignment = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const btcQuantity = position.quantity;
    const costBasis = position.strike - position.premium;

    setBtcOwned(prev => prev + btcQuantity);
    setPositions(positions.map(p => 
      p.id === positionId ? { ...p, status: 'closed' as const, assignmentPrice: btcPrice } : p
    ));

    // Update mission progress
    updateMissionProgress('handle_assignment', 1);

    toast.success('⚡ Assegnazione Ricevuta!', {
      description: `Hai acquistato ${btcQuantity} BTC a $${position.strike}. Prezzo effettivo: $${costBasis.toFixed(0)} (dopo premium)`
    });

    addXP(300);
  };

  const handleSellOption = () => {
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
    setPortfolioValue(prev => prev + (prem * qty));
    
    // Update mission progress
    updateMissionProgress('sell_option', 1);
    updateMissionProgress('collect_premium', prem * qty);

    const xpReward = optionType === 'call' ? 150 : 100;
    addXP(xpReward);
    
    toast.success(`✅ ${optionType === 'put' ? 'Put' : 'Call'} venduta!`, {
      description: `+$${prem * qty} premium raccolto | +${xpReward} XP`
    });

    // Show next tutorial step if available
    if (activeMission && currentTutorialStep < activeMission.tutorial.length - 1) {
      setCurrentTutorialStep(prev => prev + 1);
    }
  };

  const handleClosePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const currentValue = position.type === 'put' 
      ? Math.max(0, position.strike - btcPrice) * position.quantity
      : Math.max(0, btcPrice - position.strike) * position.quantity;

    const premiumCollected = position.premium * position.quantity;
    const profit = premiumCollected - currentValue;

    setPortfolioValue(prev => prev - currentValue);
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
        setCurrentTutorialStep(0);
        setShowTutorial(true);
        
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
    setCurrentTutorialStep(0);
    setShowTutorial(true);
  };

  const openPositions = positions.filter(p => p.status === 'open');
  const totalPremiumCollected = positions.reduce((acc, p) => acc + (p.premium * p.quantity), 0);
  const portfolioPnL = portfolioValue - 10000;

  const getDifficultyColor = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'hard': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="min-h-screen md:pl-20 pb-24 md:pb-0 bg-gray-50">
      <Navigation currentView="simulation" onNavigate={onNavigate} />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-6 sticky top-0 z-30 safe-area-top">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" onClick={() => onNavigate('home')} size="sm" className="h-10">
              <ArrowLeft className="w-5 h-5 md:w-4 md:h-4 mr-2" />
              <span className="hidden md:inline">Indietro</span>
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-gray-900 truncate">🎯 Trading Missions</h1>
              <p className="text-gray-600 hidden md:block">Impara la Wheel Strategy passo dopo passo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-5 md:px-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-blue-100 mb-2">BTC Price</p>
            <p className="font-bold mb-2">${btcPrice.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-blue-100">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <p className="text-gray-600 mb-2">Portfolio</p>
            <p className="text-gray-900 mb-2 font-bold">${portfolioValue.toLocaleString()}</p>
            <div className={`flex items-center gap-1 ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{portfolioPnL >= 0 ? '+' : ''}{portfolioPnL.toFixed(0)}</span>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <p className="text-gray-600 mb-2">Premium</p>
            <p className="text-gray-900 mb-2 font-bold">${totalPremiumCollected.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="w-4 h-4" />
              <span>{positions.length} trades</span>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <p className="text-gray-600 mb-2">BTC Owned</p>
            <p className="text-gray-900 mb-2 font-bold">{btcOwned}</p>
            <p className="text-gray-600">Bitcoin</p>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-purple-100 mb-2">Missioni</p>
            <p className="font-bold mb-2">{missions.filter(m => m.status === 'completed').length}/{missions.length}</p>
            <div className="flex items-center gap-1 text-purple-100">
              <Trophy className="w-4 h-4" />
              <span>Completate</span>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Mission List */}
          <div className="space-y-4">
            <h2 className="text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Le Tue Missioni
            </h2>

            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    activeMission?.id === mission.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : mission.status === 'locked'
                      ? 'opacity-60'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => selectMission(mission)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {mission.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : mission.status === 'locked' ? (
                        <Lock className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Rocket className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900 truncate">{mission.title}</h3>
                        <Badge className={getDifficultyColor(mission.difficulty)}>
                          {mission.difficulty}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{mission.description}</p>
                      
                      {mission.status === 'active' && mission.objectives.map((obj, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600">{obj.description}</span>
                            <span className="text-gray-900 font-semibold">
                              {obj.current}/{obj.target}
                            </span>
                          </div>
                          <Progress value={(obj.current / obj.target) * 100} className="h-2" />
                        </div>
                      ))}
                      
                      {mission.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-semibold">Completata! +{mission.reward.xp} XP</span>
                        </div>
                      )}
                      
                      {mission.status === 'locked' && (
                        <p className="text-gray-500 italic">{mission.unlockRequirement}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trading Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Tutorial Card */}
            {activeMission && showTutorial && activeMission.status === 'active' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-full">
                      <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-900">
                          Step {currentTutorialStep + 1}/{activeMission.tutorial.length}: {activeMission.tutorial[currentTutorialStep].title}
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowTutorial(false)}
                        >
                          Chiudi
                        </Button>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {activeMission.tutorial[currentTutorialStep].content}
                      </p>
                      <div className="flex items-center gap-2">
                        {activeMission.tutorial.map((_, idx) => (
                          <div 
                            key={idx}
                            className={`h-2 flex-1 rounded-full ${
                              idx <= currentTutorialStep ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* BTC Chart */}
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Bitcoin Price Chart</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis domain={['dataMin - 500', 'dataMax + 500']} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Trading Panel */}
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Vendi Opzione</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Button
                  variant={optionType === 'put' ? 'default' : 'outline'}
                  onClick={() => setOptionType('put')}
                  className={optionType === 'put' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  Sell Put
                </Button>
                <Button
                  variant={optionType === 'call' ? 'default' : 'outline'}
                  onClick={() => setOptionType('call')}
                  disabled={btcOwned === 0}
                  className={optionType === 'call' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  Sell Call {btcOwned === 0 && '🔒'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Strike Price ($)</Label>
                  <Input 
                    type="number" 
                    value={strikePrice}
                    onChange={(e) => setStrikePrice(e.target.value)}
                    placeholder={optionType === 'put' ? '40000' : '45000'}
                    className="h-12"
                  />
                  <p className="text-gray-500 mt-1">
                    BTC attuale: ${btcPrice.toLocaleString()} • {optionType === 'put' ? '7% sotto (sicuro)' : '7% sopra (profit target)'}
                  </p>
                </div>

                <div>
                  <Label>Premium ($) <span className="text-xs text-gray-500">(auto-calcolato)</span></Label>
                  <Input 
                    type="number" 
                    value={premium}
                    onChange={(e) => setPremium(e.target.value)}
                    placeholder="500"
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Il premium è calcolato automaticamente in base alla distanza dallo strike. Puoi modificarlo manualmente.
                  </p>
                </div>

                <div>
                  <Label>Quantità</Label>
                  <Input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                    max={optionType === 'call' ? btcOwned : undefined}
                    className="h-12"
                  />
                  {optionType === 'call' && (
                    <p className="text-gray-500 mt-1">
                      BTC disponibili: {btcOwned}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2 font-semibold">Riepilogo:</p>
                  <p className="text-gray-900">Premium totale: ${parseFloat(premium || '0') * parseInt(quantity || '1')}</p>
                  {optionType === 'put' && (
                    <p className="text-gray-600">Capitale richiesto: ${parseFloat(strikePrice || '0') * parseInt(quantity || '1')}</p>
                  )}
                </div>

                <Button 
                  onClick={handleSellOption}
                  className={`w-full h-12 ${
                    optionType === 'put' 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Vendi {optionType === 'put' ? 'Put' : 'Call'}
                </Button>
              </div>
            </Card>

            {/* Open Positions */}
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Posizioni Aperte ({openPositions.length})</h2>
              {openPositions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">Nessuna posizione aperta</p>
                  <p className="text-gray-500">Vendi la tua prima opzione per iniziare!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openPositions.map(position => {
                    const currentValue = position.type === 'put' 
                      ? Math.max(0, position.strike - btcPrice) * position.quantity
                      : Math.max(0, btcPrice - position.strike) * position.quantity;
                    const premiumCollected = position.premium * position.quantity;
                    const pnl = premiumCollected - currentValue;

                    return (
                      <div key={position.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={
                              position.type === 'put' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                            }>
                              {position.type.toUpperCase()}
                            </Badge>
                            <span className="text-gray-900 font-semibold">${position.strike.toLocaleString()}</span>
                            <span className="text-gray-600">x{position.quantity}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600">Premium: ${premiumCollected}</p>
                            <p className={pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              P&L: {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </p>
                          </div>
                          <Button 
                            onClick={() => handleClosePosition(position.id)}
                            variant="outline"
                            size="sm"
                          >
                            Chiudi
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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

      {/* 🎯 Floating Help Button to Reopen Tutorial */}
      {!showMainTutorial && (
        <Button
          onClick={() => setShowMainTutorial(true)}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-2xl z-40 flex items-center justify-center"
          title="Rivedi Tutorial"
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </Button>
      )}
    </div>
  );
}